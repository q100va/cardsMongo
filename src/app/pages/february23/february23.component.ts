import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ConfirmationService } from "primeng/api";
import { OrderService } from "src/app/services/order.service";
import { ClientService } from "src/app/services/client.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { LineItem } from "src/app/shared/interfaces/line-item.interface";
import { Order } from "src/app/shared/interfaces/order.interface";
import { Clipboard } from "@angular/cdk/clipboard";
import { Observable } from "rxjs/internal/Observable";
import { map, startWith } from "rxjs/operators";
import { error } from "protractor";
import { of } from "rxjs/internal/observable/of";
import { Client } from "src/app/shared/interfaces/client.interface";
import { CreateClientDialogComponent } from "src/app/shared/create-client-dialog/create-client-dialog.component";
import { UpdateClientDialogComponent } from "src/app/shared/update-client-dialog/update-client-dialog.component";

@Component({
  selector: "app-february23",
  templateUrl: "./february23.component.html",
  styleUrls: ["./february23.component.css"],
})
export class February23Component implements OnInit {
  order: Order;
  userName: string;
  form: FormGroup;
  holiday: string = "23 февраля 2025";
  lineItems = [];
  types: Array<string> = [
    "email",
    "phoneNumber",
    "whatsApp",
    "telegram",
    "vKontakte",
    "instagram",
    "facebook",
    "otherContact",
  ];
  defaultType = this.types[0];
  orderDate: string = new Date().toLocaleDateString();
  counter: Array<number> = [];
  successMessage: string = "";
  errorMessage: string = "";
  canSave: Boolean = false;
  ready: Boolean = false;
  order_id: any;
  contactReminder: string = "";
  clientFirstName: string = "";
  spinner: Boolean = false;
  clicked: Boolean = false;
  useProportion: Boolean = false;
  showMaxNoAddress: Boolean = true;
  showMaxOneHouse: Boolean = true;
  addressFilter: string = "any";
  genderFilter: string = "any";
  showIndexes = false;
  showInstruction = false;
  showInstructionForSubscribers = false;
  showListOfHouses: Boolean = true;
  showChoiceSpareRegions = false;
  regions = [];
  nursingHomes = [];
  // activeRegions = [];
  activeNursingHomes = [];
  actualYear = new Date().getFullYear();
  addresses: HTMLElement;
  isMainMonth = true;
  isNextMonth = false;
  isBeforeMonth = false;
  options = [];
  fullOptions = [];
  //inputContact = null;
  filteredOptions: Observable<string[]>;
  //isFirstEnter = true;
  clientInstitutes = [];
  client: Client;
  previousClient = "";
  newClient: Client;
  doubles = [];
  selectedInstitutes = [];
  showFilter = true;
  isForInstitutes = false;
  hideAll = false;
  isParcelAvailable = false;

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private orderService: OrderService,
    private clientService: ClientService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private clipboard: Clipboard,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.userName = this.cookieService.get("session_user");
  }

  ngOnInit(): void {
    this.orderService.getContacts("email").subscribe(
      async (res) => {
        // this.options = res.data['contacts'];
        console.log("res.data");
        console.log(res.data);
        this.fullOptions = res.data["contacts"];
        for (let client of res.data["contacts"]) {
          this.options.push(client.email.toLowerCase());
        }
        // this.filteredOptions = of([]);
        //console.log("this.options");
        // console.log(this.options);

        this.form.controls.contact.setValue("");
      },
      (err) => {
        this.errorMessage = err.error.msg + " " + err.message;
        console.log(err);
      }
    );
    this.orderService.getNursingHomes().subscribe(
      async (res) => {
        this.nursingHomes = res["data"]["nursingHomes"];
        this.activeNursingHomes = res["data"]["nursingHomes"];
        this.regions = res["data"]["regions"];
        //  this.activeRegions = res["data"]["regions"];
      },
      (err) => {
        console.log(err);
      }
    );

    this.form = this.fb.group({
      clientFirstName: [null],
      clientPatronymic: [null],
      clientLastName: [null],
      //email: [null, Validators.compose([Validators.email])],
      contactType: [this.defaultType],
      contact: [null, [Validators.required]],
      // institute: [null],
      institutes: this.fb.array([]),
      amount: [
        null,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      isAccepted: [false],
      source: [null, Validators.compose([Validators.required])],
      comment: [null],
      femaleAmount: [null, [Validators.min(1)]],
      maleAmount: [null, [Validators.min(1)]],
      year1: [null, [Validators.min(1900), Validators.max(this.actualYear)]],
      year2: [null, [Validators.min(1900), Validators.max(this.actualYear)]],
      date1: [null, [Validators.min(1), Validators.max(31)]],
      date2: [null, [Validators.min(1), Validators.max(31)]],
      region: [null],
      spareRegions: [false],
      nursingHome: [null],
      maxOneHouse: [null, [Validators.min(1)]],
      maxNoAddress: [null, [Validators.min(1)]],
      onlyWithPicture: [false],
      onlyAnniversaries: [false],
      onlyAnniversariesAndOldest: [false],
      nameOfInstitute: [null],
      categoryOfInstitute: [null],
      noNames: [false],
      minNumberOfHouses: [false],
      onlyWithConcent: [false],
    });

    /*     this.filteredOptions = this.form.controls.contact.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value || ""))
    ); */
  }
  private addCheckboxes() {
    this.clientInstitutes.forEach(() =>
      this.institutes.push(new FormControl(false))
    );
  }

  /*   private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
  

    let result = this.options.filter((option) => option.includes(filterValue));
    return result;
  } */
  /*     console.log("value");
    console.log(value);
    console.log("this.options");
    console.log(this.options); */
  get institutes() {
    return this.form.get("institutes") as FormArray;
  }
  getContacts(afterCreation) {
    this.orderService
      .getContacts(this.form.controls.contactType.value)
      .subscribe(
        async (res) => {
          // this.options = res.data['contacts'];
          //console.log("res.data");
          //console.log(res.data);
          this.fullOptions = res.data["contacts"];
          this.options = [];
          for (let client of res.data["contacts"]) {
            this.options.push(
              client[this.form.controls.contactType.value].toLowerCase()
            );
          }
          // console.log("this.options");
          // console.log(this.options);
          if (!afterCreation) {
            this.form.controls.contact.setValue("");
            this.client = undefined;
            this.previousClient = "";
          }
          // this.filteredOptions = this.options;
        },
        (err) => {
          this.errorMessage = err.error.msg + " " + err.message;
          console.log(err);
        }
      );
  }

  checkContactTimeOut() {
    setTimeout(() => {
      //console.log("this.previousClient");
      //console.log(this.previousClient);
      //console.log("checkContact");
      // console.log(this.form.controls.contact.value);
      //console.log(this.options);
      /*       console.log(
        this.options.includes(this.form.controls.contact.value.toLowerCase())
      ); */

      if (this.form.controls.contact.value) {
        if (
          !this.options.includes(this.form.controls.contact.value.toLowerCase())
        ) {
          this.client = undefined;
          this.previousClient = this.form.controls.contact.value.toLowerCase();
          this.institutes.clear();
          this.confirmationService.confirm({
            message:
              "Поздравляющего с указанным контактом не найдено. Вы хотите созадать для него карточку? (Если нет, проверьте, правильно ли введены данные или произведите поиск по другому типу.)",
            accept: () => {
              this.openCreateClientDialog();
            },
          });
        } else {
          if (
            this.previousClient !=
            this.form.controls.contact.value.toLowerCase()
          ) {
            let index = this.fullOptions.findIndex(
              (item) =>
                item[this.form.controls.contactType.value].toLowerCase() ==
                this.form.controls.contact.value.toLowerCase()
            );
            this.clientService
              .findClientById(this.fullOptions[index]._id)
              .subscribe(
                async (res) => {
                  this.previousClient =
                    this.form.controls.contact.value.toLowerCase();
                  console.log("res.data");
                  console.log(res.data);
                  this.client = res.data;
                  this.clientInstitutes = this.client.institutes;
                  console.log("clientInstitutes");
                  console.log(this.clientInstitutes);
                  this.institutes.clear();
                  this.addCheckboxes();
                },
                (err) => {
                  this.errorMessage = err.error.msg + " " + err.message;
                  console.log(err);
                }
              );
            this.selectedInstitutes = [];
            this.showFilter = true;
            this.isForInstitutes = false;
            this.isParcelAvailable = false;
            this.lineItems = [];
          }
        }
      } else {
        this.client = undefined;
        this.clientInstitutes = [];
        this.previousClient = "";
        this.institutes.clear();
        this.selectedInstitutes = [];
        this.showFilter = true;
        this.isForInstitutes = false;
        this.isParcelAvailable = false;
        this.lineItems = [];
      }
    }, 200);
  }

  openCreateClientDialog(): void {
    const dialogRef = this.dialog.open(CreateClientDialogComponent, {
      data: {
        userName: this.userName,
        newContactType: this.form.controls.contactType.value,
        newContact: this.form.controls.contact.value,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      console.log("result");
      console.log(result);

      if (result.noDoubles) {
        this.newClient = result.newClient;
        this.clientService.createClient(this.newClient).subscribe(
          (res) => {
            this.client = res.data;
            this.clientInstitutes = this.client.institutes;
            this.addCheckboxes();
            this.getContacts(true);
            if (this.client[this.form.controls.contactType.value]) {
              console.log("this.client[this.form.controls.contactType.value]");
              console.log(this.client[this.form.controls.contactType.value]);
              this.form.controls.contact.setValue(
                this.client[this.form.controls.contactType.value]
              );
              console.log("this.form.controls.contact.value");
              console.log(this.form.controls.contact.value);
            } else {
              for (let type of this.types) {
                if (this.client[type]) {
                  this.form.controls.contactType.setValue(type);
                  this.form.controls.contact.setValue(this.client[type]);
                  break;
                }
              }
            }

            this.previousClient = this.form.controls.contact.value;
            this.lineItems = [];
            this.isForInstitutes = false;
            this.isParcelAvailable = false;
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message: "Карточка пользователя была успешно создана.",
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
      } else {
        let doubleId = result.doubleId;
        this.openUpdateClientDialog(doubleId);
      }
    });
  }

  openUpdateClientDialog(doubleId): void {
    const dialogRef = this.dialog.open(UpdateClientDialogComponent, {
      data: {
        userName: this.userName,
        id: doubleId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.client = result.updatedClient;
        this.getContacts(true);
        if (this.client[this.form.controls.contactType.value]) {
          console.log("this.client[this.form.controls.contactType.value]");
          console.log(this.client[this.form.controls.contactType.value]);
          this.form.controls.contact.setValue(
            this.client[this.form.controls.contactType.value]
          );
          console.log("this.form.controls.contact.value");
          console.log(this.form.controls.contact.value);
        } else {
          for (let type of this.types) {
            if (this.client[type]) {
              this.form.controls.contactType.setValue(type);
              this.form.controls.contact.setValue(this.client[type]);
              break;
            }
          }
        }

        this.previousClient = this.form.controls.contact.value;
      }
    });
  }

  saveInstitute() {
    this.clientService
      .addInstitute(
        this.client._id,
        this.form.controls.nameOfInstitute.value,
        this.form.controls.categoryOfInstitute.value,
        this.userName
      )
      .subscribe(
        async (res) => {
          console.log("res.data");
          console.log(res.data);
          this.form.controls.nameOfInstitute.setValue(null);
          this.form.controls.categoryOfInstitute.setValue(null);

          this.clientInstitutes = res.data;
          this.institutes.push(new FormControl(false));
        },
        (err) => {
          console.log(err);
        }
      );
  }

  checkInstitutes() {
    console.log("checkInstitutes");
    this.selectedInstitutes = this.form.value.institutes
      .map((checked, i) => (checked ? this.clientInstitutes[i] : null))
      .filter((v) => v !== null);

    if (this.selectedInstitutes.length > 0) {
      this.showFilter = false;
      console.log(this.selectedInstitutes);
    } else {
      this.showFilter = true;
      this.form.controls.noNames.setValue(false);
      this.form.controls.minNumberOfHouses.setValue(false);
      this.form.controls.onlyWithConcent.setValue(false);
      console.log(this.selectedInstitutes);
    }
  }

  correctProportion(genderValue: string) {
    if (genderValue == "proportion") {
      this.useProportion = true;
    } else {
      this.useProportion = false;
      this.form.controls.femaleAmount.setValue(null),
        this.form.controls.maleAmount.setValue(null);
    }
  }

  correctMaxNoAddress(addressValue: string) {
    if (addressValue == "any" || addressValue == "noReleased") {
      this.showMaxNoAddress = true;
    } else {
      this.showMaxNoAddress = false;
      this.form.controls.maxNoAddress.setValue(null);
    }
  }

  onChangeSpareRegions() {
    this.showListOfHouses = !this.form.controls.spareRegions.value;
    if (!this.showListOfHouses) {
      this.form.controls.nursingHome.setValue(null);
    }
  }

  onChangeNursingHome() {
    if (!this.form.controls.nursingHome.value) {
      this.showMaxOneHouse = true;
      if (this.addressFilter == "any" || "noReleased") {
        this.showMaxNoAddress = true;
      }
    } else {
      this.showMaxOneHouse = false;
      this.form.controls.maxOneHouse.setValue(null);
      //this.form.controls.maxOneHouse.disable();
      this.showMaxNoAddress = false;
      this.form.controls.maxNoAddress.setValue(null);
      //this.form.controls.maxNoAddress.disable();
    }
  }

  onChangeRegion() {
    console.log(this.form.controls.region.value);
    console.log(this.form.controls.nursingHome.value);

    if (!this.form.controls.region.value) {
      this.showChoiceSpareRegions = false;
      this.form.controls.spareRegions.setValue(false);
      this.showListOfHouses = true;
      console.log("no regions were chosen");
      console.log(this.form.controls.region.value);
      this.activeNursingHomes = this.nursingHomes;
    } else {
      this.activeNursingHomes = this.nursingHomes.filter(
        (item) => item.region == this.form.controls.region.value
      );
      this.showChoiceSpareRegions = true;
      if (this.form.controls.nursingHome.value) {
        let activeNursingHome = this.nursingHomes.filter(
          (item) => item.nursingHome == this.form.controls.nursingHome.value
        );
        if (this.form.controls.region.value != activeNursingHome[0].region) {
          this.form.controls.nursingHome.setValue(null);
        }
      }
      console.log(this.activeNursingHomes);
    }
  }

  onChangeMinNumberOfHouses() {
    if (
      this.form.controls.minNumberOfHouses.value ||
      this.form.controls.noNames.value
    ) {
      this.showMaxOneHouse = false;
      this.showMaxNoAddress = false;
      this.hideAll = true;
    }

    if (
      !this.form.controls.minNumberOfHouses.value &&
      !this.form.controls.noNames.value
    ) {
      this.showMaxOneHouse = true;
      this.showMaxNoAddress = true;
      this.hideAll = false;
    }
  }

  onSlideToggleChange(reason: string) {
    if (reason == "onlyAnniversaries") {
      if (
        this.form.controls.onlyAnniversariesAndOldest.value &&
        this.form.controls.onlyAnniversaries.value
      ) {
        this.form.controls.onlyAnniversariesAndOldest.setValue(false);
      }
    }
    if (reason == "onlyAnniversariesAndOldest") {
      if (
        this.form.controls.onlyAnniversariesAndOldest.value &&
        this.form.controls.onlyAnniversaries.value
      ) {
        this.form.controls.onlyAnniversaries.setValue(false);
      }
    }
  }

  onSlideToggleChangeInstruction(reason: string) {
    if (reason == "newMember") {
      if (this.showInstructionForSubscribers && this.showInstruction)
        this.showInstructionForSubscribers = false;
    }
    if (reason == "subscriber") {
      if (this.showInstructionForSubscribers && this.showInstruction)
        this.showInstruction = false;
    }
  }

  /*changeRegionsSelection(event) {
    console.log(this.form.controls.region.value);
    console.log(this.form.controls.nursingHome.value);

    if (!this.form.controls.nursingHome.value) {
      console.log("no home were chosen");
      console.log(this.form.controls.nursingHome.value);
      this.activeRegions = this.regions;
    } else {
      this.activeRegions = this.regions.filter(
        (item) => item.name == this.form.controls.nursingHome.value.region
      );

      console.log(this.activeRegions);
    }

    // if (this.form.controls.nursingHome.value) {
      console.log("homes were chosen");
      let activeNursingHome = this.nursingHomes.filter(
        (item) => item.nursingHome == this.form.controls.nursingHome.value
      ); 

     // this.form.controls.region.setValue(activeNursingHome[0].region);

      // console.log(this.activeNursingHomes);
    
  }*/
  /* 
  exit() {
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите выйти без сохранения заявки?",
      accept: () => {
        this.successMessage = "";
        this.errorMessage = "";
        this.contactReminder = "";
        this.clientFirstName = "";
        this.lineItems = [];
        this.canSave = false;
        this.router.navigate(["/orders/find/" + this.userName]);
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Заявка не была сохранена",
          },
          disableClose: true,
          width: "fit-content",
        });
      },
    });
  } */

  clear(): void {
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.clientFirstName = "";
    this.lineItems = [];
    this.canSave = false;
    this.form.reset();
    this.addressFilter = "any";
    this.genderFilter = "any";

    this.clicked = false;
    this.useProportion = false;
    this.showMaxOneHouse = true;
    this.showMaxNoAddress = true;
    this.showIndexes = false;
    this.showInstruction = false;
    this.showInstructionForSubscribers = false;
    this.holiday = "23 февраля 2025";
    this.isMainMonth = true;
    this.isNextMonth = false;
    this.isBeforeMonth = false;
    this.options = [];
    this.fullOptions = [];
    this.clientInstitutes = [];
    this.client = undefined;
    this.previousClient = "";
    this.form.controls.contactType.setValue(this.defaultType);
    this.showFilter = true;
    this.isForInstitutes = false;
    this.isParcelAvailable = false;
    this.showListOfHouses = true;
    this.hideAll = false;

    this.orderService.getContacts("email").subscribe(
      async (res) => {
        // this.options = res.data['contacts'];
        console.log("res.data");
        console.log(res.data);
        this.fullOptions = res.data["contacts"];
        for (let client of res.data["contacts"]) {
          this.options.push(client.email.toLowerCase());
        }
        // this.filteredOptions = of([]);
        //console.log("this.options");
        // console.log(this.options);

        this.form.controls.contact.setValue("");
      },
      (err) => {
        this.errorMessage = err.error.msg + " " + err.message;
        console.log(err);
      }
    );
  }

  createOrder() {
    this.clicked = true;
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.clientFirstName = "";
    this.lineItems = [];
    this.canSave = false;

    this.selectedInstitutes = this.form.value.institutes
      .map((checked, i) => (checked ? this.clientInstitutes[i] : null))
      .filter((v) => v !== null);

    if (!this.form.controls.contact.value) {
      this.resultDialog.open(ConfirmationDialogComponent, {
        data: {
          message: "Обязательно укажите email или другой возможный контакт!",
        },
        disableClose: true,
        width: "fit-content",
      });
      this.clicked = false;
    } else {
      if (
        !this.options.includes(this.form.controls.contact.value.toLowerCase())
      ) {
        this.confirmationService.confirm({
          message:
            "Заявка не может быть сформирована: поздравляющего с указанным контактом не найдено. Вы хотите созадать для него карточку? (Если нет, проверьте, правильно ли введены данные или произведите поиск по другому типу.",
          accept: () => {
            this.router.navigate([]).then((result) => {
              window.open("#/clients/create/new", "_blank");
            });
          },
        });
        this.clicked = false;
      } else {
        if (
          this.form.controls.nameOfInstitute.value ||
          this.form.controls.categoryOfInstitute.value
        ) {
          this.resultDialog.open(ConfirmationDialogComponent, {
            data: {
              message:
                "Вы не завершили сохранение организации. Сохраните или удалите введенные данные.",
            },
            disableClose: true,
            width: "fit-content",
          });
          this.clicked = false;
        } else {
          if (
            /*  this.selectedInstitutes.length > 0 && */
            this.form.controls.noNames.value ||
            this.form.controls.minNumberOfHouses.value
          ) {
            this.checkDoubles();
          } else {
            console.log(this.selectedInstitutes.length);
            console.log(this.client.institutes.length);

            if (
              (this.client.institutes.length > 0 ||
                this.form.controls.amount.value > 20) &&
              this.selectedInstitutes.length == 0
            ) {
              this.confirmationService.confirm({
                message: "Вы уверены, что эта заявка не для колллектива?",
                accept: () => this.checkIndividualOrder(),
                reject: () => (this.clicked = false),
              });
            } else {
              this.checkIndividualOrder();
            }
          }
        }
      }
    }
  }

  checkIndividualOrder() {
    //console.log(this.form.controls.year2.value);
    //console.log(this.form.controls.year1.value);
    if (
      this.form.controls.year2.value != null &&
      this.form.controls.year1.value != null &&
      this.form.controls.year2.value < this.form.controls.year1.value
    ) {
      this.resultDialog.open(ConfirmationDialogComponent, {
        data: {
          message:
            "Неверно указан период для года рождения: значение 'С' должно быть меньше или равно значению 'ПО'.",
        },
        disableClose: true,
        width: "fit-content",
      });
      this.clicked = false;
      console.log("ERROR");
    } else {
      if (
        this.form.controls.date1.value != null &&
        this.form.controls.date2.value != null &&
        this.form.controls.date2.value < this.form.controls.date1.value
      ) {
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message:
              "Неверно указан период для даты рождения: значение 'С' должно быть меньше или равно значению 'ПО'.",
          },
          disableClose: true,
          width: "fit-content",
        });
        this.clicked = false;
      } else {
        console.log("this.genderFilter");
        console.log(this.genderFilter);

        if (
          this.genderFilter == "proportion" &&
          this.form.controls.femaleAmount.value +
            this.form.controls.maleAmount.value !=
            this.form.controls.amount.value
        ) {
          this.resultDialog.open(ConfirmationDialogComponent, {
            data: {
              message:
                "Количество в пропорции женщин и мужчин должно совпадать с общим количеством.",
            },
            disableClose: true,
            width: "fit-content",
          });
          this.clicked = false;
        } else {
          if (
            this.form.controls.maxOneHouse.value >
              this.form.controls.amount.value ||
            this.form.controls.maxNoAddress.value >
              this.form.controls.amount.value
          ) {
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message:
                  "Max количество адресов из одного дома или из БОА не может быть больше общего количества адресов.",
              },
              disableClose: true,
              width: "fit-content",
            });
            this.clicked = false;
          } else {
            this.checkDoubles();
          }
        }
      }
    }
  }

  checkDoubles() {
    this.orderService.checkDoubleOrder(this.holiday, this.client._id).subscribe(
      async (res) => {
        let result = res["data"];
        console.log("res");
        console.log(res);
        if (!result) {
          if (
            this.form.controls.noNames.value ||
            this.form.controls.minNumberOfHouses.value
          ) {
            // console.log("this.selectedInstitutes.length:" + this.selectedInstitutes.length);
            this.fillInstitutesOrder([], []);
          } else {
            //console.log("this.selectedInstitutes.length:" + this.selectedInstitutes.length);
            this.fillOrder([], []);
          }
        } else {
          let usernameList = "";
          for (let user of result.users) {
            usernameList =
              usernameList.length == 0 ? user : usernameList + ", " + user;
          }
          this.confirmationService.confirm({
            message:
              "Пользователь с такими контактами уже получил адреса на праздник '" +
              this.holiday +
              "' у волонтера(ов): " +
              usernameList +
              ". Вы уверены, что это не дубль?",
            accept: () => {
              if (
                this.form.controls.noNames.value ||
                this.form.controls.minNumberOfHouses.value
              ) {
                // console.log("this.selectedInstitutes.length:" + this.selectedInstitutes.length);
                this.fillInstitutesOrder(result.seniorsIds, []);
              } else {
                //console.log("this.selectedInstitutes.length:" + this.selectedInstitutes.length);
                this.fillOrder(result.seniorsIds, []);
              }
            }, //result.houses
            reject: () => (this.clicked = false),
          });
        }
      },
      (err) => {
        this.errorMessage = err.error.msg + " " + err.message;
        console.log(err);
        this.clicked = false;
      }
    );
  }

  fillInstitutesOrder(prohibitedId: [], restrictedHouses: []) {
    this.spinner = true;

    let newOrder: Order = {
      userName: this.userName,
      holiday: this.holiday,
      clientId: this.client._id,
      clientFirstName: this.client.firstName,
      clientPatronymic: this.client.patronymic,
      clientLastName: this.client.lastName,
      contactType: this.form.controls.contactType.value,
      contact: this.form.controls.contact.value,

      institutes: this.selectedInstitutes,
      amount: this.form.controls.amount.value,
      isAccepted: this.form.controls.isAccepted.value ? true : false,
      source: this.form.controls.source.value,
      comment: this.form.controls.comment.value,
      orderDate: this.orderDate,
      dateOfOrder: new Date(),
      filter: {
        addressFilter: "noSpecial",
        genderFilter: "any",
        year1: null,
        year2: null,
        femaleAmount: null,
        maleAmount: null,
        date1: null,
        date2: null,
        region: this.form.controls.region.value,
        nursingHome: null,
        maxOneHouse: null,
        maxNoAddress: null,
        onlyWithPicture: false,
        onlyAnniversaries: false,
        onlyAnniversariesAndOldest: false,
        noNames: this.form.controls.noNames.value,
        minNumberOfHouses: this.form.controls.minNumberOfHouses.value,
        onlyWithConcent: this.form.controls.onlyWithConcent.value,
      },
    };
    //console.log("newOrder");
    console.log(newOrder.dateOfOrder);
    //console.log("newOrder");
    //console.log(newOrder);

    this.orderService
      .createInstitutesOrder(newOrder, prohibitedId, restrictedHouses)
      .subscribe(
        async (res) => {
          this.spinner = false;
          this.clicked = false;
          let result = res["data"]["result"];
          if (typeof result == "string") {
            this.errorMessage = result;
            // console.log(res);
          } else {
            //alert(res.msg);
            //console.log(res);
            this.lineItems = result;
            if (newOrder.filter.noNames) {
              this.isForInstitutes = true;
            } else {
              this.isParcelAvailable = true;
            }

            let i = 0;
            for (let lineItem of this.lineItems) {
              lineItem.Female = 0;
              lineItem.Male = 0;
              for (let celebrator of lineItem.celebrators) {
                celebrator.index = i + 1;
                i++;
                if (celebrator.gender == "Female") lineItem.Female++;
                if (celebrator.gender == "Male") lineItem.Male++;
              }
            }

            this.canSave = true;
            this.successMessage =
              "Ваша заявка сформирована и сохранена. Пожалуйста, скопируйте список и отправьте поздравляющему. Если список вас не устраивает, удалите эту заявку и обратитесь к администратору.";
            this.contactReminder = " для " + res["data"]["contact"];
            this.clientFirstName = res["data"]["clientFirstName"];
          }
        },
        (err) => {
          this.spinner = false;
          this.clicked = false;
          this.errorMessage = err.error.msg + " " + err.message;
          console.log(err);
        }
      );
  }

  fillOrder(prohibitedId: [], restrictedHouses: []) {
    this.spinner = true;

    let newOrder: Order = {
      userName: this.userName,
      holiday: this.holiday,
      clientId: this.client._id,
      clientFirstName: this.client.firstName,
      clientPatronymic: this.client.patronymic,
      clientLastName: this.client.lastName,
      /*       email:
        this.form.controls.contactType.value == "email"
          ? this.form.controls.contact.value
          : null, */
      contactType: this.form.controls.contactType.value,
      contact: this.form.controls.contact.value,

      institutes: this.selectedInstitutes,
      amount: this.form.controls.amount.value,
      isAccepted: this.form.controls.isAccepted.value ? true : false,
      source: this.form.controls.source.value,
      comment: this.form.controls.comment.value,
      orderDate: this.orderDate,
      dateOfOrder: new Date(),
      filter: {
        addressFilter: this.addressFilter,
        genderFilter: this.genderFilter,
        year1: this.form.controls.year1.value,
        year2: this.form.controls.year2.value,
        femaleAmount: this.form.controls.femaleAmount.value,
        maleAmount: this.form.controls.maleAmount.value,
        date1: this.form.controls.date1.value,
        date2: this.form.controls.date2.value,
        region: this.form.controls.region.value,
        nursingHome: this.form.controls.nursingHome.value,
        maxOneHouse: this.form.controls.maxOneHouse.value,
        maxNoAddress: this.form.controls.maxNoAddress.value,
        onlyWithPicture: this.form.controls.onlyWithPicture.value,
        onlyAnniversaries: this.form.controls.onlyAnniversaries.value,
        onlyAnniversariesAndOldest:
          this.form.controls.onlyAnniversariesAndOldest.value,
        onlyWithConcent: this.form.controls.onlyWithConcent.value,
      },
    };
    //console.log("newOrder");
    console.log(newOrder.dateOfOrder);
    //console.log("newOrder");
    //console.log(newOrder);

    this.orderService
      .createOrderSpring(newOrder, prohibitedId, restrictedHouses)
      .subscribe(
        async (res) => {
          this.spinner = false;
          this.clicked = false;
          let result = res["data"]["result"];
          if (typeof result == "string") {
            this.errorMessage = result;
            // console.log(res);
          } else {
            //alert(res.msg);
            //console.log(res);
            if (newOrder.institutes.length > 0) {
              this.isParcelAvailable = true;
              this.isForInstitutes = true;
            } else {
              this.isForInstitutes = false;
              this.isParcelAvailable = false;
            }

            this.lineItems = result;
            let i = 0;
            for (let lineItem of this.lineItems) {
              /*               lineItem.Female = 0;
              lineItem.Male = 0; */
              for (let celebrator of lineItem.celebrators) {
                celebrator.index = i + 1;
                i++;
                /*                 if (celebrator.gender == "Female") lineItem.Female++;
                if (celebrator.gender == "Male") lineItem.Male++; */
              }
            }

            this.canSave = true;
            this.successMessage =
              "Ваша заявка сформирована и сохранена. Пожалуйста, скопируйте список и отправьте поздравляющему. Если список вас не устраивает, удалите эту заявку и обратитесь к администратору.";
            this.contactReminder = " для " + res["data"]["contact"];
            this.clientFirstName = res["data"]["clientFirstName"];
          }
        },
        (err) => {
          this.spinner = false;
          this.clicked = false;
          this.errorMessage = err.error.msg + " " + err.message;
          console.log(err);
        }
      );
  }

  getAddresses() {
    let greeting: string;
    if (this.clientFirstName) {
      greeting = "Здравствуйте, " + this.clientFirstName + "!\n\n";
    } else {
      greeting = "Добрый день!\n\n";
    }
    /*     let topForSubscribers =
      "Сроки доставки писем в настоящее время, к сожалению, предсказать невозможно.\n" +
      "Некоторые интернаты сообщают, что корреспонденция опаздывает на 2-3 недели,а где-то больше, чем на месяц.\n" +
      "Поэтому просим вас отправить открытки в ноябре - начале декабря.\n"; */
    let topForSubscribers =
      /* "Просим вас учитывать, что почтовые тарифы повышены с 10 февраля 2025 г.\n" + */
      "Открытки нужно отправить примерно за месяц до праздника.\n" +
      "Постарайтесь, чтобы поздравления с 23 февраля были очень тактичными, потому что поздравляемым может оказаться человек, который в силу инвалидности не смог служить в армии.\n\n";

    /*  "На конверте рекомендуем сделать пометку 'прошу вручить 31 декабря'.\nОбращаю ваше внимание, что списки поздравляемых идут без фамилий.\n\n"; */
    if (!this.isForInstitutes || this.isParcelAvailable) {
      if (!this.isParcelAvailable) {
        topForSubscribers =
          topForSubscribers +
          "Обращаю ваше внимание, что списки поздравляемых идут без фамилий и года рождения (теперь мы получаем только такие данные).\n" +
          "Не переживайте:\n" +
          "- в интернате точно найдут поздравляемого и вручат ему открытку.\n" +
          "- открытки и конверты без фамилии, а только с именем и отчеством на почте принимают и доставляют.\n\n";
      }
      if (this.isParcelAvailable) {
        topForSubscribers =
          topForSubscribers +
          "Если вам удобнее, то в один интернат можно отправить все открытки одной ПРОСТОЙ бандеролью. Получателем указать интернат.\n" +
          "Часто работники почты уговаривают отправителей на регистрируемые отправления (заказные, ценные, первого класса), но нам такой вариант совершенно не подходит, так как такие отправления с 99% вероятностью вернутся обратно.\n\n";
      }
    } else {
      topForSubscribers =
        topForSubscribers +
        "На конверте рекомендуем указать название праздника. Например, '23 февраля'.\n\n" +
        "Сообщаю вам только адреса интернатов и количество поздравляемых, то есть открытки будут не именные.\n" +
        "Открытки нужно будет отправить ПРОСТОЙ бандеролью на адрес интерната через Почту России. То есть все открытки нужно упаковать в один почтовый пакет (или конверт), заполнить адресную часть и отнести на почту, там отправить ПРОСТУЮ бандероль. Если вес будет менее 100 г, то отправление оформят как простое письмо с доплатой за вес.\n" +
        "Часто работники почты уговаривают отправителей на регистрируемые отправления (заказные, ценные, первого класса), но нам такой вариант совершенно не подходит, так как такие отправления с 99% вероятностью вернутся обратно.\n" +
        "Ссылка на полную инструкцию: https://disk.yandex.ru/i/pIc9B0o9HKXGrQ \n\n";
    }

    topForSubscribers = topForSubscribers + this.holiday + "\n\n";
    let top: string;
    let bottom: string;
    if (!this.isForInstitutes || this.isParcelAvailable) {
      /* Иногда в списках встречаются люди, которых к престарелым совсем не относятся. Это инвалиды, которые проживают в домах престарелых. Иногда сразу после детдомов. */
      top =
        "Пожалуйста, подтвердите получение этого письма, ответив на него!\n\n" +
        "Мы получили вашу заявку и очень рады вашему участию!\n\n" +
        "Высылаю вам адреса для поздравления жителей домов престарелых (сначала идет адрес, потом - ИО или несколько ИО). Фамилии в списках не указаны.\n\n" +
        this.holiday +
        "\n" +
        "Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.\n" +
        "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.\n" +
        "Обращаю ваше внимание, что по полученным адресам нужно отправить открытки и только открытки один раз к указанному празднику. Письма писать не нужно!\n" +
        "Постарайтесь, чтобы поздравления с 23 февраля были очень тактичными, потому что поздравляемым может оказаться человек, который в силу инвалидности не смог служить в армии.\n\n";
      if (!this.isParcelAvailable) {
        bottom =
          "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ письмами/открытками (НЕ заказными).\n – Каждому адресату отправляйте отдельную открытку в отдельном конверте или отдельную почтовую открытку без конверта.\n – Постарайтесь отправить открытки в ближайшие дни.\n\n" +
          "Как писать поздравления?\n – Используйте обращение на 'Вы' и по имени-отчеству (если отчество указано).\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n – По возможности укажите ваш обратный адрес (кроме случаев, когда мы просим этого не делать)*.\n – Адрес и ИО получателя на конверте или почтовой открытке укажите обязательно в правом нижнем углу.\n\n" +
          "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде не указывайте ваш телефон (даже, если есть такое поле на конверте), если не готовы на 200%, что вам начнут звонить и писать в любое время.\n – Если написано, что поздравления нужно отправлять без указания обратного адреса, не давайте свой обратный адрес и любые другие контакты*.\n\n" +
          "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваша открытка вернулась, также сообщите нам.\n\n" +
          "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, бандероли, заказные/ценные письма, письма первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
          "Помогите купить дрова на зиму для тех, кто больше всего боится морозов,  https://starikam.org/campaign/drova-nuzhno-uspet-kupit-letom/\n\n" +
          "Сердечно вас благодарим за внимание к нашим подопечным!\nБудут вопросы — обращайтесь!\n\n" +
          "* - Мы просим отправлять без указания обратного адреса поздравления в психоневрологические интернаты (ПНИ) и специальные интернаты по настоятельной просьбе администрации этих учреждений, чтобы их жители не потревожили поздравляющих ответными письмами. Если в вашем списке есть такой адрес, то под ним обязательно идет соответствующий комментарий: (администрация настоятельно просит не указывать ваш личный адрес на отправлениях в этот интернат, в графе откуда укажите адрес вашего почтового отделения, в графе от кого – Волонтер и ваше имя). Если такого комментария нет, то можете указать свой личный адрес.";
      } else {
        bottom =
          "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ письмами/открытками (НЕ заказными).\n – Каждому адресату отправляйте отдельную открытку в отдельном конверте или отдельную почтовую открытку без конверта.\n – Если вам удобнее, то в один интернат можно отправить все открытки одной ПРОСТОЙ бандеролью. Получателем указать интернат.\n – Постарайтесь отправить открытки в ближайшие дни.\n\n" +
          "Как писать поздравления?\n – Используйте обращение на 'Вы' и по имени-отчеству (если отчество указано).\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n – По возможности укажите ваш обратный адрес (кроме случаев, когда мы просим этого не делать)*.\n – Адрес и ИО получателя на конверте или почтовой открытке укажите обязательно в правом нижнем углу.\n\n" +
          "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде не указывайте ваш телефон (даже, если есть такое поле на конверте), если не готовы на 200%, что вам начнут звонить и писать в любое время.\n – Если написано, что поздравления нужно отправлять без указания обратного адреса, не давайте свой обратный адрес и любые другие контакты*.\n\n" +
          "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваша открытка вернулась, также сообщите нам.\n\n" +
          "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, заказные/ценные письма/бандероли, письма первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
          "Помогите купить дрова на зиму для тех, кто больше всего боится морозов,  https://starikam.org/campaign/drova-nuzhno-uspet-kupit-letom/\n\n" +
          "Сердечно вас благодарим за внимание к нашим подопечным!\nБудут вопросы — обращайтесь!\n\n" +
          "* - Мы просим отправлять без указания обратного адреса поздравления в психоневрологические интернаты (ПНИ) и специальные интернаты по настоятельной просьбе администрации этих учреждений, чтобы их жители не потревожили поздравляющих ответными письмами. Если в вашем списке есть такой адрес, то под ним обязательно идет соответствующий комментарий: (администрация настоятельно просит не указывать ваш личный адрес на отправлениях в этот интернат, в графе откуда укажите адрес вашего почтового отделения, в графе от кого – Волонтер и ваше имя). Если такого комментария нет, то можете указать свой личный адрес.";
      }
    } else {
      top =
        "Пожалуйста, подтвердите получение этого письма, ответив на него!\n\n" +
        "Мы получили вашу заявку и очень рады вашему участию!\n\n" +
        "В правила поздравления были внесены изменения, поэтому сообщаю вам только адреса интернатов и количество поздравляемых, то есть открытки будут не именные.\nОткрытки нужно будет отправить ПРОСТОЙ бандеролью на адрес интерната через Почту России. НЕ заказной, НЕ ценной, НЕ первого класса и никакой другой регистрируемой. Потому что простую бандероль почтальон приносит в интернат, а за регистрируемыми отправлениями нужно идти на почту с доверенностью. Правда, к сожалению, простая бандероль не имеет трек номера и ее нельзя отследить.\nТо есть все открытки нужно упаковать в один почтовый пакет (или конверт), заполнить адресную часть и отнести на почту, там отправить ПРОСТУЮ бандероль через оператора. Если вес будет менее 100 г, то отправление оформят как простое письмо с доплатой за вес. Часто работники почты уговаривают отправителей на заказные или ценные бандероли, говорят, что это быстрее и надежнее, но нам такой вариант совершенно не подходит, так как такие отправления с 99% вероятностью вернутся обратно.\n\n" +
        this.holiday +
        "\n" +
        "Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.\n" +
        "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.\n" +
        "Обращаю ваше внимание, что по полученным адресам нужно отправить открытки и только открытки один раз к указанному празднику. Письма писать не нужно!\n" +
        "Постарайтесь, чтобы поздравления с 23 февраля были очень тактичными, потому что поздравляемым может оказаться человек, который в силу инвалидности не смог служить в армии.\n\n";
      bottom =
        "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ бандеролями (от 100 г до 5 кг) или ПРОСТЫМИ письмами (до 100 г).\n – РПостарайтесь отправить открытки в ближайшие дни.\n – В графе 'кому' указывайте название интерната (учреждения). Указывать ФИО получателя совершенно не обязательно.\n – На конверте/пакете укажите название праздника. (Например, '23 февраля').\n\n" +
        "Как писать поздравления?\n – Начните ваше поздравление с приветствия: 'Добрый день! Поздравляю Вас...' или 'Здравствуйте! Поздравляю Вас...'.\n –  В поздравлениях с днями рождения можно использовать обращения: 'Дорогая именинница!', 'Уважаемый именинник!'. \n – Не используйте такие обращения, как 'дедушка' или 'бабушка': в интернатах проживают и молодые люди - инвалиды.\n – Обязательно используйте обращение на 'Вы'.\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n\n" +
        "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде в открытке (или на конверте, если каждая открытка в конверте) не указывайте ваш телефон, если не готовы на 200%, что вам начнут звонить и писать в любое время.\n\n" +
        "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваше отправление вернулось, также сообщите нам.\n\n" +
        "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, заказные/ценные бандероли, заказные/ценные письма, письма и бандероли первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
        "Помогите купить дрова на зиму для тех, кто больше всего боится морозов,  - https://starikam.org/campaign/drova-nuzhno-uspet-kupit-letom/\n\n" +
        "Сердечно вас благодарим за внимание к нашим подопечным!\nБудут вопросы — обращайтесь!\n\n";
    }
    let bottomForSubscribers =
      "Спасибо вам огромное!\n" +
      "_________________________________________________\n" +
      "Помогите купить дрова на зиму для тех, кто больше всего боится морозов, :\n" +
      "https://starikam.org/campaign/drova-nuzhno-uspet-kupit-letom/";

    let addresses = "";
    console.log(this.lineItems);
    for (let lineItem of this.lineItems) {
      /*       if (!this.isForInstitutes || this.isParcelAvailable) { */
      addresses =
        addresses +
        lineItem.address +
        " " +
        "\n" +
        (lineItem.infoComment ? lineItem.infoComment + "\n" : "") +
        (lineItem.adminComment ? lineItem.adminComment + "\n" : "");
      /*       } */
      /*       if (this.isForInstitutes && !this.isParcelAvailable) {
        addresses = addresses + lineItem.address + " " + "\n";
      } */
      console.log("addresses1");
      console.log(addresses);

      if (!this.isForInstitutes || this.isParcelAvailable) {
        for (let celebrator of lineItem.celebrators) {
          /*         console.log("celebrator");
          console.log(celebrator.lastName); */

          addresses =
            addresses +
            (this.showIndexes ? celebrator.index + ". " : "") +
            /*  (celebrator.lastName ? celebrator.lastName :"") + 
            " " +*/
            celebrator.firstName +
            " " +
            (celebrator.patronymic ? celebrator.patronymic : "") +
            " " +
            /*  (celebrator.yearBirthday ? celebrator.yearBirthday + " г.р." : "") + 
            " " +*/
            (celebrator.comment1 ? celebrator.comment1 : "") +
            " " +
            /* (celebrator.linkPhoto ? celebrator.linkPhoto : "") +
            " " + */
            (celebrator.specialComment ? celebrator.specialComment : "") +
            "\n";
        }
      }
      if (this.isForInstitutes && !this.isParcelAvailable) {
        addresses =
          addresses +
          lineItem.celebrators.length +
          " откр.: " +
          lineItem.Female +
          " жен. + " +
          lineItem.Male +
          " муж." +
          "\n";
      }
      addresses = addresses + "\n";

      console.log("addresses2");
      console.log(addresses);
    }

    if (this.showInstruction) {
      addresses = greeting + top + addresses + bottom;
    }

    if (this.showInstructionForSubscribers) {
      addresses =
        greeting + topForSubscribers + addresses + bottomForSubscribers;
    }
    console.log("addresses3");
    console.log(addresses);
    const successful = this.clipboard.copy(addresses);
    console.log("successful");
    console.log(successful);
  }
}
