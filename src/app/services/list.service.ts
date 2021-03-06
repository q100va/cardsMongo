/*
============================================
 services for list.
;===========================================
*/

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { List } from "../shared/interfaces/list.interface";
import { Senior } from "../shared/interfaces/seniors.interface";
import { Celebrator } from "../shared/interfaces/celebrator.interface";


@Injectable({
  providedIn: "root",
})
export class ListService {
  constructor(private http: HttpClient) {}

  month = 8;
  //fullDate = " августа 2022 г.";

  findAllBirthdayLists(): Observable<any> {
      return this.http.get("/api/lists");

  }

  findAllNameDayLists(): Observable<any> {
    return this.http.get("/api/lists/name-day");

}

  createBirthdayList(): Observable<any> { 
    return  this.http.post("/api/lists/" + this.month, {
    });
  }

  createNameDayList(): Observable<any> { 
    return  this.http.post("/api/lists/name-day/" + this.month, {
    });
  }

  deleteList() {
    console.log("delete2");
    return this.http.delete("/api/lists/");
    
  }

  deleteDoubleList() {
    console.log("deleteDoubleList");
    return this.http.delete("/api/lists/double");
    
  }



  
}


