/*
============================================
user-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";
import { User } from "src/app/shared/interfaces/user.interface";
//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";
import { Role } from "src/app/shared/interfaces/role.interface";
import { RoleService } from "src/app/services/roles.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-user-details",
  templateUrl: "./user-details.component.html",
  styleUrls: ["./user-details.component.css"],
})
export class UserDetailsComponent implements OnInit {
  user: User;
  userId: string;
  userName: string;
  selectedRole: string;
  roles: Role[];
  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private roleService: RoleService,
    private resultDialog: MatDialog,
    private fb: FormBuilder //private confirmationService: ConfirmationService, //private messageService: MessageService
  ) {
    this.userId = this.route.snapshot.paramMap.get("id");
    console.log(this.route.snapshot.paramMap);
    console.log(this.userId);
    this.userService.findUserById(this.userId).subscribe(
      (res) => {
        this.user = res["data"];
        this.selectedRole = this.user.role;
        console.log("1");
        console.log(this.selectedRole);
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("inside findUserById ");
        this.userName = this.user.userName;
        this.form.controls.firstName.setValue(this.user.firstName);
        this.form.controls.lastName.setValue(this.user.lastName);
        this.form.controls.phoneNumber.setValue(this.user.phoneNumber);
        this.form.controls.address.setValue(this.user.address);
        this.form.controls.email.setValue(this.user.email);
        this.form.controls.role.setValue(this.selectedRole);
        console.log(this.user.role["role"]);
        console.log(this.form.controls.role.value);
      }
    );

    this.roleService.findAllRoles().subscribe(
      (res) => {
        this.roles = res["data"];
        console.log(this.roles);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([Validators.required])],
      phoneNumber: [null, Validators.compose([])],
      address: [null, Validators.compose([])],
      email: [null, Validators.compose([Validators.email])],
      role: [null, Validators.compose([Validators.required])],
      password: [
        null,
        Validators.compose([
          Validators.pattern("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"),
        ]),
      ],
    });
  }

  saveUser(): void {
    const updatedUser: User = {
      firstName: this.form.controls.firstName.value,
      lastName: this.form.controls.lastName.value,
      phoneNumber: this.form.controls.phoneNumber.value,
      address: this.form.controls.address.value,
      email: this.form.controls.email.value,
      role: this.form.controls.role.value,
      password: this.form.controls.password.value
    };
    console.log(updatedUser);
    this.userService.updateUser(this.userId, updatedUser).subscribe(
      (res) => {
        this.router.navigate(["/users"]);
      },
      (err) => {
        console.log(err);
      },
      () => {
        //alert("User information is updated.");
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Информация о пользователе успешно обновлена.",
          },
          disableClose: true,
          width: "fit-content",
        });
      }
    );
  }

  cancel(): void {
    this.router.navigate(["/users"]);
    //alert("User information is canceled.");
    this.resultDialog.open(ConfirmationDialogComponent, {
      data: {
        message: "Вы отменили обновление.",
      },
      disableClose: true,
      width: "fit-content",
    });
  }
}
