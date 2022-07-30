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
      noAddress: newHouse.noAddress,
      isReleased: newHouse.isReleased,
      isActive: newHouse.isActive,
      dateLastUpdate: newHouse.dateLastUpdate,
      dateLastUpdateClone: newHouse.dateLastUpdateClone,
      nameContact: newHouse.nameContact,
      contact: newHouse.contact,
      website: newHouse.website,
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
      noAddress: updatedHouse.noAddress,
      isReleased: updatedHouse.isReleased,
      isActive: updatedHouse.isActive,
      dateLastUpdate: updatedHouse.dateLastUpdate,
      dateLastUpdateClone: updatedHouse.dateLastUpdateClone,
      nameContact: updatedHouse.nameContact,
      contact: updatedHouse.contact,
      website: updatedHouse.website,
    });
  }

  addManyHouses(houses: Array<House>): Observable<any> {
  return this.http.post("/api/houses/add-many/", {houses: houses});
}

findHousesEmail(startDate: Date, endDate: Date): Observable<any> {
  console.log("startDate");
  console.log(startDate);
  console.log("endDate");
  console.log(endDate);
  return this.http.post("/api/houses/email", {startDate:startDate, endDate : endDate});
}


}
