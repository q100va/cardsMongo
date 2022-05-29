/*
============================================
 services for users.
;===========================================
*/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../shared/interfaces/user.interface";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  createUser(newUser: User): Observable<any> {
     return this.http.post("/api/users", {
       userName: newUser.userName,
       password: newUser.password,
       firstName: newUser.firstName,
       lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
       address: newUser.address,
       email: newUser.email,
     });
 } 

  findAllUsers(): Observable<any> {
    return this.http.get("/api/users");
  }

  deleteUser(_id: string): Observable<any> {
    return this.http.delete("/api/users/" + _id);
  }

  findUserById(_id: string): Observable<any> {
    return this.http.get("/api/users/user/" + _id);
  }

  findUserByUserName(userName: string): Observable<any> {
    return this.http.get("/api/users/" + userName);
  }

  updateUser(_id: string, updatedUser: User): Observable<any> {
    const result = this.http.put("/api/users/" + _id, {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      email: updatedUser.email,
      role: updatedUser.role,
    });
    console.log(result);
    return result;
  }


}
