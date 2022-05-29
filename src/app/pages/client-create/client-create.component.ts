/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: April 24, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop client-create component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Client } from "src/app/shared/interfaces/client.interface";
import { ClientService } from "src/app/services/client.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-client-create",
  templateUrl: "./client-create.component.html",
  styleUrls: ["./client-create.component.css"],
})
export class ClientCreateComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clientService: ClientService,
    private resultDialog: MatDialog
  ) {}

  ngOnInit() {
    // validations
    this.form = this.fb.group({
      firstName: [null, Validators.compose([Validators.required])],
      patronymic: [null],
      lastName: [null],
      gender: [null, Validators.compose([Validators.required])],
      email: [null],
      phoneNumber: [null],
      whatsApp: [null],
      telegram: [null],
      vKontakte: [null],
      instagram: [null],
      facebook: [null],
      country: [null],
      region: [null],
      city: [null],
      nameDay: [false, Validators.compose([Validators.required])],
      comments: [null],
      institute: [null],
      correspondent: [null],
      coordinator: [null],
      isRestricted: [false, Validators.compose([Validators.required])],
    });
  }

  // create function for new clients
  create() {
    const newClient = {} as Client;

    newClient.firstName = this.form.controls.firstName.value;
    newClient.patronymic = this.form.controls.patronymic.value;
    newClient.lastName = this.form.controls.lastName.value;
    newClient.gender = this.form.controls.gender.value;
    newClient.email = this.form.controls.email.value;
    newClient.phoneNumber = this.form.controls.phoneNumber.value;
    newClient.whatsApp = this.form.controls.whatsApp.value;

    newClient.telegram = this.form.controls.telegram.value;
    newClient.vKontakte = this.form.controls.vKontakte.value;
    newClient.instagram = this.form.controls.instagram.value;
    newClient.facebook = this.form.controls.facebook.value;
    newClient.country = this.form.controls.country.value;
    newClient.region = this.form.controls.region.value;
    newClient.city = this.form.controls.city.value;

    newClient.nameDay = this.form.controls.nameDay.value;
    newClient.comments = this.form.controls.comments.value;
    newClient.institute = this.form.controls.institute.value;
    newClient.correspondent = this.form.controls.correspondent.value;
    newClient.coordinator = this.form.controls.coordinator.value;
    newClient.isRestricted = this.form.controls.isRestricted.value;



    // createClient service method to make network call to create client
    this.clientService.createClient(newClient).subscribe(
      (res) => {
        this.router.navigate(["/clients"]);
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Новый аккаунт пользователя был успешно создан.",
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
    this.router.navigate(["/clients"]);
  }
}
