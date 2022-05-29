/*
============================================
component file
;===========================================
*/

import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { House } from "../../shared/interfaces/houses.interface";
import { HousesService } from "src/app/services/houses.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-house-list",
  templateUrl: "./house-list.component.html",
  styleUrls: ["./house-list.component.css"],
})
export class HouseListComponent implements OnInit {
  house: House[];
 
  displayedColumns = ["isActive", "nursingHome", "isRestricted", "region", "address", "dateStart", "nameContact", "contact", "edit", "delete"];

  constructor(
    private dialog: MatDialog,
    private housesService: HousesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.housesService.findAllHouses().subscribe(
      (res) => {
        this.house = res["data"];
        console.log(this.house);
      },
      (err) => {},
      () => {}
    );
  }

  ngOnInit(): void {}

  //Delete task function
  deleteHouse(qId: string) {
    console.log(qId);
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту запись?",
      accept: () => {
        if (qId) {
          console.log(qId);
          this.housesService.deleteHouse(qId).subscribe(
            (res) => {
              console.log(res);
              //this.house = res["data"];
              this.housesService.findAllHouses().subscribe(
                (res) => {
                  this.house = res["data"];
                },
                (err) => {},
                () => {}
              );
            },
            (err) => {
              console.log(err);
            },
            () => {
              //this.house = this.house.filter((q) => q._id !== qId);
              console.log(this.house);
              this.messageService.add({ severity: "warn", summary: "bcrs", detail: "Запись удалена." });
            }
          );
        }
      },
    });
  }
}
