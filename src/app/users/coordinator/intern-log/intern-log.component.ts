import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MD_DIALOG_DATA, MdDialog, MdDialogRef, MdPaginator, PageEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import { Observable } from 'rxjs/Observable';
import { CoordinatorService } from '../coordinator-service/coordinator.service';

@Component( {
              selector   : 'app-intern-log',
              templateUrl: './intern-log.component.html',
              styleUrls  : [ './intern-log.component.scss' ],
            } )
export class InternLogComponent implements OnInit {
  
  
  @ViewChild( MdPaginator ) paginator: MdPaginator;
  
  @ViewChild( 'search' ) search: ElementRef;
  
  
  showCompleteBtn  = false;
  loading_text: string;
  showLoading      = false;
  student_number: number;
  company_id: number;
  student_name: string;
  student_logs: Observable<any>;
  log_id: number;
  log_date: any;
  total_page: number;
  isInternComplete = false;
  btn_text         = 'Internship Complete';
  logLength: number;
  pageSize         = 10;
  pageIndex        = 0;
  searchKeyword    = '';
  userDate: any;
  isMessageSent    = false;
  
  //  private  router: Router
  constructor ( private coordinatorService: CoordinatorService, public dialog: MdDialog,
                private route: ActivatedRoute, ) {
    
    this.showLoading  = true;
    this.loading_text = 'Populating the form preliminary user info';
  }
  
  
  ngOnInit () {
    
    const student_number = this.route.snapshot.queryParams[ 'studentId' ];
    const company_id     = this.route.snapshot.queryParams[ 'companyId' ];
    this.student_name    = this.route.snapshot.queryParams[ 'n' ];
    this.userDate        = this.coordinatorService.getLocalStorageData();
    this.verifyData( student_number, company_id );
    this.showLoading  = true;
    this.loading_text = 'Please wait';
    
    
    setTimeout( () => {
      this.initSearch();
    }, 10000 );
    
    
  }
  
  
  initSearch () {
    try {
      Observable.fromEvent( this.search.nativeElement, 'keyup' )
                .debounceTime( 1000 )
                .distinctUntilChanged()
                .subscribe( () => {
                  if (!this.logLength) {
                    return;
                  }
                  this.searchKeyword = this.search.nativeElement.value;
                  this.getStudentLogs();
                } );
    } catch (error) {
      console.log( error );
    }
    
  }
  
  
  pageChange ( event: PageEvent ) {
    console.log( event );
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    if (this.logLength >= this.pageSize) {
      this.getStudentLogs();
    }
  }
  
  verifyData ( student_number, company_id ) {
    const data        = {
      student_number: student_number,
      company_id    : company_id
    };
    this.loading_text = `Verifying intern: ${this.student_name}`;
    this.coordinatorService.getCompanyConfirmationForm( data )
        .then( result => {
          setTimeout( () => {
            this.loading_text = 'Please Wait..';
          }, 2000 );
          if (result) {
            this.company_id     = result[ 'company_id' ];
            this.student_number = result[ 'student_number' ];
            this.getMessage();
  
            if (result[ 'internship_status' ] === 'complete') {
              this.isInternComplete = true;
              this.btn_text         = 'Internship Complete';
            } else {
              this.btn_text = 'Not complete';
            }
            if (this.student_number) {
              this.getStudentLogs();
            }
          } else {
        
            // / this.router.navigate( [ `coordinator/interns/company-confirmation-form` ], queryParams )
        
          }
        } )
        .catch( error => {
          console.log( error );
        } );
  }
  
  
  getStudentLogs () {
    
    setTimeout( () => {
      this.loading_text = `Fetching ${this.student_name} logs`;
    }, 3000 );
    const data = {
      student_number: this.student_number,
      company_id    : this.company_id,
      page          : this.pageIndex,
      perpage       : this.pageSize,
      search_keyword: this.searchKeyword
    };
    const logs = this.coordinatorService.getStudentLogs( data );
    logs.subscribe( ( result ) => {
      const logStatus = [];
      let isEnd       = false;
      const logLength = result.logs.length;
      const total_log = result.pagination.total_data;
      const  messageSent = result.other.oral_status;
      if (logLength > 0) {
        result.logs.forEach( log => {
          if (log.log_status === 'approved') {
            logStatus.push( log.log_status );
          }
          if (moment( log.log_date ).isSameOrAfter( log.end_date )) {
            isEnd = true;
          }
        } );
        if (logLength === logStatus.length) {
          this.showCompleteBtn = isEnd;
          // this.btn_text = '';
        }
      }
      this.student_logs = Observable.of( result.logs );
      this.logLength    = total_log;
      this.isMessageSent = messageSent !== 'sent';
      setTimeout( () => {
        this.showLoading = false;
      }, 4000 );
      this.total_page = total_log;
    }, error2 => {
      console.log( error2 );
    } );
  }
  
  callForOralExam () {
    this.openOralCallDialog();
  }
  
  openOralCallDialog () {
    const dialogRef = this.dialog.open( OralCallDialogComponent );
    dialogRef.afterClosed()
             .subscribe( result => {
               if (result) {
                 this.sendMessage( result );
               }
               console.log( result );
             } );
  }
  
  getMessage () {
    const data = {
      student_number: this.student_number
    };
    
    this.coordinatorService.getExamMessage( data )
        .subscribe( result => {
          console.log( result );
          if (result.length > 0) {
            this.isMessageSent = false;
          }else {
            this.isMessageSent = true;
          }
        }, error => {
          console.log( error );
        } );
  }
  
  
  sendMessage ( data ) {
    const dd = {
      student_number: this.student_number,
      company_id    : this.company_id,
      coordinator_id: this.userDate[ 'id' ],
      message       : data.message,
      exam_date     : data.exam_date,
      exam_time     : data.exam_time
    };
    this.coordinatorService.sendExamMessage( dd )
        .subscribe( result => {
          console.log( result );
          alert( 'Message Sent' );
          this.getMessage();
        }, error => {
          console.log( error );
        } );
  }
  
}

@Component( {
              selector   : 'app-oral-call-dialog',
              templateUrl: './oral-call-dialog.html',
              styleUrls  : [ './intern-log.component.scss' ],
  
            } )
export class OralCallDialogComponent {
  constructor ( public dialogRef: MdDialogRef<InternLogComponent>,
                @Inject( MD_DIALOG_DATA ) public data: any ) {
  }
  
  minDate     = new Date();
  startDate   = new Date();
  submitted   = false;
  messageForm = new FormGroup( {
                                 examDate: new FormControl( '', [ Validators.required ] ),
                                 examTime: new FormControl( '', [ Validators.required ] ),
                                 message : new FormControl( '', [ Validators.required ] )
                               } );
  
  dateFilter = ( ex: Date ): boolean => {
    const day = ex.getDay();
    return day !== 0 && day !== 6;
  }
  
  
  submitReason () {
    this.submitted = true;
    const data     = this.prepareData();
    console.log( data );
    this.dialogRef.close( data );
  }
  
  prepareData () {
    const data = this.messageForm.value;
    return {
      message  : data.message as string,
      exam_date: data.examDate as any,
      exam_time: data.examTime as any
    };
  }
}
