<?php
    
    require_once 'config/_database.php';
    include 'controllers/Router.php';
    $request = file_get_contents("php://input");
    $data = json_decode($request);
    //print_r($_REQUEST['route']);
    //print_r($data);
    $myRoute = new Router();
    
    $myRoute->Route($_REQUEST['route'], $data);
?>
