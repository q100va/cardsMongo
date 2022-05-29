/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: May 4, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App services for user roles.
;===========================================
*/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Role } from "../shared/interfaces/role.interface";

@Injectable({
  providedIn: "root",
})
export class RoleService {
  constructor(private http: HttpClient) {}

  findAllRoles(): Observable<any> {
    return this.http.get("/api/roles");
  }

  deleteRole(_id: string): Observable<any> {
    return this.http.delete("/api/roles/" + _id);
  }

  findRoleById(_id: string): Observable<any> {
    return this.http.get("/api/roles/" + _id);
  }

  createRole(newRole: Role): Observable<any> {
    console.log(newRole);
    return this.http.post("/api/roles", {
      text: newRole.text,
    });
  }

  updateRole(_id: string, updatedRole: Role): Observable<any> {
    const result = this.http.put("/api/roles/" + _id, {
      text: updatedRole.text,
    });
    console.log (result);
    return result;
  }

  findUserRole(userName: string): Observable<any> {
    return this.http.get(`/api/users/${userName}/role`);
  }
}