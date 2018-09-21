import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthManagerService } from '../services/auth-manager.service';

@Component( {
              selector   : 'app-home',
              templateUrl: './home.component.html',
              styleUrls  : [ './home.component.scss' ]
            } )
export class HomeComponent implements OnInit {
  
  constructor( private router: Router, private route: ActivatedRoute, private authManager: AuthManagerService ) {
  }
  
  ngOnInit() {
    localStorage.removeItem( 'token' );
    localStorage.removeItem( 'user' );
    this.authManager.setLogInStatus( false, true );
    this.authManager.logOut();
  }
  
  loginAs( who ): void {
    this.router.navigate( [ `login/${who}` ] );
  }
}
