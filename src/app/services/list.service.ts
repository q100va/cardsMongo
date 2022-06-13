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

  month = 7;
  //fullDate = " июля 2022 г.";

  findAllLists(): Observable<any> {
      return this.http.get("/api/lists");

  }

  createList(): Observable<any> { 
    return  this.http.post("/api/lists/" + this.month, {
    });
  }

  deleteList() {
    console.log("delete2");
    return this.http.delete("/api/lists/");
    
  }



/* 

  getSeniors(): Observable<any> {
    console.log("workkkk");
    return this.http.get(`/api/seniors`);
  } */

 /*  createSeniorsCollection(correctedSeniors: [Senior]): Array<any> {
    
    let result = [];
    for (let newSenior of correctedSeniors) {
      //console.log("Populating");
      //let newSenior = correctedSeniors[5];
      this.createSenior(newSenior).subscribe(
        (res) => {
          let newRes = res["code"];
          //console.log(res['data']);
          result.push(newRes);
        },
        (err) => {
          console.log(err);
        }
      );
    }
    console.log(result);
    return result;
  }

  createSenior(newSenior: Senior): Observable<any> {
    //console.log(newSenior);
    return this.http.post("/api/lists/seniors", {
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
      noAddress: newSenior.noAddress,
      isDisabled: newSenior.isDisabled,

    });
  }

  correctSeniorsList(seniors: [Senior]): Array<any> {
    for (let senior of seniors) {
      senior.isRestricted =
        senior.isRestricted == "FALSE" ? Boolean(false) : Boolean(true);
      senior.dateBirthday = +senior.dateBirthday;
      senior.monthBirthday = +senior.monthBirthday;
      senior.yearBirthday = +senior.yearBirthday;
      senior.noAddress =
        senior.noAddress == "FALSE" ? Boolean(false) : Boolean(true);
      senior.isDisabled =
        senior.isDisabled == "FALSE" ? Boolean(false) : Boolean(true);
      console.log(senior);
    }
    //console.log("finished");
    return seniors;
  }
 */

  
}


