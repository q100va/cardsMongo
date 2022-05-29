/*
============================================
 services for houses.
;===========================================
*/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { House } from "../shared/interfaces/houses.interface";

@Injectable({
  providedIn: "root",
})
export class HousesService {
  constructor(private http: HttpClient) {}

  findAllHouses(): Observable<any> {
    return this.http.get("/api/houses");
  }

  deleteHouse(_id: string): Observable<any> {
    return this.http.delete("/api/houses/" + _id);
  }

  findHouseById(_id: string): Observable<any> {
    return this.http.get("/api/houses/" + _id);
  }

  createHouse(newHouse: House): Observable<any> {
    console.log(newHouse);
    return this.http.post("/api/houses", {
      nursingHome: newHouse.nursingHome,
      region: newHouse.region,
      address: newHouse.address,
      infoComment: newHouse.infoComment,
      adminComment: newHouse.adminComment,
      isRestricted: newHouse.isRestricted,
      isActive: newHouse.isActive,
      dateStart: newHouse.dateStart,
      dateStartClone: newHouse.dateStartClone,
      nameContact: newHouse.nameContact,
      contact: newHouse.contact,
    });
  }

  updateHouse(_id: string, updatedHouse: House): Observable<any> {
    return this.http.put("/api/houses/" + _id, {
      nursingHome: updatedHouse.nursingHome,
      isDisabled: false,
      region: updatedHouse.region,
      address: updatedHouse.address,
      infoComment: updatedHouse.infoComment,
      adminComment: updatedHouse.adminComment,
      isRestricted: updatedHouse.isRestricted,
      isActive: updatedHouse.isActive,
      dateStart: updatedHouse.dateStart,
      dateStartClone: updatedHouse.dateStartClone,
      nameContact: updatedHouse.nameContact,
      contact: updatedHouse.contact,
    });
  }
}
