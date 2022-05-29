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
  senior: Senior;
  name: string;
  _id: string;
  displayedColumns = ["region", "nursingHome", "lastName", "patronymic", "isRestricted", "DOB", "gender", "comment1", "comment2", "linkPhoto", "nameDay", "edit", "delete"];
  constructor(
    private seniorsService: SeniorsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.seniorsService.findAllSeniors().subscribe(
      (res) => {
        this.senior = res["data"];
      },
      (err) => {},
      () => {}
    );
  }

  ngOnInit(): void {}

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
              this.seniorsService.findAllSeniors().subscribe(
                (res) => {
                  this.senior = res["data"];
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
