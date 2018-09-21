import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MdPaginator, PageEvent } from '@angular/material';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
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

@Component( {
              selector   : 'app-company-interns',
              templateUrl: './interns.component.html',
              styleUrls  : [ './interns.component.scss' ]
            } )
export class InternsComponent implements OnInit, OnDestroy {
  
  
  @ViewChild( MdPaginator ) paginator: MdPaginator;
  
  @ViewChild( 'search' ) search: ElementRef;
  
  
  isLogDetail   = false;
  companyInterns: Observable<any>;
  internsLength: number;
  pageSize      = 10;
  pageIndex     = 0;
  searchKeyword = '';
  company_email: string;
  companyInternsSubscription: Subscription;
  routerSubscription: Subscription;
  
  constructor ( private router: Router, private route: ActivatedRoute, private companyService: CompanyService ) {
    this.routerSubscription = router.events.subscribe( event => {
      if (event instanceof NavigationEnd) {
        this.isLogDetail = !!this.route.snapshot.queryParams[ 'studentId' ];
      }
      
    } );
  }
  
  ngOnInit () {
    const data         = this.companyService.getLocalStorageData();
    this.company_email = data[ 'email' ];
    
    if (!this.route.snapshot.queryParams[ 'studentId' ]) {
      this.getInterns();
    }
  }
  
  
  initSearch () {
    try {
      Observable.fromEvent( this.search.nativeElement, 'keyup' )
                .debounceTime( 750 )
                .distinctUntilChanged()
                .subscribe( () => {
                  if (!this.internsLength) {
                    return;
                  }
                  this.searchKeyword = this.search.nativeElement.value;
                  this.getInterns();
                } );
    } catch (error) {
      console.log( error );
    }
    
  }
  
  pageChange ( event: PageEvent ) {
    console.log( event );
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    if (this.internsLength >= this.pageSize) {
    }
    this.getInterns();
    
  }
  
  getInterns () {
    const data                       = {
      page          : this.pageIndex,
      perpage       : this.pageSize,
      search_keyword: this.searchKeyword,
      email         : this.company_email
    };
    const companyInternsSubscription = this.companyService.getCompanyInterns( data );
    
    this.companyInternsSubscription = companyInternsSubscription
      .subscribe( ( result ) => {
        const pagination    = result.pagination;
        this.internsLength  = pagination.total_data;
        this.companyInterns = Observable.of( result.interns );
  
        this.initSearch();
      }, ( error ) => {
        console.log( error );
      } );
  }
  
  viewEval ( intern ) {
    const queryParams: NavigationExtras = {
      queryParams: {
        studentId: intern.student_number,
        eval_id  : intern.evaluation_id
      }
    };
    this.router.navigate( [ `company/evaluation-result` ], queryParams );
  }
  
  companyPageChange ( event: PageEvent ) {
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    if (this.internsLength >= this.pageSize) {
      this.getInterns();
    }
  }
  
  viewStudentLog ( studentId, intern ) {
    const internName                    = `${intern.student_first_name.trim()} ${intern.student_last_name.trim()}`;
    const queryParams: NavigationExtras = {
      queryParams: {'studentId': studentId, internName}
    };
    this.router.navigate( [ `company/interns/intern-log` ], queryParams )
        .then( () => this.isLogDetail = true );
  }
  
  ngOnDestroy () {
    
    // this.companyInternsSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }
}
