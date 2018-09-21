import { CdkTableModule } from '@angular/cdk';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MomentModule } from 'angular2-moment';
import { AuthGuard } from '../../guard/auth.guard';
import { MaterialCustomModule } from '../../share-modules/material.module';
import { TrainingConfirmationFormComponent } from './confirmation-form/confirmation-form.component';
import { HomeComponent } from './company-home/home.component';
import { InternsComponent } from './company-interns/interns.component';
import { CompanyRouteModule } from './company-route/company-route.module';
import { CompanyService } from './company-service/company.service';
import { CompanyComponent } from './company.component';
import { InternLogComponent } from './intern-log/intern-log.component';
import { ProspectiveComponent } from './prospective-interns-list/prospective.component';
import { ReviewLogDialogComponent } from './review-log-dialog/review-log-dialog.component';
import { InternEvaluationComponent } from './intern-evaluation-result/intern-evaluation.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';

@NgModule( {
             imports        : [
               CommonModule,
               FormsModule,
               ReactiveFormsModule,
               MaterialCustomModule,
               MomentModule,
               HttpModule,
               CdkTableModule,
               CompanyRouteModule
             ],
             declarations   : [
               CompanyComponent,
               HomeComponent,
               TrainingConfirmationFormComponent,
               InternsComponent,
               InternLogComponent,
               ReviewLogDialogComponent,
               InternEvaluationComponent,
               ProspectiveComponent,
               NotFoundComponent,
               CompanyProfileComponent
             ],
             entryComponents: [ ReviewLogDialogComponent ],
             providers      : [ CompanyService, AuthGuard ]
  
           } )
export class CompanyModule {
}

