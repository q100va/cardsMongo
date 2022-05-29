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
import { Role } from "src/app/shared/interfaces/role.interface";
import { CookieService } from "ngx-cookie-service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { RoleService } from "src/app/services/roles.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-role-list",
  templateUrl: "./role-list.component.html",
  styleUrls: ["./role-list.component.css"],
})
export class RoleListComponent implements OnInit {
  role: Role;
  text: string;
  _id: string;
  displayedColumns = ["text", "edit", "delete"];
  constructor(
    private roleService: RoleService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private resultDialog: MatDialog,
  ) {
    this.roleService.findAllRoles().subscribe(
      (res) => {
        this.role = res["data"];
        console.log("here " + this.role);
      },
      (err) => {},
      () => {}
    );
  }

  ngOnInit(): void {}

  deleteRole(_id: string) {
    console.log(_id);
    // Rerouted function through PrimeNG ConfirmDialog
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить этого пользователя?",
      accept: () => {
        if (_id) {
          this.roleService.deleteRole(_id).subscribe(
            (res) => {
              this.roleService.findAllRoles().subscribe(
                (res) => {
                  this.role = res["data"];
                },
                (err) => {
                  
                },
                () => {
                  
                }
              );
            },
            (err) => {
              console.log(err);
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: err.error.msg,
                },
                disableClose: true,
                width: "fit-content",
              });
            },
            () => {
              //this._id = this.user._id;
              // PrimeNG Toast message sender
              //this.messageService.add({ severity: "warn", summary: "bcrs", detail: "Role deleted successfully" });
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: "Роль успешно удалена.",
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
