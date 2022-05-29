/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: May 5, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop user-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";
import { User } from "src/app/shared/interfaces/user.interface";
import { Role } from "src/app/shared/interfaces/role.interface";
import { RoleService } from "src/app/services/roles.service";
import { CookieService } from "ngx-cookie-service";
import { HttpClient } from "@angular/common/http";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";
//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  user: User;
  userId: string;
  userName: string;
  roles: Role[];
  name: string;
  selectedRole: string;
  selectedIndex: number = 0;

  readonly: Boolean;
  edit: Boolean;
  isFilled: string;
  errorMessage: string;

  form: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private resultDialog: MatDialog,
    private cookieService: CookieService, //private confirmationService: ConfirmationService, //private messageService: MessageService
    private userService: UserService,
    private roleService: RoleService,
    private http: HttpClient
  ) {
    this.userName = this.cookieService.get("session_user");
    //console.log(this.route.snapshot.paramMap);
    console.log(this.userName);
    this.readonly = true;
    this.edit = false;
    this.isFilled = "";
  }

  ngOnInit(): void {
    //Edit user profile form
    this.form = this.fb.group({
      userName: [null, Validators.compose([])],
      firstName: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([Validators.required])],
      phoneNumber: [null, Validators.compose([])],
      address: [null, Validators.compose([])],
      email: [null, Validators.compose([Validators.email])],
      role: [null, Validators.compose([])],
    });

    // User profile: set values to form
    this.userService.findUserByUserName(this.userName).subscribe(
      (res) => {
        this.user = res["data"];
        this.userId = this.user._id;
        this.selectedRole = this.user.role;
        console.log("1");
        console.log(this.selectedRole);
      },
      (err) => {
        console.log(err);
      },
      () => {
        this.form.controls.userName.setValue(this.user.userName);
        this.form.controls.firstName.setValue(this.user.firstName);
        this.form.controls.lastName.setValue(this.user.lastName);
        this.form.controls.phoneNumber.setValue(this.user.phoneNumber);
        this.form.controls.address.setValue(this.user.address);
        this.form.controls.email.setValue(this.user.email);
        this.form.controls.role.setValue(this.user.role);
        console.log(this.user.role);
        console.log(this.form.controls.role.value);
        console.log(this.form.controls.userName.value);
      }
    );

    // Change password form
    this.passwordForm = this.fb.group({
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"),
        ]),
      ],
    });
  }

  // Save updated user information
  saveUser(): void {
    const updatedUser: User = {
      userName: this.form.controls.userName.value,
      firstName: this.form.controls.firstName.value,
      lastName: this.form.controls.lastName.value,
      phoneNumber: this.form.controls.phoneNumber.value,
      address: this.form.controls.address.value,
      email: this.form.controls.email.value,
      role: this.form.controls.role.value,
    };
    console.log(updatedUser);
    this.userService.updateUser(this.userId, updatedUser).subscribe(
      (res) => {
        this.edit = false;
        this.readonly = true;
        this.isFilled = "";
        this.cookieService.set("session_user", res["data"].userName, 1);
        // Need to be able to send lastName and firstName to home page to display in menu.

        sessionStorage.setItem(
          "name",
          `${res["data"].firstName} ${res["data"].lastName}`
        );
      },
      (err) => {
        console.log(err);
      },
      () => {
        //alert("User information is updated.");
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Профиль пользователя успешно обновлен.",
          },
          disableClose: true,
          width: "fit-content",
        });
      }
    );
  }

  // Cancel editing user information
  cancelProfile(): void {
    this.edit = false;
    this.readonly = true;
    this.isFilled = "";
    //alert("User information is canceled.");
    this.resultDialog.open(ConfirmationDialogComponent, {
      data: {
        message: "Вы отменили обновление профиля.",
      },
      disableClose: true,
      width: "fit-content",
    });
  }

  // Save new password
  resetPassword(): void {
    console.log(this.passwordForm.controls["password"].value);
    this.http
      .post("/api/session/users/" + this.userName + "/reset-password", {
        password: this.passwordForm.controls["password"].value,
      })
      .subscribe(
        (res) => {
          //this.router.navigate(["/"]);
          this.router
            .navigateByUrl("/about", { skipLocationChange: true })
            .then(() => {
              this.router.navigate(["/users/user/profile"]);
            });
          console.log(res);
        },
        (err) => {
          console.log(err);
        },
        () => {
          //alert("New password is saved.");

          this.router
            .navigateByUrl("/about", { skipLocationChange: true })
            .then(() => {
              this.router.navigate(["/users/user/profile"]);
            });

          this.resultDialog.open(ConfirmationDialogComponent, {
            data: {
              message: "Пароль был успешно изменен.",
            },
            disableClose: true,
            width: "fit-content",
          });
        }
      );
  }

  // Make user information fields editable
  editProfile(): void {
    this.edit = true;
    this.readonly = false;
    this.isFilled = "fill";
  }

  // Exit form
  exit(): void {
    this.router.navigate(["/"]);
  }
}
