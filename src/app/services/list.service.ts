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
import { ThrowStmt } from "@angular/compiler";

@Injectable({
  providedIn: "root",
})
export class ListService {
  constructor(private http: HttpClient) {}

  month = 6;
  fullDate = " июня 2022 г.";

  async findAllLists(): Promise<Observable<any>> {
    return this.http.get("/api/lists");
  }
  /*   async finalList(final): Promise<any> {
    return final;
  }
 */

  monthLists() {
    let list: List;
    let periods = ["01-05", "06-10", "11-15", "16-20", "21-25", "26-31"];
    let seniors: Array<Celebrator>;
    let final = "empty";

    this.getSeniors().subscribe(
      (res) => {
        console.log("seniors");
        seniors = res["data"];
        let i = 1;
        for (let item of periods) {
          list = {
            key: i,
            period: item + this.fullDate,
            active: i == 1 ? true : false,
            celebrators: this.createCelebrators(
              seniors,
              this.month,
              +(item[0] + item[1]),
              +(item[3] + item[4])
            ),
          };
          console.log("I am here");
          this.createList(list).subscribe(
            async (res) => {
              console.log("createList");
              console.log(res["data"]);
              let result = await this.correctLists(res["data"]);
              console.log(result);

              if (!result) alert("Ошибка в присвоении id");
            },
            (err) => {
              console.log(err);
            }
          );
          i++;
        }
      },
      (err) => {
        console.log(err);
      }
    );

    console.log("I am ready");
    return final;
  }

  deleteList() {
    console.log("delete2");
    return this.http.delete("/api/lists/");
    
  }

  async updateCelebrator(newList): Promise<Observable<any>> {
    return this.http.patch("/api/lists/" + newList._id, {
      celebrators: newList.celebrators,
    });
  }

  async correctLists(list): Promise<any> {
    let result = true;
    for (let celebrator of list.celebrators) {
      celebrator.celebrator_id = celebrator._id.toString();
      //console.log(celebrator);
    }
    (await this.updateCelebrator(list)).subscribe(
      (res) => {
        if (res["code"] != 200) {
          result = false;
        }
      },
      (err) => {
        console.log(err);
      }
    );
    //console.log(list.celebrators);
    return result;
  }

  getSeniors(): Observable<any> {
    console.log("workkkk");
    return this.http.get(`/api/seniors`);
  }
  /*   async getSeniors(): Promise<Observable<any>> {
    //console.log("workkkk");
    return this.http.get(`/api/seniors`);
  }  */

  createList(newList: List): Observable<any> {
    //console.log("work create list");
    return this.http.post("/api/lists", {
      key: newList.key,
      period: newList.period,
      active: newList.active,
      celebrators: newList.celebrators,
    });
  }

  createCelebrators(
    seniors: Array<Celebrator>,
    month: number,
    date1: number,
    date2: number
  ) {
    //console.log(seniors);
    //console.log(month);
    //console.log(date1);
    //console.log(date2);
    //console.log(seniors[0]["monthBirthday"]);

    let celebrators = seniors
      .filter(
        (item) =>
          item["monthBirthday"] == month &&
          item["dateBirthday"] >= date1 &&
          item["dateBirthday"] <= date2 &&
          item["isDisabled"] == false
      )
      .slice();

    //console.log(celebrators);

    for (let celebrator of celebrators) {
      celebrator["specialComment"] = this.specialComment(
        2022 - celebrator["yearBirthday"]
      );
      celebrator.plusAmount = 0;
      celebrator.fullDayBirthday = `${
        celebrator.dateBirthday > 9
          ? celebrator.dateBirthday
          : "0" + celebrator.dateBirthday
      }.${
        celebrator.monthBirthday > 9
          ? celebrator.monthBirthday
          : "0" + celebrator.monthBirthday
      }${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;
      if (celebrator["noAddress"]) {
        celebrator["category"] = "special";
      } else {
        if (celebrator.yearBirthday < 1933) {
          celebrator.oldest = true;
        }
        if (celebrator.yearBirthday < 1950 && celebrator.gender == "Female") {
          celebrator.category = "oldWomen";
        } else {
          if (celebrator.yearBirthday < 1950 && celebrator.gender == "Male") {
            celebrator.category = "oldMen";
          } else {
            if (celebrator.yearBirthday > 1949 || !celebrator.yearBirthday) {
              celebrator.category = "yang";
            }
          }
        }
      }
    }
    this.checkDoubles(celebrators);
    return celebrators;
  }

  specialComment(age: number) {
    let special: string;
    let specialComments = {
      91: "год",
      92: "года",
      93: "года",
      94: "года",
      96: "лет",
      97: "лет",
      98: "лет",
      99: "лет",
      101: "год",
      102: "года",
      103: "года",
      104: "года",
      106: "лет",
      107: "лет",
      108: "лет",
      109: "лет",
      111: "лет",
      112: "лет",
      113: "лет",
      114: "лет",
      116: "лет",
      117: "лет",
    };
    if (age > 103 || age < 18) alert(`Strange age: ${age}`);
    if (age % 5 === 0) {
      special = `Юбилей ${age} лет!`;
    } else {
      if (age > 90) {
        special = `${age} ${specialComments[age]}!`;
      } else {
        special = "";
      }
    }
    return special;
  }
  checkDoubles(array: any[]) {
    let tempArray = [];
    let duplicates = [];
    for (let person of array) {
      tempArray.push(
        person.nursingHome +
          person.lastName +
          person.firstNme +
          person.patronymic +
          person.dateBirthday +
          person.monthBirthday +
          person.yearBirthday
      );
    }
    tempArray = tempArray.sort();
    for (let i = 0; i < tempArray.length; i++) {
      if (tempArray[i + 1] === tempArray[i]) {
        duplicates.push(tempArray[i]);
      }
    }
    if (duplicates.length > 0) {
      alert("Есть дубли: посмотрите список в консоли!");
      console.log(duplicates);
      return duplicates;
    }
  }

  /*   createSeniorsCollection(seniors: [Senior]): Observable<any> {
    let res = [];
    let correctedSeniors = this.correctSeniorsList(seniors);
    
/*     for (let newSenior of correctedSeniors) { */
  /*  console.log("Populating");
      let newSenior = correctedSeniors[5];
      let newRes = this.createSenior(newSenior);

      console.log(newRes);
      return newRes; */
  /* res.push(newRes); */
  /*     } */
  /*  return res; 
  }*/

  createSeniorsCollection(correctedSeniors: [Senior]): Array<any> {
    
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
      /* region: "newSenior.region",
      nursingHome: "newSenior.nursingHome",
      lastName: "newSenior.lastName",
      firstName: "newSenior.firstName",
      patronymic: "newSenior.patronymic",
      isRestricted: false,
      dateBirthday: 1,
      monthBirthday: 1,
      yearBirthday: 1199,
      gender: "newSenior.gender",
      comment1: "newSenior.comment1",
      comment2: "newSenior.comment2",
      linkPhoto: "newSenior.linkPhoto",
      nameDay: "newSenior.nameDay",
      dateNameDay: 1,
      monthNameDay: 1,
      noAddress: false,
      isDisabled: false, */
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



}
