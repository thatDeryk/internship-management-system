import { CdkTableModule } from '@angular/cdk';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AuthGuard } from '../../guard/auth.guard';
import { MaterialCustomModule } from '../../share-modules/material.module';
import {
  MyDialogComponent,
  StudentApplicationFormComponent
} from './student-application-form/student-application-form.component';
import { HomeComponent } from './student-home/home.component';
import { LogFormComponent } from './student-log-form/log-form.component';
import { StudentLogsComponent } from './student-logs/student-logs.component';
import { StudentRouterModule } from './student-router/student-router.module';
import { StudentService } from './student-service/student.service';
import { StudentComponent } from './student.component';
import { MomentModule } from 'angular2-moment';
import { EvaluationResultComponent } from './evaluation-result/evaluation-result.component';
import { StudentApplicationComponent } from './student-application/student-application.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { ConfirmationFormStudentComponent } from './confirmation-form/confirmation-form-student.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule( {
             imports        : [
               CommonModule,
               FormsModule,
               HttpModule,
               MomentModule,
               ReactiveFormsModule,
               MaterialCustomModule,
               CdkTableModule,
               StudentRouterModule,
             ],
             declarations   : [
               StudentComponent,
               HomeComponent,
               LogFormComponent,
               StudentApplicationFormComponent,
               StudentLogsComponent,
               MyDialogComponent,
               EvaluationResultComponent,
               StudentApplicationComponent,
               StudentProfileComponent,
               ConfirmationFormStudentComponent,
               NotFoundComponent
             ],
             entryComponents: [ MyDialogComponent ],
             providers      : [ AuthGuard, StudentService ]
           } )
export class StudentModule {
}
