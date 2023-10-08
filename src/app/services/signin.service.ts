/*
============================================
services for user sign in.
;===========================================
*/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Role } from "../shared/interfaces/role.interface";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: "root",
})
export class SigninService {
  private token: string;
  private tokenTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  getToken() {
    console.log("this.token");
    console.log(this.token);
    return this.token;
  }

  logIn(userName, password) {
    this.http
      .post("/api/session/signin", {
        userName: userName,
        password: password,
      })
      .subscribe(
        (res) => {
          if (res["data"].user.userName) {
            this.cookieService.set(
              "session_user",
              res["data"].user.userName,
              1
            );
            // Need to be able to send lastName and firstName to home page to display in menu.

            sessionStorage.setItem(
              "name",
              `${res["data"].user.firstName} ${res["data"].user.lastName}`
            );
            this.token = res["data"].token;
  
            if (this.token) {
              const expiresInDuration = res["data"].expiresIn;
              this.setAuthTimer(expiresInDuration);
              const now = new Date();
              const expirationDate = new Date(
                now.getTime() + expiresInDuration * 1000
              );
              console.log(expirationDate);
              this.saveAuthData(this.token, expirationDate);
              this.router.navigate(["/"]);
              console.log(this.token);
              console.log(res["data"].user.userName);
              console.log(res["data"].user.firstName);
              console.log(res["data"].user.lastName);
            }
          }
        },
        (err) => {
          console.log("error");
          console.log(err.error.msg);
          // this.errorMessage = err.error.msg;
        }
      );
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;

      this.setAuthTimer(expiresIn / 1000);
    }
  }

  logout() {
    this.token = null;

    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/session/signin"]);
  }

  private setAuthTimer(duration: number) {
    console.log("Setting timer: " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
    };
  }
}
