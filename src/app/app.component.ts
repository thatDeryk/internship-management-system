import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { AuthManagerService } from './services/auth-manager.service';

@Component( {
              selector   : 'app-root',
              templateUrl: './app.component.html',
              styleUrls  : [ './app.component.scss' ]
            } )
export class AppComponent implements OnInit {
  title = 'Internship Management system';
  isLoggedIn: Observable<boolean>;

  constructor ( private router: Router, private route: ActivatedRoute,
                private authManager: AuthManagerService ) {
    this._isLoggedInUser();
  }

  ngOnInit () {
    // this.isLoggedIn = this.authManager.getLoginStatus();

  }

  _isLoggedInUser () {
    this.authManager.getLoginStatus()
        .subscribe( message => {
          this.isLoggedIn = message;
        }, error2 => {
          this.isLoggedIn = Observable.of( false );
          this.logout();
        } );
  }

  logout () {
    this.authManager.logOut();
  }


  gotoHelp () {
    const route = this.router.url;
    const user  = route.split( '/', 2 );

    switch (user[ 1 ]) {
      case'student':
        console.log( 'student' );
        this.router.navigate( [ `${user[ 1 ]}/faq-help` ] );
        break;

      case'company':
        console.log( 'company' );
        this.router.navigate( [ `${user[ 1 ]}/faq-help` ] );
        break;

      case'coordinator':
        console.log( 'coordinator' );
        this.router.navigate( [ `${user[ 1 ]}/faq-help` ] );
        break;
    default:
      this.router.navigate([`faq-help`], { queryParams: { bck:'shbck'}  });
      localStorage.setItem('bck', 'bckBtn');

    }
  }

  userProfile () {
    const rr  = this.router.url;
    const nav = rr.split( '/', 2 );
    this.router.navigate( [ `${nav[ 1 ]}/profile` ] );
  }
}
