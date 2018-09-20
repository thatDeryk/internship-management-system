<?php
    ini_set("display_errors", "on");
    require_once './config/_database.php';

    require_once 'Emailer.php';
    require_once 'LoginController.php';
    include 'CompanyController.php';
    include 'StudentController.php';
    include 'CoordinatorController.php';
    include 'User.php';
    include 'RecoverPassword.php';

    class Controller
    {
        public $response;
        public $data;


        private function routeToCompany($data)
        {
            $company = new CompanyController();
            switch ($data->method) {
                case 'get_company_interns':
                    $company->getCompanyInterns($data);
                    break;

                case 'get_company_notification':
                    $company->getNotification($data);
                    break;

                case 'get_prospective_interns':
                    $company->getProspectiveInterns($data);
                    break;

                case 'set_internship_complete':
                    $company->setInternshipStatus($data);
                    break;

                case 'get_student_confirmation_form':
                    $company->getStudentConfirmationForm($data);
                    break;

                case 'get_student_logs':
                    $company->getStudentLogs($data);
                    break;

                case 'add_log_review':
                    $company->declineLog($data);
                    break;

                case 'get_evaluation_result':
                    $company->getEvaluationResult($data);
                    break;

                case 'accept_log':
                    $company->acceptLog($data);
                    break;

                case 'submit_confirmation_form':
                    $company->SubmitConfirmationForm($data);
                    break;

                case 'check_student_name':
                    $company->checkStudentName($data);
                    break;

                case 'get_student_by_id':
                    $company->getStudentById($data);
                    break;

                default:
                    $this->error("Something went wrong, if this problem continues," .
                                 " contact Tech support with Code: <b>COMPL-02-" . strtoupper($data->method) . "</b>");
                    break;

            }
        }

        private function routeToStudent($data)
        {
            $studentClass = new StudentController();

            switch ($data->method) {

                case 'get_student_notification':
                    $studentClass->getNotification($data);
                    break;

                case 'submit_application':
                    $studentClass->submitForm($data);
                    break;

                case 'get_applications':
                    $studentClass->getApplication($data);
                    break;

                case 'get_exam_message':
                    $studentClass->getExamMessage($data);
                    break;

                case 'get_company_confirmation_form':
                    $studentClass->getCompanyConfirmationForm($data);
                    break;

                case 'get_evaluation_result':
                    $studentClass->getEvaluationResult($data);
                    break;

                case 'submit_log':
                    $studentClass->submitLog($data);
                    break;

                case 'verify_student_application_form':
                    $studentClass->verifyStudentFormData($data);
                    break;

                case 'update_log':
                    $studentClass->updateLog($data);
                    break;

                case 'get_student_log':
                    $studentClass->getStudentLog($data);
                    break;

                case 'get_active_internship_company':
                    $studentClass->getActiveInternshipCompany($data);
                    break;

                default:
                    echo json_encode('not found');
                    break;
            }
        }

        private function routeToCoordinator($data)
        {
            $coordinatorClass = new CoordinatorController();

            switch ($data->method) {
                case 'get_application_by_id':
                    $coordinatorClass->getApplicationById($data);
                    break;

                case 'get_coordinator_notification':
                    $coordinatorClass->getNotification($data);
                    break;

                case 'send_oral_exam_message':
                    $coordinatorClass->sendOralExamMessage($data);
                    break;
                case 'get_exam_message':
                    $coordinatorClass->getExamMessage($data);
                    break;
                case 'get_applications':
                    $coordinatorClass->getApplications($data);
                    break;

                case 'get_company_confirmation_form':
                    $coordinatorClass->getCompanyConfirmationForm($data);
                    break;

                case 'application_denied':
                    $coordinatorClass->applicationDenied($data);
                    break;

                case 'get_interns':
                    $coordinatorClass->getInterns($data);
                    break;

                case 'submit_evaluation':
                    $coordinatorClass->submitEvaluation($data);
                    break;

                case 'application_accepted':
                    $coordinatorClass->applicationAccepted($data);
                    break;

                case 'get_student_logs':
                    $coordinatorClass->getStudentLogs($data);
                    break;


                default:
                    echo json_encode('not found');
                    break;
            }
        }

        public function sortRoute($route, $value)
        {
            # code...
            //  echo $des.'sss';

            try {
                switch ($route) {

                    case'login':
                        $myLogin = new LoginController();
                        $myLogin->loginFunction($value);
                        break;

                    case 'change':
                        $change = new LoginController();
                        $change->changePassword($value);
                        break;
                    case 'recover':
                        $change = new RecoverPassword();
                        $change->forgotPassword($value);
                        break;

                    case'sign-up':
                        $myLogin = new LoginController();
                        $myLogin->signUp($value);
                        break;

                    case'user':
                        $user = new User();
                        $user->getUser($value);
                        break;


                    case 'student':
                        $this->routeToStudent($value);
                        break;

                    case 'coordinator':
                        $this->routeToCoordinator($value);
                        break;

                    case 'company':
                        $this->routeToCompany($value);
                        break;


                    default:
                        $message["error"]["errorMessage"] = "";
                        $format                           = "<br>
                                    <span class='has-info'>
                                     If the problem persist please contact the support and report" .
                            " this code (ErrorCode:4100)
                                     </span>";
                        echo json_encode($message["error"]["errorMessage"] = "ErrorCode:4100 - Something went wrong,
                     Please try again" . $format);
                        exit();
                        break;
                }

            } catch (Exception $e) {
                $message["error"]["errorMessage"] = $e->getMessage();
                echo json_encode($message["error"]);
            }
        }

        private function accessError()
        {
            # code...
            $message["error"]["errorMessage"] = 'ErrorCode: 0077 - You dont have permission';
            echo json_encode($message["error"]);
            exit();
        }

        public function error($data)
        {
            $message["error"]["errorMessage"] = $data;
            echo json_encode($message["error"]);
        }

        private function success($value)
        {
            # code...
            $message['success']['successMessage'] = $value;
            echo json_encode($message['success']);
        }
    }

?>
