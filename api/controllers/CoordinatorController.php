<?php
	
	/**
	 * Class CoordinatorController
	 */
	class CoordinatorController extends Emailer
	{
		/**
		 * @var
		 */
		public $_compliantId;
		/**
		 * @var
		 */
		public $_sNo;
		
		/**
		 * @param $params
		 */
		public function getNotification($params)
		{
			if (!empty($params) && $this->is_valid_user('coordinator')) {
				try {
					$param = $params->data;
					$limit = $param->limit;
					
					$total =
						$this->db->query("SELECT COUNT(id) AS rows FROM coordinator_notifications")->fetch(PDO::FETCH_OBJ);
					
					
					$perpage = 10;
					$notes   = $total->rows;
					
					$pages = ceil($notes / $perpage);
					
					$data = array(
						'options' => array(
							'default' => 1,
							'min_range' => 1,
							'max_range' => $pages
						)
					);
					
					$number = trim($limit);
					$number = filter_var($number, FILTER_VALIDATE_INT, $data);
					$range  = $perpage * ($number - 1);
					
					
					$stmt = $this->db->prepare("SELECT * FROM coordinator_notifications ORDER BY created_at DESC
                                                          LIMIT :limit, :perpage");
					
					$stmt->bindParam(':perpage', $perpage, PDO::PARAM_INT);
					$stmt->bindParam(':limit', $range, PDO::PARAM_INT);
					$stmt->execute();
					$notifications = $stmt->fetchAll();
					
					$result = array();
					
					foreach ($notifications as $note) {
						$n             = new Result();
						$n->senderId   = $note['sender_id'];
						$n->extras     = $note['extras'];
						$n->message    = $note['message'];
						$n->createdAt  = $note['created_at'];
						$n->senderType = $note['sender_type'];
						$n->receipt    = $note['receipt'];
						$n->senderName = $note['sender_name'];
						$result[]      = $n;
					}
					// $result[]['']
					header('Content-Type: application/json');
					echo json_encode($result);
					
					
				} catch (PDOException $exception) {
					$this->failed($exception, 'getting notification', '', 412);
				}
			} else {
				$this->failed('', 'Some parameters are missing', '', 412);
			}
		}
		
		/**
		 * @param $data
		 */
		public function applicationAccepted($data)
		{
			$params = $data->data;
			
			if ($this->is_valid_user('coordinator') && !empty($params)) {
				try {
					
					$application_status = 'accepted';
					$reason             = ' ';
					$stmt               = $this->db->prepare("UPDATE student_application
                                                          SET application_status= :application_status, 
                                                              reject_reason = :reject_reason 
                                                          WHERE application_id=:id 
                                                          AND student_number = :student_number");
					
					$stmt->bindParam(':id', $params->application_id);
					$stmt->bindParam(':application_status', $application_status);
					$stmt->bindParam(':reject_reason', $reason);
					$stmt->bindParam(':student_number', $params->student_number);
					
					$result =
						$this->sendEmailToCompany($params->application_id, $params->student_number, $params->coordinator_email);
					if ($result) {
						$date           = new DateTime();
						$date_evaluated = $date->format("Y-m-d\\TH:i:s");
						$data           = array(
							'message' => 'Application Accepted ',
							'createdAt' => $date_evaluated,
							'extras' => 'check_box',
							'receipt' => 'not read',
						
						);
						$this->sendStudentNotification($params, $data);
						$stmt->execute();
						$this->success('Application Approved');
					}
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'accepting_application', 'accepting application', 412);
				}
			}
		}
		
		private function checkIfMessageSent($param): bool
		{
			
			$student_number = $param->student_number;
			$total          = $this->db->query("SELECT COUNT(student_number) as rows FROM exam_message
                                                        WHERE student_number = $student_number")->fetch(PDO::FETCH_OBJ);
			$total_rows     = $total->rows;
			if ($total_rows >= 1) {
				return true; //is message sent.
			} else {
				return false;  // is message not sent
			}
		}
		
		/**
		 * @param $params
		 */
		public function getStudentLogs($params)
		{
			
			if ($this->is_valid_user('coordinator') && !empty($params->data)) {
				
				try {
					
					
					$param        = $params->data;
					$oral_message = 'not_sent';
					if ($this->checkIfMessageSent($param)) {
						$oral_message = 'sent';
					}
					
					$start          = 0;
					$perpage        = 9999999999;
					$page           = 1;
					$search_keyword = '';
					
					if (@$param->search_keyword) {
						$search_keyword = $param->search_keyword;
					}
					if (@ $param->page) {
						@ $start = $param->page + 1;
						
					}
					if (@$param->perpage) {
						@ $perpage = $param->perpage;
					}
					$student_number = $param->student_number;
					$company_id     = $param->company_id;
					$total          = $this->db->query("SELECT COUNT(student_number) as rows FROM student_log
                                                WHERE student_number=$student_number AND company_id=$company_id
                                                AND log_department LIKE '%" . $search_keyword . "%'
                                                OR `log_date` LIKE '%" . $search_keyword . "%'
                                                OR `log_day` LIKE '%" . $search_keyword . "%'
                                                OR `log_status` LIKE '%" . $search_keyword . "%'
                                                OR `log_description` LIKE '%" . $search_keyword . "%'")->fetch(PDO::FETCH_OBJ);
					
					
					$total_rows = $total->rows;
					
					$pages = ceil($total_rows / $perpage);
					
					$data   = array(
						'options' => array(
							'default' => 1,
							'min_range' => 1,
							'max_range' => $pages
						)
					);
					$number = trim($start);
					$number = filter_var($number, FILTER_VALIDATE_INT, $data);
					$range  = $perpage * ($number - 1);
					
					
					$stmt = $this->db->prepare("SELECT log_review.*, student_log.*, company_confirmation.student_number,
                                                              company_confirmation.company_id, company_confirmation.start_date,
                                                              company_confirmation.end_date, company_confirmation.internship_status
                                                              FROM log_review
                                                              RIGHT JOIN  student_log
                                                              ON student_log.log_id = log_review.log_id
                                                              RIGHT JOIN company_confirmation
                                                              ON company_confirmation.student_number = student_log.student_number
                                                              WHERE  student_log.company_id =:company_id
                                                              AND student_log.student_number =:student_number
                                                               AND  student_log.log_department
                                                              LIKE :keyword OR student_log.log_description LIKE :keyword
                                                              OR student_log.log_day LIKE :keyword
                                                              OR  student_log.log_date LIKE :keyword
                                                              ORDER BY student_log.log_date ASC LIMIT :limit, :perpage");
					
					$stmt->bindValue(':keyword', '%' . $search_keyword . '%', PDO::PARAM_STR);
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->bindParam(':perpage', $perpage, PDO::PARAM_INT);
					$stmt->bindParam(':limit', $range, PDO::PARAM_INT);
					$stmt->execute();
					$logs = $stmt->fetchAll();
					
					$result         = array();
					$result['logs'] = array();
					//  print_r($logs);
					foreach ($logs as $log) {
						$l                    = new Result();
						$l->log_status        = $log['log_status'];
						$l->log_description   = $log['log_description'];
						$l->company_id        = $log['company_id'];
						$l->log_department    = $log['log_department'];
						$l->log_date          = $log['log_date'];
						$l->log_id            = $log['log_id'];
						$l->log_review        = $log['review'];
						$l->review_id         = $log['id'];
						$l->log_day           = $log['log_day'];
						$l->internship_status = $log['internship_status'];
						$result['logs'][]     = $l;
					}
					
					$result['pagination'] = array(
						'default' => 1,
						'min_range' => 1,
						'max_range' => $pages,
						'total_data' => $total_rows,
						'range' => $range,
						'perpage' => $perpage,
						'number' => $number,
						'pages' => $pages
					);
					$result['other']      = array(
						'oral_status' => $oral_message
					);
					
					header('Content-Type: application/json');
					echo json_encode($result);
					
				} catch (PDOException $PDOException) {
					$this->failed($PDOException, 'get_student_log', 'Something went wrong', 412);
				}
				
			} else {
				$this->failed('', 'authentication/empty', 'Something went wrong auth/empty @ get_student_log', 412);
				
			}
		}
		
		/**
		 * @param $data
		 */
		public function applicationDenied($data)
		{
			$params = $data->data;
			
			if ($this->is_valid_user('coordinator')) {
				try {
					
					$application_status = 'rejected';
					$stmt               = $this->db->prepare("UPDATE student_application SET application_status= :application_status,
                                                                                    reject_reason = :reject_reason WHERE application_id=:id AND student_number = :student_number");
					
					$stmt->bindParam(':id', $params->applicationId);
					$stmt->bindParam(':application_status', $application_status);
					$stmt->bindParam(':reject_reason', $params->reason);
					$stmt->bindParam(':student_number', $params->student_number);
					$stmt->execute();
					
					$date           = new DateTime();
					$date_evaluated = $date->format("Y-m-d\\TH:i:s");
					$data           = array(
						'message' => 'Application Denied : ' . $params->reason,
						'createdAt' => $date_evaluated,
						'extras' => 'report_problem',    // notification icon
						'receipt' => 'not read',
					
					);
					$this->sendStudentNotification($params, $data);
					$this->success('Application Denied');
					
				} catch (PDOException $exception) {
					$this->failed($exception, 'denying_application', '', 412);
				}
			}
		}
		
		/**
		 * @param $data
		 */
		public function getApplicationById($data)
		{
			$params = $data->data;
			if ($this->is_valid_user('coordinator')) {
				
				try {
					
					$stmt = $this->db->prepare("SELECT * FROM  student_application LEFT JOIN student ON
                                                      student_application.student_number = student.student_number
                                                      WHERE student_application.application_id = :id
                                                      ORDER BY student_application.application_date DESC");
					
					$stmt->bindParam(':id', $params->application_id);
					$stmt->execute();
					$application = $stmt->fetch();
					
					if (!empty($application)) {
						
						$count                   = 1;
						$app                     = new Result();
						$app->id                 = $count;
						$app->application_id     = $application['application_id'];
						$app->student_number     = $application['student_number'];
						$app->student_first_name = $application['first_name'];
						$app->student_last_name  = $application['last_name'];
						$app->student_email      = $application['email'];
						$app->company_name       = $application['company_name'];
						$app->company_field      = $application['company_field'];
						$app->company_address    = $application['company_address'];
						$app->company_fax        = $application['company_fax'];
						$app->company_phone      = $application['company_phone'];
						$app->company_email      = $application['company_email'];
						$app->work_description   = $application['work_description'];
						$app->application_status = $application['application_status'];
						$app->application_date   = $application['application_date'];
						$app->reject_reason      = $application['reject_reason'];
						
						
						header('Content-Type: application/json');
						echo json_encode($app);
					} else {
						// $response = new Result();
						$response = "No Result Found";
						header("Content-Type: application/json");
						http_response_code(404);
						echo json_encode($response);
						die();
					}
					
				} catch (PDOException $exception) {
					$this->failed($exception, 'getting application by id');
				}
			} else {
				$this->failed('', 'valid user error');
			}
		}
		
		/**
		 * @param $params
		 */
		public function getApplications($params)
		{
			// $params = $data->data;
			if ($this->is_valid_user('coordinator')) {
				
				try {
					
					
					$param = $params->data;
					
					
					$start          = 0;
					$perpage        = 9999999999;
					$page           = 1;
					$search_keyword = '';
					
					if (@$param->search_keyword) {
						$search_keyword = $param->search_keyword;
					}
					if (@ $param->page) {
						@ $start = $param->page + 1;
						
					}
					if (@$param->perpage) {
						@ $perpage = $param->perpage;
					}
					$total = $this->db->query("SELECT COUNT(student_number) AS rows FROM student_application
                                                WHERE student_number LIKE '%" . $search_keyword . "%'
                                                OR `company_name` LIKE '%" . $search_keyword . "%'
                                                OR `application_date` LIKE '%" . $search_keyword . "%'
                                                OR `company_email` LIKE '%" . $search_keyword . "%'
                                                OR `work_description` LIKE '%" . $search_keyword . "%'")->fetch(PDO::FETCH_OBJ);
					
					
					$total_rows = $total->rows;
					
					$pages = ceil($total_rows / $perpage);
					
					$data   = array(
						'options' => array(
							'default' => 1,
							'min_range' => 1,
							'max_range' => $pages
						)
					);
					$number = trim($start);
					$number = filter_var($number, FILTER_VALIDATE_INT, $data);
					$range  = $perpage * ($number - 1);
					
					
					$stmt = $this->db->prepare("SELECT * FROM  student_application LEFT JOIN student ON
                                                      student_application.student_number = student.student_number 
                                                      WHERE student_application.student_number LIKE :keyword
                                                      OR student_application.company_name LIKE :keyword
                                                      OR student_application.company_email LIKE :keyword 
                                                      OR student.last_name LIKE :keyword
                                                      OR student.first_name LIKE :keyword
                                                      OR student_application.application_status LIKE :keyword
                                                      ORDER BY student_application.application_date DESC");
					
					
					$stmt->bindValue(':keyword', '%' . $search_keyword . '%', PDO::PARAM_STR);
					$stmt->bindParam(':perpage', $perpage, PDO::PARAM_INT);
					$stmt->bindParam(':limit', $range, PDO::PARAM_INT);
					$stmt->execute();
					$applications = $stmt->fetchAll();
					
					
					$result                 = array();
					$result['applications'] = array();
					$count                  = 1;
					foreach ($applications as $application) {
						$app                     = new Result();
						$app->id                 = $count;
						$app->application_id     = $application['application_id'];
						$app->student_number     = $application['student_number'];
						$app->student_first_name = $application['first_name'];
						$app->student_last_name  = $application['last_name'];
						$app->company_name       = $application['company_name'];
						$app->company_field      = $application['company_field'];
						$app->company_address    = $application['company_address'];
						$app->company_fax        = $application['company_fax'];
						$app->company_phone      = $application['company_phone'];
						$app->company_email      = $application['company_email'];
						$app->work_description   = $application['work_description'];
						$app->application_status = $application['application_status'];
						$app->application_date   = $application['application_date'];
						$app->reject_reason      = $application['reject_reason'];
						
						$count++;
						$result['applications'][] = $app;
					}
					$result['pagination'] = array(
						'default' => 1,
						'min_range' => 1,
						'max_range' => $pages,
						'total_data' => $total_rows,
						'range' => $range,
						'perpage' => $perpage,
						'number' => $number,
						'pages' => $pages
					);
					
					header('Content-Type: application/json');
					echo json_encode($result);
				} catch (PDOException $exception) {
					$this->failed($exception, 'getting application', '', 412);
				}
			} else {
				$this->failed('', 'valid user error 2');
			}
		}
		
		/**
		 * @param $params
		 */
		public function getCompanyConfirmationForm($params)
		{
			
			
			if ($this->is_valid_user('coordinator') && !empty($params)) {
				
				try {
					$param = $params->data;
					$stmt  = $this->db->prepare("SELECT * FROM  company_confirmation
                                                      WHERE company_id=:company_id AND student_number=:student_number");
					
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->execute();
					$log = $stmt->fetch();
					if (!empty($log)) {
						$l                    = new Result();
						$l->company_id        = $log['company_id'];
						$l->others            = $log['other'];
						$l->work_fields       = $log['work_fields'];
						$l->end_date          = $log['end_date'];
						$l->start_date        = $log['start_date'];
						$l->contact_person    = $log['contact_person'];
						$l->company_name      = $log['company_name'];
						$l->company_address   = $log['company_address'];
						$l->company_phone     = $log['company_phone'];
						$l->student_number    = $log['student_number'];
						$l->internship_status = $log['internship_status'];
						$l->student_name      = $log['intern_name'];
						$l->form_id           = $log['form_id'];
						
						header('Content-Type: application/json');
						echo json_encode($l);
						
					} else {
						$this->failed('', 'empty', 'not found', 404);
					}
					
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'getting company interns', $exception->getCode(), 412);
				}
			} else {
				$this->failed('', 'empty/not_authorised', '', 412);
				
			}
			
		}
		
		/**
		 * @param $params
		 */
		public function getInterns($params)
		{
			
			
			if ($this->is_valid_user('coordinator') && !empty($params)) {
				
				
				try {
					
					$param = $params->data;
					
					
					$start          = 0;
					$perpage        = 9999999999;
					$page           = 1;
					$search_keyword = '';
					
					if (@$param->search_keyword) {
						$search_keyword = $param->search_keyword;
					}
					if (@ $param->page) {
						@ $start = $param->page + 1;
						
					}
					if (@$param->perpage) {
						@ $perpage = $param->perpage;
					}
					$total = $this->db->query("SELECT COUNT(student_number) AS rows FROM company_confirmation
                                                WHERE `company_name`  LIKE '%" . $search_keyword . "%'
                                                OR `student_number` LIKE '%" . $search_keyword . "%'
                                                OR `intern_name` LIKE '%" . $search_keyword . "%'
                                                OR `internship_status` LIKE '%" . $search_keyword . "%'
                                                OR `end_date` LIKE '%" . $search_keyword . "%'
                                                OR `start_date` LIKE '%" . $search_keyword . "%'")->fetch(PDO::FETCH_OBJ);
					
					
					$total_rows = $total->rows;
					
					$pages = ceil($total_rows / $perpage);
					
					$data   = array(
						'options' => array(
							'default' => 1,
							'min_range' => 1,
							'max_range' => $pages
						)
					);
					$number = trim($start);
					$number = filter_var($number, FILTER_VALIDATE_INT, $data);
					$range  = $perpage * ($number - 1);
					
					
					$stmt = $this->db->prepare("SELECT * FROM  evaluation
													  RIGHT JOIN company_confirmation
                                                      ON company_confirmation.student_number = evaluation.student_id
                                                      WHERE company_confirmation.company_name LIKE :keyword
                                                      OR company_confirmation.student_number LIKE :keyword
                                                      OR company_confirmation.current_internship LIKE :keyword
                                                      OR company_confirmation.internship_status LIKE :keyword
                                                      OR company_confirmation.intern_name LIKE :keyword
                                                      ORDER BY company_confirmation.start_date  ASC LIMIT :limit, :perpage");
					
					$stmt->bindValue(':keyword', '%' . $search_keyword . '%', PDO::PARAM_STR);
					$stmt->bindParam(':perpage', $perpage, PDO::PARAM_INT);
					$stmt->bindParam(':limit', $range, PDO::PARAM_INT);
					
					$stmt->execute();
					$interns = $stmt->fetchAll();
					
					$result            = array();
					$result['interns'] = array();
					foreach ($interns as $log) {
						$l                    = new Result();
						$l->company_id        = $log['company_id'];
						$l->others            = $log['other'];
						$l->work_fields       = $log['work_fields'];
						$l->end_date          = $log['end_date'];
						$l->start_date        = $log['start_date'];
						$l->contact_person    = $log['contact_person'];
						$l->company_name      = $log['company_name'];
						$l->company_address   = $log['company_address'];
						$l->company_phone     = $log['company_phone'];
						$l->student_number    = $log['student_number'];
						$l->internship_status = $log['internship_status'];
						$l->student_name      = $log['intern_name'];
						$l->form_id           = $log['form_id'];
						$l->evaluation        = $log['evaluation_id'];
						
						$result['interns'][] = $l;
					}
					
					$result['pagination'] = array(
						'default' => 1,
						'min_range' => 1,
						'max_range' => $pages,
						'total_data' => $total_rows,
						'range' => $range,
						'perpage' => $perpage,
						'number' => $number,
						'pages' => $pages
					);
					
					
					header('Content-Type: application/json');
					echo json_encode($result);
					
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'getting company interns', '', 412);
				}
			} else {
				$this->failed('', 'empty/not_authorised', '', 412);
				
			}
		}
		
		
		public function getExamMessage($params)
		{
			
			if ($this->is_valid_user('coordinator') && !empty($params->data)) {
				$param = $params->data;
				try {
					
					$stmt = $this->db->prepare("SELECT * FROM exam_message
                                                        WHERE student_number = :student_number
                                                        AND exam_status ='not taken' ORDER BY message_date DESC ");
					
					$stmt->bindParam('student_number', $param->student_number);
					$stmt->execute();
					$applications = $stmt->fetchAll();
					
					
					$result = array();
					
					$count = 1;
					foreach ($applications as $application) {
						$app                 = new Result();
						$app->message_id     = $application['message_id'];
						$app->student_number = $application['student_number'];
						$app->company_id     = $application['company_id'];
						$app->exam_date      = $application['exam_date'];
						$app->exam_time      = $application['exam_time'];
						$app->exam_status    = $application['exam_status'];
						$app->message_date   = $application['message_date'];
						$app->message        = $application['message'];
						$result[]            = $app;
					}
					
					header('Content-Type: application/json');
					echo json_encode($result);
					
				} catch (PDOException $exception) {
					$this->failed($exception, 'getApplication', 'Something went wrong', 412);
				}
			} else {
				$this->failed('', 'authentication/empty', 'Something minor happened', 403);
			}
		}
		
		/**
		 * @param $params
		 */
		public function submitEvaluation($params)
		{
			
			if ($this->is_valid_user('coordinator') && !empty($params)) {
				try {
					$param          = $params->data;
					$date           = new DateTime();
					$date_evaluated = $date->format("Y-m-d\\TH:i:s");
					$stmt           = $this->db->prepare("INSERT INTO evaluation(student_id,company_id,report_evaluation,
                                                                          work_done_evaluation,knowledge_evaluation, 
                                                                          answering_questions_evaluation, note, evaluation_date, result)
                                                                          VALUES (:student_id, :company_id, :report_evaluation,
                                                                                  :work_done_evaluation, :student_knowledge,
                                                                                  :answering_question,
                                                                                  :note, :date_evaluated, :result)");
					
					$stmt->bindParam(':student_id', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->bindParam(':report_evaluation', $param->eval_report);
					$stmt->bindParam(':work_done_evaluation', $param->eval_work_done);
					$stmt->bindParam(':student_knowledge', $param->student_knowledge);
					$stmt->bindParam(':answering_question', $param->answering_question);
					$stmt->bindParam(':date_evaluated', $date_evaluated);
					$stmt->bindParam(':note', $param->note);
					$stmt->bindParam(':result', $param->result);
					$stmt->execute();
					
					$data = array(
						'message' => 'Evaluation Result: ',
						'createdAt' => $date_evaluated,
						'extras' => 'content_paste',
						'receipt' => 'not read',
					
					);
					$this->sendStudentNotification($param, $data);
					$this->sendCompanyNotification($param, $data);
					$this->success('Form Submitted');
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'evaluation', '', 412);
				}
			} else {
				$this->failed('', 'empty/not_authorised', '', 412);
				
			}
		}
		
		
		public function sendOralExamMessage($params)
		{
			
			if ($this->is_valid_user('coordinator') && !empty($params)) {
				
				try {
					$param        = $params->data;
					$now          = new DateTime();
					$exdate       = new DateTime($param->exam_date);
					$examDate     = $exdate->format("Y-m-d\\TH:i:s");
					$message_date = $now->format("Y-m-d\\TH:i:s");
					$exam_status  = 'not taken';
					$stmt         = $this->db->prepare("INSERT INTO exam_message(message, student_number, company_id,
                                                                                  exam_date, exam_time, exam_status, message_date)
                                                          VALUES(:message, :student_number, :company_id, :exam_date, 
                                                                :exam_time, :exam_status, :message_date)");
					
					$stmt->bindParam(':message', $param->message);
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->bindParam(':exam_date', $examDate);
					$stmt->bindParam(':exam_time', $param->exam_time);
					$stmt->bindParam(':exam_status', $exam_status);
					$stmt->bindParam(':message_date', $message_date);
					$ot  = new DateTime($param->exam_date);
					$exd = $ot->format("M-D-y");
					
					$data = array(
						'message' => "Oral Examination. Date:  $exd",
						'createdAt' => $message_date,
						'extras' => 'event_note',
						'receipt' => 'not read',
					);
					$this->sendStudentNotification($param, $data);
					
					$stmt->execute();
					$this->success('Message sent');
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'oral/exam', 'database error', 412);
				}
			} else {
				$this->failed('', 'auth/empty', 'empty or auth', 412);
			}
		}
		
		/**
		 * @param $param
		 * @param $data
		 */
		private function sendStudentNotification($param, $data)
		{
			
			$senderType = 'coordinator';
			$stmt       = $this->db->prepare("INSERT INTO student_notifications(sender_id, receiver_id, message, created_at, extras, receipt, sender_type, sender_name)
                                                       VALUES(:sender_id, :receiver_id, :message, :created_at, :extras,
                                                              :receipt, :sender_type, :sender_name)");
			
			
			$stmt->bindParam(':sender_id', $param->coordinator_id);
			$stmt->bindParam(':receiver_id', $param->student_number);
			$stmt->bindParam(':message', $data['message']);
			$stmt->bindParam(':created_at', $data['createdAt']);
			$stmt->bindParam(':extras', $data['extras']);
			$stmt->bindParam(':receipt', $data['receipt']);
			$stmt->bindParam(':sender_type', $senderType);
			$stmt->bindParam(':sender_name', $senderType);
			$stmt->execute();
		}
		
		/**
		 * @param $param
		 * @param $data
		 */
		private function sendCompanyNotification($param, $data)
		{
			
			$senderType = 'coordinator';
			$stmt       = $this->db->prepare("INSERT INTO company_notifications(sender_id, receiver_id, message, created_at, extras, receipt, sender_type, sender_name)
                                                 VALUES(:sender_id, :receiver_id, :message, :created_at, :extras,
                                                 :receipt, :sender_type, :sender_name) ");
			
			
			$stmt->bindParam(':sender_id', $param->coordinator_id);
			$stmt->bindParam(':receiver_id', $param->company_id);
			$stmt->bindParam(':message', $data['message']);
			$stmt->bindParam(':created_at', $data['createdAt']);
			$stmt->bindParam(':extras', $data['extras']);
			$stmt->bindParam(':receipt', $data['receipt']);
			$stmt->bindParam(':sender_type', $senderType);
			$stmt->bindParam(':sender_name', $senderType);
			$stmt->execute();
		}
		
		/**
		 * @param $exception
		 * @param $method
		 * @param $message
		 * @param $code
		 */
		private function failed($exception, $method, $message, $code)
		{
			$response            = new Result();
			$response->result    = "failure @ $method";
			$response->exception = $exception;
			$response->message   = $message;
			
			header("Content-Type: application/json");
			http_response_code($code);
			echo json_encode($response);
			die();
			
		}
		
		
		/**
		 * @param $value
		 */
		private function success($value)
		{
			$response          = new Result();
			$response->result  = "OK";
			$response->message = $value;
			header("Content-Type: application/json");
			echo json_encode($response);
		}
		
		
	}