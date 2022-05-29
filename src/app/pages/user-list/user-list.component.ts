/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: April 23, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop user-list component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { User } from "src/app/shared/interfaces/user.interface";
import { CookieService } from "ngx-cookie-service";
import { MatDialog } from "@angular/material/dialog";
//import { CreateTaskDialogComponent } from "src/app/shared/create-task-dialog/create-task-dialog.component";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-user-list",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.css"],
})
export class UserListComponent implements OnInit {
  user: User;
  userName: string;
  _id: string;
  displayedColumns = ["userName", "firstName", "lastName", "phoneNumber", "address", "email", "edit", "delete"];

  constructor(
    private userService: UserService,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private resultDialog: MatDialog,
  ) {
    this.userService.findAllUsers().subscribe(
      (res) => {
        this.user = res["data"];
      },
      (err) => {},
      () => {}
    );
  }

  ngOnInit(): void {}

  deleteUser(_id: string) {
    console.log(_id);
    // Rerouted function through PrimeNG ConfirmDialog
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить этого пользователя?",
      accept: () => {
        if (_id) {
          this.userService.deleteUser(_id).subscribe(
            (res) => {
              //this.user = res.data;
              this.userService.findAllUsers().subscribe(
                (res) => {
                  this.user = res["data"];
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
              //this.messageService.add({ severity: "warn", summary: "bcrs", detail: "Task deleted successfully" });
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: "Аккаунт пользователя успешно удален.",
                },
                disableClose: true,
                width: "fit-content",
              });
            }
          );
        }
      },
    });
  }
}
