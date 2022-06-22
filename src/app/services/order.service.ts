/*
============================================
 services for order.
;===========================================
*/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Order } from "../shared/interfaces/order.interface";

import { LineItem } from "../shared/interfaces/line-item.interface";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  constructor(private http: HttpClient) {}

  findAllOrders(): Observable<any> {
    return this.http.get("/api/orders");
  }

  findAllOrdersByUserId(userName): Observable<any> {
    return this.http.get("/api/orders/find/" + userName);
  }

  findNotConfirmedOrdersByUserId(userName): Observable<any> {
    return this.http.get("/api/orders/findNotConfirmed/" + userName);
  }

  findOrderById(_id: string): Observable<any> {
    console.log('findOrderById');
    return this.http.get("/api/orders/" + _id);
  }

  deleteOrder(_id: string, isShowAll: boolean, userName: string): Observable<any> {
    return this.http.patch("/api/orders/delete/" + _id, {isShowAll: isShowAll, userName: userName});
  }

  updateOrder(_id: string, updatedOrder: Order): Observable<any> {
    const result = this.http.put("/api/orders/" + _id, {});
    console.log(result);
    return result;
  }

  confirmOrder(_id: string, isShowAll: boolean, userName: string): Observable<any> {
    const result = this.http.patch("/api/orders/confirm/" + _id, {isShowAll: isShowAll, userName: userName});
    console.log(result);
    return result;
  }

  updateList(celebrator_id): Observable<any> {

        return this.http.patch("/api/lists/check/"+ celebrator_id, {amount :1});
  }

  changeActiveList () {
    let key= this.http.patch("/api/lists/change/", {active : false});
    return this.http.patch("/api/lists/change/"+ key, {active : true});
  }

   ifCloseList(): Observable<any> {
    return this.http.get("/api/lists/get/active/");
  }




   createOrder(newOrder: Order): Observable<any> {
    
    return  this.http.post("/api/orders/" + newOrder.amount, {
      userName: newOrder.userName,
      holiday: newOrder.holiday,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      filter: newOrder.filter,
    });
  }

  createOrderForNameDay(newOrder: Order): Observable<any> {
    
    return  this.http.post("/api/orders/name-day", {
      userName: newOrder.userName,
      holiday: newOrder.holiday,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      temporaryLineItems: newOrder.temporaryLineItems,

    });
 
  }

  getRegions(): Observable<any>  {
    return this.http.get("/api/orders/get/regions/");
  }
  

  //////////////////////////////////////////////////////

  findNursingHomes(): Observable<any> {
    return this.http.get("/api/houses/");
  }

  getLists(): Observable<any> {
    return this.http.get("/api/lists/");
  }

  findNursingHome(nursingHome: string): Observable<any> {
    return this.http.get("/api/houses/name" + nursingHome)["data"];
  }

/*   getProportion(amount: number): Observable<any> {
    return this.http.get("/api/orders/proportion/" + amount);
  }

  generateOrder(proportion: any, allLists: any, nursingHomes: any) {
    let lineItems = [];
    let list = this.generateList(proportion, allLists);
    console.log(list);
    if (list.length > 0) {
      for (let person of list) {
        console.log(person);
        console.log(lineItems);
        let index = -1;
        console.log(lineItems.length);
        if (lineItems.length > 0) {
          index = lineItems.findIndex((item) => 
            item.nursingHome == person.nursingHome
          );

        }
        console.log(index);
        if (index > -1) {
          lineItems[index].celebrators.push(person);
        } else {
          let foundHouse = nursingHomes.find(
            (item) =>
              item.nursingHome == person.nursingHome
          );
console.log(person.nursingHome);
          lineItems.push({
            region: foundHouse.region,
            nursingHome: foundHouse.nursingHome,
            address: foundHouse.address,
            infoComment: foundHouse.infoComment,
            adminComment: foundHouse.adminComment,
            noAddress: foundHouse.noAddress,
            celebrators: [person],
          });
        }
      }
      console.log(lineItems);

      return lineItems;
    } else {
      return false;
    }
  }

  generateList(proportion: any, allLists: any): Array<any> {
    let celebrators = [];
    let houses = {};
    let restrictedHouses = [];

    let categories = ["oldWomen", "oldMen", "yang", "special", "oldest"];
    let searchOrders = {
      oldWomen: ["oldWomen", "oldMen", "oldest"],
      oldMen: ["oldMen", "oldWomen", "yang", "oldest"],
      yang: ["yang", "oldWomen", "oldMen", "oldest"],
      special: ["special", "yang", "oldWomen", "oldMen", "oldest"],
    };

    let mainListObject = allLists.find((item) => item.active);
    let mainList = mainListObject.celebrators.filter(
      (item) =>
        (item.plusAmount < 3 && !item.oldest) ||
        (item.plusAmount < 4 && item.oldest)
    );
    let spareDate = +(mainListObject.period[3] + mainListObject.period[4]) + 1;
    console.log(spareDate);
    let spareList = allLists
      .find((item) => item.key == mainListObject.key + 1)
      .celebrators.filter((item) => item.dateBirthday == spareDate)
      .slice();
    console.log(spareList);
    spareList = spareList.filter(
      (item) =>
        (item.plusAmount < 3 && !item.oldest) ||
        (item.plusAmount < 4 && item.oldest)
    );

    console.log("mainList");
    console.log(mainList);
    console.log("spareList");
    console.log(spareList);

    let newMainList = {
      oldWomen: [],
      oldMen: [],
      yang: [],
      special: [],
      oldest: [],
    };
    let newSpareList = {
      oldWomen: [],
      oldMen: [],
      yang: [],
      special: [],
      oldest: [],
    };

    for (let category of categories) {
      console.log(category);
      if (category == "oldest") {
        newMainList[category] = mainList
          .filter((item) => item.category && item.plusAmount == 3)
          .slice();
        newSpareList[category] = spareList
          .filter((item) => item.category && item.plusAmount == 3)
          .slice();
        console.log(newMainList["category"]);
      } else {
        newMainList[category] = mainList
          .filter((item) => item.category == category && item.plusAmount < 3)
          .slice();
        newSpareList[category] = spareList
          .filter((item) => item.category == category && item.plusAmount < 3)
          .slice();
      }

      console.log("newMainList " + category);
      console.log(newMainList[category]);
      console.log("newSpareList " + category);
      console.log(newSpareList[category]);

      newMainList[category].sort(
        (prev, next) => prev.dateBirthday - next.dateBirthday
      );
      newSpareList[category].sort(
        (prev, next) => prev.dateBirthday - next.dateBirthday
      );

      newMainList[category].sort(
        (prev, next) => prev.plusAmount - next.plusAmount
      );
      newSpareList[category].sort(
        (prev, next) => prev.plusAmount - next.plusAmount
      );
    }

    console.log("newMainList");
    console.log(newMainList);
    console.log("newSpareList");
    console.log(newSpareList);

    for (let category of categories) {
      //let list = [];
      console.log(category);
      console.log(proportion[category]);
      let counter = 0;
      if (proportion[category]) {
        outer: for (let kind of searchOrders[category]) {
          console.log(newMainList[kind]);
          let index = 0;
          for (let person of newMainList[kind]) {
            if (!restrictedHouses.includes(person.nursingHome)) {
              celebrators.push(person);
              console.log(`newMainList + ${kind}`);
              console.log(person);
              newMainList[kind].splice(index, 1);

              counter++;
              houses[person["nursingHome"]]++;
              if (houses[person["nursingHome"]] == proportion["oneHouse"]) {
                restrictedHouses.push([person["nursingHome"]]);
              }
            }
            if (counter == proportion[category]) break outer;
            index++;
          }

          if (counter < proportion[category]) {
            let index = 0;
            for (let person of newSpareList[kind]) {
              if (!restrictedHouses.includes(person.nursingHome)) {
                celebrators.push(person);
                console.log(`newSpareList + ${kind}`);
                console.log(person);
                newSpareList[kind].splice(index, 1);
                counter++;
                houses[person["nursingHome"]]++;
                if (houses[person["nursingHome"]] == proportion["oneHouse"]) {
                  restrictedHouses.push([person["nursingHome"]]);
                }
              }
              if (counter == proportion[category]) break outer;
              index++;
            }
          }
        }

        if (counter < proportion[category]) {
          alert(
            "Обратитесь к администратору!!! Список не может быть сформирован."
          );
          console.log("возвращает пустой массив");
          return [];
        }
      }
    }
    console.log(celebrators);
    return celebrators;
  } */



/*   checkDoubles(array1: any[], array2: any[]) {
    for (let person of array1) {
      let index = array2.findIndex((item) => {
        item.nursingHome +
          item.lastName +
          item.firstNme +
          item.patronymic +
          item.dateBirthday +
          item.monthBirthday +
          item.yearBirthday ==
          person.nursingHome +
            person.lastName +
            person.firstNme +
            person.patronymic +
            person.dateBirthday +
            person.monthBirthday +
            person.yearBirthday;
      });

      if (index) {
        array2.splice(index, 1);
      }
    }
    return array2;
  } */


  /*   findCelebrator(condition: string, gender: string) {
    return this.http.get("/api/orders/celebrator/" + condition + gender);
  } */

  /*   findRestrictedCelebrator(condition: string, gender: string, house: string) {
    return this.http.get(
      "/api/orders/celebrator/" + condition + gender + house
    );
  } */
}

/* import { Injectable } from '@angular/core';
import { of } from 'rxjs';
//import { Book } from './book';

interface Book {
    id: number;
    name: string;
    writer: string
} 

const ALL_BOOKS: Book[] = [
  { id: 101, name: 'Godaan', writer: 'Premchand' },
  { id: 102, name: 'Karmabhoomi', writer: 'Premchand' },
  { id: 103, name: 'Pinjar', writer: 'Amrita Pritam' }, 
  { id: 104, name: 'Kore Kagaz', writer: 'Amrita Pritam' },   
  { id: 105, name: 'Nirmala', writer: 'Premchand' },
  { id: 106, name: 'Seva Sadan', writer: 'Premchand' }           
];

@Injectable({
  providedIn: 'root'
})
export class BookService {
  getAllBooks() {
    return of(ALL_BOOKS);
  }
  saveBook(books) {
    console.log(JSON.stringify(books));
  }
}  */

/* 
//old men list
if (proportion["oldMen"]) {
  list = this.getList("oldMen").slice();
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list.filter((item) => item.nursingHome != restrictedHouse);
    }
  }
  if (!list || list.length < proportion["oldMen"]) {
    let addList = this.getList("oldWomen").slice();
    addList = this.checkDoubles(list, addList);
    list = list.concat(addList);
  }
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list
        .filter((item) => item.nursingHome != restrictedHouse)
        .slice();
    }
    list = this.checkDoubles(celebrators, list);
  }
  if (!list || list.length < proportion["oldMen"]) {
    let addList = this.getList("oldest").slice();
    addList = this.checkDoubles(list, addList);
    list = list.concat(addList);
  }
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list
        .filter((item) => item.nursingHome != restrictedHouse)
        .slice();
    }
    list = this.checkDoubles(celebrators, list);
  }
  if (!list) {
    alert("Обратитесь к администратору!");
  } else {
    let counter = 0;
    for (let person of list) {
      if (!restrictedHouses.includes(person.nursingHome)) {
        celebrators.push(person);
        counter++;
        houses[person["nursingHome"]]++;
        if (houses[person["nursingHome"]] == proportion["oneHouse"]) {
          restrictedHouses.push([person["nursingHome"]]);
        }
      }
      if (counter == proportion["oldMen"]) break;
    }
    if (counter < proportion["oldMen"]) {
      alert("Обратитесь к администратору!");
    }
  }
}

//yang people list
if (proportion["yang"]) {
  list = this.getList("yang").slice();
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list.filter((item) => item.nursingHome != restrictedHouse);
    }
  }
  if (!list || list.length < proportion["yang"]) {
    let addList = this.getList("oldWomen").slice();
    addList = this.checkDoubles(list, addList);
    list = list.concat(addList);
  }
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list
        .filter((item) => item.nursingHome != restrictedHouse)
        .slice();
    }
    list = this.checkDoubles(celebrators, list);
  }
  if (!list || list.length < proportion["yang"]) {
    let addList = this.getList("oldMen").slice();
    addList = this.checkDoubles(list, addList);
    list = list.concat(addList);
  }
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list
        .filter((item) => item.nursingHome != restrictedHouse)
        .slice();
    }
    list = this.checkDoubles(celebrators, list);
  }
  if (!list) {
    alert("Обратитесь к администратору!");
  } else {
    let counter = 0;
    for (let person of list) {
      if (!restrictedHouses.includes(person.nursingHome)) {
        celebrators.push(person);
        counter++;
        houses[person["nursingHome"]]++;
        if (houses[person["nursingHome"]] == proportion["oneHouse"]) {
          restrictedHouses.push([person["nursingHome"]]);
        }
      }
      if (counter == proportion["yang"]) break;
    }
    if (counter < proportion["yang"]) {
      alert("Обратитесь к администратору!");
    }
  }
}

//special people list
if (proportion["special"]) {
  list = this.getList("special").slice();
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list.filter((item) => item.nursingHome != restrictedHouse);
    }
  }
  if (!list || list.length < proportion["special"]) {
    let addList = this.getList("yang").slice();
    addList = this.checkDoubles(list, addList);
    list = list.concat(addList);
  }
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list
        .filter((item) => item.nursingHome != restrictedHouse)
        .slice();
    }
    list = this.checkDoubles(celebrators, list);
  }
  if (!list || list.length < proportion["special"]) {
    let addList = this.getList("oldMen").slice();
    addList = this.checkDoubles(list, addList);
    list = list.concat(addList);
  }
  if (list && restrictedHouses) {
    for (let restrictedHouse of restrictedHouses) {
      list = list
        .filter((item) => item.nursingHome != restrictedHouse)
        .slice();
    }
    list = this.checkDoubles(celebrators, list);
  }
  if (!list) {
    alert("Обратитесь к администратору!");
  } else {
    let counter = 0;
    for (let person of list) {
      if (!restrictedHouses.includes(person.nursingHome)) {
        celebrators.push(person);
        counter++;
        houses[person["nursingHome"]]++;
        if (houses[person["nursingHome"]] == proportion["oneHouse"]) {
          restrictedHouses.push([person["nursingHome"]]);
        }
      }
      if (counter == proportion["special"]) break;
    }
    if (counter < proportion["special"]) {
      alert("Обратитесь к администратору!");
    }
  }
} */

/* generateList(amount: number): Array<any> {
  let proportion = {};
  let celebrators = [];
  let houses = {};
  let restrictedHouses = [];
  let categories = ["oldWomen", "oldMen", "yang", "special"];
  let spare = {
    oldWomen: ["oldMen", "oldest"],
    oldMen: ["oldWomen", "yang", "oldest"],
    yang: ["oldWomen", "oldMen", "oldest"],
    special: ["yang", "oldWomen", "oldMen", "oldest"],
  };

  this.getProportion(amount).subscribe(
    (res) => {
      proportion = res["data"];

      for (let category of categories) {
        let list = [];
        console.log(category);
        console.log(proportion[category]);
        if (proportion[category]) {
          this.getList(category).subscribe(
            (res) => {
              list = res["data"].slice();
              console.log(list);
              if (list && restrictedHouses) {
                for (let restrictedHouse of restrictedHouses) {
                  list = list.filter(
                    (item) => item.nursingHome != restrictedHouse
                  );
                  console.log("no doubles");
                  console.log(list);
                }
              }

              for (let item of spare[category]) {
                if (!list || list.length < proportion[category]) {
                  this.getList(item).subscribe(
                    (res) => {
                      let addList = res["data"].slice();
                      addList = this.checkDoubles(list, addList);
                      list = list.concat(addList);
                      console.log(item);
                      console.log(list);
                      if (list && restrictedHouses) {
                        for (let restrictedHouse of restrictedHouses) {
                          list = list.filter(
                            (item) => item.nursingHome != restrictedHouse
                          );
                          console.log("no doubles");
                          console.log(list);
                        }
                      }
                    },
                    (err) => {
                      console.log(err);
                    }
                  );
                }
              }

              if (!list || list.length < proportion[category]) {
                console.log(list.length);
                console.log(list);
                alert(
                  "Обратитесь к администратору! Список не может быть сформирован."
                );
                //break;
              } else {
                console.log("final");
                console.log(list);
                list.sort((prev, next) => prev.plusAmount - next.plusAmount);
                let counter = 0;
                for (let person of list) {
                  if (!restrictedHouses.includes(person.nursingHome)) {
                    celebrators.push(person);
                    counter++;
                    houses[person["nursingHome"]]++;
                    if (
                      houses[person["nursingHome"]] == proportion["oneHouse"]
                    ) {
                      restrictedHouses.push([person["nursingHome"]]);
                    }
                  }
                  if (counter == proportion[category]) break;
                }
                if (counter < proportion[category]) {
                  alert(
                    "Обратитесь к администратору!!! Список не может быть сформирован."
                  );
                  //break;
                } else { console.log(celebrators);
                  return celebrators;}
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      }
    },
    (err) => {
      console.log(err);
    }
  );
 
} */
