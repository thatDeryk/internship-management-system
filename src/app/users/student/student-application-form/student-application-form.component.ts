import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MD_DIALOG_DATA, MdDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { EMAIL_REGEX, InternshipApplicationFormInterface } from '../../../interfaces/app-interface';
import { StudentService } from '../student-service/student.service';

const _EMAIL_REGEX = EMAIL_REGEX;

@Component( {
              selector   : 'app-training-confirmation-form',
              templateUrl: './student-application-form.component.html',
              styleUrls  : [ './student-application-form.component.scss' ]
            } )
export class StudentApplicationFormComponent implements OnInit, OnDestroy {
  
  no_application;
  internForm = new FormGroup( {
    
                                company_name    : new FormControl( '', [ Validators.required ] ),
                                company_field   : new FormControl( '', [ Validators.required ] ), // eg construction,
                                                                                                  // Architecture, IT
                                                                                                  // Firm
                                company_address : new FormControl( '', [ Validators.required ] ),
                                company_fax     : new FormControl(),
                                company_phone   : new FormControl( '', [ Validators.required ] ),
                                company_email   : new FormControl( '', [ Validators.required,
                                                                         Validators.pattern( _EMAIL_REGEX ) ] ),
                                work_description: new FormControl( ' ',
                                                                   [ Validators.required,
                                                                     Validators.minLength( 20 ) ] )
                              } );
  
  _student_number: number;
  internFormData: InternshipApplicationFormInterface;
  errorMessage: any;
  showLoading = false;
  loadingText: string;
  loadingMode = 'indeterminate';
  student_fullName: string;
  loadingValue: any;
  isUpdateForm = false;
  applicationId: number;
  subscription: Subscription;
  
  constructor( private studentService: StudentService, public dialog: MdDialog,
               private router: Router,
               private  route: ActivatedRoute ) {
    
    
  }
  
  
  ngOnInit() {
    const userData = JSON.parse( localStorage.getItem( 'user' ) );
    this._student_number = userData[ 'student_number' ];
    this.student_fullName = `${userData[ 'first_name' ]} ${userData[ 'last_name' ]}`;
    const formData = JSON.parse( localStorage.getItem( 'studentApplication' ) );
    if (formData) {
      this.internForm.patchValue( formData );
      this.isUpdateForm = true;
      this.applicationId = formData.application_id;
    }
  }
  
  
  /* TODO: Create a loading component */
  onSubmitForm() {
    this.internFormData = this.prepareApplicationData();
    this.showLoading = true;
    this.loadingText = 'Please wait while we process you application form';
    this.no_application = false;
    
    /*setTimeout( () => {
     this.showLoading = false;
     this.no_application = false;
     }, 4000 );*/
    this.studentService.submitApplicationForm( this.internFormData )
        .subscribe( ( result ) => {
          console.log( result );
          if (result.result === 'OK') {
            this.internForm.reset();
            setTimeout( () => {
              this.loadingText = 'Application submitted successfully';
              this.loadingValue = 100;
            }, 2000 );
            setTimeout( () => {
              this.loadingText = 'Redirecting in 2 secs';
              this.loadingValue = 100;
            }, 3000 );
            setTimeout( () => {
              this.loadingText = 'Redirecting in 1 sec';
              this.loadingValue = 100;
              this.showLoading = false;
              this.viewApplications();
              // this.no_application = false;
          
            }, 4000 );
          }
        }, error2 => {
          this.showLoading = false;
          this.no_application = true;
          this.errorMessage = error2;
          console.log( error2 );
        } );
  }
  
  
  openDialog() {
    const dialogRef = this.dialog.open( MyDialogComponent, {
      data: 'Your Application is submitted successfully'
    } );
    
    dialogRef.afterClosed().subscribe( ( result ) => {
      console.log( 'closed' );
    } );
  }
  
  viewApplications() {
    this.router.navigate( [ 'student/internship-application' ] );
  }
  
  prepareApplicationData(): InternshipApplicationFormInterface {
    const formModel = this.internForm.value;
    return {
      company_name    : formModel.company_name as string,
      company_field   : formModel.company_field as string,
      company_address : formModel.company_address as string,
      company_fax     : formModel.company_fax as string,
      company_phone   : formModel.company_phone as string,
      company_email   : formModel.company_email as string,
      work_description: formModel.work_description as string,
      student_number  : this._student_number as number,
      student_name    : this.student_fullName as string,
      application_id  : this.applicationId as number,
      isFormUpdate    : this.isUpdateForm  as boolean
    };
  }
  
  ngOnDestroy() {
  
  }
}

@Component( {
              selector: 'app-my-dialog',
              template: '{{data}}'
            } )
export class MyDialogComponent {
  constructor( @Inject( MD_DIALOG_DATA ) public data: any ) {
  }
}
