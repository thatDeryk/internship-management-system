<?php

	require '../vendor/phpmailer/phpmailer/PHPMailerAutoload.php';

	class Emailer extends _Database
	{


		/**
		 * @return string
		 */


		public function sendRecoveryEmail($data, $default_password): bool
		{


			$email = $data->email;

			/**
			 * This example shows sending a message using a local sendmail binary.
			 */


			//Create a new PHPMailer instance
			$mail = new PHPMailer;


			//Tell PHPMailer to use SMTP
			$mail->isSMTP();


			//Enable SMTP debugging
			// 0 = off (for production use)
			// 1 = client messages
			// 2 = client and server messages
			$mail->SMTPDebug = 0;

			//Ask for HTML-friendly debug output
			$mail->Debugoutput = 'html';

			//Set the hostname of the mail server
			$mail->Host = 'smtp.gmail.com';
			// use
			// $mail->Host = gethostbyname('smtp.gmail.com');
			// if your network does not support SMTP over IPv6

			//Set the SMTP port number - 587 for authenticated TLS, a.k.a. RFC4409 SMTP submission
			$mail->Port = 587;

			//Set the encryption system to use - ssl (deprecated) or tls
			$mail->SMTPSecure = 'tls';

			//Whether to use SMTP authentication
			$mail->SMTPAuth = true;

			//Username to use for SMTP authentication - use full email address for gmail
			$mail->Username = "derekjamabo@gmail.com";

			//Password to use for SMTP authentication
			$mail->Password = "zbtlcxjrbmhlmztr";

			//Set who the message is to be sent from
			$mail->setFrom('no-reply@emu.edu.tr', 'Online Internship System');


			//Set who the message is to be sent to
			$mail->addAddress("$email");
			$mail->isHTML(true);

			$mail->Subject = "Password Recovery";
			//$mail->msgHTML(file_get_contents('forgot_password.html'), dirname(__FILE__));
			$mail->Body = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">
<html>
	<head>
    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=iso-8859-1\">
    <title>Online Internship System, EMU</title>
</head>
<body>
<div style=\"width: 640px; font-family: Arial, Helvetica, sans-serif; font-size: 11px;\">
  <h3>
    <strong>Hello $email,</strong>
  </h3>
  <p>
    You Requested for a recovery password. Please use the following details to log into our system.<br>
    <span>Email: <strong> $email </strong></span> <br>
    <span>Password: <strong>$default_password</strong></span> <br>
  </p>
    <p>
        NOTE: Ignore this message if you did not make this request.
	</p>
</div>
</body>
</html>";
			$isSent     = false;

			if (!$mail->send()) {
				$this->failed('', 'sending_email', "Mailer Error: " . $mail->ErrorInfo, 412);
				$isSent = false;
			} else {
				$isSent = true;
			}
			return $isSent;
		}

		/**
		 * @return boolean
		 **/
		private function checkCompanyExits($email): bool
		{

			try {
				$stmt = $this->db->prepare('SELECT email FROM company WHERE email =:email');

				$stmt->bindParam('email', $email);
				$stmt->execute();
				$result = $stmt->fetch();
				if (!empty($result)) {
					return true; // email exits
				} else {
					return false; //no company with  the given email;
				}
			} catch (PDOException $exception) {
				$this->failed($exception->getMessage(), 'checking company', 'companyusercheck', 412);
			}
		}


		public function sendEmailToCompany($applicationId, $student_number, $coordinator_email)
		{

			try {
				$stmt = $this->db->prepare("SELECT company_email, company_name FROM student_application
                                                  WHERE application_id = :application_id
                                             AND student_number = :student_number");
				$stmt->bindParam(':application_id', $applicationId);
				$stmt->bindParam(':student_number', $student_number);
				$stmt->execute();
				$result = $stmt->fetch();

				$email        = $result['company_email'];
				$company_name = $result['company_name'];

				// if a company exit in our database wiht the givin email then no need to seen another email
				if ($this->checkCompanyExits($email)) {
					return true;
				} else {
					$default_password = $this->generatorDefaultPassword();
					$mail             = new PHPMailer;

					//Tell PHPMailer to use SMTP
					$mail->isSMTP();

					//Enable SMTP debugging
					// 0 = off (for production use)
					// 1 = client messages
					// 2 = client and server messages
					$mail->SMTPDebug = 0;

					//Ask for HTML-friendly debug output
					$mail->Debugoutput = 'html';

					//Set the hostname of the mail server
					$mail->Host = 'smtp.gmail.com';
					// use
					// $mail->Host = gethostbyname('smtp.gmail.com');
					// if your network does not support SMTP over IPv6

					//Set the SMTP port number - 587 for authenticated TLS, a.k.a. RFC4409 SMTP submission
					$mail->Port = 587;

					//Set the encryption system to use - ssl (deprecated) or tls
					$mail->SMTPSecure = 'tls';

					//Whether to use SMTP authentication
					$mail->SMTPAuth = true;

					//Username to use for SMTP authentication - use full email address for gmail
					$mail->Username = "derekjamabo@gmail.com";

					//Password to use for SMTP authentication
					$mail->Password = "zbtlcxjrbmhlmztr";

					//Set who the message is to be sent from
					$mail->setFrom("no_reply@emu.edu.tr", 'Online Internship System EMU');
					//Set who the message is to be sent to
					$mail->addAddress("$email", "$company_name");
					//Set the subject line
					$mail->isHTML(true);
					$mail->Subject = 'Login Details';
					//Read an HTML message body from an external file, convert referenced images to embedded,
					//convert HTML into a basic plain-text alternative body
					//$mail->msgHTML(file_get_contents('forgot_password.html'), dirname(__FILE__));
					$mail->Body = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">
<html>
<head>
  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=iso-8859-1\">
  <title>Online Internship System, EMU</title>
</head>
<body>
<div style=\"width: 640px; font-family: Arial, Helvetica, sans-serif; font-size: 11px;\">
  <h3>
    <strong>Dear Sir/Madam,</strong>
  </h3>
  <p>
    Please use the following details to log into our system.<br>
    <span>Email: <strong>$email</strong></span> <br>
    <span>Password: <strong>$default_password</strong></span> <br>
  </p>
</div>
</body>
</html>";
        $hash_password = $this->passwordHash($default_password);
					//send the message, check for errors
					if (!$mail->send()) {
						$this->failed('', 'sending_email', "Mailer Error: " . $mail->ErrorInfo, 412);
					} else {
						$stmt2 = $this->db->prepare("INSERT INTO company (first_name, last_name, email, position, password, vis)
                                              VALUES (' ',' ',:email,' ',:password, :vis)");
						$stmt2->bindParam(':email', $email);
						$stmt2->bindParam(':vis', $default_password);
						$stmt2->bindParam(':password', $hash_password);
						$stmt2->execute();
						return true;
					}


				}
			} catch (PDOException $exception) {
				$this->failed($exception, 'sending_email_db_error', 'Something Happened', 412);
			}

		}


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

		private function success($value)
		{
			$response          = new Result();
			$response->result  = "OK";
			$response->message = "Application Updated";
			header("Content-Type: application/json");
			echo json_encode($response);
		}
	}