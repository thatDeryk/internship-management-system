import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MdDialog, MdPaginator, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { CompanyService } from '../company-service/company.service';
import { ReviewLogDialogComponent } from '../review-log-dialog/review-log-dialog.component';

@Component( {
              selector   : 'app-company-intern-log',
              templateUrl: './intern-log.component.html',
              styleUrls  : [ './intern-log.component.scss' ],
            } )
export class InternLogComponent implements OnInit {
  
  @ViewChild( MdPaginator ) paginator: MdPaginator;
  
  @ViewChild( 'searchLogs' ) search: ElementRef;
  
  
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
  btn_text         = 'Mark Internship as complete';
  logLength: number;
  pageSize         = 20;
  pageIndex        = 0;
  searchKeyword    = '';
  logs: Subscription;
  
  constructor ( private companyService: CompanyService, public dialog: MdDialog,
                private route: ActivatedRoute,
                private  router: Router ) {
    
    this.showLoading  = true;
    this.loading_text = 'Populating the form preliminary user info';
  }
  
  
  ngOnInit () {
    
    const comId         = this.companyService.getLocalStorageData();
    this.company_id     = comId[ 'id' ];
    this.student_number = this.route.snapshot.queryParams[ 'studentId' ];
    this.student_name   = this.route.snapshot.queryParams[ 'internName' ];
    setTimeout( () => {
      this.getStudentLogs();
      this.getStudentConfirmation();
    }, 1000 );
    this.initSearch();

  }
  
  pageChange ( event: PageEvent ) {
    console.log( event );
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getStudentLogs();
    
    
  }
  
  initSearch () {
    Observable.fromEvent( this.search.nativeElement, 'keyup' )
              .debounceTime( 750 )
              .distinctUntilChanged()
              .subscribe( () => {
                if (!this.logLength) {
                  return;
                }
                this.searchKeyword = this.search.nativeElement.value;
                this.getStudentLogs();
      
              } );
    
  }
  
  
  getStudentLogs () {
    const data         = {
      student_number: this.student_number,
      company_id    : this.company_id,
      page          : this.pageIndex,
      perpage       : this.pageSize,
      search_keyword: this.searchKeyword
    };
    const student_logs = this.companyService.getStudentLogs( data );
    this.logs          = student_logs.subscribe( ( result ) => {
      const logStatus  = [];
      let isEnd        = false;
      const pagination = result.pagination;
      const logLength  = pagination.total_data;
      
      if (logLength > 0) {
        result.logs.forEach( log => {
          if (log.log_status === 'approved') {
            logStatus.push( log.log_status );
          }
          if (moment( log.log_date ).isSameOrAfter( log.end_date )) {
            isEnd = true;
          }
        } );
        if (logLength == logStatus.length) {
          this.showCompleteBtn = isEnd;
          // this.btn_text = '';
        }
      }
      
      this.total_page   = logLength;
      this.logLength    = logLength;
      this.student_logs = Observable.of( result.logs );
    }, error2 => {
      console.log( error2 );
    } );
  }
  
  getStudentConfirmation () {
    
    const data = {
      student_number: this.student_number,
      company_id    : this.company_id
    };
    this.companyService.getStudentConfirmation( data )
        .then( result => {
          console.log( result );
          if (result[ 'internship_status' ] === 'complete') {
            this.isInternComplete = true;
            this.btn_text         = 'Internship Complete';
          }
        } ).catch( error => {
      console.log( error );
    } );
  }
  
  internComplete () {
    const data = {
      student_number: this.student_number,
      company_id    : this.company_id,
      student_name  : this.student_name
    };
    this.companyService.setInternshipComplete( data )
        .then( r => {
          console.log( r );
          if (r.result === 'OK') {
            this.isInternComplete = true;
          }
        } )
        .catch( error => {
          console.error( error );
        } );
  }
  
  openReviewDialog () {
    const dialogRef = this.dialog.open( ReviewLogDialogComponent, {
      height    : '300px',
      panelClass: '../review-log-dialog/review-log-dialog.component.scss'
    } );
    dialogRef.afterClosed()
             .subscribe( result => {
               console.log( 'dialog closed' );
      
               try {
                 if (typeof result[ 'decline_reason' ] !== 'undefined') {
                   //  console.log(result);
                   this.submitReason( result[ 'decline_reason' ] );
                 }
               } catch (error) {
                 console.log( error );
               }
             }, error => {
               console.log( error );
             } );
  }
  
  submitReason ( reason ) {
    const data = {
      review        : reason.trim(),
      company_id    : this.company_id,
      student_number: this.student_number,
      log_id        : this.log_id,
      log_date      : this.log_date
    };
    
    this.companyService.addLogReview( data )
        .subscribe( ( result ) => {
          console.log( result );
          this.getStudentLogs();
        }, error => {
          console.log( error );
        } );
  }
  
  acceptLog ( log ): void {
    this.log_id = log.log_id;
    const data  = {
      company_id    : this.company_id,
      student_number: this.student_number,
      log_id        : this.log_id,
      review_id     : log.review_id,
      log_date      : log.log_date
    };
    this.companyService.acceptLog( data )
        .subscribe( result => {
          console.log( result );
          this.getStudentLogs();
        }, error => {
          console.log( error );
        } );
  }
  
  declineLog ( log ): void {
    this.log_id   = log.log_id;
    this.log_date = log.log_date;
    this.openReviewDialog();
  }
}
