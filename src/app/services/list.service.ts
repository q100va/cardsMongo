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
  //fullDate = " февраль 2024 г.";

  findAllBirthdayLists(): Observable<any> {
    return this.http.get("/api/lists");
  }

  findAllNameDayLists(month: string): Observable<any> {
    return this.http.get("/api/lists/name-day/" + month);
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
    return this.http.post("/api/lists/" + this.month, {});
  }

  createNextBirthdayList(): Observable<any> {
    return this.http.post("/api/lists/" + (this.month +1), {});
  }

  createNameDayList(month: number): Observable<any> {
    return this.http.post("/api/lists/name-day/" + month, {});
  }

  createTeacherDayList(): Observable<any> {
    return this.http.post("/api/lists/teacher-day/create", {});
  }

  createNewYearList(NYList): Observable<any> {
    return this.http.post("/api/lists/new-year/create", {list: NYList});
  }

  createFebruary23List(list): Observable<any> {
    return this.http.post("/api/lists/february-23/create", {list: list});
  }

  createMarch8List(list): Observable<any> {
    return this.http.post("/api/lists/march-8/create", {list: list});
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
    return this.http.post("/api/lists/new-year/check-doubles", {
      nursingHome: house,
    });
  }

  checkFullness(house: string) {
    console.log("checkFullness");
    return this.http.post("/api/lists/new-year/check-fullness", {
      nursingHome: house,
    });
  }

  checkHolidayFullness(house: string, holiday: string) {
    console.log("checkFullness");
    return this.http.post("/api/lists/holiday/check-fullness/" + holiday, {
      nursingHome: house,
    });
  }

  checkDoublesHB(house: string) {
    console.log("checkDoubles");
    return this.http.post("/api/lists/birthday/check-doubles", {
      nursingHome: house,
    });
  }

  checkFullnessHB(house: string) {
    console.log("checkFullness");
    return this.http.post("/api/lists/birthday/check-fullness", {
      nursingHome: house,
    });
  }

  findSpecialLists() {
    return this.http.get("/api/lists/holiday/special-list");
  }

  create9mayList(): Observable<any> {
    return this.http.post("/api/lists/9may/create", {});
  }

  findAll9mayLists(): Observable<any> {
    return this.http.get("/api/lists/9may");
  }

  createFamiliesList(arrayOfFamilies: Array<any>): Observable<any> {
    return this.http.post("/api/lists/create/family-day", {
      listOfFamilies: arrayOfFamilies,
    });
  }

  findAllFamilyDayLists(): Observable<any> {
    return this.http.get("/api/lists/family-day");
  }

  findLessFamilyDayLists(): Observable<any> {
    return this.http.get("/api/lists/family-day/less");
  }

  countAmountOfVolunteers(): Observable<any> {
    return this.http.get("/api/lists/amountOfVolunteers");
  }

  countAmountOfSeniors(): Observable<any> {
    return this.http.get("/api/lists/amountOfSeniors");
  }

  findUncertain(): Observable<any> {
    return this.http.patch("/api/lists/uncertain", {});
  }

  correctOrdersDates(): Observable<any> {
    return this.http.patch("/api/orders/correct-orders-dates", {});
  }

  takeListOfClients(): Observable<any> {
    //return this.http.get("/api/clients/create-clients/all");
    return this.http.get("/api/clients/collect-clients/all");
  }

  checkListOfClients(client, index): Observable<any> {
    //return this.http.post("/api/clients/create-clients/" + index, {client: client});
    return this.http.post("/api/clients/check-all-clients/" + index, {client: client});
  }

  saveChangedClient(id, client, idsToDelete): Observable<any> {
    console.log(id);
    return this.http.post("/api/clients/update-and-delete-clients/" + id, {client: client, ids: idsToDelete});
  }


}
