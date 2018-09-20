<?php
	
	require_once 'Result.php';
	
	class StudentController extends _Database
	{
		
		
		protected $__db;
		protected $_exception;
		
		/**
		 * @param $params
		 */
		public function getNotification($params)
		{
			if (!empty($params) && $this->is_valid_user('student')) {
				try {
					$param       = $params->data;
					$start       = $param->limit;
					$receiver_id = $param->id;
					
					$total = $this->db->query("SELECT COUNT(id) as rows FROM student_notifications
                                                WHERE receiver_id =$receiver_id")->fetch(PDO::FETCH_OBJ);
					
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
					
					$number = trim($start);
					$number = filter_var($number, FILTER_VALIDATE_INT, $data);
					$range  = $perpage * ($number - 1);
					
					
					$stmt = $this->db->prepare("SELECT * FROM student_notifications WHERE receiver_id =:student_number
                                                          ORDER BY created_at DESC LIMIT :limit, :perpage");
					
					$stmt->bindParam(':student_number', $param->id, PDO::PARAM_INT);
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
		
		
		public function getCompanyConfirmationForm($params)
		{
			
			
			if ($this->is_valid_user('student') && !empty($params)) {
				
				try {
					$param = $params->data;
					$stmt  = $this->db->prepare("SELECT * FROM  company_confirmation
                                                      WHERE student_application_form_id=:application_id
                                                       AND student_number=:student_number");
					
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':application_id', $param->application_id);
					$stmt->execute();
					$log                  = $stmt->fetch();
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
					
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'getting company interns', $exception->getCode(), 412);
				}
			}
			
		}
		
		
		public function verifyStudentFormData($params)
		{
			
			if ($this->is_valid_user('student') && !empty($params)) {
				try {
					$param = $params->data;
					$stmt  = $this->db->prepare("SELECT student_number, application_id
                                                          FROM student_application
                                                          WHERE student_number=:student_number
                                                          AND  application_id =:application_id");
					
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':application_id', $param->application_id);
					$stmt->execute();
					$count = $stmt->rowCount();
					echo $count;
					if ($count >= 1) {
						$this->success('Looks good');
					} else {
						$this->failed('null', 'validity', 'false', 404);
					}
				} catch (PDOException $PDO_exception) {
				
				}
			}
		}
		
		public function getActiveInternshipCompany($params)
		{
			
			if ($this->is_valid_user('student') && !empty($params)) {
				
				
				try {
					$param = $params->data;
					$stmt  = $this->db->prepare("SELECT * FROM company_confirmation
                                                     WHERE student_number=:student_number
                                                     AND current_internship='true'");
					
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->execute();
					$logs   = $stmt->fetchAll();
					$result = array();
					foreach ($logs as $log) {
						$l                    = new Result();
						$l->company_id        = $log['company_id'];
						$l->others            = $log['other'];
						$l->work_fields       = $log['work_fields'];
						$l->end_date          = $log['end_date'];
						$l->start_date        = $log['start_date'];
						$l->contact_person    = $log['contact_person'];
						$l->company_address   = $log['company_address'];
						$l->company_phone     = $log['company_phone'];
						$l->student_number    = $log['student_number'];
						$l->internship_status = $log['internship_status'];
						$l->student_name      = $log['intern_name'];
						
						/*
						 *
						 * company_name: string;
	  company_address: string;
	  company_phone: string;
	  student_name: string;
	  student_number: number;
	  contact_person: string;
	  start_date: any;
	  end_date: any;
	  work_fields: any;
	  others?: any;
	  company_id: number;
						 *
						 * */
						$result[] = $l;
					}
					
					header('Content-Type: application/json');
					echo json_encode($result);
					
				} catch (PDOException $PDOException) {
					$this->failed($PDOException, 'get_student_log', 'Something went wrong', 412);
				}
				
			} else {
				$this->failed('', 'authentication/empty', 'Something went wrong auth/empty @ get_student_log', 412);
				
			}
		}
		
		public function checkIfCanStartLog($params)
		{
			try {
				
				$stmt = $this->db->prepare("SELECT * FROM company_confirmation
                                                     WHERE student_number=:student_number
                                                     AND company_id =:company_id
                                                  AND current_internship ='true'");
				
				$stmt->bindParam(':student_number', $params->student_number);
				$stmt->bindParam(':company_id', $params->company_id);
				$stmt->execute();
				$result = $stmt->fetchAll();
				
				if (empty($result)) {
					return true;
				} else {
					return false;  //print_r($result);
				}
				//return empty($result);
				
			} catch (PDOException $exception) {
				$this->failed($exception, 'check_if_can_start', '', 412);
			}
			
		}
		
		public function getStudentLog($params)
		{
			
			if ($this->is_valid_user('student') && !empty($params)) {
				$param = $params->data;
				
				if (!$this->checkIfCanStartLog($param)) {
					try {
						
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
                                                WHERE student_number =$student_number AND company_id = $company_id
                                                ")->fetch(PDO::FETCH_OBJ);
						
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
						
						
						$stmt = $this->db->prepare("SELECT * FROM log_review RIGHT JOIN  student_log
                                                              ON student_log.log_id = log_review.log_id
                                                              WHERE  (student_log.log_department LIKE :keyword
                                                              OR student_log.log_description LIKE :keyword
                                                              OR student_log.log_day LIKE :keyword
                                                              OR  student_log.log_date LIKE :keyword)
                                                              AND student_log.student_number =:student_number
                                                              AND  student_log.company_id =:company_id
                                                              ORDER BY student_log.log_date ASC LIMIT :limit, :perpage");
						$stmt->bindParam(':student_number', $param->student_number);
						$stmt->bindParam(':company_id', $param->company_id);
						
						$stmt->bindValue(':keyword', '%' . $search_keyword . '%', PDO::PARAM_STR);
						
						$stmt->bindParam(':perpage', $perpage, PDO::PARAM_INT);
						$stmt->bindParam(':limit', $range, PDO::PARAM_INT);
						
						
						$stmt->execute();
						$logs = $stmt->fetchAll();
						
						
						$result         = array();
						$result['logs'] = array();
						//  print_r($logs);
						foreach ($logs as $log) {
							$l                  = new Result();
							$l->log_status      = $log['log_status'];
							$l->log_description = $log['log_description'];
							$l->company_id      = $log['company_id'];
							$l->log_department  = $log['log_department'];
							$l->log_date        = $log['log_date'];
							$l->log_id          = $log['log_id'];
							$l->log_review      = $log['review'];
							$l->review_id       = $log['id'];
							$l->log_day         = $log['log_day'];
							$result['logs'][]   = $l;
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
						
					} catch (PDOException $PDOException) {
						$this->failed($PDOException->getMessage(), 'get_student_log', 'Something went wrong', 412);
					}
				} else {
					$this->failed('', 'get_student_log/cant_start', 'Cant Start Log', 412);
					
				}
			} else {
				$this->failed('', 'authentication/empty', 'Something went wrong auth/empty @ get_student_log', 412);
				
			}
		}
		
		
		public function submitForm($data)
		{
			
			if ($this->is_valid_user('student')) {
				$param = $data->data;
				if ($param->isFormUpdate && $param->application_id) {
					$this->updateApplication($param);
				} else {
					$this->newApplication($param);
				}
			} else {
				$this->failed('', 'submit_application', 'auht/empty', 403);
			}
		}
		
		
		private function updateApplication($param)
		{
			$now         = new DateTime();
			$form_date   = $now->format("Y-m-d\\TH:i:s");
			$form_status = 'pending';
			try {
				
				$stmt = $this->db->prepare("UPDATE student_application
                                                 SET  company_name =:company_name,
                                                                      company_field = :company_field,
                                                                      company_address = :company_address,
                                                                      company_fax = :company_fax,
                                                                      company_phone =:company_phone,
                                                                      company_email =:company_email,
                                                                      work_description =:work_description,
                                                                      application_status =:application_status,
                                                                      application_date =:application_date
                                                                      WHERE application_id=:id
                                                                      AND student_number=:student_number");
				
				$stmt->bindParam(':id', $param->application_id);
				$stmt->bindParam(':student_number', $param->student_number);
				$stmt->bindParam(':company_name', $param->company_name);
				$stmt->bindParam(':company_field', $param->company_field);
				$stmt->bindParam(':company_address', $param->company_address);
				$stmt->bindParam(':company_fax', $param->company_fax);
				$stmt->bindParam(':company_phone', $param->company_phone);
				$stmt->bindParam(':company_email', $param->company_email);
				$stmt->bindParam(':work_description', $param->work_description);
				$stmt->bindParam(':application_status', $form_status);
				$stmt->bindParam(':application_date', $form_date);
				$stmt->execute();
				$this->success('Application Updated');
			} catch (PDOException $exception) {
				$this->failed($exception->getMessage(), 'update_application', 'update gone wrong', 412);
			}
			
		}
		
		private function newApplication($param)
		{
			$now         = new DateTime();
			$form_date   = $now->format("Y-m-d\\TH:i:s");
			$form_status = 'pending';
			try {
				
				$this->db->beginTransaction();
				
				$stmt = $this->db->prepare("INSERT INTO student_application(student_number,company_name,company_field,company_address,company_fax,company_phone,company_email,work_description, application_status, application_date) VALUES (:student_number, :company_name,
                                                                        :company_field, :company_address, :company_fax, :company_phone,
                                                                        :company_email, :work_description, :application_status,:application_date) ");
				
				$stmt->bindParam(':student_number', $param->student_number);
				$stmt->bindParam(':company_name', $param->company_name);
				$stmt->bindParam(':company_field', $param->company_field);
				$stmt->bindParam(':company_address', $param->company_address);
				$stmt->bindParam(':company_fax', $param->company_fax);
				$stmt->bindParam(':company_phone', $param->company_phone);
				$stmt->bindParam(':company_email', $param->company_email);
				$stmt->bindParam(':work_description', $param->work_description);
				$stmt->bindParam(':application_status', $form_status);
				$stmt->bindParam(':application_date', $form_date);
				$stmt->execute();
				
				
				$data = array(
					'message' => 'New Internship Application from : ' . $param->student_name,
					'created_at' => $form_date,
					'extras' => 'library_books',
					'receipt' => 'not read',
				
				);
				
				$this->sendCoordinatorNotification($param, $data);
				$this->success('Application sent');
			} catch (PDOException $exception) {
				$this->failed($exception->getMessage(), 'newApplication', 'Something went wrong', 412);
				
			}
		}
		
		
		private function sendCoordinatorNotification($param, $data)
		{
			
			
			$senderType = 'student';
			$stmt       = $this->db->prepare("INSERT INTO coordinator_notifications(sender_id, message, created_at,
                                                                                        extras, receipt, sender_type, sender_name)
                                                 VALUES(:sender_id, :message, :created_at, :extras,
                                                 :receipt, :sender_type, :sender_name) ");
			
			
			$stmt->bindParam(':sender_id', $param->student_number);
			$stmt->bindParam(':message', $data['message']);
			$stmt->bindParam(':created_at', $data['created_at']);
			$stmt->bindParam(':extras', $data['extras']);
			$stmt->bindParam(':receipt', $data['receipt']);
			$stmt->bindParam(':sender_type', $senderType);
			$stmt->bindParam(':sender_name', $param->student_name);
			$stmt->execute();
			
			$this->db->commit();
		}
		
		public function updateLog($params)
		{
			if ($this->is_valid_user('student') && !empty($params)) {
				
				try {
					
					$this->db->beginTransaction();
					$param    = $params->data;
					$now      = new DateTime($param->log_date);
					$log_date = $now->format("Y-m-d\\TH:i:s");
					$stmt     = $this->db->prepare("UPDATE student_log SET log_status=:log_status , log_date=:log_date,
                                                      log_description=:log_description, log_department =:log_department
                                                 WHERE log_id=:log_id AND student_number=:student_number
                                                 AND company_id =:company_id AND log_id=:log_id");
					
					$stmt->bindParam(':log_id', $param->log_id);
					$stmt->bindParam(':log_status', $param->log_status);
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->bindParam(':log_date', $log_date);
					$stmt->bindParam(':log_department', $param->log_department);
					$stmt->bindParam(':log_description', $param->log_description);
					$stmt->execute();
					
					$this->db->commit();
					$this->success('');
					
				} catch (PDOException $PDOException) {
					$this->db->rollBack();
					$this->failed($PDOException->getMessage(), 'updating log', 'update to log' . $params->data->log_id, 412);
				}
			} else {
				$this->failed('none', 'update_log', 'auth/empty', 412);
			}
		}
		
		private function checkLogDate($param): bool
		{
			$student_number = $param->student_number;
			$now            = new DateTime($param->log_date);
			$log_date       = $now->format("Y-m-d");
			
			$total = $this->db->query("SELECT COUNT(student_number) as rows FROM student_log
                                                WHERE student_number=$student_number AND log_date = '$log_date' ")->fetch(PDO::FETCH_OBJ);
			
			$total_rows = $total->rows;
			if ($total_rows >= 1)
				return true;
			else
				return false;
			
		}
		
		public function submitLog($params)
		{
			
			
			if ($this->is_valid_user('student') && !empty($params)) {
				$param = $params->data;
				
				$now            = new DateTime($param->log_date);
				$form_date      = $now->format("Y-m-d");
				$log_status     = 'pending';
				$student_number = $param->student_number;
				try {
					
					if ($this->checkLogDate($param)) {
						$this->failed('', 'log_date_duplicate', "You've entered a log for $form_date, please Choose another date", 412);
						exit();
					}
					
					$total = $this->db->query("SELECT COUNT(student_number) as rows FROM student_log
                                                WHERE student_number =$student_number")->fetch(PDO::FETCH_OBJ);
					
					$total_rows = $total->rows;
					
					$day  = $total_rows + 1;
					$stmt = $this->db->prepare("INSERT INTO student_log(log_date,log_department,
                                                                  log_description,
                                                                  log_status, student_number, company_id, log_day)
                                                          VALUES (:log_date, :log_department,
                                                                        :log_description, :log_status, :student_number,
                                                                        :company_id, :log_day) ");
					
					$stmt->bindParam(':log_date', $form_date);
					$stmt->bindParam(':log_department', $param->log_department);
					$stmt->bindParam(':log_description', $param->log_description);
					$stmt->bindParam(':log_status', $log_status);
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->bindParam(':log_day', $day);
					$stmt->execute();
					
					$now2        = new DateTime();
					$review_date = $now2->format("Y-m-d\\TH:i:s");
					$log_date    = $now->format("M-D-y");
					$data        = array(
						'message' => "New log from: $param->student_name, Log Date: $log_date",
						'createdAt' => $review_date,
						'extras' => 'library_books',
						'receipt' => 'not read',
						'senderName' => $param->student_name
					
					);
					$this->sendCompanyNotification($param, $data);
					$this->success('Log Updated');
				} catch (PDOException $PDO_exception) {
					$this->failed($PDO_exception->getMessage(), $PDO_exception->getCode(), 'Something happen', 412);
				}
			} else {
				$this->failed('', 'authentication/empty', 'Something happen', 403);
				
			}
		}
		
		public function getExamMessage($params)
		{
			
			if ($this->is_valid_user('student') && !empty($params)) {
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
		
		public function getApplication($data)
		{
			
			if ($this->is_valid_user('student') && !empty($data)) {
				$params = $data->data;
				try {
					
					$stmt = $this->db->prepare("SELECT * FROM student_application
                                                        WHERE student_number = :student_number");
					
					$stmt->bindParam('student_number', $params->student_number);
					$stmt->execute();
					$applications = $stmt->fetchAll();
					
					
					$result = array();
					
					$count = 1;
					foreach ($applications as $application) {
						$app                           = new Result();
						$app->id                       = $count;
						$app->application_id           = $application['application_id'];
						$app->student_number           = $application['student_number'];
						$app->company_name             = $application['company_name'];
						$app->company_field            = $application['company_field'];
						$app->company_address          = $application['company_address'];
						$app->company_fax              = $application['company_fax'];
						$app->company_phone            = $application['company_phone'];
						$app->company_email            = $application['company_email'];
						$app->work_description         = $application['work_description'];
						$app->application_status       = $application['application_status'];
						$app->application_date         = $application['application_date'];
						$app->form_confirmation_status = $application['confirmation_form_status'];
						$app->reject_reason            = $application['reject_reason'];
						
						$count++;
						$result[] = $app;
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
		
		
		public function getEvaluationResult($data)
		{
			
			if ($this->is_valid_user('student') && !empty($data)) {
				$params = $data->data;
				try {
					
					$stmt = $this->db->prepare("SELECT * FROM evaluation
                                                        WHERE student_id = :student_number");
					
					$stmt->bindParam('student_number', $params->student_number);
					$stmt->execute();
					$application = $stmt->fetch();
					
					
					// $result = array();
					$app                     = new Result();
					$app->application_id     = $application['evaluation_id'];
					$app->student_number     = $application['student_id'];
					$app->company_id         = $application['company_id'];
					$app->eval_report        = $application['report_evaluation'];
					$app->eval_work_done     = $application['work_done_evaluation'];
					$app->student_knowledge  = $application['knowledge_evaluation'];
					$app->answering_question = $application['answering_questions_evaluation'];
					$app->note               = $application['note'];
					$app->result             = $application['result'];
					$app->evaluation_date    = $application['evaluation_date'];
					// $result[] = $app;
					/*  $count = 1;
					  foreach ($applications as $application) {

					  }*/
					
					header('Content-Type: application/json');
					echo json_encode($app);
					
				} catch (PDOException $exception) {
					$this->failed($exception, 'getApplication', 'Something went wrong', 412);
				}
			} else {
				$this->failed('', 'authentication/empty', 'Something minor happened', 403);
			}
		}
		
		
		/**
		 * @param $param
		 * @param $data
		 */
		private function sendCompanyNotification($param, $data)
		{
			
			$senderType = 'student';
			$stmt       = $this->db->prepare("INSERT INTO company_notifications(sender_id, receiver_id, message,
                                                        created_at, extras, receipt, sender_type, sender_name)
                                                 VALUES(:sender_id, :receiver_id, :message, :created_at, :extras,
                                                 :receipt, :sender_type, :sender_name) ");
			
			
			$stmt->bindParam(':sender_id', $param->student_number);
			$stmt->bindParam(':receiver_id', $param->company_id);
			$stmt->bindParam(':message', $data['message']);
			$stmt->bindParam(':created_at', $data['createdAt']);
			$stmt->bindParam(':extras', $data['extras']);
			$stmt->bindParam(':receipt', $data['receipt']);
			$stmt->bindParam(':sender_type', $senderType);
			$stmt->bindParam(':sender_name', $data['senderName']);
			$stmt->execute();
		}
		
		private function failed($exception, $method, $message, $code): void
		{
			$response            = new Result();
			$response->result    = "failure";
			$response->exception = $exception;
			$response->method    = $method;
			$response->message   = $message;
			header("Content-Type: application/json");
			http_response_code("$code");
			echo json_encode($response);
			die();
			
		}
		
		private function success($message)
		{
			$response          = new Result();
			$response->result  = "OK";
			$response->message = $message;
			header("Content-Type: application/json");
			echo json_encode($response);
			
		}
		
		
		
		
		/*
		 * Call to error function
		 * */
		
		
		/*
		 * call to success Function
		 * */
		
		
	}

