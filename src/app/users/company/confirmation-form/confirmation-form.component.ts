import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CompanyConfirmationFormInterface } from '../../../interfaces/app-interface';
import { CompanyService } from '../company-service/company.service';

@Component( {
              selector   : 'app-company-confirmation-form',
              templateUrl: './confirmation-form.component.html',
              styleUrls  : [ './confirmation-form.component.scss' ]
            } )
export class TrainingConfirmationFormComponent implements OnInit {
  
  work_to_be_done = [ {id: 1, name: 'Developing Software'},
                      {id: 2, name: 'Operating System Installation and Maintenance'},
                      {id: 3, name: 'Working as part of a team in a large software project'},
                      {id: 4, name: 'Hardware fault diagnosis and repairs'},
                      {id: 5, name: 'Designing WEB pages'},
                      {id: 6, name: 'Developing a WEB application using ASP,.NET, PHP etc.'},
                      {id: 7, name: 'Designing/working with Databases'},
                      {id: 8, name: 'Learning to use complex company software'},
                      {id: 9, name: 'Network Installation and Maintenance'} ];
  minDate = new Date();
  maxDate = new Date();
  startDate = new Date();
  loading_text: string;
  showLoading = false;
  student_number: number;
  company_id: number;
  student_name: string;
  application_id: number;
  confirmationForm = new FormGroup( {
                                      company_name   : new FormControl( '', [ Validators.required ] ),
                                      company_address: new FormControl( '', [ Validators.required ] ),
                                      company_phone  : new FormControl( '', [ Validators.required ] ),
                                      student_name   : new FormControl( '', [ Validators.required ] ),
                                      contact_person : new FormControl( '', [ Validators.required ] ),
                                      start_date     : new FormControl( '', [ Validators.required ] ),
                                      end_date       : new FormControl( '', [ Validators.required ] ),
                                      others         : new FormControl( '', [] ),
                                      work_fields    : new FormArray( [] )
                                    }, this.validateDate );
  
  constructor( private companyService: CompanyService,
               private route: ActivatedRoute,
               private  router: Router ) {
    
    this.showLoading = true;
    this.loading_text = 'Populating the form preliminary user info';
  }
  
  ngOnInit() {
    const comId = this.companyService.getLocalStorageData();
    this.company_id = comId[ 'id' ];
    this.student_number = this.route.snapshot.queryParams[ 'studentId' ];
    this.application_id = this.route.snapshot.queryParams[ 'applicationId' ];
    
    this.verifyQueryParams();
    setTimeout( () => {
      this.getStudentName();
    }, 100 );
  }
  
  
  getStudentName() {
    
    const email = this.companyService.getLocalStorageData();
    const data = {
      student_number: this.student_number,
      email         : email[ 'email' ]
    };
    this.companyService.getStudentByNumber( data )
        .subscribe( ( res ) => {
          setTimeout( () => {
            this.showLoading = false;
            this.confirmationForm.controls[ 'company_name' ].setValue( res[ 0 ].company_name );
            this.confirmationForm.controls[ 'student_name' ].setValue( res[ 0 ].student_full_name );
            this.student_name = res[ 0 ].student_name;
          }, 2000 );
        }, error => {
          const err = JSON.parse( error[ '_body' ] );
          if (err[ 'result' ] === 'failure @ already_filled') {
            this.loading_text = 'A confirmation form has been filled for this user';
          }
          setTimeout( () => {
            this.showLoading = false;
            this.router.navigate( [ `company/prospective-interns` ] );
          }, 1000 );
        } );
  }
  
  /* Get checked values from md check box*/
  checkedValue( value: string, isChecked: boolean ) {
    const work_fields = <FormArray>this.confirmationForm.controls.work_fields;
    if (isChecked[ 'checked' ]) {
      work_fields.push( (new FormControl( value )) );
    } else {
      const index = work_fields.controls.findIndex( x => x.value === value );
      work_fields.removeAt( index );
    }
  }
  
  
  checkStudentName( event: Event ) {
    const student_name = <FormControl>this.confirmationForm.controls.student_name;
    const company_name = <FormControl>this.confirmationForm.controls.company_name;
    if ((student_name.value === '') || (company_name.value === '')) {
      company_name.setErrors( Validators.required );
    } else {
      const data = {
        student_name: student_name.value,
        company_name: company_name.value,
      };
      this.companyService.checkStudentName( data )
          .subscribe( ( result ) => {
            console.log( result );
          }, ( hasError ) => {
            console.log( hasError );
            student_name.setErrors( {isStudent: true} );
          } );
    }
  }
  
  
  validateDate( control: AbstractControl ): { [ key: string]: boolean } {
    
    const dates = control.value;
    if (!dates.start_date || !dates.end_date) {
      return null;
    }
    const start = control.get( 'start_date' );
    const end = control.get( 'end_date' );
    if (!start || !end) {
      return null;
    }
    const isSame_Before = moment( dates.end_date ).isSameOrBefore( dates.start_date ) ? {isSameOrBefore: true} : null;
    control.get( 'start_date' ).setErrors( isSame_Before );
    control.get( 'end_date' ).setErrors( isSame_Before );
    return isSame_Before;
  }
  
  verifyQueryParams(): boolean {
    const data = {
      student_number: this.student_number,
      application_id: this.application_id
    };
    const form = this.companyService.verifyQueryParams( data )
                     .subscribe( result => {
                       console.log( result );
                     }, error => {
                       console.log( error );
                     } );
    return true;
  }
  
  onSubmit() {
    
    const formData = this.prepareApplicationData();
    this.loading_text = 'Please Wait while we process your form';
    this.showLoading = true;
    this.companyService.submitConfirmationForm( formData )
        .subscribe( ( result ) => {
          setTimeout( () => {
            this.loading_text = 'Saving form details';
          }, 2000 );
          setTimeout( () => {
            this.loading_text = 'Form submitted successfully';
          }, 3000 );
          setTimeout( () => {
            this.showLoading = false;
            this.confirmationForm.reset();
            this.router.navigate( [ `company/prospective-interns` ] );
        
          }, 4000 );
      
        }, ( errorHandler ) => {
          console.log( errorHandler );
          this.loading_text = 'Oops something happened';
          setTimeout( () => {
            this.showLoading = false;
          }, 2000 );
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
      end_date       : new Date( formModel.end_date ).toDateString(),
      start_date     : new Date( formModel.start_date ).toDateString(),
      others         : formModel.others as string,
      company_id     : this.company_id,
      application_id : this.application_id
    };
  }
}
