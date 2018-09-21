import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoordinatorService } from '../coordinator-service/coordinator.service';

@Component( {
              selector   : 'app-company-confirmation-form',
              templateUrl: './confirmation-form.component.html',
              styleUrls  : [ './confirmation-form.component.scss' ]
            } )
export class ConfirmationFormComponent implements OnInit {
  
  work_to_be_done = [];
  
  loading_text: string;
  showLoading      = false;
  student_number: number;
  company_id: number;
  student_name: string;
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
  
  constructor ( private coordinatorService: CoordinatorService,
                private route: ActivatedRoute,
                private  router: Router ) {
    
    this.showLoading  = true;
    this.loading_text = 'Populating the form preliminary user info';
  }
  
  
  ngOnInit () {
    const form = <FormGroup>this.confirmationForm;
    
    
    this.student_number = this.route.snapshot.queryParams[ 'studentId' ];
    this.company_id     = this.route.snapshot.queryParams[ 'companyId' ];
    this.showLoading    = false;
    
    this.getFormDetails();
  }
  
  getFormDetails () {
    const data = {
      company_id    : this.company_id,
      student_number: this.student_number
    };
    this.coordinatorService.getCompanyConfirmationForm( data )
        .then( result => {
          console.log( result );
          this.populateFormData( result );
        } )
        .catch( error => {
          console.log( error );
        } );
  }
  
  populateFormData ( data ) {
    
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
  
}
