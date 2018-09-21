import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../student-service/student.service';

@Component( {
              selector   : 'app-evaluation-result',
              templateUrl: './evaluation-result.component.html',
              styleUrls  : [ './evaluation-result.component.scss' ]
            } )
export class EvaluationResultComponent implements OnInit {
  
  showLoading    = true;
  loading_text   = 'Loading Evaluation';
  mode           = 'indeterminate';
  loading_value  = 0;
  student_name: string;
  student_number: number;
  company_id: number;
  color          = '#003876';
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
  
  constructor ( private studentService: StudentService,
                private route: ActivatedRoute,
                private  router: Router ) {
  }
  
  ngOnInit () {
    const studentData = JSON.parse( localStorage.getItem( 'user' ) );
    if (!studentData) {
      this.router.navigate( [ './' ] );
    }
    this.student_number = studentData[ 'student_number' ];
    this.getEvaluation();
  }
  
  formData ( data ): void {
    const userData = this.studentService.getLocalStorageData();
  
    this.evaluationForm.patchValue( data );
    this.evaluationForm.controls[ 'student_name' ].setValue(
      `${userData[ 'first_name' ]}  ${userData[ 'last_name' ]  }` );
    
  }
  
  getEvaluation (): void {
    const data = {
      student_number: this.student_number
    };
    
    this.studentService.getEvaluationResult( data )
        .then( ( result ) => {
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
        } )
        .catch( ( error ) => {
          console.log( error );
          this.showLoading   = true;
          this.mode          = 'determinate';
          this.loading_text  = 'No Evaluation.';
          this.loading_value = 100;
        } );
    
  }
  
}
