import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../company-service/company.service';

@Component( {
              selector   : 'app-evaluation-result',
              templateUrl: './intern-evaluation.component.html',
              styleUrls  : [ './intern-evaluation.component.scss' ]
            } )
export class InternEvaluationComponent implements OnInit {
  
  showLoading    = true;
  loading_text   = 'Loading Evaluation';
  mode           = 'indeterminate';
  loading_value  = 0;
  student_name: string;
  company_id: number;
  color          = '#003876';
  eval_id: number;
  student_number: number;
  evaluationForm = new FormGroup( {
                                    student_name      : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    student_number    : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    eval_report       : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    eval_work_done    : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    student_knowledge : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    answering_question: new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    note              : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    result            : new FormControl( {value: '', disabled: true} ),
                                  } );
  
  constructor ( private companyService: CompanyService,
                private route: ActivatedRoute,
                private  router: Router ) {
  }
  
  ngOnInit () {
    const userData = JSON.parse( localStorage.getItem( 'user' ) );
    if (!userData) {
      this.router.navigate( [ './' ] );
    }
    this.company_id     = userData[ 'id' ];
    this.eval_id        = this.route.snapshot.queryParams[ 'eval_id' ];
    this.student_number = this.route.snapshot.queryParams[ 'studentId' ];
    
    // this.showLoading = false;
    this.getEvaluation();
  }
  
  formData ( data ): void {
    
    this.evaluationForm.setValue( {
                                    student_name      : '',
                                    student_number    : '',
                                    eval_report       : '',
                                    eval_work_done    : '',
                                    student_knowledge : '',
                                    answering_question: '',
                                    note              : '',
                                    result            : '',
                                  } );
    
    this.evaluationForm.patchValue( data );
    
  }
  
  getEvaluation (): void {
    console.log( this.eval_id );
    const data = {
      eval_id       : this.eval_id,
      company_id    : this.company_id,
      student_number: this.student_number,
    };
    
    this.companyService.getEvaluationResult( data )
        .subscribe( ( result ) => {
                      console.log( result );
                      if (result.eval_report) {
                        this.formData( result );
                        this.showLoading   = false;
                        this.mode          = 'determinate';
                        this.loading_text  = 'No Evaluation.';
                        this.loading_value = 100;
                      } else {
                        this.showLoading   = true;
                        this.mode          = 'determinate';
                        this.loading_text  = 'No Evaluation.';
                        this.loading_value = 100;
                      }
                    },
                    ( error ) => {
                      console.log( error );
                      this.showLoading   = true;
                      this.mode          = 'determinate';
                      this.loading_text  = 'No Evaluation.';
                      this.loading_value = 100;
                    } );
  }
  
}
