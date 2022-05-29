/*
============================================
; Title: WEB450 Bob's Computer Repair SHop
; Author: Professor Krasso
; Date: April 24, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App ResetPasswordFormComponent file
;===========================================
*/
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "app-reset-password-form",
  templateUrl: "./reset-password-form.component.html",
  styleUrls: ["./reset-password-form.component.css"],
})
export class ResetPasswordFormComponent implements OnInit {
  form: FormGroup;
  username: string;
  isAuthenticated: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.isAuthenticated =
      this.route.snapshot.queryParamMap.get("isAuthenticated");
    this.username = this.route.snapshot.queryParamMap.get("username");
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern("^(?=.*\\d)(?=.*[A-Za-z]).{8,}$"),
        ]),
      ],
    });
  }

  resetPassword(): void {
    console.log(this.form.controls["password"].value);
    this.http
      .post("/api/session/users/" + this.username + "/reset-password", {
        password: this.form.controls["password"].value,
        
      })
      .subscribe(
        (res) => {
          this.cookieService.set("session_user", this.username, 1);
          sessionStorage.setItem("name", `${res["data"].firstName} ${res["data"].lastName}`);
          this.router.navigate(["/"]);
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  cancel(): void {
    this.router.navigate(["/session/signin"]);
  }
}
