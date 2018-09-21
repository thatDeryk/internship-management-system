import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MdPaginator, PageEvent } from '@angular/material';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { InternshipApplicationInterface } from '../../../interfaces/app-interface';
import { CoordinatorService } from '../coordinator-service/coordinator.service';

@Component( {
              selector   : 'app-applications',
              templateUrl: './applications.component.html',
              styleUrls  : [ './applications.component.scss' ]
            } )
export class ApplicationsComponent implements OnInit, OnDestroy {
  isDetailLoaded = false;
  
  student_applications: Observable<InternshipApplicationInterface>;
  page_length: number;
  @ViewChild( MdPaginator ) paginator: MdPaginator;
  
  
  @ViewChild( 'search' ) search: ElementRef;
  
  
  total_page: number;
  pageSize      = 10;
  pageIndex     = 0;
  searchKeyword = '';
  subscription: Subscription;
  routerSubscription: Subscription;
  
  constructor ( private router: Router, private route: ActivatedRoute,
                private coordinatorService: CoordinatorService ) {
    this.routerSubscription = router.events.subscribe( event => {
      if (event instanceof NavigationEnd) {
        this.isDetailLoaded = !!this.route.snapshot.queryParams[ 'applicationId' ];
        console.log();
        if (!this.isDetailLoaded) {
          this.getStudentsApplications();
        }
      }
      
    } );
  }
  
  ngOnInit () {
   // this.getStudentsApplications();
    
    if (this.route.snapshot.queryParams[ 'applicationId' ]) {
      this.isDetailLoaded = true;
    }
    setTimeout( () => {
      this.initSearch();
    }, 10000 );
  }
  
  getStudentsApplications () {
    const data                 = {
      page          : this.pageIndex,
      perpage       : this.pageSize,
      search_keyword: this.searchKeyword
    };
    const student_applications = this.coordinatorService.getInternshipApplications( data );
    this.subscription          = student_applications.subscribe( ( result ) => {
      const pagination          = result[ 'pagination' ];
      this.student_applications = Observable.of( result[ 'applications' ] );
      console.log( pagination );
      this.total_page = pagination.total_data;
    }, error2 => {
      console.log( error2 );
    } );
  }
  
  viewApplication ( applicationId ) {
    
    this.isDetailLoaded                 = true;
    const queryParams: NavigationExtras = {
      queryParams: {'applicationId': applicationId}
    };
    this.router.navigate( [ `coordinator/applications/application-detail` ], queryParams );
  }
  
  
  pageChange ( event: PageEvent ) {
    console.log( event );
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    if (this.total_page >= this.pageSize) {
      this.getStudentsApplications();
    }
  }
  
  
  initSearch () {
    try {
      Observable.fromEvent( this.search.nativeElement, 'keyup' )
                .debounceTime( 1000 )
                .distinctUntilChanged()
                .subscribe( () => {
                  if (!this.total_page) {
                    return;
                  }
                  this.searchKeyword = this.search.nativeElement.value;
                  this.getStudentsApplications();
        
                } );
      
    } catch (error) {
      console.log( error );
    }
    
  }
  
  ngOnDestroy () {
    this.subscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }
}
