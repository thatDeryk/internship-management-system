import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoordinatorService } from '../coordinator-service/coordinator.service';

@Component( {
              selector   : 'app-evaluation-form',
              templateUrl: './evaluation-form.component.html',
              styleUrls  : [ './evaluation-form.component.scss' ]
            } )
export class EvaluationFormComponent implements OnInit {
  
  
  showLoading    = true;
  loading_text   = 'Generating Form';
  student_name: string;
  student_number: number;
  company_id: number;
  color          = '#003876';
  userData: any;
  evaluationForm = new FormGroup( {
                                    student_name      : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    student_number    : new FormControl( {value: ' ', disabled: true},
                                                                         [ Validators.required ] ),
                                    eval_report       : new FormControl( '', [ Validators.required ] ),
                                    eval_work_done    : new FormControl( '', [ Validators.required ] ),
                                    student_knowledge : new FormControl( '', [ Validators.required ] ),
                                    answering_question: new FormControl( '', [ Validators.required ] ),
                                    note              : new FormControl( '', [ Validators.required ] ),
                                    result            : new FormControl( '', [ Validators.required ] ),
    
                                  } );
  
  
  constructor ( private coordinatorService: CoordinatorService,
                private route: ActivatedRoute,
                private  router: Router ) {
  }
  
  ngOnInit () {
    this.student_number = this.route.snapshot.queryParams[ 'studentId' ];
    this.company_id     = this.route.snapshot.queryParams[ 'companyId' ];
    this.student_name   = this.route.snapshot.queryParams[ 'studentName' ];
    this.userData       = this.coordinatorService.getLocalStorageData();
    
    this.evaluationForm.setValue( {
                                    student_name  : this.student_name,
                                    student_number: this.student_number,
      
                                    eval_report       : '',
                                    eval_work_done    : '',
                                    student_knowledge : '',
                                    answering_question: '',
                                    note              : '',
                                    result            : ''
                                  } );
    
    this.showLoading = false;
  }
  
  _submitEvaluation (): void {
    this.showLoading  = true;
    this.loading_text = 'Submitting Evaluation';
    const data        = this.prepareEvaluationData();
    this.coordinatorService.submitEvaluation( data )
        .subscribe( ( result ) => {
          console.log( result );
          this.router.navigate( [ `coordinator/interns` ] );
        }, error2 => {
          console.log( error2 );
        } );
  }
  
  prepareEvaluationData () {
    const formData = this.evaluationForm.value;
    
    return {
      
      student_name      : formData.student_name,
      student_number    : this.student_number,
      eval_report       : formData.eval_report,
      eval_work_done    : formData.eval_work_done,
      student_knowledge : formData.student_knowledge,
      answering_question: formData.answering_question,
      note              : formData.note,
      company_id        : this.company_id,
      coordinator_id    : this.userData[ 'id' ],
      result            : formData.result as string
    };
  }
  
}
