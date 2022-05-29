/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint 1
; Author: Professor Krasso
; Date: April 23, 2022
; Modified By: William Talley
; Description: Bob's Computer Repair Shop auth.guard.ts file
; sign-in authorization
;===========================================
*/

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const sessionUser = this.cookieService.get("session_user");

    if (sessionUser) {
      return true;
    } else {
      this.router.navigate(["/session/signin"]);
      return false;
    }
  }
}
