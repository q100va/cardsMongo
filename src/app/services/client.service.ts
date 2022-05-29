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
        gender: newClient.gender,
        email: newClient.email,
        phoneNumber: newClient.phoneNumber,
        whatsApp: newClient.whatsApp,
        telegram: newClient.telegram,
        vKontakte: newClient.vKontakte,
        instagram: newClient.instagram,
        facebook: newClient.facebook,
        country: newClient.country,
        region: newClient.region,
        city: newClient.city,
        nameDay: newClient.nameDay,
        comments: newClient.comments,
        institute: newClient.institute,
        correspondent: newClient.correspondent,
        coordinator: newClient.coordinator,
        isRestricted: newClient.isRestricted,
        
     });
 } 

  findAllClients(): Observable<any> {
    return this.http.get("/api/clients");
  }

  deleteClient(_id: string): Observable<any> {
    return this.http.delete("/api/clients/" + _id);
  }

  findClientById(_id: string): Observable<any> {
    return this.http.get("/api/clients/" + _id);
  }

  findClientByClientName(clientName: string): Observable<any> {
    return this.http.get("/api/clients/client/" + clientName);
  }

  updateClient(_id: string, updatedClient: Client): Observable<any> {
    const result = this.http.put("/api/clients/" + _id, {
        firstName: updatedClient.firstName,
        patronymic: updatedClient.patronymic,
        lastName: updatedClient.lastName,
        gender: updatedClient.gender,
        email: updatedClient.email,
        phoneNumber: updatedClient.phoneNumber,
        whatsApp: updatedClient.whatsApp,
        telegram: updatedClient.telegram,
        vKontakte: updatedClient.vKontakte,
        instagram: updatedClient.instagram,
        facebook: updatedClient.facebook,
        country: updatedClient.country,
        region: updatedClient.region,
        city: updatedClient.city,
        nameDay: updatedClient.nameDay,
        comments: updatedClient.comments,
        institute: updatedClient.institute,
        correspondent: updatedClient.correspondent,
        coordinator: updatedClient.coordinator,   
        isRestricted: updatedClient.isRestricted,


    });
    console.log(result);
    return result;
  }


}
