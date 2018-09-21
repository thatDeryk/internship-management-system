import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  NavigationExtras,
  Route,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { AuthManagerService } from '../services/auth-manager.service';


@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  
  constructor( private authService: AuthManagerService,
               private router: Router, private route: ActivatedRoute ) {
  }
  
  canActivate( next: ActivatedRouteSnapshot,
               state: RouterStateSnapshot ): Observable<any> | Observable<boolean> | Promise<boolean> | boolean {
    
    
    const url = `/${next.url}`;
    return this.authService.getUser( `${next.url}` )
               .map( result => {
                 if (result.user && result.user.token) {
                   return true;
                 }
      
                 // not logged in so redirect to login page with the return url
                 this.router.navigate( [ `../login/${url}` ],
                                       {
                                         queryParams: {
                                           returnUrl: state.url
                                         }
                                       } )
                     .catch( e => console.log( 'll' ) );
                 return false;
               } ).catch(this.handleError);
  }
  
  canActivateChild( route: ActivatedRouteSnapshot,
                    state: RouterStateSnapshot ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate( route, state );
  }
  
  
  /**
   * not used yet, but the intended purpose of
   * this method is to prevent certain components/pages
   * from being accessed with out the right authentication/permission
   * @return boolean  truthy
   *
   * */
  canLoad( route: Route ): boolean {
    const url = `/${route.path}`;
    
    return this.checkLogin( url );
  }
  
  checkLogin( url: string ): boolean {
    const user = localStorage.getItem( 'token' );
    
    if (user) {
      return true;
    }
    
    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;
    
    
    // Set our navigation extras object
    // that contains our global query params and fragment
    const navigationExtras: NavigationExtras = {
      queryParams: {'returnUrl': url},
    };
    
    // Navigate to the login page with extras
    this.router.navigate( [ `../login/${url}` ], navigationExtras );
    return false;
  }
  
  
  private handleError( error: Response | any ) {
    // use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body || JSON.stringify( body );
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw( errMsg );
  }
}
