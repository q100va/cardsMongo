/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint 3
; Author: Professor Krasso
; Date: May 4, 2022
; Modified By: William Talley
; Description: Bob's Computer Repair Shop role.guard.ts file
;  authorization for user role access
;===========================================
*/

import { RoleService } from "../services/roles.service";
import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService, private roleService: RoleService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.roleService.findUserRole(this.cookieService.get("session_user")).pipe(
      map((res) => {
        console.log(res);

        if (res["data"] === "admin") {
          return true;
        } else {
          this.router.navigate(["/"]);
          return false;
        }
      })
    );
  }
}
