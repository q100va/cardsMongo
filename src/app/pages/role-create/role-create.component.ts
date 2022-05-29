import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";

import { Router } from "@angular/router";
import { RoleService } from "src/app/services/roles.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { Role } from "src/app/shared/interfaces/role.interface";

@Component({
  selector: "app-role-create",
  templateUrl: "./role-create.component.html",
  styleUrls: ["./role-create.component.css"],
})
export class RoleCreateComponent implements OnInit {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleService: RoleService,
    private resultDialog: MatDialog
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      text: [null, Validators.compose([Validators.required])],
    });
  }
  createRole() {
    const newRole = {} as Role;
    newRole.text = this.form.controls.text.value;

    this.roleService.createRole(newRole).subscribe(
      (res) => {
        this.router.navigate(["/roles"]);
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "New role has been created successfully.",
          },
          disableClose: true,
          width: "fit-content",
        });
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
      }
    );
  }

    // This is the cancel button.
    cancel() {
      this.router.navigate(["/roles"]);
    }
}
