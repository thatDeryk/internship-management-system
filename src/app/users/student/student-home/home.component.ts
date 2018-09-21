import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Notifications } from '../../../interfaces/app-interface';
import { StudentService } from '../student-service/student.service';

@Component( {
              selector   : 'app-home',
              templateUrl: './home.component.html',
              styleUrls  : [ './home.component.scss' ]
            } )
export class HomeComponent implements OnInit {
  student_applications: Observable<any>;
  _student_number: number;
  notifications: Observable<Notifications>;
  isNotification = false;
  userData: any;
  examMessages: Observable<any>;
  
  constructor ( private  router: Router, private studentService: StudentService ) {
    console.log();
  }
  
  ngOnInit () {
    const userData       = JSON.parse( localStorage.getItem( 'user' ) );
    this._student_number = userData[ 'student_number' ];
    this.getApplications();
    
    const data = this.studentService.getLocalStorageData();
    if (data) {
      this.userData = data;
      this.getCompanyNotification( 15 );
      this.getMessage();
    }
  }
  
  getApplications () {
    const data                = {student_number: this._student_number};
    this.student_applications = this.studentService.getInternshipApplications( data );
  }
  
  
  getCompanyNotification ( range ) {
    const data         = {
      id   : this.userData[ 'student_number' ],
      limit: range
    };
    this.notifications = this.studentService.getNotification( data );
    this.notifications.subscribe( result => {
      console.log( result );
      if (result.length > 0) {
        this.isNotification = true;
      }
    }, error => {
      console.log( error );
    } );
    
    
  }
  
  getMessage () {
    const data = {
      student_number: this.userData[ 'student_number' ],
    };
    
    this.examMessages = this.studentService.getExamMessage( data );
    this.examMessages
        .subscribe( result => {
          console.log( result );
         
        }, error => {
          console.log( error );
        } );
  }
  
  viewForm ( application ) {
    const queryParams: NavigationExtras = {
      queryParams: {'applicationId': application.application_id, studentId: application.student_number}
    };
    this.router.navigate( [ `student/company-confirmation-form` ], queryParams );
  }
}
