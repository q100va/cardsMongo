/*
============================================
 AppComponent
; 
;===========================================
*/
import { Component, OnInit } from '@angular/core';

import { SigninService } from './services/signin.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: [``]
})
export class AppComponent implements OnInit {
  constructor(private signinService: SigninService) {}

  ngOnInit() {
    this.signinService.autoAuthUser();
  }
}