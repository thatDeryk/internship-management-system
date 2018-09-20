<?php
	
	/**
	 *
	 * This is the company class,
	 * Available methods include:
	 *             getStudentById
	 *
	 *
	 */
	class CompanyController extends _Database
	{
		
		/**
		 * @var
		 */
		protected $company;
		
		
		/**
		 * @param $params
		 */
		public function getNotification($params)
		{
			if (!empty($params) && $this->is_valid_user('company')) {
				try {
					$param       = $params->data;
					$limit       = $param->limit;
					$receiver_id = $param->company_id;
					
					$total = $this->db->query("SELECT COUNT(id) as rows FROM company_notifications
                                                        WHERE receiver_id='$receiver_id'")->fetch(PDO::FETCH_OBJ);
					
					
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
					
					
					$stmt = $this->db->prepare("SELECT * FROM company_notifications
                                                          WHERE receiver_id=:company_id
                                                          LIMIT :limit, :perpage");
					
					$stmt->bindParam(':company_id', $param->company_id);
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
		 * @return bool
		 * @param $params
		 **/
		public function checkIfAlreadyFilled($params): bool
		{
			try {
				
				$stmt = $this->db->prepare("SELECT * FROM company_confirmation
                                                  WHERE student_number=:student_number AND company_id =:company_id");
				
				$stmt->bindParam(':student_number', $params->student_number);
				$stmt->bindParam(':company_id', $params->company_id);
				$stmt->execute();
				$result = $stmt->fetchAll();
				
				return !!empty($result);
				
			} catch (PDOException $exception) {
				$this->failed($exception, 'check if filled', '', 412);
			}
			
		}
		
		/**
		 * @param $params
		 */
		public function getStudentById($params)
		{
			
			if (!empty($params) && $this->is_valid_user('company')) {
				try {
					$param = $params->data;
					if ($this->checkIfAlreadyFilled($param)) {
						
						
						$stmt = $this->db->prepare("SELECT * FROM  student_application LEFT JOIN student ON
                                                      student_application.student_number = student.student_number
                                                      WHERE student_application.company_email = :company_email
                                                      AND student_application.application_status = 'accepted'
                                                      AND student_application.student_number =:student_number");
						
						
						$stmt->bindParam(':student_number', $param->student_number);
						$stmt->bindParam(':company_email', $param->email);
						$stmt->execute();
						$interns = $stmt->fetchAll();
						$result  = array();
						$count   = 1;
						foreach ($interns as $intern) {
							$app                    = new Result();
							$app->id                = $count;
							$app->student_number    = $intern['student_number'];
							$app->company_name      = $intern['company_name'];
							$app->student_full_name = $intern['first_name'] . ' ' . $intern['last_name'];
							$result[]               = $app;
						}
						header('Content-Type: application/json');
						echo json_encode($result);
					} else {
						$this->failed('', 'already_filled', '', 412);
					}
					
				} catch (PDOException $exception) {
					$this->failed($exception, 'getting student_by_id', '', 412);
				}
			} else {
				$this->failed('', 'Some parameters are missing', '', 412);
			}
		}
		
		/**
		 * @param $params
		 */
		public function checkStudentName($params)
		{
			if (empty($params)) {
				$response          = new Result();
				$response->result  = "failed";
				$response->message = 'Something went wrong, If problem persist contact System Administrator';
				header("Content-Type: application/json");
				http_response_code(403);
				echo json_encode($response);
				die();
				// exit();
			}
			
			
			if (!$this->is_valid_user('company')) {
				$response          = new Result();
				$response->result  = "Failed";
				$response->message = 'Unauthorised Access';
				header("Content-Type: application/json");
				http_response_code(403);
				echo json_encode($response);
				die();
				// exit();
			}
			
			$param = $params->data;
			
			try {
				$stmt = $this->db->prepare("SELECT company_confirmation.intern_name
                                                  FROM  company_confirmation WHERE intern_name = :intern_name
                                                  AND  company_name =:company_name");
				
				
				$stmt->bindParam(':intern_name', $param->student_name);
				$stmt->bindParam(':company_name', $param->company_name);
				$stmt->execute();
				$interns = $stmt->fetchAll();
				
				if (empty($interns)) {
					$response         = new Result();
					$response->result = "OK";
					header('Content-Type: application/json');
					echo json_encode($response);
				} else {
					$response         = new Result();
					$response->result = "Failed";
					header('Content-Type: application/json');
					http_response_code(412);
					echo json_encode($response);
				}
				
			} catch (PDOException $exception) {
				$this->failed($exception, 'getting company interns', '', 412);
			}
		}
		
		/**
		 * decline log
		 * @param $params
		 */
		public function declineLog($params)
		{
			if ($this->is_valid_user('company') && !empty($params)) {
				try {
					$param = $params->data;
					
					//   $this->db->beginTransaction();
					$now         = new DateTime();
					$review_date = $now->format("Y-m-d\\TH:i:s");
					$stmt        = $this->db->prepare("INSERT INTO log_review(log_id,student_number,company_id,review,review_date)
                                                     VALUES (:log_id,:student_number,:company_id,
                                                     :review, :review_date)");
					
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->bindParam(':log_id', $param->log_id);
					$stmt->bindParam(':review', $param->review);
					$stmt->bindParam(':review_date', $review_date);
					
					$stmt->execute();
					// $log_status = 'declined';
					
					if ($this->updateStudentLog($param, 'declined')) {
						// prepare notification data
						$ld       = new DateTime($param->log_date);
						$log_date = $ld->format("M-D-y");
						$data     = array(
							'message' => "Log Declined, Log Date: $log_date . Review :  $param->review",
							'createdAt' => $review_date,
							'extras' => 'info',
							'receipt' => 'not read',
							'senderName' => ' '
						);
						
						$this->sendStudentNotification($param, $data);
						
						//   $this->db->commit();
						$this->success('Review Added');
					}
					
				} catch (PDOException $PDOException) {
					// $this->db->rollBack();
					$this->failed($PDOException->getMessage(), 'insert_log', 'Insert failed', 412);
				}
			}
			
		}
		
		
		/**
		 * @param $params
		 */
		
		public function acceptLog($params)
		{
			try {
				if (!empty($params) && $this->is_valid_user('company')) {
					$param = $params->data;
					//$this->db->beginTransaction();
					
					if ($this->updateStudentLog($param, 'approved')) {
						// prepare notification data
						$now         = new DateTime();
						$review_date = $now->format("Y-m-d\\TH:i:s");
						$ld          = new DateTime($param->log_date);
						$log_date    = $ld->format("M-D-y");
						$data        = array(
							'message' => "Your Log has been accepted. Log Date:  $log_date",
							'createdAt' => $review_date,
							'extras' => 'check_circle',
							'receipt' => 'not read',
							'senderName' => ' '
						);
						$this->sendStudentNotification($param, $data);
						$this->success('Log accepted');
					}
				}
			} catch (PDOException $PDO_exception) {
				$this->failed($PDO_exception->getMessage(), 'accept_log', $PDO_exception->getCode(), 412);
			}
		}
		
		/**
		 * @param $params
		 * @param $status
		 * @return bool
		 */
		public function updateStudentLog($params, $status)
		{
			
			try {
				
				$log_status = $status;
				$stmt       = $this->db->prepare("UPDATE student_log SET log_status=:log_status
                                                 WHERE log_id=:log_id AND student_number=:student_number
                                                 AND company_id =:company_id");
				
				$stmt->bindParam(':log_id', $params->log_id);
				$stmt->bindParam(':log_status', $log_status);
				$stmt->bindParam(':student_number', $params->student_number);
				$stmt->bindParam(':company_id', $params->company_id);
				$stmt->execute();
				
				//  $this->db->commit();
				return true;
				
			} catch (PDOException $PDOException) {
				// $this->db->rollBack();
				$this->failed($PDOException->getMessage(), 'declining log', '', 412);
			}
		}
		
		public function getEvaluationResult($data)
		{
			
			if ($this->is_valid_user('company') && !empty($data)) {
				$params = $data->data;
				try {
					
					$stmt = $this->db->prepare("SELECT evaluation.*, student.last_name, student.first_name,
                                                          student.student_number
                                                          FROM evaluation LEFT JOIN student
                                                           ON evaluation.student_id = student.student_number
                                                        WHERE evaluation.student_id = :student_number
                                                         AND evaluation.evaluation_id=:eval_id");
					
					$stmt->bindParam(':student_number', $params->student_number);
					$stmt->bindParam(':eval_id', $params->eval_id);
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
					$app->evaluation_date    = $application['evaluation_date'];
					$app->result             = $application['result'];
					$app->student_name       = $application['first_name'] . " " . $application['last_name'];
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
		 * @param $params
		 */
		public function getStudentLogs($params)
		{
			
			if ($this->is_valid_user('company') && !empty($params)) {
				
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
					$student_number = $param->student_number;
					$company_id     = $param->company_id;
					$total          = $this->db->query("SELECT COUNT(student_number) as rows FROM student_log
                                                WHERE student_number=$student_number AND company_id=$company_id
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
					
					
					$stmt = $this->db->prepare("SELECT log_review.*, student_log.*, company_confirmation.student_number,
                                                              company_confirmation.company_id, company_confirmation.start_date,
                                                              company_confirmation.end_date, company_confirmation.internship_status
                                                              FROM log_review
                                                              RIGHT JOIN  student_log
                                                              ON student_log.log_id = log_review.log_id
                                                              RIGHT JOIN company_confirmation
                                                              ON company_confirmation.student_number = student_log.student_number
                                                              WHERE student_log.company_id =:company_id
                                                              AND student_log.student_number =:student_number
                                                              AND (student_log.log_department LIKE :keyword
                                                              OR student_log.log_description LIKE :keyword
                                                              OR student_log.log_day LIKE :keyword
                                                              OR  student_log.log_date LIKE :keyword)
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
		 * @param $params
		 */
		public function SubmitConfirmationForm($params)
		{
			
			if ($this->is_valid_user('company') && !empty($params)) {
				
				try {
					// $this->db->beginTransaction();
					$param             = $params->data;
					$work_fields       = implode('\\', $param->work_fields);
					$start_date        = new DateTime($param->start_date);
					$start_date_string = $start_date->format("Y-m-d\\TH:i:s");
					$end_date          = new DateTime($param->end_date);
					$end_date_string   = $end_date->format("Y-m-d\\TH:i:s");
					$stmt              = $this->db->prepare(
						"INSERT INTO company_confirmation(company_name,company_address,company_phone,
                                                                                  intern_name, contact_person, start_date,
                                                                                  end_date, work_fields, other, company_id,
                                                                                  student_number,
                                                                                  student_application_form_id, internship_status, current_internship)
                                                                          VALUES (:company_name, :company_address, :company_phone,
                                                                                  :intern_name, :contact_person, :start_date,
                                                                                  :end_date, :work_fields, :other, :company_id,
                                                                                  :student_number, :application_id, 'not complete', 'true')");
					
					$stmt->bindParam(':company_name', $param->company_name);
					$stmt->bindParam(':application_id', $param->application_id);
					$stmt->bindParam(':company_address', $param->company_address);
					$stmt->bindParam(':intern_name', $param->student_name);
					$stmt->bindParam(':company_phone', $param->company_phone);
					$stmt->bindParam(':contact_person', $param->contact_person);
					$stmt->bindParam(':start_date', $start_date_string);
					$stmt->bindParam(':end_date', $end_date_string);
					$stmt->bindParam(':work_fields', $work_fields);
					$stmt->bindParam(':other', $param->others);
					$stmt->bindParam(':company_id', $param->company_id);
					$stmt->bindParam(':student_number', $param->student_number);
					
					if ($this->setStudentFormStatus($param->student_number)) {
						$now         = new DateTime();
						$review_date = $now->format("Y-m-d\\TH:i:s");
						$data        = array(
							'message' => 'Confirmation Form has been filled by: ' . $param->company_name,
							'createdAt' => $review_date,
							'extras' => 'note',
							'receipt' => 'not read',
							'senderName' => $param->company_name
						);
						$this->sendStudentNotification($param, $data);
						$this->sendCoordinatorNotification($param, $data);
						
						// $this->db->commit();
						$stmt->execute();
						
						$this->success('Form Submitted');
						
					}
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'company_confirmation_form', '', 412);
				}
			} else {
				$this->failed('', 'auth/emptyParams', 'Some parameters are missing', 412);
				
			}
		}
		
		/**
		 * @param $params
		 */
		public function getCompanyInterns($params)
		{
			
			
			if ($this->is_valid_user('company') && !empty($params)) {
				
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
					$company_email = $param->email;
					$total         = $this->db->query("SELECT COUNT(student_number) AS rows FROM student_application
                                                WHERE company_email = '$company_email' AND application_status='accepted'
                                                AND confirmation_form_status='filled'")->fetch(PDO::FETCH_OBJ);
					
					
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
					
					$stmt = $this->db->prepare("SELECT student_application.*, evaluation.*,
                                                                student.student_number, student.email,
                                                      student.first_name, student.last_name
                                                      FROM  student_application
                                                      LEFT JOIN student
                                                      ON student_application.student_number = student.student_number
                                                      LEFT JOIN evaluation ON student.student_number =evaluation.student_id
                                                      WHERE student_application.company_email = :company_email
                                                      AND student_application.application_status = 'accepted'
                                                      AND student_application.confirmation_form_status = 'filled'
                                                      AND (student_application.student_number LIKE :keyword
                                                      OR student.first_name LIKE :keyword
                                                      OR student.last_name LIKE :keyword
                                                      OR student_application.work_description LIKE :keyword)
                                                      ORDER BY student_application.application_date ASC
                                                      LIMIT :limit, :perpage");
					
					$stmt->bindParam(':company_email', $param->email);
					
					$stmt->bindValue(':keyword', '%' . $search_keyword . '%', PDO::PARAM_STR);
					$stmt->bindParam(':perpage', $perpage, PDO::PARAM_INT);
					$stmt->bindParam(':limit', $range, PDO::PARAM_INT);
					
					$stmt->execute();
					$interns = $stmt->fetchAll();
					
					$result            = array();
					$count             = 1;
					$result['interns'] = array();
					foreach ($interns as $intern) {
						$app = new Result();
						
						$app->id                       = $count;
						$app->application_id           = $intern['application_id'];
						$app->student_number           = $intern['student_number'];
						$app->student_first_name       = $intern['first_name'];
						$app->student_last_name        = $intern['last_name'];
						$app->company_name             = $intern['company_name'];
						$app->company_field            = $intern['company_field'];
						$app->company_address          = $intern['company_address'];
						$app->company_fax              = $intern['company_fax'];
						$app->company_phone            = $intern['company_phone'];
						$app->company_email            = $intern['company_email'];
						$app->work_description         = $intern['work_description'];
						$app->application_status       = $intern['application_status'];
						$app->application_date         = $intern['application_date'];
						$app->evaluation_id            = $intern['evaluation_id'];
						$app->confirmation_form_status = $intern['confirmation_form_status'];
						$count++;
						$result['interns'][] = $app;
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
					
					// $result['pageSize'] = count($result);
					header('Content-Type: application/json');
					echo json_encode($result);
					
				} catch (PDOException $exception) {
					$this->failed($exception->getMessage(), 'getting company interns', '', 412);
				}
			} else {
				$this->failed('', 'empty or not allowed', 'auth/empty', 412);
				
			}
		}
		
		
		/**
		 * @param $params
		 * @return bool
		 */
		public function setInternshipStatus($params)
		{
			
			if ($this->is_valid_user('company') && !empty($params)) {
				try {
					$param = $params->data;
					$stmt  = $this->db->prepare("UPDATE company_confirmation
                                                 SET internship_status='complete'
                                                 WHERE  student_number=:student_number
                                                 AND company_id =:company_id");
					
					
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':company_id', $param->company_id);
					
					// prepare notification data
					$now         = new DateTime();
					$review_date = $now->format("Y-m-d\\TH:i:s");
					
					$data = array(
						'message' => "Internship Complete",
						'createdAt' => $review_date,
						'extras' => 'done_all',
						'receipt' => 'not read',
						'senderName' => ' '
					);
					
					$this->sendStudentNotification($param, $data);
					$data['message'] = "Internship Complete for $param->student_name";
					$this->sendCoordinatorNotification($param, $data);
					
					$stmt->execute();
					$this->success('request success');
					
				} catch (PDOException $PDOException) {
					$this->failed($PDOException->getMessage(), 'status not set', '', 412);
				}
			} else {
				$this->failed('', 'empty or not allowed', 'auth/empty', 412);
			}
			
		}
		
		
		public function getStudentConfirmationForm($params)
		{
			
			if ($this->is_valid_user('company') && !empty($params)) {
				
				try {
					
					$param = $params->data;
					
					$stmt = $this->db->prepare("SELECT * FROM company_confirmation
                                                         WHERE company_id =:company_id
                                                         AND student_number=:student_number");
					
					$stmt->bindParam(":company_id", $param->company_id);
					$stmt->bindParam(":student_number", $param->student_number);
					
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
					
				} catch (PDOException $PDOException) {
					$this->failed($PDOException->getMessage(), 'status not set', '', 412);
				}
			} else {
				$this->failed('', 'empty or not allowed', 'auth/empty', 412);
			}
		}
		
		/**
		 * @param $params
		 */
		public function verifyStudentFormData($params)
		{
			
			if ($this->is_valid_user('company') && !empty($params)) {
				try {
					$param = $params->data;
					$stmt  = $this->db->prepare("SELECT student_number, application_id
                                                          FROM student_application
                                                          WHERE student_number=:student_number
                                                          AND  application_id =: application_id");
					
					$stmt->bindParam(':student_number', $param->student_number);
					$stmt->bindParam(':application_id', $param->application_id);
					$stmt->execute();
					$count = $stmt->rowCount();
					
					if ($count > 1) {
						$this->success('Looks good');
					} else {
						$this->failed('null', 'validity', 'false', 404);
					}
				} catch (PDOException $PDO_exception) {
				
				}
			}
		}
		
		/**
		 * @param $params
		 */
		public function getProspectiveInterns($params)
		{
			
			if ($this->is_valid_user('company') && !empty($params)) {
				
				
				try {
					$param = $params->data;
					
					$stmt = $this->db->prepare("SELECT student_application.*, evaluation.*, student.student_number, student.email,
                                                      student.first_name, student.last_name
                                                      FROM  student_application
                                                      LEFT JOIN student
                                                      ON student_application.student_number = student.student_number
                                                      LEFT JOIN evaluation ON student.student_number =evaluation.student_id
                                                      WHERE student_application.company_email = :company_email
                                                      AND student_application.application_status = 'accepted'
                                                      AND student_application.confirmation_form_status = 'not filled'
                                                      ORDER BY student_application.application_date ASC");
					
					
					$stmt->bindParam(':company_email', $param->email);
					$stmt->execute();
					$interns = $stmt->fetchAll();
					
					$result = array();
					$count  = 1;
					foreach ($interns as $intern) {
						$app = new Result();
						
						$app->id                       = $count;
						$app->application_id           = $intern['application_id'];
						$app->student_number           = $intern['student_number'];
						$app->student_first_name       = $intern['first_name'];
						$app->student_last_name        = $intern['last_name'];
						$app->company_name             = $intern['company_name'];
						$app->company_field            = $intern['company_field'];
						$app->company_address          = $intern['company_address'];
						$app->company_fax              = $intern['company_fax'];
						$app->company_phone            = $intern['company_phone'];
						$app->company_email            = $intern['company_email'];
						$app->work_description         = $intern['work_description'];
						$app->application_status       = $intern['application_status'];
						$app->application_date         = $intern['application_date'];
						$app->evaluation_id            = $intern['evaluation_id'];
						$app->confirmation_form_status = $intern['confirmation_form_status'];
						$count++;
						$result[] = $app;
					}
					
					// $result['pageSize'] = count($result);
					header('Content-Type: application/json');
					echo json_encode($result);
					
				} catch (PDOException $exception) {
					$this->failed($exception, 'getting company interns', '', 412);
				}
			} else {
				$this->failed('null', 'get_prospective_intern', 'unauthorised/emptyParam', 404);
			}
		}
		
		
		/**
		 * @param $student_number
		 * @return bool
		 */
		private function setStudentFormStatus($student_number)
		{
			
			try {
				
				$stmt = $this->db->prepare("UPDATE student_application
                                                 SET confirmation_form_status ='filled'
                                                  WHERE student_number=:student_number");
				
				$stmt->bindParam(':student_number', $student_number);
				
				$stmt->execute();
				
				//  $this->db->commit();
				return true;
				
			} catch (PDOException $exception) {
				$this->failed($exception, 'updating student application status', '', 412);
			}
		}
		
		/**
		 * @param $param
		 * @param $data
		 */
		private function sendStudentNotification($param, $data)
		{
			
			$senderType = 'company';
			$stmt       = $this->db->prepare("INSERT INTO student_notifications(sender_id, receiver_id, message, created_at, extras, receipt, sender_type, sender_name)
                                                 VALUES(:sender_id, :receiver_id, :message, :created_at, :extras,
                                                 :receipt, :sender_type, :sender_name) ");
			
			
			$stmt->bindParam(':sender_id', $param->company_id);
			$stmt->bindParam(':receiver_id', $param->student_number);
			$stmt->bindParam(':message', $data['message']);
			$stmt->bindParam(':created_at', $data['createdAt']);
			$stmt->bindParam(':extras', $data['extras']);
			$stmt->bindParam(':receipt', $data['receipt']);
			$stmt->bindParam(':sender_type', $senderType);
			$stmt->bindParam(':sender_name', $data['senderName']);
			$stmt->execute();
			
			// $this->db->commit();
		}
		
		private function sendCoordinatorNotification($param, $data)
		{
			
			$senderType = 'company';
			$stmt       = $this->db->prepare("INSERT INTO coordinator_notifications(sender_id, message, created_at, extras, receipt, sender_type, sender_name)
                                                 VALUES(:sender_id, :message, :created_at, :extras,
                                                 :receipt, :sender_type, :sender_name) ");
			
			
			$stmt->bindParam(':sender_id', $param->company_id);
			$stmt->bindParam(':message', $data['message']);
			$stmt->bindParam(':created_at', $data['createdAt']);
			$stmt->bindParam(':extras', $data['extras']);
			$stmt->bindParam(':receipt', $data['receipt']);
			$stmt->bindParam(':sender_type', $senderType);
			$stmt->bindParam(':sender_name', $data['senderName']);
			$stmt->execute();
			
			// $this->db->commit();
		}
		
		/**
		 * @param $exception
		 * @param $method
		 * @param $message
		 * @param $code
		 */
		private function failed($exception, $method, $message, $code): void
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
		 * @param $message
		 */
		public function success($message)
		{
			$response          = new Result();
			$response->result  = "OK";
			$response->message = $message;
			header("Content-Type: application/json");
			echo json_encode($response);
		}
	}

?>
