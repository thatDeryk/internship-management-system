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
import { CoordinatorService } from '../coordinator-service/coordinator.service';

@Component( {
              selector   : 'app-interns',
              templateUrl: './interns.component.html',
              styleUrls  : [ './interns.component.scss' ]
            } )
export class InternsComponent implements OnInit, OnDestroy {
  
  
  @ViewChild( MdPaginator ) paginator: MdPaginator;
  
  @ViewChild( 'search' ) search: ElementRef;
  
  
  isLogDetail = false;
  
  interns: Observable<any>;
  
  internsLength: number;
  pageSize      = 20;
  pageIndex     = 0;
  searchKeyword = '';
  
  routerSubscription: Subscription;
  searchSubscription: Subscription;
  
  constructor ( private router: Router, private route: ActivatedRoute,
                private coordinatorService: CoordinatorService ) {
    this.routerSubscription = router.events.subscribe( event => {
      if (event instanceof NavigationEnd) {
        console.log( event );
        console.log( this.route.snapshot.queryParams[ 'studentId' ] );
        this.isLogDetail = !!this.route.snapshot.queryParams[ 'studentId' ];
      }
      
      
    } );
  }
  
  ngOnInit () {
    
    this.getAllInterns();
    
    if (!this.route.snapshot.queryParams[ 'studentId' ]) {
      setTimeout( () => {
      }, 10000 );
      
    }
    
  }
  
  
  pageChange ( event: PageEvent ) {
    console.log( event );
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    if (this.internsLength >= this.pageSize) {
      this.getAllInterns();
    }
  }
  
  initSearch () {
    try {
      this.searchSubscription = Observable.fromEvent( this.search.nativeElement, 'keyup' )
                                          .debounceTime( 1000 )
                                          .distinctUntilChanged()
                                          .subscribe( () => {
                                            if (!this.internsLength) {
                                              return;
                                            }
                                            this.searchKeyword = this.search.nativeElement.value;
                                            this.getAllInterns();
        
                                          } );
      
    } catch (error) {
      console.log( error );
    }
    
  }
  
  
  getAllInterns () {
    
    const data    = {
      page          : this.pageIndex,
      perpage       : this.pageSize,
      search_keyword: this.searchKeyword
    };
    const interns = this.coordinatorService.getInterns( data );
    
    interns.subscribe( ( result ) => {
      this.internsLength = result.pagination.total_data;
      this.interns       = Observable.of( result.interns );
      if (!this.route.snapshot.queryParams[ 'studentId' ]) {
        this.initSearch();
      }
    }, error => {
      console.log( error );
    } );
    
    
  }
  
  viewStudentLog ( intern ): void {
    const queryParams: NavigationExtras = {
      queryParams: {
        studentId: intern[ 'student_number' ],
        n        : intern[ 'student_name' ],
        companyId: intern[ 'company_id' ]
      }
    };
    this.router.navigate( [ `coordinator/interns/intern-log` ], queryParams )
        .then( () => this.isLogDetail = true );
  }
  
  viewForm ( intern ): void {
    const queryParams: NavigationExtras = {
      queryParams: {
        studentId: intern[ 'student_number' ],
        n        : intern[ 'student_name' ],
        companyId: intern[ 'company_id' ]
      }
    };
    this.router.navigate( [ `coordinator/interns/company-confirmation-form` ], queryParams )
        .then( () => this.isLogDetail = true );
  }
  
  
  evaluateIntern ( intern ): void {
    const queryParams: NavigationExtras = {
      queryParams: {
        studentId  : intern[ 'student_number' ],
        companyId  : intern[ 'company_id' ],
        studentName: intern[ 'student_name' ]
      }
    };
    this.router.navigate( [ `coordinator/interns/evaluation-form` ], queryParams )
        .then( () => this.isLogDetail = true );
  }
  
  ngOnDestroy () {
    this.routerSubscription.unsubscribe();
    // this.searchSubscription.unsubscribe();
  }
}
