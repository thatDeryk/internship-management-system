<?php

    include_once '../controllers/Result.php';

    class _Database
    {
        /**
         * @var PDO
         */
        /**
         * @var PDO
         */
        /**
         * @var PDO
         */
        /**
         * @var PDO
         */
        protected $db, $result, $res, $user;

        /**
         * _Database constructor.
         */
        public function __construct()
        {

            try {
                $host = "localhost";
                $username = "root";
                $password = "root";
                $database = "oims";
                // $dsn = 'mysql:dbname=cdeskdb;host=localhost';


                date_default_timezone_set("UTC");

                $this->db = new PDO("mysql:dbname=$database;host=$host;", $username, $password);
                $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                $this->db->exec("CREATE DATABASE IF NOT EXISTS `$database`");
                $this->db->exec("use `$database`");

            } catch (PDOException $e) {

                $result =  new Result();
                $result->exception = $e->getMessage();
                $result->statuse = 'Failed';
                header("Content-Type: application/json");
                http_response_code(404);

                echo json_encode($result);

            }

        }

        public function createUser() {
          # code...


        }

        /**
         * @param $table_name
         * @return bool
         */
        public function tableExists($table_name): bool
        {
            $result = $this->db->query("SHOW TABLES LIKE '$table_name'");
            if (!$result) {
                return FALSE;
            }

            if ($result->rowCount() > 0) {
                return TRUE;
            }

            return FALSE;
        }


        /**
         * @return string
         */
        public function generate_random()
        {
            return bin2hex(random_bytes(32));
        }

        /**
         * @return mixed
         * @param string
         */
        public function is_valid_user($table_name)
        {
            if ($this->tableExists($table_name)) {
                if (empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
                    return NULL;
                }

                $token = $_SERVER['HTTP_X_AUTH_TOKEN'];
                //global $this->$db;

                $now = new DateTime();

                $now_string = $now->format("Y-m-d\\TH:i:s");

                $stmt = $this->db->prepare("SELECT $table_name.* FROM  user_token JOIN $table_name ON
                                                     user_token.user_id = $table_name.id WHERE token = :token AND expires > :now");
                $stmt->bindParam(':token', $token);
                $stmt->bindParam(':now', $now_string);
                $stmt->execute();
                return $stmt->fetch();
            }
            return NULL;
        }

        /**
         * @param $table_name
         * @return bool
         */
        public function validate_request($table_name)
        {
            $isValid = $this->is_valid_user($table_name);
            if ($isValid != NULL)
                return true;
            return false;
        }

        /**
         * @param $password
         * @return bool|string
         */
        public function passwordHash($password)
        {
            return password_hash($password, PASSWORD_BCRYPT, ['cost' => 11]);
        }


        /**
         * @return string
         */
        public function generatorDefaultPassword(): string
        {


            $chars    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-=+;:,.?";
            $password = substr(str_shuffle($chars), 0, 6);

            $genPass = $password;
            return $genPass;

        }

        /**
         * @param $params
         * @return bool
         */
        public function isParamEmpty($params)
        {
            if (empty($params)) {
                $response = new Result();
                $response->result = "failed";
                $response->message = 'Something went wrong, If problem persist contact System Administrator';
                header("Content-Type: application/json");
                http_response_code(400);
                echo json_encode($response);
                die();
                // exit();
            } else {
                return false;
            }
        }

    }

?>
