/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: April 24, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App base layout component
; 
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { RoleService } from "src/app/services/roles.service";

@Component({
  selector: "app-base-layout",
  templateUrl: "./base-layout.component.html",
  styleUrls: ["./base-layout.component.css"],
})
export class BaseLayoutComponent implements OnInit {
  year: number = Date.now();
  userRole: any;
  isLoggedIn: boolean;
  name: string;
  isAdmin: boolean;
  userName: string;

  constructor(private cookieService: CookieService, private router: Router, private roleService: RoleService) {
    
    this.roleService.findUserRole(this.cookieService.get("session_user")).subscribe((res) => {
      this.userRole = res["data"];
      console.log(this.userRole);
      this.isAdmin = this.userRole === "admin" ? true : false;
    });
    this.isLoggedIn = this.cookieService.get("session_user") ? true : false;
    this.userName = this.cookieService.get("session_user");
  }

/*   isAdmin(): boolean {   
    return this.userRole.role === "admin";
  }
 */
  ngOnInit(): void {
    this.name = sessionStorage.getItem("name");
  }

  redirectToProfile(): void {
    this.router.navigateByUrl("/users/user/profile");
  }

  redirectToLists(): void {
    this.router.navigate(["/lists/"]);
  }

  redirectToClients(): void {
    this.router.navigate(["/clients/"]);
  }

  signOut() {
    this.cookieService.deleteAll();
    this.router.navigate(["/session/signin"]);
  }

  redirectToSeniors(): void {
    this.router.navigate(["/seniors/"]);
  }

  redirectToOrders(): void {
    this.router.navigate(["/orders/create/new"]);
  }

  redirectToInstaOrders(): void {
    this.router.navigate(["/orders/insta"]);
  }
}
