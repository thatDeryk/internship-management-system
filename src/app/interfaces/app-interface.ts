import { AbstractControl } from '@angular/forms';

export interface LoginFormDataInterface {
  email: string;
  password: string;
  user: string;
}

export interface StudentSignUpFormInterface {
  email: string;
  first_name: string;
  last_name: string;
  student_number: number;
  password: string;
  confirm_password: string;

}


export interface Notifications {
  senderId: number;
  extras: string;
  message: string;
  createdAt: Date;
  senderType: string;
  receipt: string;
  senderName: string;
  length?: number;
}

export interface InternshipApplicationFormInterface {
  company_name: string;
  company_field: string;
  company_address: string;
  company_fax?: string;
  company_phone: string;
  company_email: string;
  work_description: string;
  student_number: number;
  student_name: string;
  application_id?: number;
  isFormUpdate?: boolean;
}

export interface CompanyConfirmationFormInterface {
  company_name: string;
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
  application_id: number;
}


export interface LogBookFormInternface {
  log_id?: number;
  log_date: any;
  log_department: string;
  log_description: string;
  log_status?: string;
  student_number: number;
  company_id: number;
  student_name: string;
}

export interface StudentLog {
  log_date: any;
  log_department: string;
  log_description: string;
  log_status: string;
  student_number: number;
  company_id: number;
  log_id: number;
}


export interface InternshipApplicationInterface {
  length: any;
  company_name: string;
  company_field: string;
  company_address: string;
  company_fax?: string;
  company_phone: string;
  company_email: string;
  student_number: number;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  work_description: string;
  reject_reason?: string;
  application_date: string;
  application_id: number;
  application_status?: string;
}

export const ApiUrl = 'http://localhost/workspace/online-internship-ms/online-internship-ms-backend/api/index.php?route=';

export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;


export const passwordMismatch = ( control: AbstractControl ): { [ key: string]: boolean } => {

  const password         = control.get( 'password' );
  const confirm_password = control.get( 'confirm_password' );
  if (!password || !confirm_password) {
    return null;
  }
  const d = password.value === confirm_password.value ? null : {mismatch: true};
  console.log( d );
  return d;
};
