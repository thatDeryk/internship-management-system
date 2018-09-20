<?php
include_once 'Result.php';

class User extends _Database
{
    protected $_user = Array();
    protected $_student_number;
    protected $_token;

    public function getUser($value)
    {

        $this->_token = $_SERVER['HTTP_X_AUTH_TOKEN'];
        $this->_user = $this->is_valid_user($value->user);
        if (count($this->_user) > 1) {
            if ($value->user === 'student') $this->_student_number = $this->_user['student_number'];
            $this->success();
        } else {
            $this->failed();
        }

    }

    private function success()
    {
        $response = new Result();
        $response->result = "OK";
        // $response->user = new Result();
        $response->user['first_name'] = $this->_user['first_name'];
        $response->user['last_name'] = $this->_user['last_name'];
        $response->user['email'] = $this->_user['email'];
        $response->user['token'] = $this->_token;
        if (iconv_strlen($this->_student_number) > 0)
            $response->user['student_number'] = $this->_student_number;
        $response->message = 'Success';

        header("Content-Type: application/json");
        echo json_encode($response);

    }


    private function failed(): void
    {
        $response = new Result();
        $response->result = "failure";
        $response->message = 'invalid login: ' . $this->_user;

        header("Content-Type: application/json");
        http_response_code(403);
        echo json_encode($response);
        die();

    }
}