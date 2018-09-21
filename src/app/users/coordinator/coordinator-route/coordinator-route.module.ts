import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationDetailComponent } from '../application-detail/application-detail.component';
import { ApplicationsComponent } from '../applications/applications.component';
import { ConfirmationFormComponent } from '../confirmation-form/confirmation-form.component';
import { HomeComponent } from '../coordinator-home/home.component';
import { CoordinatorComponent } from '../coordinator.component';
import { InternLogComponent } from '../intern-log/intern-log.component';
import { InternsComponent } from '../interns/interns.component';
import { EvaluationFormComponent } from '../evaluation-form/evaluation-form.component';
import { CoordinatorProfileComponent } from '../coordinator-profile/coordinator-profile.component';
import { AuthGuard } from '../../../guard/auth.guard';
import { NotFoundComponent } from '../not-found/not-found.component';
import { HelpComponent } from '../../../help/help.component';

const coordinitor_route: Routes = [
  {
    path     : 'coordinator',
    component: CoordinatorComponent,
    canActivate: [AuthGuard],

    children: [
      {
        path    : '',
        //  canActivateChild: [AuthGuard],
        children: [
          {
            path     : 'home',
            component: HomeComponent
          },
          {
            path     : 'profile',
            component: CoordinatorProfileComponent
          },
          {
            path     : 'applications',
            component: ApplicationsComponent,
            children : [
              {
                path     : 'application-detail',
                component: ApplicationDetailComponent
              },
            ]
          },
          {
            path     : 'interns',
            component: InternsComponent,
            children : [
              {
                path     : 'intern-log',
                component: InternLogComponent
              },
              {
                path     : 'company-confirmation-form',
                component: ConfirmationFormComponent
              },
              {
                path     : 'evaluation-form',
                component: EvaluationFormComponent
              }
            ]
          },
      {
        path: 'faq-help',
        component: HelpComponent
      },
          {
            path      : '',
            redirectTo: 'home',
            pathMatch : 'full'
          },
          {
            path: '**',
            component: NotFoundComponent
          }
        ]
      }

    ]
  }
];

@NgModule( {
             imports: [ RouterModule.forRoot( coordinitor_route ) ],
             exports: [ RouterModule ],

           } )
export class CoordinatorRouteModule {
}
