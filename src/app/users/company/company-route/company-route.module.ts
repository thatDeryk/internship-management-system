import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "../../../guard/auth.guard";
import { HomeComponent } from '../company-home/home.component';
import { InternsComponent } from '../company-interns/interns.component';
import { CompanyProfileComponent } from '../company-profile/company-profile.component';
import { CompanyComponent } from '../company.component';
import { TrainingConfirmationFormComponent } from '../confirmation-form/confirmation-form.component';
import { InternLogComponent } from '../intern-log/intern-log.component';
import { ProspectiveComponent } from "../prospective-interns-list/prospective.component";
import { InternEvaluationComponent } from '../intern-evaluation-result/intern-evaluation.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { HelpComponent } from '../../../help/help.component';

const company_route: Routes = [
  {
    path       : 'company',
    component  : CompanyComponent,
    canActivate: [ AuthGuard ],

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
            component: CompanyProfileComponent
          },
          {
            path     : 'evaluation-result',
            component: InternEvaluationComponent
          },

          {
            path     : 'interns',
            component: InternsComponent,
            children : [
              {
                path     : 'intern-log',
                component: InternLogComponent
              },
            ]
          },
          {
            path     : 'prospective-interns',
            component: ProspectiveComponent,
            children : [
              {
                path     : 'confirmation-form',
                component: TrainingConfirmationFormComponent
              },
            ]
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
            path: '**',
            component: NotFoundComponent
          }
        ]
      }

    ]
  }
]

@NgModule( {
             imports: [ RouterModule.forRoot( company_route ) ],
             exports: [ RouterModule ],

           } )
export class CompanyRouteModule {
}
