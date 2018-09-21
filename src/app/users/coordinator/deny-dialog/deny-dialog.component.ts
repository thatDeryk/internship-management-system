import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MD_DIALOG_DATA, MdDialogRef } from '@angular/material';
import { CoordinatorService } from '../coordinator-service/coordinator.service';

@Component( {
              selector   : 'app-deny-dialog',
              templateUrl: './deny-dialog.component.html',
              styleUrls  : [ './deny-dialog.component.scss' ]
            } )
export class DenyDialogComponent implements OnInit {
  
  submitted = false;
  
  constructor ( @Inject( MD_DIALOG_DATA ) private data: any,
                private dialogRef: MdDialogRef<DenyDialogComponent>, private coordinatorService: CoordinatorService ) {
  }
  
  
  reasonForm = new FormGroup( {
                                reason: new FormControl( '', [ Validators.required ] )
                              } );
  
  ngOnInit () {
    console.log( this.data );
  }
  
  submitReason () {
    this.submitted   = true;
    const denyReason = {
      reason        : this.reasonForm.value.reason,
      student_number: this.data.studentId,
      applicationId : this.data.applicationId,
      coordinator_id: this.data.coordinator_id
    };
    this.coordinatorService.applicationDenied( denyReason )
        .subscribe( response => {
          console.log( response );
          this.reasonForm.reset();
          this.dialogRef.close();
      
        }, error => {
      
        } );
  }
}
