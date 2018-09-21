import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EMAIL_REGEX, StudentSignUpFormInterface } from '../interfaces/app-interface';
import { AuthManagerService } from '../services/auth-manager.service';

@Component( {
              selector   : 'app-sign-up',
              templateUrl: './sign-up.component.html',
              styleUrls  : [ './sign-up.component.scss' ]
            } )
export class SignUpComponent implements OnInit {
  
  studentSignUpForm = new FormGroup( {
                                       first_name    : new FormControl( '', [ Validators.required ] ),
                                       last_name     : new FormControl( '', [ Validators.required ] ),
                                       student_number: new FormControl( '', [ Validators.required,
                                                                              this.checkStudentNumber ] ),
                                       email         : new FormControl( '', [ Validators.email,
                                                                              Validators.required,
                                                                              Validators.pattern( EMAIL_REGEX ) ] ),
    
                                       password        : new FormControl( '', [ Validators.required,
                                                                                Validators.minLength( 6 ) ] ),
                                       confirm_password: new FormControl( '', [
                                         Validators.required, Validators.minLength( 6 ) ] )
                                     }, this.passwordMatchValidator2.bind( this ) );
  
  //
  errorMessage: string;
  showLoading = false;
  loading_text: string;
  
  constructor( private authManager: AuthManagerService, public router: Router ) {
  }
  
  ngOnInit() {
  }
  
  
  checkStudentNumber( control: AbstractControl ): { [key: string]: boolean } {
    const std_number = String( control.value );
    
    if (!std_number || (std_number.length === 0)) {
      return null;
    }
    console.log( typeof std_number );
    
    const d = (std_number.length < 6) || (std_number.length > 8 ) ? {MinMaxNumber: true} : null;
    console.log( d );
    return d;
  }
  
  passwordMatchValidator2( control: AbstractControl ): { [ key: string]: boolean } {
    
    const password = control.get( 'password' );
    const confirm_password = control.get(
      'confirm_password' );
    if (!password || !confirm_password) {
      return null;
    }
    const dd = password.value === confirm_password.value
      ? null : {mismatch: true};
    if (dd !== null) {
      control.get( 'confirm_password' ).setErrors( dd );
    } else {
      control.get( 'confirm_password' ).getError( 'required' );
      control.get( 'confirm_password' ).getError( 'minlength' );
    }
    return dd;
  }
  
  onSubmit() {
    const signUpData = this.prepareSignUpData();
    this.showLoading = true;
    this.loading_text = 'Please wait while we process your form';
    this.authManager.signUpStudent( signUpData )
        .subscribe( ( result ) => {
      
          this.loading_text = 'Sign up succesfull';
          setTimeout( () => {
            this.loading_text = 'Redirecting to loging page in 2 seconds';
        
          }, 2000 );
          setTimeout( () => {
            this.loading_text = 'Redirecting to loging page in 1 seconds';
        
          }, 3000 );
      
          setTimeout( () => {
            this.showLoading = false;
            this.router.navigate( [ '../login/student' ] )
                .then( ( t ) => {
                  if (t) {
                  }
                } ).catch( error => console.log( error ) );
          }, 4000 );
      
        }, error2 => {
          const _error = error2[ '_body' ];
          this.showLoading = false;
          this.errorMessage = _error.message;
        } );
  }
  
  prepareSignUpData(): StudentSignUpFormInterface {
    const formData = this.studentSignUpForm.value;
    
    
    return {
      email           : formData.email as string,
      first_name      : formData.first_name as string,
      last_name       : formData.last_name as string,
      student_number  : formData.student_number as number,
      password        : formData.password as string,
      confirm_password: formData.confirm_password as string
    };
  }
}
