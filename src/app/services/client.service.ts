/*
============================================
; Description: Bob's Computer Repair Shop App services for clients.
;===========================================
*/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Client } from "../shared/interfaces/client.interface";

@Injectable({
  providedIn: "root",
})
export class ClientService {
  constructor(private http: HttpClient) {}

  createClient(newClient: Client): Observable<any> {
    return this.http.post("/api/clients", {
      firstName: newClient.firstName,
      patronymic: newClient.patronymic,
      lastName: newClient.lastName,
      institutes: newClient.institutes,
      email: newClient.email,
      phoneNumber: newClient.phoneNumber,
      whatsApp: newClient.whatsApp,
      telegram: newClient.telegram,
      vKontakte: newClient.vKontakte,
      instagram: newClient.instagram,
      facebook: newClient.facebook,
      otherContact: newClient.otherContact,
      country: newClient.country,
      region: newClient.region,
      city: newClient.city,
      //nameDayCelebration: newClient.nameDayCelebration,
      comments: newClient.comments,
      correspondents: newClient.correspondents,
      coordinators: newClient.coordinators,
      publishers: newClient.publishers,
      isRestricted: newClient.isRestricted,
      causeOfRestriction: newClient.causeOfRestriction,
      preventiveAction: newClient.preventiveAction,
    });
  }

  findAllClients(): Observable<any> {
    return this.http.get("/api/clients");
  }

  deleteClient(
    _id: string,
    userName: string,
    pageSize: number,
    currentPage: number,
    isShowSubs: boolean
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    return this.http.patch("/api/clients/delete/" + _id + queryParams, {
      isShowSubs: isShowSubs,
      userName: userName,
    });
  }

  findClientById(_id: string): Observable<any> {
    return this.http.get("/api/clients/" + _id);
  }

  /*   findClientByClientName(clientName: string): Observable<any> {
    return this.http.get("/api/clients/client/" + clientName);
  }
 */
  updateClient(_id: string, updatedClient: Client): Observable<any> {
    const result = this.http.put("/api/clients/" + _id, {
      firstName: updatedClient.firstName,
      patronymic: updatedClient.patronymic,
      lastName: updatedClient.lastName,
      email: updatedClient.email,
      phoneNumber: updatedClient.phoneNumber,
      whatsApp: updatedClient.whatsApp,
      telegram: updatedClient.telegram,
      vKontakte: updatedClient.vKontakte,
      instagram: updatedClient.instagram,
      facebook: updatedClient.facebook,
      otherContact: updatedClient.otherContact,
      country: updatedClient.country,
      region: updatedClient.region,
      city: updatedClient.city,
      // nameDayCelebration: updatedClient.nameDayCelebration,
      comments: updatedClient.comments,
      institutes: updatedClient.institutes,
      correspondents: updatedClient.correspondents,
      coordinators: updatedClient.coordinators,
      publishers: updatedClient.publishers,
      isRestricted: updatedClient.isRestricted,
      causeOfRestriction: updatedClient.causeOfRestriction,
      preventiveAction: updatedClient.preventiveAction,
      whatChanged: updatedClient.whatChanged,
    });
    console.log(result);
    return result;
  }

  checkDoubleClient(newClient, id): Observable<any> {
    return this.http.post("/api/clients/check-double/", {
      newClient: newClient,
      id: id,
    });
  }
  findAllClientsByUserName(userName, pageSize, currentPage): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    console.log("queryParams");
    console.log(queryParams);
    return this.http.get("/api/clients/find/" + userName + queryParams);
  }

  findSubscribersByUserName(
    userName: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    return this.http.get(
      "/api/clients/findSubscribers/" + userName + queryParams
    );
  }
  addSearchArray(): Observable<any> {
    return this.http.get("/api/clients/add-search-array");
  }

  correctContacts(): Observable<any> {
    return this.http.get("/api/clients/contacts/correct");
  }

  restoreContacts(): Observable<any> {
    return this.http.get("/api/clients/restore/coordinators");
  }

  findClientBySearchString(userName, pageSize, currentPage, valueToSearch): Observable<any> {
    valueToSearch = valueToSearch.replace("+", "%2B");
    valueToSearch = valueToSearch.replace("#", "%23");
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}&valueToSearch=${valueToSearch}`;
    console.log("queryParams");
    console.log(queryParams);
    return this.http.get("/api/clients/search/" + userName + queryParams);
  }

  addInstitute(id, nameOfInstitute, categoryOfInstitute, userName ): Observable<any> {
    console.log("addInstitute");

    return this.http.post("/api/clients/add-institute/" + id, {     
      //id: id,
      name: nameOfInstitute,
      category: categoryOfInstitute,
      userName: userName
    });
  }

}
