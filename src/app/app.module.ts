import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MomentModule } from 'angular2-moment';
import { AppRouteModule } from './app-route/app-route.module';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginFormDataInterface } from './interfaces/app-interface';
import { LoginComponent } from './login/login.component';
import { AuthManagerService } from './services/auth-manager.service';
import { MaterialCustomModule } from './share-modules/material.module';
import { CompanyModule } from './users/company/company.module';
import { CoordinatorModule } from './users/coordinator/coordinator.module';
import { StudentModule } from './users/student/student.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RecoverPaswordComponent } from './recover-pasword/recover-pasword.component';
import { HelpComponent, HelpDialogComponent } from './help/help.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';


@NgModule( {
             declarations   : [
               AppComponent,
               LoginComponent,
               HomeComponent,
               SignUpComponent,
               RecoverPaswordComponent,
               HelpComponent,
               PageNotFoundComponent,
         HelpDialogComponent
             ],
             imports        : [
               BrowserModule,
               FormsModule,
               ReactiveFormsModule,
               HttpModule,
               MomentModule,
               BrowserAnimationsModule,
               StudentModule,
               CoordinatorModule,
               CompanyModule,
               MaterialCustomModule,
               AppRouteModule,
             ],
       entryComponents: [LoginComponent, HomeComponent, HelpDialogComponent],
             providers      : [ AuthManagerService ],
             bootstrap      : [ AppComponent ]
           } )
export class AppModule {
}
