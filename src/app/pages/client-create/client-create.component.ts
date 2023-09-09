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
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { Client } from "src/app/shared/interfaces/client.interface";
import { ClientService } from "src/app/services/client.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { countries } from "server/models/countries-list.js";
import { OrderService } from "src/app/services/order.service";
import { SeniorsService } from "src/app/services/seniors.service";

@Component({
  selector: "app-client-create",
  templateUrl: "./client-create.component.html",
  styleUrls: ["./client-create.component.css"],
})
export class ClientCreateComponent implements OnInit {
  userName: string;
  countries = countries;
  publishers: string[] = [];
  categories = [
    "образовательное учреждение",
    "коммерческая организация",
    "бюджетное учреждение",
    "благотворительная организация",
    "религиозная организация",
    "детский или юношеский коллектив/клуб",
    "взрослые волонтеры",
    "клуб по интересам (взрослые)",
    "прочие организации",
  ];
  nursingHomes = [];
  seniors = [];
  preventiveActions = [
    "выдавать адреса без отметки",
    "выдавать только БОА",
    "выдавать только проверенные адреса",
    "не выдавать адреса",
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private clientService: ClientService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private orderService: OrderService,
    private seniorsService: SeniorsService
  ) {
    this.userName = this.cookieService.get("session_user");
  }

  ngOnInit() {
    this.orderService.getNursingHomes().subscribe(
      async (res) => {
        let nursingHomesList = res["data"]["nursingHomes"];
        for (let home of nursingHomesList) {
          this.nursingHomes.push(home.nursingHome);
        }
      },
      (err) => {
        console.log(err);
      }
    );
    console.log("this.form.controls.isRestricted.value");
    console.log(this.form.controls.isRestricted.value);
  }
  form = this.formBuilder.group({
    firstName: [null, Validators.compose([Validators.required])],
    patronymic: [null],
    lastName: [null],

    /*     institutes: this.formBuilder.array([
      new FormControl("", Validators.minLength(2)),
    ]), */

    institutes: this.formBuilder.array([]),
    // institute:[null],
    // category:[null],

    email: [null, Validators.compose([Validators.email])],
    phoneNumber: [
      null,
      Validators.compose([this.phoneNumberFormatValidator()]),
    ],
    whatsApp: [null, Validators.compose([this.phoneNumberFormatValidator()])],
    telegram: [null, Validators.compose([this.telegramFormatValidator()])],
    vKontakte: [null, Validators.compose([this.vKontakteFormatValidator()])],
    instagram: [null, Validators.compose([this.instaFormatValidator()])],
    facebook: [null, Validators.compose([this.fbFormatValidator()])],
    otherContact: [null],
    country: [null],
    region: [null],
    city: [null],
    publishers: [false],
    //nameDay: [false],
    comments: [null],
    correspondents: this.formBuilder.array([]),
    //coordinator: [null],
    isRestricted: [false],
    // causeOfRestriction: [null],
    // preventiveAction: [null],
    causeOfRestriction: [null],
    preventiveAction: [null],
  });

  handleValidations(){
    if (this.form.controls.isRestricted.value) {
        this.form.get('causeOfRestriction').setValidators([Validators.required]);
        this.form.get('preventiveAction').setValidators([Validators.required]);
    } else {
        this.form.get('causeOfRestriction').setValidators([Validators.nullValidator]);
        this.form.get('preventiveAction').setValidators([Validators.nullValidator]);
    }
    //this.form.controls.causeOfRestriction.setValue(null);
    //this.form.controls.preventiveAction.setValue(null);
    this.form.get('causeOfRestriction').updateValueAndValidity();
    this.form.get('preventiveAction').updateValueAndValidity();
}
  

  get institutes() {
    return this.form.get("institutes") as FormArray;
  }

  get isRestricted() {
    return this.form.get("isRestricted") as FormControl;
  }

  phoneNumberFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneRe = /^((\+7)+([0-9]){10})$/;
      const allowed = phoneRe.test(control.value);
      /*       console.log('control.value');
      console.log(control.value);
      console.log(control.value == null || control.value == ''); */

      return allowed || control.value == null || control.value == ""
        ? null
        : { phoneNumberFormat: true };
    };
  }

  telegramFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneRe = /^((\+7)+([0-9]){10})$/;
      const allowed_phone = phoneRe.test(control.value);
      const allowed_empty = control.value == null || control.value == "";
      const nicknameRe = /^@/;
      const allowed_nickname = nicknameRe.test(control.value);
      const idRe = /^(\#+([0-9]){10})$/;
      const allowed_id = idRe.test(control.value);
      //console.log("control.value");
      //console.log(allowed_phone);
      // console.log(allowed_empty);
      // console.log(allowed_nickname);
      // console.log(allowed_id);

      return allowed_phone || allowed_empty || allowed_nickname || allowed_id
        ? null
        : { telegramFormat: { value: control.value } };
    };
  }

  vKontakteFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const vkRe = /^https:\/\/vk.com\//;
      const allowed = vkRe.test(control.value);
      return allowed || control.value == null || control.value == ""
        ? null
        : { vKontakteFormat: { value: control.value } };
    };
  }

  instaFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const instaRe = /^https:\/\/www.instagram.com\//;
      const allowed = instaRe.test(control.value);
      return allowed || control.value == null || control.value == ""
        ? null
        : { instagramFormat: { value: control.value } };
    };
  }

  fbFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fbRe = /^https:\/\/www.facebook.com\//;
      const allowed = fbRe.test(control.value);
      return allowed || control.value == null || control.value == ""
        ? null
        : { fbFormat: { value: control.value } };
    };
  }

  causeOfRestrictionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isRestricted = control?.root?.get("isRestricted")?.value;
      console.log('isRestricted');
      console.log(isRestricted);

      return !isRestricted || (control.value && isRestricted)
        ? null
        : { causeOfRestriction: { value: true} };
    };
  }

  preventiveActionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isRestricted = control?.root?.get("isRestricted")?.value;

      return !isRestricted || (control.value && isRestricted)
        ? null
        : { preventiveAction: { value: true} };
    };
  }

  addInstituteControl() {
    const group = this.formBuilder.group({
      name: [null],
      category: [null],
    });
    console.log(group);

    this.institutes.push(group);
    console.log(this.institutes);
  }

  deleteInstituteControl(index: number) {
    this.institutes.removeAt(index);
  }

  get correspondents() {
    return this.form.get("correspondents") as FormArray;
  }
  addCorrespondentControl() {
    const group = this.formBuilder.group({
      nursingHome: [null],
      fullName: [null],
    });
    console.log(group);

    this.correspondents.push(group);
    // console.log(this.correspondents);
  }

  deleteCorrespondentControl(index: number) {
    this.correspondents.removeAt(index);
  }

  onSelectHome(index) {
    console.log("this.form");
    console.log(this.form);
    console.log(this.correspondents.getRawValue()[index].nursingHome);
    let nursingHome = this.correspondents.getRawValue()[index].nursingHome;
    this.seniorsService.findSeniorsFromOneHome(nursingHome).subscribe(
      (res) => {
        console.log('res["data"]');
        console.log(res["data"]);
        this.seniors[index] = res["data"].filter(
          (item) => item.dateExit == null
        );
        console.log("this.seniors");
        console.log(this.seniors[index]);
      },
      (err) => {},
      () => {}
    );
  }

  // create function for new clients
  create() {
    const newClient = {} as Client;
    let institutes = this.institutes.getRawValue();    

    for (let institute of institutes) {
      if (institute.name == null) {
        let index = institutes.findIndex((item) => item.name == null);
        institutes.splice(index, 1);
      }
    }

    let correspondents = this.correspondents.getRawValue();    

    

    for (let correspondent of correspondents) {
      if (correspondent.fullName == null) {
        let index = correspondents.findIndex((item) => item.fullName == null);
        correspondents.splice(index, 1);
      }
    }
    let correspondentsFullList = [];
    for (let correspondent of correspondents) {
      correspondentsFullList.push(correspondent.fullName);
    }

    if (this.form.controls.publishers.value) {
      this.publishers.push(this.userName);
    }

    /*let index = -1;
     while (index == -1) {
      index = institutes.findIndex(item => item.name == null);
      institutes.splice(index, 1);
    }   */

    newClient.firstName = this.form.controls.firstName.value;
    newClient.patronymic = this.form.controls.patronymic.value;
    newClient.lastName = this.form.controls.lastName.value;
    newClient.email = this.form.controls.email.value;
    newClient.phoneNumber = this.form.controls.phoneNumber.value;
    newClient.whatsApp = this.form.controls.whatsApp.value;
    newClient.telegram = this.form.controls.telegram.value;
    newClient.vKontakte = this.form.controls.vKontakte.value;
    newClient.instagram = this.form.controls.instagram.value;
    newClient.facebook = this.form.controls.facebook.value;
    newClient.otherContact = this.form.controls.otherContact.value;
    newClient.country = this.form.controls.country.value;
    newClient.region = this.form.controls.region.value;
    newClient.city = this.form.controls.city.value;
    //newClient.nameDayCelebration = this.form.controls.nameDay.value;
    newClient.comments = this.form.controls.comments.value;
    newClient.institutes = institutes;
    newClient.correspondents = correspondentsFullList;
    newClient.coordinators = [];
    newClient.publishers = this.publishers;
    newClient.isRestricted = this.form.controls.isRestricted.value;
    newClient.causeOfRestriction =this.form.controls.isRestricted.value ? this.form.controls.causeOfRestriction.value : null;
    newClient.preventiveAction = this.form.controls.isRestricted.value ? this.form.controls.preventiveAction.value : null;

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
