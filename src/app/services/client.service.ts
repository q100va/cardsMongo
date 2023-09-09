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
        //coordinators: newClient.coordinators,
        publishers: newClient.publishers,
        isRestricted: newClient.isRestricted,
        causeOfRestriction: newClient.causeOfRestriction,
        preventiveAction: newClient.preventiveAction,
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
        institutes:    updatedClient.institutes,    
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
        nameDayCelebration: updatedClient.nameDayCelebration,
        comments: updatedClient.comments,
        institute: updatedClient.institutes,
        correspondents: updatedClient.correspondents,
        coordinators: updatedClient.coordinators,   
        isRestricted: updatedClient.isRestricted,


    });
    console.log(result);
    return result;
  }


}
