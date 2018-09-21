import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component( {
              selector     : 'app-company',
              templateUrl  : './company.component.html',
              styleUrls    : [ './company.component.scss' ],
              encapsulation: ViewEncapsulation.None,
  
            } )
export class CompanyComponent implements OnInit {
  
  constructor () {
  }
  
  ngOnInit () {
  }
  
}
