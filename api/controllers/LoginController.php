<?php

    require_once 'Result.php';

    class LoginController extends _Database
    {

        protected $_token;
        protected $_user = Array();
        protected $_student_number;


        protected function generatorStaffPassword($length)
        {


            $chars    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-=+;:,.?";
            $password = substr(str_shuffle($chars), 0, $length);

            $genPass = $password;

            return $genPass;

        }

        public function loginFunction($params)
        {


            $userTable = trim($params->user);
            $_password = trim($params->password);
            $_email    = trim($params->email);
            $stmt      = $this->db->prepare("SELECT * FROM $userTable WHERE email =:email");

            $stmt->bindParam(":email", $_email);
            $stmt->execute();

            $this->_user = $stmt->fetch();

            $found = $this->_user != NULL;

            if (!$found) {
                $this->_user['email'] = $params->email;
                $this->failed('email', 'Email not found in our system: ' . $this->_user['email']);
            }

            if ($userTable === 'student') $this->_student_number = $this->_user['student_number'];
            if (!password_verify($_password, $this->_user['password'])) {
                $this->failed('password', 'Invalid Login, please check your password');
            }

            $this->_token = $this->generate_random();

            $now     = new DateTime();
            $expires = clone $now;
            $expires->add(new DateInterval("P7D")); // set token to expire in 7 days.

            $now_string     = $now->format("Y-m-d\\TH:i:s");
            $expires_string = $expires->format("Y-m-d\\TH:i:s");

            try {
                $stmt = $this->db->prepare("INSERT INTO user_token(user_id, created, expires, token)
                                                    VALUES (:id, :created, :expires, :token)");

                $stmt->bindParam(':id', $this->_user['id']);
                $stmt->bindParam(':created', $now_string);
                $stmt->bindParam(':expires', $expires_string);
                $stmt->bindParam(':token', $this->_token);
                $stmt->execute();

                $this->success();
            } catch (PDOException $e) {
                $this->failed($e->getMessage(), 'Opps Something Happened');
            }


        }

        public function changePassword($params)
        {

            if (!empty($params)) {

                $param = $params->data;
                $user  = trim($param->user);
                if ($this->is_valid_user($user)) {
                    $_old_pass = trim($param->old_pass);
                    $_new_pass = trim($param->new_pass);
                    $_email    = trim($param->email);
                    $stmt      = $this->db->prepare("SELECT * FROM $user WHERE email =:email");

                    $stmt->bindParam(":email", $_email);
                    $stmt->execute();
                    $this->_user = $stmt->fetch();

                    $found = $this->_user != NULL;

                    if (!$found) {
                        $this->_user['email'] = $params->email;
                        $this->failed('email', 'Email not found in our system: ' . $this->_user['email']);
                    }

                    if (!password_verify($_old_pass, $this->_user['password'])) {
                        $this->failed('mismatch', 'Password not correct');
                    }

                    if (password_verify($_new_pass, $this->_user['password'])) {
                        $this->failed('new_same_as_old', 'New password cant be same as old');
                    }
                    try {
                        $_new_pass_enc = $this->passwordHash("$_new_pass");
                        $stmt = $this->db->prepare("UPDATE $user SET password =:new_pass WHERE email=:email");

                        $stmt->bindParam(':email', $_email);
                        $stmt->bindParam(':new_pass', $_new_pass_enc);
                        $stmt->execute();

                        $result          = new Result();
                        $result->message = "Password Changed";
                        $result->status  = 'OK';

                        header("Content-Type: application/json");
                        echo json_encode($result);


                    } catch (PDOException $e) {
                        $this->failed($e->getMessage(), 'Opps Something Happened');
                    }
                }
            }

        }

        private function checkStudentExits($email, $student_number): bool
        {
            try {
                $stmt = $this->db->prepare("SELECT email, student_number FROM student WHERE email = :email AND 
                                                        student_number = :student_number");
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':student_number', $student_number);

                $stmt->execute();
                $result = $stmt->fetch();

                if (!empty($result)) {
                    return true; // student found
                } else {
                    return false;
                }
            } catch (PDOException $exception) {
                $response          = new Result();
                $response->result  = "failure";
                $response->message = $exception;
                header("Content-Type: application/json");
                http_response_code(401);
                echo json_encode($response);
                die();
            }
        }



        public function signUp($params)
        {

            if (!empty($params)) {
                try {
                    $email     = $params->email;
                    $password_ = trim($params->password);
                    $student   = $params->student_number;
                    if (!$this->checkStudentExits("$email", "$student")) {

                        $password = $this->passwordHash("$password_");
                        $stmt     = $this->db->prepare("INSERT INTO student(first_name,last_name,student_number,email,password)
                              VALUES (:first_name, :last_name, :student_number, :email, :password)");

                        $stmt->bindParam(':first_name', $params->first_name);
                        $stmt->bindParam(':last_name', $params->last_name);
                        $stmt->bindParam(':student_number', $params->student_number);
                        $stmt->bindParam(':email', $params->email);
                        $stmt->bindParam(':password', $password);
                        $stmt->execute();
                        $response          = new Result();
                        $response->result  = "OK";
                        $response->message = 'Sign Up Success';

                        header("Content-Type: application/json");
                        echo json_encode($response);
                    } else {
                        $response          = new Result();
                        $response->result  = "failure";
                        $response->message = "User with $email already exits";
                        header("Content-Type: application/json");
                        http_response_code(403);
                        echo json_encode($response);
                    }
                } catch (PDOException $exception) {
                    $response          = new Result();
                    $response->result  = "failure";
                    $response->message = $exception;
                    http_response_code(403);
                    header("Content-Type: application/json");
                    echo json_encode($response);
                    die();
                }
            } else {
                $response          = new Result();
                $response->result  = "failure";
                $response->message = "Something went wrong try again";
                header("Content-Type: application/json");
                http_response_code(403);
                echo json_encode($response);
            }

        }

        private function failed($exception, $message): void
        {
            $response            = new Result();
            $response->result    = "failure";
            $response->exception = "$exception";
            $response->message   = $message;

            header("Content-Type: application/json");
            http_response_code(403);
            echo json_encode($response);
            die();

        }

        private function success()
        {
            $response         = new Result();
            $response->result = "OK";
            // $response->user = new Result();
            $response->user['id']         = $this->_user['id'];
            $response->user['first_name'] = $this->_user['first_name'];
            $response->user['last_name']  = $this->_user['last_name'];
            $response->user['email']      = $this->_user['email'];
            if (iconv_strlen($this->_student_number) > 1) $response->user['student_number'] =
                $this->_user['student_number'];
            $response->user['token'] = $this->_token;
            $response->message       = 'Success';

            header("Content-Type: application/json");
            echo json_encode($response);

        }


    }


?>
