import { Component, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { EMAIL_REGEX, LoginFormDataInterface } from '../interfaces/app-interface';
import { AuthManagerService } from '../services/auth-manager.service';


const _EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component( {
              selector   : 'app-login',
              templateUrl: './login.component.html',
              styleUrls  : [ './login.component.scss' ],
              providers  : [ AuthManagerService ]
            } )

export class LoginComponent implements OnInit, OnChanges {
  
  param: string;
  loading_text: string;
  showLoading   = false;
  passInputType = 'password';
  isPassVisible = false;
  loginForm     = new FormGroup( {
                                   email   : new FormControl( '', [
                                     Validators.email,
                                     Validators.required,
                                     Validators.pattern( EMAIL_REGEX )
                                   ] ),
                                   password: new FormControl( '', [ Validators.required ] )
                                 } );
  loginData: LoginFormDataInterface;
  errorMessage: string;
  
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
    this.loginForm.reset();
  }
  
  
  gotoForgotPass () {
    this.router.navigate( [ `forgot-password/${this.param}` ] );
    
  }
  
  onSubmit () {
    this.showLoading  = true;
    this.loading_text = 'Authentication in progress';
    this.loginData    = this.prepareLoginData();
    this.authManager.doLogin( {
                                email   : this.loginData.email,
                                password: this.loginData.password,
                                user    : this.loginData.user
                              } )
        .subscribe( ( result ) => {
          if (result.user && result.user.token) {
            setTimeout( () => {
              this.loading_text = 'Using Authenticated Successfully';
            }, 2000 );
            setTimeout( () => {
              this.loading_text = 'Logging you in';
            }, 3000 );
        
            setTimeout( () => {
              this.loading_text                        = 'Logging you in';
              const navigationExtras: NavigationExtras = {
                queryParams: {'q': result.user[ 'token' ]},
              };
              // Navigate to the login page with extras
              const returnUrl                          = this.route.snapshot.queryParams[ 'returnUrl' ] || `${this.param}`;
          
              localStorage.setItem( 'user', JSON.stringify( result.user ) );
              localStorage.setItem( 'token', result.user[ 'token' ] );
              this.authManager.setLogInStatus( true, true );
              this.router.navigate( [ returnUrl ], navigationExtras )
                  .then( ( t ) => {
                    if (t) {
                    }
                  } ).catch( error => console.log( error ) );
            }, 4000 );
        
          }
        }, error => {
          this.showLoading  = false;
          const _error      = JSON.parse( error[ '_body' ] );
          this.errorMessage = _error.message;
        } );
  }
  
  visiblePass ( event: Event ): void {
    event.preventDefault();
    if (!this.isPassVisible) { // show password
      this.passInputType = 'text';
      this.isPassVisible = true;
    } else {
      this.passInputType = 'password'; // hide password
      this.isPassVisible = false;
    }
    
  }
  
  prepareLoginData (): LoginFormDataInterface {
    const formModel = this.loginForm.value;
    
    return {
      email   : formModel.email as string,
      password: formModel.password as string,
      user    : this.param
    };
  }
}
