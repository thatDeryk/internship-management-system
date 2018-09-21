import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CompanyService } from '../company-service/company.service';

@Component( {
              selector   : 'app-prospective-list',
              templateUrl: './prospective.component.html',
              styleUrls  : [ './prospective.component.scss' ]
            } )
export class ProspectiveComponent implements OnInit {
  
  
  isConfirmationForm = false;
  prospectiveInterns: Observable<any>;
  
  constructor( private router: Router, private route: ActivatedRoute,
               private companyService: CompanyService ) {
    router.events.subscribe( event => {
      if (event instanceof NavigationEnd) {
        console.log( event );
        console.log( this.route.snapshot.queryParams[ 'studentId' ] );
        this.isConfirmationForm = !!this.route.snapshot.queryParams[ 'studentId' ];
      }
      
      
    } );
    this.getInterns();
  
  }
  
  ngOnInit() {
    // this.companyService.setStudentData( this.interns );
    
  }
  
  getInterns() {
    const data = this.companyService.getLocalStorageData();
    this.prospectiveInterns = this.companyService.getProspCompanyInterns(data);
    
  }
  
  
  fillConfirmationForm( application ) {
    const queryParams: NavigationExtras = {
      queryParams: {'studentId': application.student_number, applicationId: application.application_id}
    };
    this.router.navigate( [ `company/prospective-interns/confirmation-form` ], queryParams )
        .then( () => this.isConfirmationForm = true );
  }
  
}
