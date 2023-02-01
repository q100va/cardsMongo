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

  findAllOrdersNotAccepted(): Observable<any> {
    return this.http.get("/api/orders/all/findAllOrdersNotAccepted/");
  }

  findAllOrdersByUserId(userName): Observable<any> {
    return this.http.get("/api/orders/find/" + userName);
  }

  findNotConfirmedOrdersByUserId(userName): Observable<any> {
    return this.http.get("/api/orders/findNotConfirmed/" + userName);
  }

  findOrderById(_id: string): Observable<any> {
    console.log("findOrderById");
    return this.http.get("/api/orders/" + _id);
  }

  deleteOrder(
    _id: string,
    isShowAll: boolean,
    userName: string
  ): Observable<any> {
    return this.http.patch("/api/orders/delete/" + _id, {
      isShowAll: isShowAll,
      userName: userName,
    });
  }

  updateOrder(_id: string, updatedOrder: Order): Observable<any> {
    const result = this.http.put("/api/orders/" + _id, {});
    console.log(result);
    return result;
  }

  confirmOrder(
    _id: string,
    isShowAll: boolean,
    userName: string
  ): Observable<any> {
    const result = this.http.patch("/api/orders/confirm/" + _id, {
      isShowAll: isShowAll,
      userName: userName,
    });
    console.log(result);
    return result;
  }

  updateList(celebrator_id): Observable<any> {
    return this.http.patch("/api/lists/check/" + celebrator_id, { amount: 1 });
  }

  changeActiveList() {
    let key = this.http.patch("/api/lists/change/", { active: false });
    return this.http.patch("/api/lists/change/" + key, { active: true });
  }

  ifCloseList(): Observable<any> {
    return this.http.get("/api/lists/get/active/");
  }

  checkDoubleOrder(holiday: string, email: string, contact: string): Observable<any> {
    return this.http.post("/api/orders/check-double/", {
      holiday: holiday,
      email: email,
      contact: contact,
    });
  }

  createOrder(newOrder: Order, prohibitedId: []): Observable<any> {
    return this.http.post("/api/orders/birthday/" + newOrder.amount, {
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
      prohibitedId: prohibitedId
    });
  }

  createOrderNewYear(newOrder: Order): Observable<any> {
    return this.http.post("/api/orders/new-year/" + newOrder.amount, {
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

  createOrderSpring(newOrder: Order, prohibitedId:[]): Observable<any> {
    return this.http.post("/api/orders/spring/" + newOrder.amount, {
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
      prohibitedId: prohibitedId
    });
  }

  createOrderForNameDay(newOrder: Order): Observable<any> {
    return this.http.post("/api/orders/name-day", {
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

  createOrderForTeacherDay(newOrder: Order): Observable<any> {
    return this.http.post("/api/orders/teacher-day", {
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

  getRegions(): Observable<any> {
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

  ///////////////////////////////////////////////////////

  findAllOrdersWithAbsents(): Observable<any> {
    return this.http.get("/api/orders/absents/all");
  }
}
