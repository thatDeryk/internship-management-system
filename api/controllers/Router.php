<?php
    require_once 'Controller.php';
    
    class Router extends Controller {
        private $destination;
        public $datum;
        public $pages = ['login', 'company', 'coordinator', 'student', 'sign-up','change','recover','user'];
        
        public function Route($routeTo, $data) {
            # code...
            $dest = "";
            $this->destination = $routeTo;
            
            foreach ($this->pages as $value) {
                # code...
                if ($this->destination == $value) {
                    $dest = $value;
                    $this->sortRoute($dest, $data);
                    //$this->_.''.$value();
                    break;
                }
            }
            
        }
    }

?>
