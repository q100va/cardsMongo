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

  month = 2;
  //fullDate = " февраля 2023 г.";

  findAllBirthdayLists(): Observable<any> {
      return this.http.get("/api/lists");

  }

  findAllNameDayLists(): Observable<any> {
    return this.http.get("/api/lists/name-day");
}

findAllNewYearLists(): Observable<any> {
  return this.http.get("/api/lists/new-year");
}

findAllFebruary23Lists(): Observable<any> {
  return this.http.get("/api/lists/february-23");
}

findAllMarch8Lists(): Observable<any> {
  return this.http.get("/api/lists/march-8");
}

findAllTeacherDayLists(): Observable<any> {
  return this.http.get("/api/lists/teacher-day");
}

  createBirthdayList(): Observable<any> { 
    return  this.http.post("/api/lists/" + this.month, {
    });
  }

  createNameDayList(): Observable<any> { 
    return  this.http.post("/api/lists/name-day/" + this.month, {
    });
  }

  createTeacherDayList(): Observable<any> { 
    return  this.http.post("/api/lists/teacher-day/create" , {
    });
  }

  createNewYearList(): Observable<any> { 
    return  this.http.post("/api/lists/new-year/create" , {
    });
  }

  createFebruary23List(): Observable<any> { 
    return  this.http.post("/api/lists/february-23/create" , {
    });
  }

  createMarch8List(): Observable<any> { 
    return  this.http.post("/api/lists/march-8/create" , {
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

  checkDoubles(house: string) {
    console.log("checkDoubles");
    return this.http.post("/api/lists/new-year/check-doubles", {nursingHome: house});
    
  }

  checkFullness(house: string) {
    console.log("checkFullness");
    return this.http.post("/api/lists/new-year/check-fullness", {nursingHome: house});
    
  }

  checkDoublesHB(house: string) {
    console.log("checkDoubles");
    return this.http.post("/api/lists/birthday/check-doubles", {nursingHome: house});
    
  }

  checkFullnessHB(house: string) {
    console.log("checkFullness");
    return this.http.post("/api/lists/birthday/check-fullness", {nursingHome: house});
    
  }

  findSpecialLists() { 
      return this.http.get("/api/lists/holiday/special-list"); 
  }

  
  
}


