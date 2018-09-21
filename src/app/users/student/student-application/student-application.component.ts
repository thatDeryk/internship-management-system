import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { InternshipApplicationFormInterface, InternshipApplicationInterface } from '../../../interfaces/app-interface';
import { StudentService } from '../student-service/student.service';

@Component( {
              selector   : 'app-student-application',
              templateUrl: './student-application.component.html',
              styleUrls  : [ './student-application.component.scss' ]
            } )
export class StudentApplicationComponent implements OnInit {
  
  no_application;
  student_applications: Observable<InternshipApplicationInterface>;
  _student_number: number;
  internFormData: InternshipApplicationFormInterface;
  errorMessage: any;
  showLoading       = false;
  loadingText: string;
  loadingMode       = 'indeterminate';
  student_fullName: string;
  loadingValue: any;
  isUpdateForm      = false;
  applicationId: number;
  isApplicationForm = false;
  showList          = true;
  
  
  constructor ( private studentService: StudentService,
                private router: Router, private route: ActivatedRoute ) {
    
    router.events.subscribe( event => {
      if (event instanceof NavigationEnd) {
        this.isApplicationForm = !!this.route.snapshot.queryParams[ 'applicationForm' ];
        this.showList          = !this.isApplicationForm;
        if (this.showList) {
          this.getInternshipApplication();
        }
      }
      
    } );
  }
  
  ngOnInit () {
    const userData       = JSON.parse( localStorage.getItem( 'user' ) );
    this._student_number = userData[ 'student_number' ];
    
    if (this.route.snapshot.queryParams[ 'applicationForm' ]) {
      this.isApplicationForm = true;
      const data             = JSON.parse( localStorage.getItem( 'studentApplication' ) );
      if (data) {
        this.studentService.setApplicationFormData( data );
      }
    } else {
      //  this.getInternshipApplication();
      console.log( this.showList );
      
    }
    
  }
  
  startApplication () {
    this.isApplicationForm              = true;
    this.showList                       = false;
    const queryParams: NavigationExtras = {
      queryParams: {'applicationForm': 'isOpen'}
    };
    this.router.navigate( [ `student/internship-application/application-form` ], queryParams )
        .then( ( t ) => {
          this.isApplicationForm = true;
        } );
  }
  
  viewForm ( application: InternshipApplicationFormInterface ) {
    
    this.showList = false;
    
    this.isUpdateForm  = true;
    this.applicationId = application.application_id;
    
    console.log( application );
    this.studentService.setApplicationFormData( application );
    
    const queryParams: NavigationExtras = {
      queryParams: {'applicationForm': 'isOpen'}
    };
    localStorage.setItem( 'studentApplication', JSON.stringify( application ) );
    this.router.navigate( [ `student/internship-application/application-form` ], queryParams )
        .then( ( t ) => {
          this.isApplicationForm = true;
        } );
    
  }
  
  getInternshipApplication () {
    
    localStorage.removeItem( 'studentApplication' );
    const userData = JSON.parse( localStorage.getItem( 'user' ) );
    if (!userData) {
      return;
    }
    this._student_number      = userData[ 'student_number' ];
    this.student_fullName     = `${userData[ 'first_name' ]} ${ userData[ 'last_name' ]}`;
    const data                = {student_number: this._student_number};
    this.student_applications = this.studentService.getInternshipApplications( data );
    const application         = this.student_applications;
    application.subscribe( ( result ) => {
      this.no_application = result.length > 0;
      // this.isApplicationForm = false;
    } );
    
  }
}
