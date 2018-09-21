import { Component, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMAIL_REGEX } from '../interfaces/app-interface';
import { AuthManagerService } from '../services/auth-manager.service';

@Component( {
              selector   : 'app-recover-pasword',
              templateUrl: './recover-pasword.component.html',
              styleUrls  : [ './recover-pasword.component.scss' ]
            } )
export class RecoverPaswordComponent implements OnInit, OnChanges {
  
  param: string;
  loading_text: string;
  showLoading   = false;
  recoverForm   = new FormGroup( {
                                   email: new FormControl( '', [
                                     Validators.email,
                                     Validators.required,
                                     Validators.pattern( EMAIL_REGEX )
                                   ] ),
                                 } );
  errorMessage: string;
  successMessage: string;
  
  constructor ( public router: Router,
                private  authManager: AuthManagerService,
                private route: ActivatedRoute ) {
    
  }
  
  ngOnInit () {
    this.param = this.route.snapshot.params[ 'user' ];
    localStorage.removeItem( 'token' );
    localStorage.removeItem( 'user' );
    this.authManager.setLogInStatus( false, true );
  }
  
  ngOnChanges () {
    this.recoverForm.reset();
  }
  
  onSubmit () {
    this.successMessage = '';
    this.errorMessage = '';
    this.showLoading  = true;
    this.loading_text = 'Please wait...';
    const formData     = this.prepareLoginData();
    this.authManager.recoverPassword( formData )
        .subscribe( ( result ) => {
         console.log(result);
         this.showLoading = false;
         this.successMessage = result['message'];
        }, error => {
          console.log(error);
          this.showLoading  = false;
          const _error      = JSON.parse( error[ '_body' ] );
          this.errorMessage = _error.message;
        } );
  }
  
  
  prepareLoginData (): object {
    const formModel = this.recoverForm.value;
    
    return {
      email   : formModel.email as string,
      user    : this.param
    };
  }
  
}
