import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GlobalEventManagerService {

  private _visitedRoute : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public visitedRouteEmitter : Observable<boolean> = this._visitedRoute.asObservable();

  constructor () { }

  getVisiteRoute (route : boolean) {
    this._visitedRoute.next(route)
  }

}
