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
  house = [];
 
  displayedColumns = [ "region", "nursingHome", "statistic.newYear.amount", "address", "dateLastUpdate", "nameContact", "contact", "notes", "noAddress", "isReleased", "edit", "delete"];//"isActive",

  constructor(
    private dialog: MatDialog,
    private housesService: HousesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {

    function dynamicSort(properties) {
      return function(a, b) {
          for (let i = 0; i < properties.length; i++) {
              let prop = properties[i];
              if (a[prop] < b[prop]) return -1;
              if (a[prop] > b[prop]) return 1;
          }
          return 0;
      }
  }
    this.housesService.findAllHouses().subscribe(
      (res) => {
        this.house = res["data"];
        this.house = this.house.filter(item => item.isActive == true);
       // this.house = this.house.sort((prev, next) => prev.region > next.region ? 1 : -1 );
       this.house = this.house.sort(dynamicSort(["region", "nursingHome"]));
        for (let house of  this.house) {
         
          if (new Date(house.dateLastUpdate) < new Date("2024-09-01")) {
            console.log(new Date(house.dateLastUpdate));
            console.log(new Date("2024-09-01"));
            house.color = "red";
          } else {
            house.color = "black";
          }

        }
        console.log(this.house);
      },
      (err) => {},
      () => {}
    );
  }

//644526, Омская обл., Омский р-н, п. 2. Андреевский, ул. Центральная, д. 2. 8, Пушкинский ДИ (психоневрологический)

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
