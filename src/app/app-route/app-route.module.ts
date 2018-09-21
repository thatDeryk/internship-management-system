import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from '../help/help.component';
import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { RecoverPaswordComponent } from '../recover-pasword/recover-pasword.component';
import { SignUpComponent } from '../sign-up/sign-up.component';

const appRoutes: Routes = [
  {
    path     : '',
    component: HomeComponent
  },
  {
    path     : 'login/:user',
    component: LoginComponent
  },
  {
    path     : 'forgot-password/:user',
    component: RecoverPaswordComponent
  },
  {
    path     : 'login/student/sign-up',
    component: SignUpComponent
  },
  {
    path     : 'student/faq-help',
    component: HelpComponent
  },
  {
    path     : 'faq-help',
    component: HelpComponent
  },
  {
    path     : 'company/faq-help',
    component: HelpComponent
  },
  {
    path: 'coordinator/faq-help',
    component: HelpComponent
  },
  {
    path     : '**',
    component: PageNotFoundComponent
  }
];

@NgModule( {
             imports: [
               RouterModule.forRoot(
                 appRoutes,
                 // {enableTracing: true}
               ),
             ],
             exports: [ RouterModule ],
           } )
export class AppRouteModule {
}
