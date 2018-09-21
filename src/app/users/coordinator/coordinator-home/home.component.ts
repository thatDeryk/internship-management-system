import { Component, OnInit } from '@angular/core';
import { CoordinatorService } from '../coordinator-service/coordinator.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  notifications: Observable<any>;
  isNotification = false;
  userData: any;
  constructor(private coordinatorService: CoordinatorService) { }

  ngOnInit() {
  
    const data = this.coordinatorService.getLocalStorageData();
    if (data) {
      this.userData = data;
      this.getCoordinatorNotification( 15 );
    }
  }
  
  
  
  getCoordinatorNotification( range ) {
    const data = {
      id: this.userData[ 'id' ],
      limit     : range
    };
    this.notifications = this.coordinatorService.getNotification( data );
    this.notifications.subscribe( result => {
      console.log( result );
      if (result.length > 0) {
        this.isNotification = true;
      }
    }, error => {
      console.log( error );
    } );
    
    
  }
}
