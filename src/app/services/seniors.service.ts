/*
============================================
seniors.service component
; 
;===========================================
*/

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Senior } from "../shared/interfaces/seniors.interface";
import { House } from "../shared/interfaces/houses.interface";

@Injectable({
  providedIn: "root",
})
export class SeniorsService {
  constructor(private http: HttpClient) {}

  findAllSeniors(): Observable<any> {
    return this.http.get("/api/seniors");
  }

  findSeniorsFromOneHome(nursingHome): Observable<any> {
    return this.http.get("/api/seniors/one-home/" + nursingHome);
  }

  findSeniorById(_id: string): Observable<any> {
    return this.http.get("/api/seniors/" + _id);
  }

  deleteSenior(_id: string): Observable<any> {
    return this.http.delete("/api/seniors/" + _id);
  }

  updateSenior(_id: string, updatedSenior: Senior): Observable<any> {
    const result = this.http.put("/api/seniors/update/" + _id, {
      region: updatedSenior.region,
      nursingHome: updatedSenior.nursingHome,
      lastName: updatedSenior.lastName,
      firstName: updatedSenior.firstName,
      patronymic: updatedSenior.patronymic,
      isRestricted: updatedSenior.isRestricted,
      noAddress: updatedSenior.noAddress,
      isReleased: updatedSenior.isReleased,
      dateBirthday: updatedSenior.dateBirthday,
      monthBirthday: updatedSenior.monthBirthday,
      yearBirthday: updatedSenior.yearBirthday,
      gender: updatedSenior.gender,
      comment1: updatedSenior.comment1,
      comment2: updatedSenior.comment2,
      linkPhoto: updatedSenior.linkPhoto,
      nameDay: updatedSenior.nameDay,
      dateNameDay: updatedSenior.dateNameDay,
      monthNameDay: updatedSenior.monthNameDay,
      //dateEnter: updatedSenior.dateEnter,
      //dateExit: updatedSenior.dateExit,
    });
    return result;
  }

  createSenior(newSenior: Senior): Observable<any> {
    console.log(newSenior);
    return this.http.post("/api/seniors", {
      region: newSenior.region,
      nursingHome: newSenior.nursingHome,
      lastName: newSenior.lastName,
      firstName: newSenior.firstName,
      patronymic: newSenior.patronymic,
      isRestricted: newSenior.isRestricted,
      dateBirthday: newSenior.dateBirthday,
      monthBirthday: newSenior.monthBirthday,
      yearBirthday: newSenior.yearBirthday,
      gender: newSenior.gender,
      comment1: newSenior.comment1,
      comment2: newSenior.comment2,
      linkPhoto: newSenior.linkPhoto,
      nameDay: newSenior.nameDay,
      dateNameDay: newSenior.dateNameDay,
      monthNameDay: newSenior.monthNameDay,
    });
  }

  /*   async createSeniorsCollection(seniors: Array<Senior>): Promise<any> {

    console.log("start");

    let result = this.http.post("/api/seniors/add-many/", {seniors: seniors});
    console.log("result");
    console.log(result);
    return  result;
  } */

/*   createSeniorsCollection(seniors: Array<Senior>): Observable<any> {
    console.log("start createSeniorsCollection");
    return this.http.post("/api/seniors/add-many/", { seniors: seniors });
  } */

  compareListsBackend(arrayOfNewSeniors:  Array<Senior> , house: House): Observable<any> {

    console.log("start compareListsBackend");
    return this.http.put("/api/seniors/compare-lists/", {    
      seniors: arrayOfNewSeniors,
      house: house,
    });
  }

  applyChanges(resultOfCompare, date, house): Observable<any> {
    console.log("start applyChanges");
    return this.http.put("/api/seniors/update-lists/", {
      absents: resultOfCompare.absents,
      arrived: resultOfCompare.arrived,
      changed: resultOfCompare.accepted,
      date: date,
      house: house,
    });
  }
}
