import { CdkTableModule } from '@angular/cdk';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MomentModule } from 'angular2-moment';
import { AuthGuard } from '../../guard/auth.guard';
import { MaterialCustomModule } from '../../share-modules/material.module';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ConfirmationFormComponent } from './confirmation-form/confirmation-form.component';
import { HomeComponent } from './coordinator-home/home.component';
import { CoordinatorRouteModule } from './coordinator-route/coordinator-route.module';
import { CoordinatorService } from './coordinator-service/coordinator.service';
import { CoordinatorComponent } from './coordinator.component';
import { DenyDialogComponent } from './deny-dialog/deny-dialog.component';
import { EvaluationFormComponent } from './evaluation-form/evaluation-form.component';
import { InternLogComponent, OralCallDialogComponent } from './intern-log/intern-log.component';
import { InternsComponent } from './interns/interns.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CoordinatorProfileComponent } from './coordinator-profile/coordinator-profile.component';

@NgModule( {
             imports        : [
               CommonModule,
               FormsModule,
               HttpModule,
               ReactiveFormsModule,
               MomentModule,
               MaterialCustomModule,
               CdkTableModule,
               CoordinatorRouteModule
             ],
             declarations   : [
               CoordinatorComponent,
               HomeComponent,
               ApplicationsComponent,
               ApplicationDetailComponent,
               InternsComponent,
               InternLogComponent,
               DenyDialogComponent,
               ConfirmationFormComponent,
               EvaluationFormComponent,
               NotFoundComponent,
               OralCallDialogComponent,
               CoordinatorProfileComponent

             ],
             entryComponents: [ DenyDialogComponent, OralCallDialogComponent
             ],
             providers      : [ AuthGuard,
                                CoordinatorService ]
           } )
export class CoordinatorModule {
}
