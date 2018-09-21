import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MdDialogRef } from '@angular/material';

@Component( {
              selector   : 'app-review-log-dialog',
              templateUrl: './review-log-dialog.component.html',
              styleUrls  : [ './review-log-dialog.component.scss' ]
            } )
export class ReviewLogDialogComponent implements OnInit {
  
  log_review: string;
  declineForm = new FormGroup( {
                                 decline_reason: new FormControl( '', [ Validators.required ] )
                               } );
  
  constructor( public diablogRef: MdDialogRef<ReviewLogDialogComponent> ) {
  }
  
  ngOnInit() {
  }
  
  
}
