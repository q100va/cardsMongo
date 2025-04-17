/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint3
; Author: Professor Krasso
; Date: May 7, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop user-list component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { Senior } from "src/app/shared/interfaces/seniors.interface";
import { CookieService } from "ngx-cookie-service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { SeniorsService } from "src/app/services/seniors.service";
import { OrderService } from "src/app/services/order.service";
import { ActivatedRoute } from "@angular/router";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-seniors-list",
  templateUrl: "./seniors-list.component.html",
  styleUrls: ["./seniors-list.component.css"],
})
export class SeniorsListComponent implements OnInit {
  seniors: Senior[];
  length: number;
  name: string;
  _id: string;
  nursingHome: string;
  nursingHomes = [];
  value: string;
  displayedColumns = ["lastName", "firstName", "patronymic", "DOB", "gender", "dateEnter", "dateExit", "comment1", "comment2", "linkPhoto", "dateOfSignedConsent",  "isRestricted", "edit", "delete",]; //"nameDay"
  selectedHome = new FormControl('');
  constructor(
    private seniorsService: SeniorsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private orderService: OrderService,
    private route: ActivatedRoute,
  ) {

    this.route.queryParams.subscribe((params) => {
      console.log(params);
      this.selectedHome.setValue(params.nursingHome);
      this.formList(params.nursingHome);

    });
  }

  ngOnInit(): void {
    this.orderService.getNursingHomes().subscribe(
      async (res) => {
        this.nursingHomes = res["data"]["nursingHomes"];
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onChangeNursingHome(event){
    this.nursingHome = event.value;
    this.seniorsService.findSeniorsFromOneHome(event.value).subscribe(
      (res) => {
        this.seniors = res["data"];
        this.length = this.seniors.length;
      },
      (err) => {},
      () => {}
    );
  }

  formList(nursingHome){
    this.seniorsService.findSeniorsFromOneHome(nursingHome).subscribe(
      (res) => {
        this.seniors = res["data"];
        this.length = this.seniors.length;
      },
      (err) => {},
      () => {}
    );
  }

  deleteSenior(_id: string) {
    console.log(_id);
    // Rerouted function through PrimeNG ConfirmDialog
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this senior?",
      accept: () => {
        if (_id) {
          this.seniorsService.deleteSenior(_id).subscribe(
            (res) => {
              //this.user = res.data;
              this.seniorsService.findSeniorsFromOneHome(this.nursingHome).subscribe(
                (res) => {
                  this.seniors = res["data"];
                  this.length = this.seniors.length;
                },
                (err) => {},
                () => {}
              );
            },
            (err) => {
              console.log(err);
            },
            () => {
              //this._id = this.user._id;
              // PrimeNG Toast message sender
              this.messageService.add({ severity: "warn", summary: "bcrs", detail: "Service deleted successfully" });
            }
          );
        }
      },
    });
  }
}
