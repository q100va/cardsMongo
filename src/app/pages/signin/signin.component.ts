/*
============================================
; Title: WEB450 Bob's Computer Repair SHop
; Author: Professor Krasso
; Date: April 24, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App signin.component file
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";
import { HttpClient } from "@angular/common/http";
//import { SigninService } from 'src/app/shared/services/sign-in.service';
import { Message } from "primeng/api/message";
import { MessageService } from "primeng/api";
import { ConfirmationService } from "primeng/api";
import { SigninService } from "src/app/services/signin.service";


@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.css"],
})
export class SigninComponent implements OnInit {
  form: FormGroup;
  errorMessage: string;
  contactForm: FormGroup;
  credentialsForm: FormGroup;
  errorMessages: Message[];
  display: boolean = false;
  showDialog() {
    this.display = true;
  }


  constructor(
    private router: Router,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private signinService: SigninService,

  ) {
    
  }

  //password validation pattern added

  ngOnInit(): void {
    // Sign in form portion
    this.form = this.fb.group({
      userName: [null, Validators.compose([Validators.required])],
      password: [null, Validators.compose([Validators.required])],
    });


  }

  redirectLogIn() {
    this.router.navigateByUrl("/");
  }
  

  onSubmit(): void {
    const userName = this.form.controls.userName.value;
    const password = this.form.controls.password.value;

    this.signinService.logIn(userName, password);

/*     .subscribe(
        (res) => {
          if (res["data"].userName) {
            this.cookieService.set("session_user", res["data"].userName, 1);
            // Need to be able to send lastName and firstName to home page to display in menu.

            sessionStorage.setItem("name", `${res["data"].firstName} ${res["data"].lastName}`);
            //this.token = res["data"].token;
            this.router.navigate(["/"]);
            console.log(res["data"].userName);
            console.log(res["data"].firstName);
            console.log(res["data"].lastName);
          }
        },
        (err) => {
          console.log("error");
          console.log(err);
          this.errorMessage = err.error.msg;
        }
      ); */
  }
}
