import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { InternshipApplicationInterface } from '../../../interfaces/app-interface';
import { CoordinatorService } from '../coordinator-service/coordinator.service';
import { DenyDialogComponent } from '../deny-dialog/deny-dialog.component';

@Component( {
              selector   : 'app-application-detail',
              templateUrl: './application-detail.component.html',
              styleUrls  : [ './application-detail.component.scss' ]
            } )
export class ApplicationDetailComponent implements OnInit {
  applicationDetails: InternshipApplicationInterface;
  errorMessage;
  showLoading = true;
  loading_text: any;
  submitted   = false;
  coordinatorid: number;
  _coordinator_email: string;
  
  constructor ( private coordinatorService: CoordinatorService, private dialog: MdDialog,
                private route: ActivatedRoute, private router: Router ) {
  }
  
  ngOnInit () {
    this.loading_text = 'Please wait, while we fetch the application details';
    const userData    = JSON.parse( localStorage.getItem( 'user' ) );
    if (!userData) {
      this.router.navigate( [ '../' ] );
    } else {
      this._coordinator_email = userData[ 'email' ];
      this.coordinatorid      = userData[ 'id' ];
      this.getApplicationDetails();
    }
    
  }
  
  
  openDenyDialog ( id, std_number ) {
    const dialogRef = this.dialog.open( DenyDialogComponent, {
      data: {
        applicationId: id,
        studentId    : std_number,
        coordinator_id   : this.coordinatorid,
        coordinator_email: this._coordinator_email
      }
    } );
    dialogRef.afterClosed().subscribe( result => {
      console.log( 'dialog closed' );
      this.router.navigate( [ `coordinator/applications` ] );
    } );
  }
  
  approveApplication ( applicationId, student_number ) {
    const data = {
      application_id   : applicationId,
      student_number   : student_number,
      coordinator_id   : this.coordinatorid,
      coordinator_email: this._coordinator_email
    };
    
    this.showLoading  = true;
    this.loading_text = 'Approving Application';
    setTimeout(() => {
      this.loading_text = `Resolving Company Email:  ${this.applicationDetails.company_email}`;
    }, 2000);
    
    setTimeout(() => {
      this.loading_text = `Sending Email To:  ${this.applicationDetails.company_email}`;
    }, 3000);
    
    this.coordinatorService.approveApplication( data )
        .subscribe( result => {
          setTimeout( () => {
            this.loading_text = 'Email Sent';
          }, 4000 );
          setTimeout( () => {
            this.loading_text = 'Application Approved';
          }, 5000 );
          setTimeout( () => {
            this.showLoading = false;
            this.router.navigate( [ `coordinator/applications` ] );
          }, 3000 );
          console.log( result );
        }, error => {
          console.log( error );
        } );
  }
  
  denyApplication ( applicationId, student_number ) {
    this.openDenyDialog( applicationId, student_number );
  }
  
  getApplicationDetails () {
    const data = {
      application_id: this.route.snapshot.queryParams[ 'applicationId' ]
    };
    this.coordinatorService.getInternshipApplicationById( data )
        .subscribe( result => {
          this.applicationDetails = result;
          this.showLoading        = false;
        }, error2 => {
          console.log( error2 );
          this.errorMessage = error2;
        } );
  }
}
