import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../../guard/auth.guard';
import { HelpComponent } from '../../../help/help.component';
import { ConfirmationFormStudentComponent } from '../confirmation-form/confirmation-form-student.component';
import { EvaluationResultComponent } from '../evaluation-result/evaluation-result.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { StudentApplicationFormComponent } from '../student-application-form/student-application-form.component';
import { StudentApplicationComponent } from '../student-application/student-application.component';
import { HomeComponent } from '../student-home/home.component';
import { LogFormComponent } from '../student-log-form/log-form.component';
import { StudentLogsComponent } from '../student-logs/student-logs.component';
import { StudentProfileComponent } from '../student-profile/student-profile.component';
import { StudentComponent } from '../student.component';

const student_routes: Routes = [
  {
    path       : 'student',
    component  : StudentComponent,
    canActivate: [ AuthGuard ],
    
    children: [
      {
        path    : '',
        // canActivateChild: [ AuthGuard ],
        children: [
          {
            path     : 'home',
            component: HomeComponent
          },
          {
            path     : 'internship-application',
            component: StudentApplicationComponent,
            children : [
              {
                path     : 'application-form',
                component: StudentApplicationFormComponent,
              }
            ]
          },
          {
            path     : 'log-book',
            component: LogFormComponent
          },
          {
            path     : 'my-logs',
            component: StudentLogsComponent
          },
          {
            path     : 'evaluation-result',
            component: EvaluationResultComponent
          },
          {
            path     : 'company-confirmation-form',
            component: ConfirmationFormStudentComponent,
          },
          {
            path     : 'profile',
            component: StudentProfileComponent,
          },
          {
            path     : 'faq-help',
            component: HelpComponent
          },
          {
            path      : '',
            redirectTo: 'home',
            pathMatch : 'full'
          },
          {
            path     : '**',
            component: NotFoundComponent
          }
        ]
      }
    
    ]
  },


];

@NgModule( {
             imports: [ RouterModule.forRoot( student_routes ) ],
             exports: [ RouterModule ],
  
           } )
export class StudentRouterModule {
}
