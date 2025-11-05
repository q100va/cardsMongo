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
import { ConfirmationService, MessageService } from "primeng/api";
import { OrderService } from "src/app/services/order.service";
import { EmailService } from "src/app/services/email.service";
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
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";

const ICON_GOOGLE = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>`;

const ICON_YANDEX = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<linearGradient id="lpa7hSZqz_S376v76E9kia_wQ15B9zLAw61_gr1" x1="13.239" x2="37.906" y1="1.907" y2="33.479" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f52537"></stop><stop offset=".293" stop-color="#f32536"></stop><stop offset=".465" stop-color="#ea2434"></stop><stop offset=".605" stop-color="#dc2231"></stop><stop offset=".729" stop-color="#c8202c"></stop><stop offset=".841" stop-color="#ae1e25"></stop><stop offset=".944" stop-color="#8f1a1d"></stop><stop offset="1" stop-color="#7a1818"></stop></linearGradient><path fill="url(#lpa7hSZqz_S376v76E9kia_wQ15B9zLAw61_gr1)" d="M32,24h-7l8-18h7L32,24z M27,36.689	c0-4.168-0.953-8.357-2.758-12.117L15,6H8l10.833,21.169C20.251,30.123,21,33.415,21,36.689V42h6V36.689z"></path>
</svg>`;

@Component({
  selector: "app-upload-ny",
  templateUrl: "./upload-ny.component.html",
  styleUrls: ["./upload-ny.component.css"],
})
export class UploadNyComponent implements OnInit {
  emailOrders = [];
  order: Order;
  userName: string;
  form: FormGroup;
  holiday: string = "Новый год 2026";
  lineItems = [];
  types: Array<string> = [
    "email",
    /*     "phoneNumber",
    "whatsApp",
    "telegram",
    "vKontakte",
    "instagram",
    "facebook",
    "otherContact", */
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
  showIndexes: false;
  showInstruction: false;
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
  activeMessage: string;
  // hoverColor = "#e1dede";
  email: string = "";
  domainName: string;
  titleForEmails = "Заявки";
  emailOrder;

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
    private emailService: EmailService,
    private clientService: ClientService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private clipboard: Clipboard,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) {
    this.userName = this.cookieService.get("session_user");

    this.iconRegistry.addSvgIconLiteral(
      "google",
      this.sanitizer.bypassSecurityTrustHtml(ICON_GOOGLE)
    );
    this.iconRegistry.addSvgIconLiteral(
      "yandex",
      this.sanitizer.bypassSecurityTrustHtml(ICON_YANDEX)
    );
  }

  ngOnInit(): void {
    this.orderService.getContacts("email").subscribe(
      async (res) => {
        // this.options = res.data['contacts'];
        // console.log("res.data");
        // console.log(res.data);
        this.fullOptions = res.data["contacts"];
        for (let client of res.data["contacts"]) {
          this.options.push(client.email.toLowerCase());
        }
        // this.filteredOptions = of([]);
        //console.log("this.options");
        // console.log(this.options);

        this.form.controls.contact.setValue("");
        this.email = "";
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
      nursingHome: [null],
      maxOneHouse: [null, [Validators.min(1)]],
      maxNoAddress: [null, [Validators.min(1)]],
      onlyWithPicture: [false],
      onlyAnniversaries: [false],
      onlyAnniversariesAndOldest: [false],
      nameOfInstitute: [null],
      categoryOfInstitute: [null],
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
            this.email = "";
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
    // setTimeout(() => {
    //console.log("this.previousClient");
    //console.log(this.previousClient);
    //console.log("checkContact");
    // console.log(this.form.controls.contact.value);
    //console.log(this.options);
    /*       console.log(
        this.options.includes(this.form.controls.contact.value.toLowerCase())
      ); */

    if (this.email) {
      if (!this.options.includes(this.email.toLowerCase())) {
        this.client = undefined;
        this.previousClient = this.email.toLowerCase();
        this.institutes.clear();
        this.confirmationService.confirm({
          message:
            "Поздравляющего с указанным контактом не найдено. Вы хотите созадать для него карточку? (Если нет, проверьте, правильно ли введены данные или произведите поиск по другому типу.)",
          accept: () => {
            this.openCreateClientDialog();
          },
        });
      } else {
        if (this.previousClient != this.email.toLowerCase()) {
          let index = this.fullOptions.findIndex(
            (item) =>
              item[this.form.controls.contactType.value].toLowerCase() ==
              this.email.toLowerCase()
          );
          console.log("this.fullOptions[index]");
          console.log(this.fullOptions[index]);
          this.clientService
            .findClientById(this.fullOptions[index]._id)
            .subscribe(
              async (res) => {
                this.previousClient = this.email.toLowerCase();
                console.log("res.data");
                console.log(res.data);
                this.client = res.data;
                this.clientInstitutes = this.client.institutes;
                console.log("client");
                console.log(this.client.firstName);
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
      this.lineItems = [];
    }
    // }, 0);
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
    this.selectedInstitutes = this.form.value.institutes
      .map((checked, i) => (checked ? this.clientInstitutes[i] : null))
      .filter((v) => v !== null);

    if (this.selectedInstitutes.length > 0) {
      this.showFilter = false;
    } else {
      this.showFilter = true;
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

  onChangeNursingHome() {
    if (!this.form.controls.nursingHome.value) {
      this.showMaxOneHouse = true;
      if (this.addressFilter == "any" || "noReleased") {
        this.showMaxNoAddress = true;
      }
    } else {
      this.showMaxOneHouse = false;
      this.form.controls.maxOneHouse.setValue(null);
      this.showMaxNoAddress = false;
      this.form.controls.maxNoAddress.setValue(null);
    }
  }

  onChangeRegion() {
    console.log(this.form.controls.region.value);
    console.log(this.form.controls.nursingHome.value);

    if (!this.form.controls.region.value) {
      console.log("no regions were chosen");
      console.log(this.form.controls.region.value);
      this.activeNursingHomes = this.nursingHomes;
    } else {
      this.activeNursingHomes = this.nursingHomes.filter(
        (item) => item.region == this.form.controls.region.value
      );

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

    this.holiday = "Новый год 2026";
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
    this.email = "";

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
        this.email = "";
      },
      (err) => {
        this.errorMessage = err.error.msg + " " + err.message;
        console.log(err);
      }
    );
  }
  //
  fetchEmail(domainName) {
    this.emailService.fetchEmail(domainName).subscribe(
      async (res) => {
        console.log(res);
        alert(res["msg"]);
        this.domainName = domainName;
        this.titleForEmails =
          domainName == "google"
            ? "Заявки с google почты"
            : "Заявки с yandex почты";
        this.emailOrders = res["data"];
      },
      (err) => {
        this.errorMessage = err.error.msg + " " + err.message;
        alert(this.errorMessage);
        console.log(err);
      }
    );
  }

  chosenOrderAction(emailOrder) {
    console.log(emailOrder);
    if (this.activeMessage)
      this.emailOrders[this.activeMessage].backgroundColor = "white";
    this.activeMessage = this.emailOrders
      .findIndex(
        (element) => element.numberOfMessage == emailOrder.numberOfMessage
      )
      .toString();
    console.log(this.activeMessage);
    this.emailOrders[this.activeMessage].backgroundColor = "#66bb6a9a";
    console.log(this.emailOrders[this.activeMessage].backgroundColor);
    this.emailOrder = this.emailOrders[this.activeMessage];
    this.email = emailOrder.email;
    this.form.controls.contact.setValue(emailOrder.email);
    this.checkContactTimeOut();
  }

  sendEmail() {
    const greetingText = this.clientFirstName
      ? "Здравствуйте, " + this.clientFirstName + "!\n\n"
      : "Добрый день!\n\n";

    const subscribersTopText =
      "Сроки доставки писем в настоящее время, к сожалению, предсказать невозможно.\nНекоторые интернаты сообщают, что корреспонденция опаздывает на 2-3 недели, а где-то больше, чем на месяц.\nПоэтому прошу вас отправить открытки в ноябре - начале декабря и только простыми отправлениями.\nНа конверте можно указать 'вручить 31 декабря'.\nОбращаю ваше внимание, что списки поздравляемых идут без фамилий.\n\n" +
      this.holiday +
      "\n\n";
    const subscribersBottomText =
    "Спасибо вам преогромное!\n_________________________________________________\nПомогите поздравить с Новым годом одиноких пожилых людей:\n https://ng.starikam.org/2026 \n\n";
    const addressesText = this.formAddressLines();
    const subscribersInstituteTopText =
      "В правила поздравления были внесены изменения, поэтому сообщаю вам только адреса интернатов и количество поздравляемых, то есть открытки будут не именные.\n Открытки нужно будет отправить ПРОСТОЙ бандеролью на адрес интерната через Почту России. НЕ заказной, НЕ ценной, НЕ первого класса и никакой другой регистрируемой. Потому что простую бандероль почтальон приносит в интернат, а за регистрируемыми отправлениями нужно идти на почту с доверенностью. Правда, к сожалению, простая бандероль не имеет трек номера и ее нельзя отследить.\n То есть все открытки нужно упаковать в один почтовый пакет (или конверт), заполнить адресную часть и отнести на почту, там отправить ПРОСТУЮ бандероль через оператора. Если вес будет менее 100 г, то отправление оформят как простое письмо с доплатой за вес. Часто работники почты уговаривают отправителей на заказные или ценные бандероли, говорят, что это быстрее и надежнее, но нам такой вариант совершенно не подходит, так как такие отправления с 99% вероятностью вернутся обратно.\n\n" +
      this.holiday +
      "\n" +
      "Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.\n" +
      "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.\n\n";
    const subscribersInstituteBottomText =
      "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ бандеролями (от 100 г до 5 кг) или ПРОСТЫМИ письмами (до 100 г).\n – Рассчитывайте, что срок доставки будет примерно 30 дней. Лучше отправить открытки в ноябре - начале декабря.\n – В графе 'кому' указывайте название интерната (учреждения). Указывать ФИО получателя совершенно не обязательно.\n – На конверте/пакете укажите название праздника/праздников. (Например, 'Новый год').\n\n" +
      "Как писать поздравления?\n – Начните ваше поздравление с приветствия: 'Добрый день! Поздравляю Вас...' или 'Добрый день! Поздравляю Вас...'.\n –  В поздравлениях с днями рождения можно использовать обращения: 'Дорогая именинница!', 'Уважаемый именинник!'. \n – Не используйте такие обращения, как 'дедушка' или 'бабушка': в интернатах проживают и молодые люди - инвалиды.\n – Обязательно используйте обращение на 'Вы'.\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n\n" +
      "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде в открытке (или на конверте, если каждая открытка в конверте) не указывайте ваш телефон, если не готовы на 200%, что вам начнут звонить и писать в любое время.\n\n" +
      "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваше отправление вернулось, также сообщите нам.\n\n" +
      "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, заказные/ценные бандероли, заказные/ценные письма, письма и бандероли первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
      "Помогите поздравить с Новым годом одиноких пожилых людей:\n https://ng.starikam.org/2026 \n\n" +
      "Сердечно вас благодарю!\n\n";

    const greetingHtml = this.clientFirstName
      ? "<div>Здравствуйте, " + this.clientFirstName + "!</div><br>"
      : "<div>Добрый день!</div><br>";
    const subscribersTopHtml =
      "<div>Сроки доставки писем в настоящее время, к сожалению, предсказать невозможно.<br>Некоторые интернаты сообщают, что корреспонденция опаздывает на 2-3 недели, а где-то больше, чем на месяц.<br>Поэтому прошу вас отправить открытки в ноябре - начале декабря и только простыми отправлениями.<br>На конверте можно указать 'вручить 31 декабря'.<br />Обращаю ваше внимание, что списки поздравляемых идут без фамилий.</div><br><p style='font-weight: bold;'>" +
      this.holiday +
      "</p>";
    const subscribersBottomHtml =
    "<div>Спасибо вам преогромное!<br>___________________________________________________________<br>Помогите поздравить с Новым годом одиноких пожилых людей:<br><a href = 'https://ng.starikam.org/2026'>Давайте дарить тепло и радость уже сейчас!</a></div><br>";
    const addressesHtml = this.formAddressLinesForHtml();

    const subscribersInstituteTopHtml =
      "<div>В правила поздравления были внесены изменения, поэтому сообщаю вам только адреса интернатов и количество поздравляемых, то есть открытки будут не именные.<br>Открытки нужно будет отправить ПРОСТОЙ бандеролью на адрес интерната через Почту России. НЕ заказной, НЕ ценной, НЕ первого класса и никакой другой регистрируемой. Потому что простую бандероль почтальон приносит в интернат, а за регистрируемыми отправлениями нужно идти на почту с доверенностью. Правда, к сожалению, простая бандероль не имеет трек номера и ее нельзя отследить.<br> То есть все открытки нужно упаковать в один почтовый пакет (или конверт), заполнить адресную часть и отнести на почту, там отправить ПРОСТУЮ бандероль через оператора. Если вес будет менее 100 г, то отправление оформят как простое письмо с доплатой за вес. Часто работники почты уговаривают отправителей на заказные или ценные бандероли, говорят, что это быстрее и надежнее, но нам такой вариант совершенно не подходит, так как такие отправления с 99% вероятностью вернутся обратно.</div><br>" +
      "<p style='font-weight: bold;'>" +
      this.holiday +
      "</p>" +
      "<p style='font-style: italic;'> Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.<br>" +
      "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.</p>";
    const subscribersInstituteBottomHtml =
      "<br><div><span style='font-weight: bold; color: rgb(31, 86, 168)'>Отправляйте письма правильно!</span><br> – Открытки отправляйте Почтой России только ПРОСТЫМИ бандеролями (от 100 г до 5 кг) или ПРОСТЫМИ письмами (до 100 г).<br> – Рассчитывайте, что срок доставки будет примерно 30 дней. Лучше отправить открытки в ноябре - начале декабря.<br> – В графе 'кому' указывайте название интерната (учреждения). Указывать ФИО получателя совершенно не обязательно.<br> – На конверте/пакете укажите название праздника/праздников. (Например, 'Новый год').</div><br>" +
      "<div><span style='font-weight: bold; color: rgb(31, 86, 168)'>Как писать поздравления?</span><br> – Начните ваше поздравление с приветствия: 'Добрый день! Поздравляю Вас...' или 'Добрый день! Поздравляю Вас...'.<br> –  В поздравлениях с днями рождения можно использовать обращения: 'Дорогая именинница!', 'Уважаемый именинник!'. <br> – Не используйте такие обращения, как 'дедушка' или 'бабушка': в интернатах проживают и молодые люди - инвалиды.<br> – Обязательно используйте обращение на 'Вы'.<br> – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).<br> – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.</div><br>" +
      "<div><span style='font-weight: bold; color: rgb(31, 86, 168)'>Что писать не надо.</span><br> – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.<br> – Нигде в открытке (или на конверте, если каждая открытка в конверте) не указывайте ваш телефон, если не готовы на 200%, что вам начнут звонить и писать в любое время.</div><br>" +
      "<div><span style='font-weight: bold; color: rgb(31, 86, 168)'>Получили ответ?</span><br> – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.<br> – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.<br> – Если ваше отправление вернулось, также сообщите нам.</div><br>" +
      "<div><span style='font-weight: bold; color: rgb(31, 86, 168)'>Чего просим не делать.</span><br> – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).<br> – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.<br> – Не отправляйте посылки, заказные/ценные бандероли, заказные/ценные письма, письма и бандероли первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.<br> – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!</div><br>" +
      "<div>Сердечно вас благодарю!</div><br>" +
      "<div>_______________________________________________________________________________________<br>Помогите поздравить с Новым годом одиноких пожилых людей:<br><a href = 'https://ng.starikam.org/2026'>Давайте дарить тепло и радость уже сейчас!</a> </div><br>";

    const signatureText =
      "--\nС уважением,\nОксана Кустова\nКоординатор программы 'Поздравление открытками'\nБФ «Старость в радость»\no.kustova@starikam.org\nwww.starikam.org | https://t.me/cardsforgrandma | https://t.me/starost_v_radost";
    const signatureHtml =
      "<div style='color: #6a6a6a;'>--<br>С уважением,<br>Оксана Кустова<br>Координатор программы 'Поздравление открытками'<br>БФ «Старость в радость»<br>o.kustova@starikam.org<br>www.starikam.org | https://t.me/cardsforgrandma | https://t.me/starost_v_radost</div>";

    const emailData = {
      clientEmail: this.emailOrder.email,
      // clientName: "Оксана",
      subject:
        this.emailOrder.subject.substring(0, 1) != "Re"
          ? "Re: " + this.emailOrder.subject
          : this.emailOrder.subject,
      text: this.isForInstitutes
        ? greetingText +
          subscribersInstituteTopText +
          addressesText +
          subscribersInstituteBottomText +
          signatureText
        : greetingText +
          subscribersTopText +
          addressesText +
          subscribersBottomText +
          signatureText,
      html: this.isForInstitutes
        ? greetingHtml +
          subscribersInstituteTopHtml +
          addressesHtml +
          subscribersInstituteBottomHtml +
          signatureHtml
        : greetingHtml +
          subscribersTopHtml +
          addressesHtml +
          subscribersBottomHtml +
          signatureHtml,
      domainName: this.domainName,
    };

    this.emailService.sendEmail(emailData).subscribe(
      async (res) => {
        console.log(res);
        this.messageService.add({
          severity: "success",
          summary: "email",
          detail: res.msg,
        });
        this.emailOrders[this.activeMessage].color = "#bbbbbb";
      },
      (err) => {
        this.errorMessage = err.error.msg + " " + err.message;
        alert(this.errorMessage);
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
          if (this.selectedInstitutes.length > 0) {
            this.checkDoubles();
          } else {
            if (
              this.client.institutes.length > 0 ||
              this.form.controls.amount.value > 20
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
      /*     if (
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
      }  else {*/
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
      /*  } */
    }
  }

  checkDoubles() {
    this.orderService.checkDoubleOrder(this.holiday, this.client._id).subscribe(
      async (res) => {
        let result = res["data"];
        console.log("res");
        console.log(res);
        if (!result) {
          if (this.selectedInstitutes.length > 0) {
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
              if (this.selectedInstitutes.length > 0) {
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
        addressFilter: "any",
        genderFilter: "any",
        year1: null,
        year2: null,
        femaleAmount: null,
        maleAmount: null,
        date1: null,
        date2: null,
        region: null,
        nursingHome: null,
        maxOneHouse: null,
        maxNoAddress: null,
        onlyWithPicture: false,
        onlyAnniversaries: false,
        onlyAnniversariesAndOldest: false,
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
            this.isForInstitutes = true;
            // let i = 0;
            for (let lineItem of this.lineItems) {
              lineItem.Female = 0;
              lineItem.Male = 0;
              for (let celebrator of lineItem.celebrators) {
                /*                 celebrator.index = i + 1;
                i++; */
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
      },
    };
    //console.log("newOrder");
    console.log(newOrder.dateOfOrder);
    //console.log("newOrder");
    //console.log(newOrder);

    this.orderService
      .createOrderNewYear(newOrder, prohibitedId, restrictedHouses)
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
            this.isForInstitutes = false;
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
      greeting = "Добрый день, " + this.clientFirstName + "!\n\n";
    } else {
      greeting = "Добрый день!\n\n";
    }
    let top: string;
    let bottom: string;
    if (!this.isForInstitutes) {
      top =
        "Пожалуйста, подтвердите получение этого письма, ответив на него!\n\n" +
        "Мы получили вашу заявку и очень рады вашему участию!\n\n" +
        "Высылаю вам адреса для поздравления жителей домов престарелых (сначала идет адрес, потом - ИО или несколько ИО). Фамилии в списках не указаны. Иногда в списках встречаются люди, которых к престарелым совсем не относятся. Это инвалиды, которые проживают в домах престарелых. Иногда сразу после детдомов.\n\n" +
        this.holiday +
        "\n" +
        "Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.\n" +
        "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.\n\n";
      bottom =
        "Обращаю ваше внимание, что по полученным адресам нужно отправить открытки и только открытки и только один раз к указанному празднику. Письма писать не нужно!\nДля поздравления с другими праздниками нужно получать другие адреса. Списки на поздравления мы готовим примерно за 1,5 месяца до праздника.\n\n" +
        "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ письмами/открытками (НЕ заказными).\n – Каждому адресату отправляйте отдельную открытку в отдельном конверте или отдельную почтовую открытку без конверта.\n – Рассчитывайте, что срок доставки может составить 30 дней или дольше. Просим отправить открытки в ноябре - начале декабря.\n\n" +
        "Как писать поздравления?\n – Используйте обращение на 'Вы' и по имени-отчеству (если отчество указано).\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n – По возможности укажите ваш обратный адрес (кроме случаев, когда мы просим этого не делать)*.\n – Адрес и ИО получателя на конверте или почтовой открытке укажите обязательно в правом нижнем углу.\n\n" +
        "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде не указывайте ваш телефон (даже, если есть такое поле на конверте), если не готовы на 200%, что вам начнут звонить и писать в любое время.\n – Если написано, что поздравления нужно отправлять без указания обратного адреса, не давайте свой обратный адрес и любые другие контакты*.\n\n" +
        "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваша открытка вернулась, также сообщите нам.\n\n" +
        "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, бандероли, заказные/ценные письма, письма первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
        "Помогите поздравить с Новым годом одиноких пожилых людей. Сделайте пожертвование на - https://ng.starikam.org/2026\n\n" +
        "От всего сердца благодарим вас за помощь!\nБудут вопросы — обращайтесь!\n\n" +
        "* - Мы просим отправлять без указания обратного адреса поздравления в психоневрологические интернаты (ПНИ) и специальные интернаты по настоятельной просьбе администрации этих учреждений, чтобы их жители не потревожили поздравляющих ответными письмами. Если в вашем списке есть такой адрес, то под ним обязательно идет соответствующий комментарий: (администрация настоятельно просит не указывать ваш личный адрес на отправлениях в этот интернат, в графе откуда укажите адрес вашего почтового отделения, в графе от кого – Волонтер и ваше имя). Если такого комментария нет, то можете указать свой личный адрес.";
    } else {
      top =
        "Пожалуйста, подтвердите получение этого письма, ответив на него!\n\n" +
        "Мы получили вашу заявку и очень рады вашему участию!\n\n" +
        "В правила поздравления были внесены изменения, поэтому сообщаю вам только адреса интернатов и количество поздравляемых, то есть открытки будут не именные.\n Открытки нужно будет отправить ПРОСТОЙ бандеролью на адрес интерната через Почту России. НЕ заказной, НЕ ценной, НЕ первого класса и никакой другой регистрируемой. Потому что простую бандероль почтальон приносит в интернат, а за регистрируемыми отправлениями нужно идти на почту с доверенностью. Правда, к сожалению, простая бандероль не имеет трек номера и ее нельзя отследить.\n То есть все открытки нужно упаковать в один почтовый пакет (или конверт), заполнить адресную часть и отнести на почту, там отправить ПРОСТУЮ бандероль через оператора. Если вес будет менее 100 г, то отправление оформят как простое письмо с доплатой за вес. Часто работники почты уговаривают отправителей на заказные или ценные бандероли, говорят, что это быстрее и надежнее, но нам такой вариант совершенно не подходит, так как такие отправления с 99% вероятностью вернутся обратно.\n\n" +
        this.holiday +
        "\n" +
        "Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.\n" +
        "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.\n\n";
      bottom =
        "Обращаю ваше внимание, что по полученным адресам нужно отправить открытки и только открытки и только один раз к указанному празднику. Письма писать не нужно!\nДля поздравления с другими праздниками нужно получать другие адреса. Списки на поздравления мы готовим примерно за 1,5 месяца до праздника.\n\n" +
        "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ бандеролями (от 100 г до 5 кг) или ПРОСТЫМИ письмами (до 100 г).\n – Рассчитывайте, что срок доставки может составить 30 дней или дольше. Просим отправить открытки в ноябре - начале декабря.\n – В графе 'кому' указывайте название интерната (учреждения). Указывать ФИО получателя совершенно не обязательно.\n – На конверте/пакете укажите название праздника/праздников, особенно это актуально для дней рождений. (Например, 'Дни рождения декабря').\n\n" +
        "Как писать поздравления?\n – Начните ваше поздравление с приветствия: 'Добрый день! Поздравляю Вас...' или 'Добрый день! Поздравляю Вас...'.\n –  В поздравлениях с днями рождения можно использовать обращения: 'Дорогая именинница!', 'Уважаемый именинник!'. \n – Не используйте такие обращения, как 'дедушка' или 'бабушка': в интернатах проживают и молодые люди - инвалиды.\n – Обязательно используйте обращение на 'Вы'.\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n\n" +
        "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде в открытке (или на конверте, если каждая открытка в конверте) не указывайте ваш телефон, если не готовы на 200%, что вам начнут звонить и писать в любое время.\n\n" +
        "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваше отправление вернулось, также сообщите нам.\n\n" +
        "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, заказные/ценные бандероли, заказные/ценные письма, письма и бандероли первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
        "Помогите поздравить с Новым годом одиноких пожилых людей. Сделайте пожертвование на - https://ng.starikam.org/2026\n\n" +
        "От всего сердца благодарим вас за помощь!\nБудут вопросы — обращайтесь!\n\n";
    }

    let addresses = this.formAddressLines();

    if (this.showInstruction) {
      addresses = greeting + top + addresses + bottom;
    }
    console.log("addresses3");
    console.log(addresses);
    const successful = this.clipboard.copy(addresses);
    console.log("successful");
    console.log(successful);
  }

  formAddressLines() {
    let addresses = "";
    console.log(this.lineItems);
    for (let lineItem of this.lineItems) {
      if (!this.isForInstitutes) {
        addresses =
          addresses +
          lineItem.address +
          " " +
          "\n" +
          (lineItem.infoComment ? lineItem.infoComment + "\n" : "") +
          (lineItem.adminComment ? lineItem.adminComment + "\n" : "");
      } else {
        addresses = addresses + lineItem.address + " " + "\n";
      }
      console.log("addresses1");
      console.log(addresses);

      if (!this.isForInstitutes) {
        for (let celebrator of lineItem.celebrators) {
/*           console.log("celebrator");
          console.log(celebrator.lastName); */

          addresses =
            addresses +
            (this.showIndexes ? celebrator.index + ". " : "") +
      /*       (celebrator.lastName ? celebrator.lastName : "") + */
            " " +
            celebrator.firstName +
            " " +
            (celebrator.patronymic ? celebrator.patronymic : "") +
            " " +
            (celebrator.yearBirthday > 0 ? celebrator.yearBirthday + " г.р." : "") +
            " " +
            (celebrator.comment1 ? celebrator.comment1 : "") +
            " " +
            (celebrator.linkPhoto ? celebrator.linkPhoto : "") +
            " " +
            (celebrator.specialComment ? celebrator.specialComment : "") +
            "\n";
        }
      }
      if (this.isForInstitutes) {
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
    addresses =
      addresses +
      "* - Я отправляю письма отправляются из нового приложения, поэтому прошу сообщить об ошибках, странностях и неточностях! Спасибо!\n\n";
    return addresses;
  }
  formAddressLinesForHtml() {
    let addresses = "";
    console.log(this.lineItems);
    for (let lineItem of this.lineItems) {
      if (!this.isForInstitutes) {
        addresses =
          addresses +
          "<p> <span style='font-weight: bold;'>" +
          lineItem.address +
          "</span><br> " +
          (lineItem.infoComment
            ? "<span style='font-style: italic;'>" +
              lineItem.infoComment +
              "</span><br>"
            : "") +
          (lineItem.adminComment
            ? "<span style='color: red; font-weight: bold;'>" +
              lineItem.adminComment +
              "</span><br>"
            : "");
      } else {
        addresses =
          addresses +
          "<p style='font-weight: bold;'>" +
          lineItem.address +
          "<br> ";
      }
      console.log("addresses1");
      console.log(addresses);

      if (!this.isForInstitutes) {
        for (let celebrator of lineItem.celebrators) {
 /*          console.log("celebrator");
          console.log(celebrator.lastName); */

          addresses =
            addresses +
            "<span>" +
            (this.showIndexes ? celebrator.index + ". " : "") +
         /*    (celebrator.lastName ? celebrator.lastName + " " : "") + */
            celebrator.firstName +
            " " +
            (celebrator.patronymic ? celebrator.patronymic + " " : "") +
            (celebrator.yearBirthday > 0 ? celebrator.yearBirthday + " г.р." : "") +
            " " +
            (celebrator.comment1 ? celebrator.comment1 : "") +
            " " +
            (celebrator.linkPhoto ? celebrator.linkPhoto : "") +
            " </span>" +
            "<span style='font-weight: bold; color: rgb(175, 19, 175);'>" +
            (celebrator.specialComment ? celebrator.specialComment : "") +
            "</span><br>";
        }
        addresses = addresses + "</p>";
      }
      if (this.isForInstitutes) {
        addresses =
          addresses +
          /*   "<p style='font-weight: bold;'>" + */
          lineItem.celebrators.length +
          " откр.: " +
          lineItem.Female +
          " жен. + " +
          lineItem.Male +
          " муж." +
          "</p>";
      }

      console.log("addresses2");
      console.log(addresses);
    }
    addresses =
      addresses +
      "<p style='font-style: italic; color: rgb(175, 19, 175);'>* - Я отправляю письма из нового приложения, поэтому прошу сообщить об ошибках, странностях и неточностях! Спасибо!</p>";

    return addresses;
  }
}
