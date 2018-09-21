import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { NavigationStart, Router } from '@angular/router';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import 'rxjs/add/operator/share';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ApiUrl } from '../interfaces/app-interface';

const API_URL = ApiUrl;

@Injectable()
export class AuthManagerService {
  user: any;
  redirectUrl;
  private isLoginSubject            = new BehaviorSubject<boolean>( this.hasToken() ); // variable to keep track of
                                                                                       // user status
  private keepAfterNavigationChange = false;
  
  constructor ( private http: Http, private router: Router ) {
    
    // clear alert message on route change
    router.events.subscribe( event => {
      if (event instanceof NavigationStart) {
        // keep checking after page navigation//
        // this helps control unauthorised access.
        //
        console.log( event );
        this.isLoginSubject.next( this.hasToken() );
      }
    } );
  }
  
  
  requestOptions (): RequestOptions {
    const storedUser = localStorage.getItem( 'user' );
    const headers    = new Headers();
    if (storedUser) {
      const user = JSON.parse( storedUser );
      if (user) {
        headers.append( 'X-Auth-Token', user.token );
      }
    }
    return new RequestOptions( {headers: headers} );
  }
  
  getUser ( user: string ): Observable<any> {
    return this.http.post( `${API_URL}user`,
                           {user: user},
                           this.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  doLogin ( user: { email: string, password: string, user: string } ): Observable<any> {
    return this.http.post( `${API_URL}login`, user )
               .map( ( response: Response ) => response.json() );
  }
  
  recoverPassword(data): Observable<any> {
    return this.http.post( `${API_URL}recover`, data )
               .map( ( response: Response ) => response.json() );
  }
  
  /**
   * if we have a token the user is logged in
   * @return boolean
   * */
  private hasToken (): boolean {
    return !!localStorage.getItem( 'token' );
  }
  
  
  setLogInStatus ( status: boolean, keepAfterNavigationChange = false ) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.isLoginSubject.next( status );
  }
  
  /**
   * @returns Observable
   *
   **/
  getLoginStatus (): Observable<any> {
    return this.isLoginSubject.asObservable().share();
  }
  
  
  logOut (): void {
    localStorage.removeItem( 'user' );
    localStorage.removeItem( 'token' );
    this.router.navigate( [ '/' ] ).then( () => {
      this.isLoginSubject.next( false );
    } ).catch( err => console.log( err ) );
  }
  
  signUpStudent ( user ): Observable<any> {
    return this.http.post( `${API_URL}sign-up`, user )
               .map( ( response: Response ) => response.json() );
  }
  
  changePassword ( data ): Observable<any> {
    return this.http.post( `${API_URL}change`,
                           {data: data},
                           this.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  private handleError ( error: Response | any ) {
    // use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err  = body.error || JSON.stringify( body );
      errMsg     = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw( errMsg );
  }
  
}


