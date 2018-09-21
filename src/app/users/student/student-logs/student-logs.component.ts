import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MdPaginator, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import * as moment from 'moment';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { StudentLog } from '../../../interfaces/app-interface';
import { StudentService } from '../student-service/student.service';

export interface LogData {
  id: string;
  date: string;
  department: string;
  description: string;
}

@Component( {
              selector   : 'app-student-logs',
              templateUrl: './student-logs.component.html',
              styleUrls  : [ './student-logs.component.scss' ]
            } )
export class StudentLogsComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild( MdPaginator ) paginator: MdPaginator;
  
  @ViewChild( 'search' ) search: ElementRef;
  
  
  searchEvent: Subscription;
  showCompleteBtn                           = false;
  isInternComplete                          = false;
  minDate                                   = new Date();
  maxDate                                   = new Date();
  startDate                                 = new Date();
  intern_start_date: any;
  intern_end_date: any;
  userData: any;
  showLoading                               = true;
  loading_text: string;
  spinner_mode                              = 'indeterminate';
  spinner_value                             = 0;
  company_id: number;
  showForm                                  = false;
  formTitle: string;
  studentLogs: Observable<any>;
  log_id: number;
  logLength: number;
  pageSize                                  = 20;
  pageIndex                                 = 0;
  searchKeyword                             = '';
  logBookForm                               = new FormGroup( {
                                                               logDate       : new FormControl(),
                                                               logDepartment : new FormControl(),
                                                               logDescription: new FormControl()
                                                             } );
  dataChange: BehaviorSubject<StudentLog[]> = new BehaviorSubject<StudentLog[]>( [] );
  
  _dateFilter = ( d: Date ): boolean => {
    const day = d.getDay();
    return day !== 0 && day !== 6;
  }
  
  get data (): StudentLog[] {
    return this.dataChange.value;
  }
  
  constructor ( private studentService: StudentService,
                private router: Router ) {
    
    
  }
  
  pageChange ( event: PageEvent ) {
    console.log( event );
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadStudentLog();
    
  }
  
  initSearch () {
    this.searchEvent = Observable.fromEvent( this.search.nativeElement, 'keyup' )
                                 .debounceTime( 1000 )
                                 .distinctUntilChanged()
                                 .subscribe( () => {
                                   if (!this.logLength) {
                                     return;
                                   }
                                   this.searchKeyword = this.search.nativeElement.value;
                                   this.loadStudentLog();
      
                                 } );
    
  }
  
  
  ngOnInit () {
    //
    // wait for the view to completely render.
   
    this.userData = this.studentService.getLocalStorageData();
    if (!this.userData) {
      this.router.navigate( [ './' ] );
    } else {
      setTimeout( () => {
        this.showLoading  = true;
        this.loading_text = 'Loading Log Book, Please wait...';
        this.getCompanyConfirmationForm( this.userData[ 'student_number' ] );
      }, 5000 );
      
      
    }
    
    
  }
  
  ngAfterViewInit () {
    console.log( this.search );
    
  }
  
  getCompanyConfirmationForm ( student_number: number ) {
    
    const data = {
      student_number: student_number
    };
    this.studentService.getCompanyOfIntern( data )
        .subscribe( ( result ) => {
          if (result.length > 0) {
            console.log( result );
            this.intern_start_date = result[ 0 ][ 'start_date' ];
            this.intern_end_date   = result[ 0 ][ 'end_date' ];
            this.company_id        = result[ 0 ][ 'company_id' ];
            if (result[ 0 ][ 'internship_completed' ] === 'true') {
              this.showCompleteBtn  = true;
              this.isInternComplete = true;
            }
            this.loadStudentLog();
          } else {
            this.loading_text  =
              'Notice: Unable to generate log book\n' + '. Make sure you have submitted an application. If you have, ' +
              ' Please remind your internship supervisor to fill and submit the Internship confirmation Form ';
            this.spinner_mode  = 'determinate';
            this.spinner_value = 79;
          }
        }, error => {
          this.showLoading = false;
          console.log( error );
        } );
  }
  
  reviewAndUpdateDeniedLog ( log, reviewId: number ) {
    
    console.log( this.intern_start_date );
    console.log( this.intern_end_date );
    this.startDate = new Date( this.intern_start_date );
    this.minDate   = new Date( this.intern_start_date );
    this.maxDate   = new Date( this.intern_end_date );
    
    this.log_id    = log.log_id;
    this.showForm  = true;
    this.formTitle = 'Update Declined Log';
    this.logBookForm.setValue( {
                                 logDate       : new Date( log.log_date ),
                                 logDepartment : log.log_department,
                                 logDescription: log.log_description,
                               } );
  }
  
  updateLog ( log ) {
    
    console.log( this.intern_start_date );
    this.startDate = new Date( this.intern_start_date );
    this.minDate   = new Date( this.intern_start_date );
    const d        = moment.duration( {'days': 40} );
    this.maxDate   = new Date( this.intern_end_date );
    
    this.log_id    = log.log_id;
    this.showForm  = true;
    this.formTitle = 'Update Log';
    this.logBookForm.setValue( {
                                 logDate       : new Date( log.log_date ),
                                 logDepartment : log.log_department,
                                 logDescription: log.log_description,
                               } );
  }
  
  onSubmitUpdatedLog () {
    this.showLoading     = true;
    this.loading_text    = 'Updating form for review..';
    const updatedLogData = this.prepareUpdatedLog();
    
    this.studentService.submitUpdatedLog( updatedLogData )
        .subscribe( ( result ) => {
          this.getCompanyConfirmationForm( this.userData[ 'student_number' ] );
          this.showForm = false;
        }, error => {
          console.log( error );
          this.showLoading = false;
        } );
  }
  
  prepareUpdatedLog () {
    const formData = this.logBookForm.value;
    return {
      log_date       : formData.logDate.toDateString(),
      log_department : formData.logDepartment as string,
      log_description: formData.logDescription as string,
      log_status     : 'updated' as string,
      student_number : this.userData[ 'student_number' ],
      company_id     : this.company_id as number,  // TODO get companyId
      log_id         : this.log_id as number
    };
    
  }
  
  loadStudentLog () {
    const data = {
      student_number: this.userData[ 'student_number' ],
      company_id    : this.company_id,
      page          : this.pageIndex,
      perpage       : this.pageSize,
      search_keyword: this.searchKeyword
    };
    const logs = this.studentService.getStudentLog( data );
    logs.subscribe( result => {
      if (result.logs.length > 0) {
        console.log( result );
        this.logLength   = result.pagination.total_data;
        this.showLoading = false;
        this.studentLogs = Observable.of( result.logs );
        
        // this.dataChange.next( result.logs );
      } else {
        this.loading_text  = 'No logs Found..';
        this.spinner_mode  = 'determinate';
        this.spinner_value = 79;
        this.studentLogs   = Observable.of( result.logs );
        this.logLength     = result.pagination.total_data;
      }
      setTimeout( () => {
        this.initSearch();
      }, 10000 );
    }, error => {
      console.log( error );
    } );
    
  }
  
  ngOnDestroy () {
   // this.searchEvent.unsubscribe();
  }
}





