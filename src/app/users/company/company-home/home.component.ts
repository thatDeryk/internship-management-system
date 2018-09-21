import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CompanyService } from '../company-service/company.service';

@Component( {
              selector   : 'app-home',
              templateUrl: './home.component.html',
              styleUrls  : [ './home.component.scss' ]
            } )
export class HomeComponent implements OnInit {
  notifications: Observable<any>;
  isNotification = false;
  companyData: any;
  
  constructor( private router: Router, private companyService: CompanyService ) {
  }
  
  ngOnInit() {
    const data = this.companyService.getLocalStorageData();
    if (data) {
      this.companyData = data;
      this.getCompanyNotification( 15 );
    }
  }
  
  
  getCompanyNotification( range ) {
    const data = {
      company_id: this.companyData[ 'id' ],
      limit     : range
    };
    this.notifications = this.companyService.getNotification( data );
    this.notifications.subscribe( result => {
      console.log( result );
      if (result.length > 0) {
        this.isNotification = true;
      }
    }, error => {
      console.log( error );
    } );
    
    
  }
}
