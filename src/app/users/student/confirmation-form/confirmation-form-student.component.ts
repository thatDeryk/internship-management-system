import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyConfirmationFormInterface } from '../../../interfaces/app-interface';
import { StudentService } from '../student-service/student.service';

@Component( {
              selector   : 'app-confirmation-form-student',
              templateUrl: './confirmation-form-student.component.html',
              styleUrls  : [ './confirmation-form-student.component.scss' ]
            } )
export class ConfirmationFormStudentComponent implements OnInit {
  
  work_to_be_done = [];
  
  loading_text: string;
  showLoading = false;
  student_number: number;
  company_id: number;
  student_name: string;
  application_id: number;
  confirmationForm = new FormGroup( {
                                      company_name   : new FormControl( {value: '', disabled: true},
                                                                        [ Validators.required ], ),
                                      company_address: new FormControl( {value: '', disabled: true},
                                                                        [ Validators.required ] ),
                                      company_phone  : new FormControl( {value: '', disabled: true},
                                                                        [ Validators.required ] ),
                                      student_name   : new FormControl( {value: '', disabled: true},
                                                                        [ Validators.required ] ),
                                      contact_person : new FormControl( {value: '', disabled: true},
                                                                        [ Validators.required ] ),
                                      start_date     : new FormControl( {value: '', disabled: true},
                                                                        [ Validators.required ] ),
                                      end_date       : new FormControl( {value: '', disabled: true},
                                                                        [ Validators.required ] ),
                                      others         : new FormControl( {value: '', disabled: true}, [] ),
                                      work_fields    : new FormArray( [] )
                                    } );
  
  constructor( private studentService: StudentService,
               private route: ActivatedRoute,
               private  router: Router ) {
    
    this.showLoading = true;
    this.loading_text = 'Populating the form preliminary user info';
  }
  
  
  ngOnInit() {
    const form = <FormGroup>this.confirmationForm;
    
    
    this.student_number = this.route.snapshot.queryParams[ 'studentId' ];
    // this.company_id = this.route.snapshot.queryParams[ 'companyId' ];
    this.application_id = this.route.snapshot.queryParams[ 'applicationId' ];
    this.showLoading = false;
    this.verifyQueryParams();
    this.getFormDetails();
  }
  
  getFormDetails() {
    const data = {
      application_id    : this.application_id,
      student_number: this.student_number
    };
    this.studentService.getCompanyConfirmationForm( data )
        .subscribe( result => {
          console.log( result );
          this.populateFormData( result );
        }, error => {
          console.log( error );
        } );
  }
  
  verifyQueryParams(): boolean {
    const data = {
      student_number: this.student_number,
      application_id: this.application_id
    };
    const form = this.studentService.verifyQueryParams( data )
                     .subscribe( result => {
                       console.log( result );
                     }, error => {
                       console.log( error );
                     } );
    return true;
  }
  
  populateFormData( data ) {
    
    this.confirmationForm.setValue( {
      
                                      company_name   : data.company_name,
                                      company_address: data.company_address,
                                      company_phone  : data.company_phone,
                                      student_name   : data.student_name,
                                      contact_person : data.contact_person,
                                      start_date     : data.start_date,
                                      end_date       : data.end_date,
                                      others         : data.others,
                                      work_fields    : []
                                    } );
    
    data.work_fields.split( '\\' ).forEach( field => {
      this.work_to_be_done.push( {name: field} );
    } );
    
  }
  
  
  prepareApplicationData(): CompanyConfirmationFormInterface {
    const formModel = this.confirmationForm.value;
    return {
      company_name   : formModel.company_name as string,
      company_address: formModel.company_address as string,
      company_phone  : formModel.company_phone as string,
      work_fields    : formModel.work_fields as Array<any>,
      student_name   : formModel.student_name as string,
      student_number : this.student_number as number,
      contact_person : formModel.contact_person as string,
      end_date       : formModel.end_date as Date,
      start_date     : formModel.start_date as Date,
      others         : formModel.others as string,
      company_id     : this.company_id,
      application_id : this.application_id
    };
  }
}
