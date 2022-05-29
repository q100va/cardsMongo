/*
============================================
 role-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { RoleService } from "src/app/services/roles.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { Role } from "src/app/shared/interfaces/role.interface";
//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";

@Component({
  selector: "app-role-details",
  templateUrl: "./role-details.component.html",
  styleUrls: ["./role-details.component.css"],
})
export class RoleDetailsComponent implements OnInit {
  role: Role;
  text: string;
  roleId: string;
  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private resultDialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.roleId = this.route.snapshot.paramMap.get("id");

    this.roleService.findRoleById(this.roleId).subscribe(
      (res) => {
        this.role = res["data"];
      },
      (err) => {
        console.log(err);
      },
      () => {
        this.form.controls.text.setValue(this.role.text);
      }
    );

    this.roleService.findAllRoles().subscribe(
      (res) => {
        this.role = res["data"];
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      text: [null, Validators.compose([Validators.required])],
    });
  }
  saveRole(): void {
    const updatedRole: Role = {
      text: this.form.controls.text.value,
    };
    this.roleService.updateRole(this.roleId, updatedRole).subscribe(
      (res) => {
        console.log(res);
        this.router.navigate(["/roles"]);
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
        //alert("Role information is updated.");
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Роль была успешно обновлена.",
          },
          disableClose: true,
          width: "fit-content",
        });
      }
    );
  }

  cancel(): void {
    this.router.navigate(["/roles"]);
    //alert("Role information is canceled.");
    this.resultDialog.open(ConfirmationDialogComponent, {
      data: {
        message: "Вы отменили обновление.",
      },
      disableClose: true,
      width: "fit-content",
    });
  }
}
