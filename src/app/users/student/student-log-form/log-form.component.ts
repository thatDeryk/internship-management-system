import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { LogBookFormInternface } from '../../../interfaces/app-interface';
import { StudentService } from '../student-service/student.service';

@Component( {
              selector   : 'app-log-form',
              templateUrl: './log-form.component.html',
              styleUrls  : [ './log-form.component.scss' ]
            } )
export class LogFormComponent implements OnInit {
  logBookStarted: boolean;
  minDate     = new Date();
  maxDate     = new Date();
  startDate   = new Date();
  userData: any;
  start_btn_text: string;
  showLoading = true;
  
  
  loading_text  = 'Please wait';
  spinner_mode  = 'indeterminate';
  spinner_value = 0;
  company_id: number;
  studentLog: any;
  logDay: any;
  intern_start_date: any;
  intern_end_date: any;
  number_of_days_missed: any;
  logBookForm   = new FormGroup( {
                                   logDate       : new FormControl( '', [ Validators.required ] ),
                                   logDepartment : new FormControl( '', [ Validators.required ] ),
                                   logDescription: new FormControl( '', [ Validators.required ] )
                                 } );
  
  dateFilter = ( ex: Date ): boolean => {
    const day = ex.getDay();
    return day !== 0 && day !== 6;
  }
  
  constructor ( private studentService: StudentService,
                private router: Router ) {
    console.log( this.logBookStarted );
    
  }
  
  
  ngOnInit () {
    this.userData = this.studentService.getLocalStorageData();
    if (!this.userData) {
      this.router.navigate( [ './' ] );
    } else {
      this.showLoading = true;
      setTimeout( () => {
        this.loading_text = 'Generating logbook Form...';
        this.getCompanyConfirmationForm( this.userData[ 'student_number' ] );
      }, 1000 );
    }
  }
  
  getCompanyConfirmationForm ( student_number: number ) {
    
    const data = {
      student_number: student_number
    };
    this.studentService.getCompanyOfIntern( data )
        .subscribe( ( result ) => {
          if (result.length > 0) {
            this.intern_start_date = result[ 0 ][ 'start_date' ];
            this.intern_end_date   = result[ 0 ][ 'end_date' ];
            this.company_id        = result[ 0 ][ 'company_id' ];
            const isComplete       = moment().isAfter( this.intern_end_date );
            this.canStartLog( this.company_id );
          } else {
            this.loading_text  =
              'Notice: Unable to generate log book form\n' +
              'Make sure you have submitted an application. If you have, ' +
              ' Please remind your internship supervisor to fill and submit the Internship confirmation Form ';
            this.spinner_mode  = 'determinate';
            this.spinner_value = 100;
          }
        }, error => {
          this.showLoading = false;
          console.log( error );
          this.spinner_mode  = 'determinate';
          this.spinner_value = 100;
        } );
  }
  
  canStartLog ( company_id: number ) {
    const data = {
      student_number: this.userData[ 'student_number' ],
      company_id    : company_id
    };
    this.studentService.getStudentLog( data )
        .subscribe( ( res ) => {
          console.log( res );
          if (res.logs.length === 0) {
            this.start_btn_text = 'Start log book';
            this.loading_text   = `Generating Log Book Form for day ${res.logs.length + 1}`;
          }
          this.studentLog = res.logs;
          if (!this.logDateCheck()) {
            setTimeout( () => {
              this.loading_text = `Generating Log Book Form for day ${res.logs.length + 1}`;
              this.showLoading  = false;
              this.loading_text = '';
              this.startLog();
            }, 3000 );
          } else {
            this.loading_text  = `You cant enter a new log. Log Complete.\n Number of days:  ${ res.logs.length}`;
            this.spinner_mode  = 'determinate';
            this.spinner_value = 100;
          }
      
      
        }, error => {
          const err    = JSON.parse( error[ '_body' ] );
          const status = error[ 'status' ];
          if ((status === 412 ) && (err[ 'method' ] === 'get_student_log/cant_start')) {
            this.start_btn_text = 'dd';
            this.loading_text   = 'Error.... ';
            this.spinner_mode   = 'determinate';
            this.spinner_value  = 100;
        
          } else {
            console.log( 'other' );
            this.loading_text  = 'Error.... ';
            this.spinner_mode  = 'determinate';
            this.spinner_value = 100;
          }
        } );
  }
  
  
  logDateCheck (): boolean {
    if (this.studentLog) {
      console.log( moment( [ this.intern_start_date ] ).add( this.studentLog.length, 'd' ) );
      let isComplete = false;
      this.studentLog.forEach( log => {
        if (moment( log.log_date ).isSame( this.intern_end_date )) {
          isComplete = true; // cant make new log
        }
      } );
      return isComplete;
    }
  }
  
  startLog () {
    // this.showLoading = true;
    this.logBookStarted = true;
    
    this.startDate = new Date( this.intern_start_date );
    this.minDate   = new Date( this.intern_start_date );
    const d        = moment.duration( {'days': 40} );
    this.maxDate   = new Date( this.intern_end_date ); // new Date( moment( this.minDate ).add( d ).calendar() );
    
    
  }
  
  checkDate () {
    console.log( this.logBookForm.controls[ 'logDate' ].value );
  }
  
  
  onSubmitLog () {
    const logData = this.prepareFormData();
    console.log( logData );
    this.showLoading  = true;
    this.loading_text = 'Please Wait...';
    this.studentService.submitLog( logData )
        .subscribe( ( result ) => {
          this.loading_text = 'Log submitted successfully';
          this.logBookForm.reset();
          setTimeout( () => {
            this.showLoading = false;
          }, 2000 );
          console.log( result );
        }, error => {
          const err = JSON.parse( error[ '_body' ] );
          switch (err.method) {
            case 'log_date_duplicate':
              this.loading_text = err.message;
              setTimeout( () => {
                this.showLoading = false;
              }, 5000 );
              this.logBookForm.setErrors( {'isUsed': true} );
              break;
        
            default:
              this.loading_text = 'Something Happened, Please try again.';
              setTimeout( () => {
                this.showLoading = false;
              }, 5000 );
              this.logBookForm.setErrors( {'isUsed': true} );
          }
        } );
  }
  
  
  prepareFormData (): LogBookFormInternface {
    const formData = this.logBookForm.value;
    console.log( formData.logDate );
    return {
      log_date       : new Date( formData.logDate ).toDateString(),
      log_department : formData.logDepartment as string,
      log_description: formData.logDescription as string,
      log_status     : '' as string,
      student_number : this.userData[ 'student_number' ],
      company_id     : this.company_id as number,  // TODO get companyId
      student_name   : this.userData[ 'first_name' ] + ' ' + this.userData[ 'last_name' ]
    };
  }
}
