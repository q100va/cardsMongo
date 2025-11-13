import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from 'rxjs';
import { RoleService } from "../services/roles.service";

import { CookieService } from "ngx-cookie-service";
import { map } from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class DobroruGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService, private roleService: RoleService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.roleService.findUserRole(this.cookieService.get("session_user")).pipe(
      map((res) => {
        console.log(res);

        if (res["data"] === "dobroru" || res["data"] === "manager" || res["data"] === "admin") {
          return true;
        } else {
          this.router.navigate(["/"]);
          return false;
        }
      })
    );
  }
}
