<?php


    class RecoverPassword extends Emailer
    {
        public function forgotPassword($value)
        {

            if(!empty($value) && !empty($value->user)){
                $user = trim($value->user);
                $email = trim($value->email);
                if($this->checkEmailExits($email, $user)){

                   $default_password = $this->generatorDefaultPassword();
                    /// send email to user......
                    if($this->sendRecoveryEmail($value, $default_password)){

                        try{
                            $hash_password = $this->passwordHash($default_password);

                            $stmt2 = $this->db->prepare("UPDATE $user SET password =:password
                                        WHERE email=:email");
                            $stmt2->bindParam(':email', $email);
                            $stmt2->bindParam(':password', $hash_password);
                            $stmt2->execute();
                            $this->success("Recovery Email sent to: $email");
                        }catch (PDOException $exception){
                            $this->failed($exception->getMessage(),'error_updating user',412);
                        }
                    }


                }else{
                    $this->failed('','No Such '. $user .' User with email: '.$email.' in our system', 404);
                }
            }else{
                $this->failed('','Opps Something happened',412);
            }

        }


        private function checkEmailExits($email, $user): bool
        {
            try {
                $stmt = $this->db->prepare("SELECT email FROM $user WHERE email = :email");
                $stmt->bindParam(':email', $email);
                $stmt->execute();
                $result = $stmt->fetch();

                if (!empty($result)) {
                    return true; // student found
                } else {
                    return false;
                }
            } catch (PDOException $exception) {

                $this->failed($exception->getMessage(), 'checking user error',401);
            }
        }



        private function failed($exception, $message, $code): void
        {
            $response            = new Result();
            $response->result    = "failure";
            $response->exception = "$exception";
            $response->message   = $message;

            header("Content-Type: application/json");
            http_response_code($code);
            echo json_encode($response);
            die();

        }

        private function success($value)
        {
            $response          = new Result();
            $response->result  = "OK";
            $response->message = "$value";
            header("Content-Type: application/json");
            echo json_encode($response);
        }

    }