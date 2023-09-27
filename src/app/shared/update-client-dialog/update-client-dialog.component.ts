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
import { Client } from "src/app/shared/interfaces/client.interface";
import { ClientService } from "src/app/services/client.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { countries } from "server/models/countries-list.js";
import { OrderService } from "src/app/services/order.service";
import { SeniorsService } from "src/app/services/seniors.service";
import { ConfirmationService } from "primeng/api";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-update-client-dialog",
  templateUrl: "./update-client-dialog.component.html",
  styleUrls: ["./update-client-dialog.component.css"],
})
export class UpdateClientDialogComponent implements OnInit {
  userName: string;
  updatedContact: string;

  //
  client: Client;
  clientId: string;
  clientName: string;
  form: FormGroup;
  countries = countries;
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
  doubles = [];
  readonly = true;
  listOfCoordinators = "";
  listOfPublishers = "";

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private clientService: ClientService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private orderService: OrderService,
    private seniorsService: SeniorsService,
    private confirmationService: ConfirmationService,
    private dialogRef: MatDialogRef<UpdateClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.userName = data.userName;
    this.clientId = data.id;

    this.form = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      patronymic: [null],
      lastName: [null],
      institutes: this.formBuilder.array([]),
      contacts: this.formBuilder.group({
        email: [null, Validators.compose([Validators.email])],
        phoneNumber: [
          null,
          Validators.compose([this.phoneNumberFormatValidator()]),
        ],
        whatsApp: [
          null,
          Validators.compose([this.phoneNumberFormatValidator()]),
        ],
        telegram: [null, Validators.compose([this.telegramFormatValidator()])],
        vKontakte: [
          null,
          Validators.compose([this.vKontakteFormatValidator()]),
        ],
        instagram: [null, Validators.compose([this.instaFormatValidator()])],
        facebook: [null, Validators.compose([this.fbFormatValidator()])],
        otherContact: [null],
      }),
      country: [null],
      region: [null],
      city: [null],
      publishers: [false],
      comments: [null],
      correspondents: this.formBuilder.array([]),
      isRestricted: [false],
    });
    this.form.get("contacts").setValidators(this.minValidator());

    this.clientService.findClientById(this.clientId).subscribe(
      (res) => {
        this.client = res["data"];
        console.log("this.client");
        console.log(this.client);
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("inside findClientById ");
        this.form.controls.publishers.setValue(
          this.client.publishers.includes(this.userName)
        );
        this.form.controls.firstName.setValue(this.client.firstName);
        this.form.controls.patronymic.setValue(this.client.patronymic);
        this.form.controls.lastName.setValue(this.client.lastName);
        if (this.client.institutes.length > 0) {
          for (let institute of this.client.institutes) {
            const group = this.formBuilder.group({
              name: new FormControl({ value: null }, Validators.required),
              category: new FormControl({ value: null }, Validators.required),
            });
            group.controls.name.setValue(institute.name);
            group.controls.category.setValue(institute.category);
            // console.log(group);
            this.institutes.push(group);
          }
        }
        this.contacts.controls.email.setValue(this.client.email);
        this.contacts.controls.phoneNumber.setValue(this.client.phoneNumber);
        this.contacts.controls.whatsApp.setValue(this.client.whatsApp);
        this.contacts.controls.telegram.setValue(this.client.telegram);
        this.contacts.controls.vKontakte.setValue(this.client.vKontakte);
        this.contacts.controls.instagram.setValue(this.client.instagram);
        this.contacts.controls.facebook.setValue(this.client.facebook);
        this.contacts.controls.otherContact.setValue(this.client.otherContact);
        this.form.controls.country.setValue(this.client.country);
        this.form.controls.region.setValue(this.client.region);
        this.form.controls.city.setValue(this.client.city);

        if (this.client.correspondents.length > 0) {
          let index = 0;
          for (let correspondent of this.client.correspondents) {
            const group = this.formBuilder.group({
              nursingHome: new FormControl(
                { value: null },
                Validators.required
              ),
              fullName: new FormControl({ value: null }, Validators.required),
            });
            group.controls.nursingHome.setValue(correspondent.nursingHome);
            let nursingHome = correspondent.nursingHome;
            this.seniorsService.findSeniorsFromOneHome(nursingHome).subscribe(
              (res) => {
                console.log('res["data"]');
                console.log(res["data"]);
                let seniorsData = res["data"];
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
            group.controls.fullName.setValue(correspondent.fullName);

            // group.controls.fullName.setValue(correspondent.fullName);
            //group.controls.fullName.setValue( correspondent.fullName.lastName + ' ' + correspondent.fullName.firstName + ' ' + correspondent.fullName.patronymic +
            //' ' + correspondent.fullName.yearBirthday);
            console.log("group.controls.fullName.value");
            console.log(group.controls.fullName.value);
            this.correspondents.push(group);
          }
        }

        //this.form.controls.nameDay.setValue(this.client.nameDay);
        this.form.controls.comments.setValue(this.client.comments);

        //  this.form.controls.coordinators.setValue(this.client.coordinators);
        if (this.client.coordinators.length > 0) {
          for (let coordinator of this.client.coordinators) {
            this.listOfCoordinators =
              this.listOfCoordinators + " " + coordinator;
          }
        }

        if (this.client.publishers.length > 0) {
          for (let publisher of this.client.publishers) {
            this.listOfPublishers = this.listOfPublishers + " " + publisher;
          }
        }

        this.form.controls.isRestricted.setValue(this.client.isRestricted);
        if (this.client.isRestricted) {
          this.form.addControl(
            "causeOfRestriction",
            new FormControl(null, Validators.required)
          );
          this.form.addControl(
            "preventiveAction",
            new FormControl(null, Validators.required)
          );
          this.form.controls.causeOfRestriction.setValue(
            this.client.causeOfRestriction
          );
          this.form.controls.preventiveAction.setValue(
            this.client.preventiveAction
          );
        }
      }
    );
  }

  get contacts() {
    return this.form.get("contacts") as FormGroup;
  }

  get institutes() {
    return this.form.get("institutes") as FormArray;
  }

  get correspondents() {
    return this.form.get("correspondents") as FormArray;
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

  ngOnInit(): void {
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

  saveClient(): void {
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
    let publishers: string[] = this.client.publishers;
    if (
      this.form.controls.publishers.value &&
      !this.client.publishers.includes(this.userName)
    ) {
      publishers.push(this.userName);
    }
    if (
      !this.form.controls.publishers.value &&
      this.client.publishers.includes(this.userName)
    ) {
      let i = publishers.indexOf(this.userName);
      publishers.splice(i, 1);
    }

    /*     let coordinators : string[] = this.client.coordinators;
    if (!this.client.coordinators.includes(this.userName)) {
      coordinators.push(this.userName);
    }
 */

    //create a function

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
    newClient.coordinators = [this.userName];
    newClient.publishers = publishers;
    newClient.isRestricted = this.form.controls.isRestricted.value;
    newClient.causeOfRestriction = this.form.controls.isRestricted.value
      ? this.form.controls.causeOfRestriction.value
      : null;
    newClient.preventiveAction = this.form.controls.isRestricted.value
      ? this.form.controls.preventiveAction.value
      : null;

    let changes = {
      userName: this.userName,
      date: new Date(),
      changed: [],
    };

    console.log("this.client");
    console.log(this.client);
    console.log("newClient");
    console.log(newClient);

    let changesDetails = this.checkChanges(this.client, newClient);
    if (changesDetails.length > 0) {
      changes.changed = changesDetails;
      this.client.whatChanged.push(changes);
    }

    newClient.whatChanged = this.client.whatChanged;

    this.clientService.checkDoubleClient(newClient, this.clientId).subscribe(
      (res) => {
        this.doubles = res.data;
        console.log("res.data");
        console.log(res.data);

        if (this.doubles.length == 0) {
          this.clientService.updateClient(this.clientId, newClient).subscribe(
            (res) => {
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: "Карточка пользователя была успешно обновлена.",
                },
                disableClose: true,
                width: "fit-content",
              });

              this.data.updatedClient = res.data;
              this.dialogRef.close(this.data);
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
        } else {
          let doublesId = "";
          for (let client of this.doubles) {
            doublesId = doublesId + client._id + " ";
          }
          this.resultDialog.open(ConfirmationDialogComponent, {
            data: {
              message:
                "К сожалению, контакт c id" +
                this.clientId +
                " не может быть обновлен, потому что найдены дубли с id: " +
                doublesId +
                ". Cообщите, пожалуйста, все id администратору!",
            },
            disableClose: true,
            width: "40%",
          });
        }
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

  checkChanges(oldClient, newClient) {
    let changes = [];
    for (let prop in oldClient) {
      console.log("oldClient[prop]");
      console.log(oldClient[prop]);
      if (
        prop != "correspondents" &&
        prop != "publishers" &&
        prop != "institutes" &&
        prop != "coordinators" &&
        prop != "whatChanged" &&
        prop != "isDisabled" &&
        prop != "__v" &&
        prop != "_id" &&
        prop != "creator" &&
        prop != "dateCreated" &&
        prop != "nameDayCelebration"
      ) {
        if (oldClient[prop] != newClient[prop]) {
          changes.push({
            [prop + "Old"]: oldClient[prop],
            [prop + "New"]: newClient[prop],
          });
        }
      }
      if (
        prop == "correspondents" ||
        prop == "publishers" ||
        prop == "institutes" ||
        prop == "coordinators"
      ) {
        if (oldClient[prop].length != newClient[prop].length) {
          changes.push({
            [prop + "Old"]: oldClient[prop],
            [prop + "New"]: newClient[prop],
          });
        } else {
          if (prop == "publishers" || prop == "coordinators") {
            for (let item of oldClient[prop]) {
              if (!newClient[prop].includes(item)) {
                changes.push({
                  [prop + "Old"]: oldClient[prop],
                  [prop + "New"]: newClient[prop],
                });
                break;
              }
            }
          }
          if (prop == "correspondents") {
            for (let cor of oldClient[prop]) {
              let index = newClient[prop].findIndex(
                (item) => item.fullName == cor.fullName
              );
              if (index == -1) {
                changes.push({
                  [prop + "Old"]: oldClient[prop],
                  [prop + "New"]: newClient[prop],
                });
                break;
              } else {
                if (cor.nursingHome != newClient[prop][index].nursingHome) {
                  changes.push({
                    [prop + "Old"]: oldClient[prop],
                    [prop + "New"]: newClient[prop],
                  });
                  break;
                }
              }
            }
          }
          if (prop == "institutes") {
            for (let ins of oldClient[prop]) {
              let index = newClient[prop].findIndex(
                (item) => item.name == ins.name
              );
              if (index == -1) {
                changes.push({
                  [prop + "Old"]: oldClient[prop],
                  [prop + "New"]: newClient[prop],
                });
                break;
              } else {
                if (ins.category != newClient[prop][index].category) {
                  changes.push({
                    [prop + "Old"]: oldClient[prop],
                    [prop + "New"]: newClient[prop],
                  });
                  break;
                }
              }
            }
          }
        }
      }
    }
    return changes;
  }

/*   edit(): void {
    this.readonly = false;
  } */
/* 
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
  } */

  close(): void {
    this.dialogRef.close();
  }
}
