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
  displayedColumns = ["lastName", "firstName", "patronymic", "DOB", "gender", "dateEnter", "dateExit", "comment1", "comment2", "linkPhoto", "dateOfSignedConsent",  "edit", "delete", "isRestricted"]; //"nameDay",
  constructor(
    private seniorsService: SeniorsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {

  }

  ngOnInit(): void {}

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
