import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
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
import { countries } from "server/models/countries-list.js";
import { OrderService } from "src/app/services/order.service";
import { SeniorsService } from "src/app/services/seniors.service";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: "app-create-client-dialog",
  templateUrl: "./create-client-dialog.component.html",
  styleUrls: ["./create-client-dialog.component.css"],
})
export class CreateClientDialogComponent implements OnInit {
  userName: string;
  newContactType: string;
  newContact: string;

  //
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
  form: FormGroup;
  doubles = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private clientService: ClientService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private orderService: OrderService,
    private seniorsService: SeniorsService,
    private confirmationService: ConfirmationService,
    private dialogRef: MatDialogRef<CreateClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.userName = data.userName;
    this.newContactType = data.newContactType;
    this.newContact = data.newContact;

    this.form = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      patronymic: [null],
      lastName: [null],
      institutes: this.formBuilder.array([]),
      contacts: this.formBuilder.group({
        email: [
          this.newContactType == "email" ? this.newContact : null,
          Validators.compose([Validators.email]),
        ],
        phoneNumber: [
          this.newContactType == "phoneNumber" ? this.newContact : null,
          Validators.compose([this.phoneNumberFormatValidator()]),
        ],
        whatsApp: [
          this.newContactType == "whatsApp" ? this.newContact : null,
          Validators.compose([this.phoneNumberFormatValidator()]),
        ],
        telegram: [
          this.newContactType == "telegram" ? this.newContact : null,
          Validators.compose([this.telegramFormatValidator()]),
        ],
        vKontakte: [
          this.newContactType == "vKontakte" ? this.newContact : null,
          Validators.compose([this.vKontakteFormatValidator()]),
        ],
        instagram: [
          this.newContactType == "instagram" ? this.newContact : null,
          Validators.compose([this.instaFormatValidator()]),
        ],
        facebook: [
          this.newContactType == "facebook" ? this.newContact : null,
          Validators.compose([this.fbFormatValidator()]),
        ],
        otherContact: [
          this.newContactType == "otherContact" ? this.newContact : null,
        ],
      }),
      country: [null],
      region: [null],
      city: [null],
      publishers: [false],
      //nameDay: [false],
      comments: [null],
      correspondents: this.formBuilder.array([]),
      //coordinator: [null],
      isRestricted: [false],
    });
    this.form.get("contacts").setValidators(this.minValidator());
  }
  get contacts() {
    return this.form.get("contacts") as FormGroup;
  }

  minValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors | null => {
      //const fg = ctrl as FormGroup;
      console.log("group.controls");
      console.log(group.controls);
      const controls = Object.values(group.controls);
      let result;
      if (controls.every((fc) => !fc.value)) {
        // group.setErrors({ noContacts: true });
        result = { noContacts: true };
      } else {
        //group.setErrors(null);
        result = null;
      }
      console.log("group.errors");
      console.log(group.errors);
      return result;
    };
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

  addIfRestricted() {
    if (this.form.controls.isRestricted.value) {
      this.form.addControl(
        "causeOfRestriction",
        new FormControl(null, Validators.required)
      );
      this.form.addControl(
        "preventiveAction",
        new FormControl(null, Validators.required)
      );
    } else {
      this.form.removeControl("causeOfRestriction");
      this.form.removeControl("preventiveAction");
    }
  }

  get institutes() {
    return this.form.get("institutes") as FormArray;
  }
  addInstituteControl() {
    const group = this.formBuilder.group({
      name: [null, [Validators.required]],
      category: [null, [Validators.required]],
    });
    // console.log(group);

    this.institutes.push(group);
    //console.log(this.institutes);
    console.log("contacts.errors");
    console.log(this.contacts.errors);
  }

  deleteInstituteControl(index: number) {
    this.institutes.removeAt(index);
    /*     this.form
        .get("causeOfRestriction")
        .setValidators([Validators.nullValidator]);
      this.form
        .get("preventiveAction")
        .setValidators([Validators.nullValidator]); */
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
      console.log("isRestricted");
      console.log(isRestricted);

      return !isRestricted || (control.value && isRestricted)
        ? null
        : { causeOfRestriction: { value: true } };
    };
  }

  preventiveActionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isRestricted = control?.root?.get("isRestricted")?.value;

      return !isRestricted || (control.value && isRestricted)
        ? null
        : { preventiveAction: { value: true } };
    };
  }

  get correspondents() {
    return this.form.get("correspondents") as FormArray;
  }
  addCorrespondentControl() {
    const group = this.formBuilder.group({
      nursingHome: [null, [Validators.required]],
      fullName: [null, [Validators.required]],
    });
    console.log(group);

    this.correspondents.push(group);
    // console.log(this.correspondents);
  }

  deleteCorrespondentControl(index: number) {
    this.correspondents.removeAt(index);

    /*     this.form
        .get("nursingHome")
        .setValidators([Validators.nullValidator]);
      this.form
        .get("fullName")
        .setValidators([Validators.nullValidator]); */
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
        let seniorsData = res["data"].filter((item) => item.dateExit == null);
        this.seniors[index] = [];
        for (let senior of seniorsData) {
          this.seniors[index].push(
            senior.lastName +
              " " +
              senior.firstName +
              " " +
              senior.patronymic +
              " " +
              senior.yearBirthday
          );
        }

        console.log("this.seniors");
        console.log(this.seniors[index]);
      },
      (err) => {},
      () => {}
    );
  }

  createNewClient() {
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
    /*     let correspondentsFullList = [];
    for (let correspondent of correspondents) {
      correspondentsFullList.push(correspondent.fullName);
    }
 */
    if (this.form.controls.publishers.value) {
      this.publishers.push(this.userName);
    }

    /*let index = -1;
     while (index == -1) {
      index = institutes.findIndex(item => item.name == null);
      institutes.splice(index, 1);
    }   */
    let coordinators = [];
    coordinators.push(this.userName);

    newClient.firstName = this.form.controls.firstName.value;
    newClient.patronymic = this.form.controls.patronymic.value;
    newClient.lastName = this.form.controls.lastName.value;
    newClient.email = this.contacts.controls.email.value;
    newClient.phoneNumber = this.contacts.controls.phoneNumber.value;
    newClient.whatsApp = this.contacts.controls.whatsApp.value;
    newClient.telegram = this.contacts.controls.telegram.value;
    newClient.vKontakte = this.contacts.controls.vKontakte.value;
    newClient.instagram = this.contacts.controls.instagram.value;
    newClient.facebook = this.contacts.controls.facebook.value;
    newClient.otherContact = this.contacts.controls.otherContact.value;
    newClient.country = this.form.controls.country.value;
    newClient.region = this.form.controls.region.value;
    newClient.city = this.form.controls.city.value;
    //newClient.nameDayCelebration = this.form.controls.nameDay.value;
    newClient.comments = this.form.controls.comments.value;
    newClient.institutes = institutes;
    newClient.correspondents = correspondents;
    newClient.coordinators = coordinators;
    newClient.publishers = this.publishers;
    newClient.isRestricted = this.form.controls.isRestricted.value;
    newClient.causeOfRestriction = this.form.controls.isRestricted.value
      ? this.form.controls.causeOfRestriction.value
      : null;
    newClient.preventiveAction = this.form.controls.isRestricted.value
      ? this.form.controls.preventiveAction.value
      : null;
    /*       this.data.newClient = newClient;
      console.log("dialog - this.data.newClient");
      console.log(this.data.newClient); */

    this.clientService.checkDoubleClient(newClient, null).subscribe(
      (res) => {
        this.doubles = res.data;
        console.log("res.data");
        console.log(res.data);

        if (this.doubles.length == 0) {
          this.data.newClient = newClient;
          this.data.noDoubles = true;
          this.dialogRef.close(this.data);
        } else {
          if (this.doubles.length > 1) {
            let doublesId = "";
            for (let client of this.doubles) {
              doublesId = doublesId + client._id + ", ";
            }
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message:
                  "К сожалению, контакт не может быть создан, потому что найдено несколько дублей с id: " +
                  doublesId +
                  "сообщите, пожалуйста, эти id администратору!",
              },
              disableClose: true,
              width: "40%",
            });
          } else {
            console.log("1 double");
            console.log(this.doubles[0]);
            //ОПРЕДЕЛИТЬ ЕСТЬ ИЛИ НЕТ РАСХОЖДЕНИЙ В ДАННЫХ.
            //если нет, то просто сообщить, что пользуйтесь старым + объединить инст, пабл, коорд, корресп
            //если есть, то предложить объединить с выбором вариантов

            const email = this.doubles[0].email
              ? "email: " + this.doubles[0].email + ", "
              : "";
            const phoneNumber = this.doubles[0].phoneNumber
              ? "phoneNumber: " + this.doubles[0].phoneNumber + ", "
              : "";
            const whatsApp = this.doubles[0].whatsApp
              ? "whatsApp: " + this.doubles[0].whatsApp + ", "
              : "";
            const telegram = this.doubles[0].telegram
              ? "telegram: " + this.doubles[0].telegram + ", "
              : "";
            const vKontakte = this.doubles[0].vKontakte
              ? "vKontakte: " + this.doubles[0].vKontakte + ", "
              : "";
            const instagram = this.doubles[0].instagram
              ? "instagram: " + this.doubles[0].instagram + ", "
              : "";
            const facebook = this.doubles[0].facebook
              ? "facebook: " + this.doubles[0].facebook + ", "
              : "";
            const otherContact = this.doubles[0].otherContact
              ? "другой контакт: " + this.doubles[0].otherContact + ". "
              : "";

            let foundClient =
              this.doubles[0].firstName +
              " " +
              (this.doubles[0].patronymic
                ? this.doubles[0].patronymic + " "
                : "") +
              (this.doubles[0].lastName ? this.doubles[0].lastName + " " : "") +
              email +
              phoneNumber +
              whatsApp +
              telegram +
              vKontakte +
              instagram +
              facebook +
              otherContact;

            console.log("foundClient[foundClient.length-1]");
            console.log(foundClient[foundClient.length - 1]);
            if (foundClient[foundClient.length - 2] == ",") {
              console.log("foundClient[foundClient.length-1]");
              console.log(foundClient[foundClient.length - 1]);
              foundClient = foundClient.slice(0, foundClient.length - 2) + ". ";
            }

            this.confirmationService.confirm({
              message:
                "Пользователь с такими контактами уже существует: " +
                foundClient +
                "Вы хотите открыть существующую карточку?",
              accept: () => {
                this.confirmationService.close();
                this.data.newClient = newClient;
                this.data.noDoubles = false;
                this.data.doubleId = this.doubles[0]._id;
                this.dialogRef.close(this.data);

              },
              reject: () => {},
            });
          }
        }
      },
      (err) => {
        console.log(err);
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: err.error.msg,
          },
       
          width: "fit-content",
        });
      }
    );
  }



  close(): void {
    this.dialogRef.close();
  }
}
