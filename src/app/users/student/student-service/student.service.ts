import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ApiUrl, InternshipApplicationFormInterface } from '../../../interfaces/app-interface';
import { InternshipApplicationParams } from '../../../interfaces/student';
import { AuthManagerService } from '../../../services/auth-manager.service';


const API_URL = ApiUrl;

@Injectable()
export class StudentService {
  
  private applicationDetail = new Subject<InternshipApplicationFormInterface>();
  private applicationDatailPassed = new Subject<InternshipApplicationFormInterface>();
  
  applicationDetailSent$ = this.applicationDetail.asObservable();
  applicationDetailReceived$ = this.applicationDatailPassed.asObservable();
  
  constructor( private http: Http, private authManager: AuthManagerService ) {
  }
  
  
  getNotification( data ): Observable<any> {
    return this.http.post( `${API_URL}student`, {
                             method: 'get_student_notification',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  
  setApplicationFormData( data: InternshipApplicationFormInterface ) {
    this.applicationDetail.next( data );
  }
  
  getCompanyConfirmationForm( data ): Observable<any> {
    return this.http.post( `${API_URL}student`, {
                             method: 'get_company_confirmation_form',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  submitApplicationForm( data: InternshipApplicationParams ): Observable<any> {
    
    return this.http.post( `${API_URL}student`,
                           {
                             method: 'submit_application',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) =>
                       response.json() );
  }
  
  verifyQueryParams( data ): Observable<any> {
    return this.http.post( `${API_URL}student`, {
                             method: 'verify_student_application_form',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  getInternshipApplications( data ): Observable<any> {
    return this.http.post( `${API_URL}student`, {
                             method: 'get_applications',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  submitLog( data ): Observable<any> {
    return this.http.post( `${API_URL}student`, {
                             method: 'submit_log',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  
  submitUpdatedLog( data ): Observable<any> {
    return this.http.post( `${API_URL}student`, {
                             method: 'update_log',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  
  getStudentLog( data ): Observable<any> {
    //
    return this.http.post( `${API_URL}student`, {
                             method: 'get_student_log',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  getLocalStorageData(): any {
    return JSON.parse( localStorage.getItem( 'user' ) );
  }
  
  getCompanyOfIntern( data ): Observable<any> {
    //
    return this.http.post( `${API_URL}student`, {
                             method: 'get_active_internship_company',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  getEvaluationResult( data ): Promise<any> {
    //
    return this.http.post( `${API_URL}student`, {
                             method: 'get_evaluation_result',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .toPromise()
               .then( ( response: Response ) => response.json() );
  }
  
  getExamMessage(data): Observable<any>{
    return this.http.post( `${API_URL}student`, {
                             method: 'get_exam_message',
                             data  : data
                           },
                           this.authManager.requestOptions() )
               .map( ( response: Response ) => response.json() );
  }
  
  private handleError( error: Response | any ) {
    // use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify( body );
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
      console.error( errMsg );
      
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw( errMsg );
  }
}
