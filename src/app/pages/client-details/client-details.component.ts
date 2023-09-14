/*
============================================
client-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ClientService } from "src/app/services/client.service";
import { Client } from "src/app/shared/interfaces/client.interface";
//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";
import { Role } from "src/app/shared/interfaces/role.interface";
import { RoleService } from "src/app/services/roles.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-client-details",
  templateUrl: "./client-details.component.html",
  styleUrls: ["./client-details.component.css"],
})
export class ClientDetailsComponent implements OnInit {
  client: Client;
  clientId: string;
  clientName: string;
  selectedRole: string;
  roles: Role[];
  form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private roleService: RoleService,
    private resultDialog: MatDialog,
    private fb: FormBuilder //private confirmationService: ConfirmationService, //private messageService: MessageService
  ) {
    this.clientId = this.route.snapshot.paramMap.get("id");
    console.log(this.route.snapshot.paramMap);
    console.log(this.clientId);
    this.clientService.findClientById(this.clientId).subscribe(
      (res) => {
        this.client = res["data"];
        console.log("1");

      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("inside findClientById ");

        this.form.controls.firstName.setValue(this.client.firstName);
        this.form.controls.patronymic.setValue(this.client.patronymic);
        this.form.controls.lastName.setValue(this.client.lastName);
      //  this.form.controls.gender.setValue(this.client.gender);
        this.form.controls.email.setValue(this.client.email);
        this.form.controls.phoneNumber.setValue(this.client.phoneNumber);
        this.form.controls.whatsApp.setValue(this.client.whatsApp);
        this.form.controls.telegram.setValue(this.client.telegram);
        this.form.controls.vKontakte.setValue(this.client.vKontakte);
        this.form.controls.instagram .setValue(this.client.instagram);
        this.form.controls.facebook.setValue(this.client.facebook);
        this.form.controls.country.setValue(this.client.country);
        this.form.controls.region.setValue(this.client.region);
        this.form.controls.city.setValue(this.client.city);
        //this.form.controls.nameDay.setValue(this.client.nameDay);
        this.form.controls.comments.setValue(this.client.comments);
       // this.form.controls.institute.setValue(this.client.institute);
       // this.form.controls.correspondent.setValue(this.client.correspondent);
      //  this.form.controls.coordinator.setValue(this.client.coordinator);
        this.form.controls.isRestricted.setValue(this.client.isRestricted);


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

  saveClient(): void {
    const updatedClient: Client = {
      firstName: this.form.controls.firstName.value,
      patronymic: this.form.controls.patronymic.value,
      lastName: this.form.controls.lastName.value,
      //gender : this.form.controls.gender.value,
      email: this.form.controls.email.value,
      phoneNumber: this.form.controls.phoneNumber.value,
      whatsApp: this.form.controls.whatsApp.value,

      telegram: this.form.controls.telegram.value,
      vKontakte: this.form.controls.vKontakte.value,
      instagram: this.form.controls.instagram.value,
      facebook: this.form.controls.facebook.value,
      country: this.form.controls.country.value,
      region: this.form.controls.region.value,
      city: this.form.controls.city.value,

      //nameDay : this.form.controls.nameDay.value,
      comments: this.form.controls.comments.value,
      // institute : this.form.controls.institute.value,
      // correspondent : this.form.controls.correspondent.value,
      //coordinator : this.form.controls.coordinator.value,
      isRestricted: this.form.controls.isRestricted.value,
      otherContact: "",
      nameDayCelebration: false,
      causeOfRestriction: "",
      preventiveAction: [],
      isDisabled: false
    };
    console.log(updatedClient);
    this.clientService.updateClient(this.clientId, updatedClient).subscribe(
      (res) => {
        this.router.navigate(["/clients"]);
      },
      (err) => {
        console.log(err);
      },
      () => {
        //alert("Client information is updated.");
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
    this.router.navigate(["/clients"]);
    //alert("Client information is canceled.");
    this.resultDialog.open(ConfirmationDialogComponent, {
      data: {
        message: "Вы отменили обновление.",
      },
      disableClose: true,
      width: "fit-content",
    });
  }
}