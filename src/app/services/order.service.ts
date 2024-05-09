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

  findAllOrdersByUserId(
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    console.log("queryParams");
    console.log(queryParams);
    return this.http.get("/api/orders/find/" + userName + queryParams);
  }

  findNotConfirmedOrdersByUserId(
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    return this.http.get(
      "/api/orders/findNotConfirmed/" + userName + queryParams
    );
  }

  findOrderById(_id: string): Observable<any> {
    console.log("findOrderById");
    return this.http.get("/api/orders/" + _id);
  }

  deleteDestinationFromOrder(
    orderId: string,
    idCelebrator: string
  ): Observable<any> {
    //console.log("findOrderById");
    return this.http.patch("/api/orders/edit/" + orderId, {
      idCelebrator: idCelebrator,
    });
  }

  updateOrderStatus(
    _id: string,
    isShowAll: boolean,
    userName: string,
    newStatus: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    return this.http.patch("/api/orders/change-status/" + _id + queryParams, {
      isShowAll: isShowAll,
      userName: userName,
      newStatus: newStatus,
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
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    const result = this.http.patch("/api/orders/confirm/" + _id + queryParams, {
      isShowAll: isShowAll,
      userName: userName,
    });
    console.log(result);
    return result;
  }

  cancelConfirmOrder(
    _id: string,
    isShowAll: boolean,
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    const result = this.http.patch(
      "/api/orders/unconfirmed/" + _id + queryParams,
      {
        isShowAll: isShowAll,
        userName: userName,
      }
    );
    console.log(result);
    return result;
  }

  restoreOrder(
    _id: string,
    isShowAll: boolean,
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    const result = this.http.patch("/api/orders/restore/" + _id + queryParams, {
      isShowAll: isShowAll,
      userName: userName,
    });
    console.log(result);
    return result;
  }

  //////////////////////////////////////////////////////////////////////

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

  checkDoubleOrder(
    holiday: string,
    clientId: string
  ): Observable<any> {
    return this.http.post("/api/orders/check-double/", {
      holiday: holiday,
      clientId: clientId
    });
  }

  getContacts(contactType: string): Observable<any> {
    return this.http.get("/api/clients/find-contacts/" + contactType);
  }

  

  createOrder(newOrder: Order, prohibitedId: [], restrictedHouses: []): Observable<any> {
    return this.http.post("/api/orders/birthday/" + newOrder.amount, {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,
      prohibitedId: prohibitedId,
      restrictedHouses: restrictedHouses
    });
  }

  createInstitutesOrder(newOrder: Order, prohibitedId: [], restrictedHouses: []): Observable<any> {

    console.log(" api/orders/birthdayForInstitutes");
    return this.http.post("/api/orders/birthdayForInstitutes/" + newOrder.amount, {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,
      prohibitedId: prohibitedId,
      restrictedHouses: restrictedHouses
    });
  }

  createDobroruOrder(newOrder: Order, prohibitedId: [], restrictedHouses: []): Observable<any> {
    return this.http.post("/api/dobroru/birthday/" + newOrder.amount, {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,
      prohibitedId: prohibitedId,
      restrictedHouses: restrictedHouses
    });
  }

  createOrderNewYear(newOrder: Order, prohibitedId: [], restrictedHouses: []): Observable<any> {
    return this.http.post("/api/orders/new-year/" + newOrder.amount, {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,
      prohibitedId: prohibitedId,
      restrictedHouses: restrictedHouses
    });
  }

  createOrderEaster(newOrder: Order, prohibitedId: [], restrictedHouses: []): Observable<any> {
    return this.http.post("/api/orders/easter/" + newOrder.amount, {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,
      prohibitedId: prohibitedId,
      restrictedHouses: restrictedHouses
    });
  }

  createOrderSpring(newOrder: Order, prohibitedId: [], restrictedHouses: []): Observable<any> {
    return this.http.post("/api/orders/spring/" + newOrder.amount, {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,
      prohibitedId: prohibitedId,
      restrictedHouses: restrictedHouses
    });
  }

  createOrderForNameDay(newOrder: Order): Observable<any> {
    return this.http.post("/api/orders/name-day", {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,   
      temporaryLineItems: newOrder.temporaryLineItems,
    });
  }

  createOrderForFamilyDay(newOrder: Order): Observable<any> {
    return this.http.post("/api/orders/family-day", {
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
      source: newOrder.source,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      temporaryLineItems: newOrder.temporaryLineItems,
    });
  }

  createOrderMay9(newOrder: Order): Observable<any> {
    return this.http.post("/api/orders/may9/" + newOrder.amount, {
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

  getRegions(): Observable<any> {
    return this.http.get("/api/orders/get/regions/");
  }

  getNursingHomes(): Observable<any> {
    return this.http.get("/api/orders/get/nursingHomes/");
  }

  //////////////////////////////////////////////////////

  findNursingHomes(): Observable<any> {
    return this.http.get("/api/houses/");
  }

  getLists(): Observable<any> {
    return this.http.get("/api/lists/");
  }

  findNursingHome(nursingHome: string): Observable<any> {
    return this.http.get("/api/houses/name/" + nursingHome)["data"];
  }

  ///////////////////////////////////////////////////////

  findAllOrdersWithAbsents(): Observable<any> {
    return this.http.get("/api/orders/absents/all");
  }

  moveInstitutes(): Observable<any> {
    return this.http.get("/api/orders/clients/move-institutes");
  }

  restorePluses(holiday): Observable<any> {
    return this.http.get("/api/orders/restore-pluses/" + holiday);
  }

  createOrderVeterans(newOrder: Order, prohibitedId: [], restrictedHouses: []): Observable<any> {
    return this.http.post("/api/orders/veterans/" + newOrder.amount, {
      userName: newOrder.userName,
      clientId: newOrder.clientId,
      holiday: newOrder.holiday,
      source: newOrder.source,
      amount: newOrder.amount,
      clientFirstName: newOrder.clientFirstName,
      clientPatronymic: newOrder.clientPatronymic,
      clientLastName: newOrder.clientLastName,
      email: newOrder.email,
      contactType: newOrder.contactType,
      contact: newOrder.contact,
      institute: newOrder.institute,
      institutes: newOrder.institutes,
      isAccepted: newOrder.isAccepted,
      comment: newOrder.comment,
      orderDate: newOrder.orderDate,
      dateOfOrder: newOrder.dateOfOrder,
      filter: newOrder.filter,
      prohibitedId: prohibitedId,
      restrictedHouses: restrictedHouses
    });
  }

}
