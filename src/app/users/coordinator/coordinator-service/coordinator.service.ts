import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { ApiUrl, InternshipApplicationInterface } from '../../../interfaces/app-interface';
import { AuthManagerService } from '../../../services/auth-manager.service';

const API_URL = ApiUrl;

@Injectable()
export class CoordinatorService {
  
  constructor ( private http: Http, private authManager: AuthManagerService ) {
  }
  
  getLocalStorageData (): any {
    return JSON.parse( localStorage.getItem( 'user' ) );
  }
  
  getInternshipApplications ( data ): Observable<InternshipApplicationInterface> {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'get_applications',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  
  getInternshipApplicationById ( data ): Observable<InternshipApplicationInterface> {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'get_application_by_id',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  approveApplication ( data ) {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'application_accepted',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  applicationDenied ( reason ) {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'application_denied',
                             data  : reason
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  getInterns ( data ): Observable<any> {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'get_interns',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  getCompanyConfirmationForm ( data ): Promise<any> {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'get_company_confirmation_form',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .toPromise()
               .then( ( response: Response ) => response.json() );
  }
  
  
  getNotification ( data ): Observable<any> {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'get_coordinator_notification',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() ).catch( this.handleError );
  }
  
  
  submitEvaluation ( data ): Observable<any> {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'submit_evaluation',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  
  getStudentLogs ( data ): Observable<any> {
    //
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'get_student_logs',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  sendExamMessage(data): Observable<any> {
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'send_oral_exam_message',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  getExamMessage(data): Observable<any>{
    return this.http.post( `${API_URL}coordinator`, {
                             method: 'get_exam_message',
                             data  : data
                           },
                           this.authManager.requestOptions() )
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
    console.error( errMsg );
    return Observable.throw( errMsg );
  }
}
