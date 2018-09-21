import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { NavigationStart, Router } from '@angular/router';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ApiUrl, CompanyConfirmationFormInterface } from '../../../interfaces/app-interface';
import { AuthManagerService } from '../../../services/auth-manager.service';


const API_URL = ApiUrl;

@Injectable()
export class CompanyService {
  
  private isStudenData = new Subject<any>(); // variable to keep track of user status
  private keepAfterNavigationChange = false;
  
  constructor( private http: Http, private authManager: AuthManagerService, public router: Router ) {
    router.events.subscribe( event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          this.isStudenData.next();
        }
      }
    } );
  }
  
  
  getCompanyInterns(data): Observable<any> {
    
    return this.http.post( `${API_URL}company`, {
                             method: 'get_company_interns',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  getProspCompanyInterns( data ): Observable<any> {
    return this.http.post( `${API_URL}company`, {
                             method: 'get_prospective_interns',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  getNotification( data ): Observable<any> {
    return this.http.post( `${API_URL}company`, {
                             method: 'get_company_notification',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  getLocalStorageData(): any {
    return JSON.parse( localStorage.getItem( 'user' ) );
  }
  
  submitConfirmationForm( data: CompanyConfirmationFormInterface ): Observable<any> {
    return this.http.post( `${API_URL}company`, {
                             method: 'submit_confirmation_form',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  checkStudentName( data ): Observable<any> {
    return this.http.post( `${API_URL}company`, {
                             method: 'check_student_name',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  verifyQueryParams( data ): Observable<any> {
    return this.http.post( `${API_URL}company`, {
                             method: 'verify_student_application_form',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  loadConfirmationForm(): Observable<any> {
    const data = this.getLocalStorageData();
    return this.http.post( `${API_URL}company`, {
                             method: 'load_confirmation_form',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  getStudentByNumber( data ): Observable<any> {
    return this.http.post( `${API_URL}company`, {
                             method: 'get_student_by_id',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  setStudentData( status: any, keepAfterNavigationChange = true ) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.isStudenData.next( status );
  }
  
  getStudentLogs( data ): Observable<any> {
    //
    return this.http.post( `${API_URL}company`, {
                             method: 'get_student_logs',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  getEvaluationResult( data ): Observable<any> {
    //
    return this.http.post( `${API_URL}company`, {
                             method: 'get_evaluation_result',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  setInternshipComplete( data ): Promise<any> {
    
    return this.http.post( `${API_URL}company`, {
                 method: 'set_internship_complete',
                 data  : data
               }, this.authManager.requestOptions() )
               .toPromise()
               .then( ( response: Response ) => response.json() );
  }
  
  getStudentConfirmation( data ): Promise<any> {
    return this.http.post( `${API_URL}company`, {
                 method: 'get_student_confirmation_form',
                 data  : data
               }, this.authManager.requestOptions() )
               .toPromise()
               .then( ( response: Response ) => response.json() );
  }
  
  addLogReview( data ): Observable<any> {
    //
    return this.http.post( `${API_URL}company`, {
                             method: 'add_log_review',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  acceptLog( data ): Observable<any> {
    //
    return this.http.post( `${API_URL}company`, {
                             method: 'accept_log',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  getStudentData(): Observable<any> {
    return this.isStudenData.asObservable().share();
  }
  
  private handleError( error: Response | any ) {
    // use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify( body );
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error( errMsg );
    return Observable.throw( errMsg );
  }
}
