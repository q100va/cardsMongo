/*
============================================
 order-details component
;===========================================
*/
import { TeacherDay } from "src/app/shared/interfaces/teacher-day.interface";
import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ConfirmationService } from "primeng/api";
import { OrderService } from "src/app/services/order.service";
import { ListService } from "src/app/services/list.service";
import { ClientService } from "src/app/services/client.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { LineItem } from "src/app/shared/interfaces/line-item.interface";

import { Order } from "src/app/shared/interfaces/order.interface";
import { SelectionModel } from "@angular/cdk/collections";
import { Observable } from "rxjs/internal/Observable";
import { map, startWith } from "rxjs/operators";
import { Clipboard } from "@angular/cdk/clipboard";
import { Client } from "src/app/shared/interfaces/client.interface";
import { CreateClientDialogComponent } from "src/app/shared/create-client-dialog/create-client-dialog.component";
import { UpdateClientDialogComponent } from "src/app/shared/update-client-dialog/update-client-dialog.component";

@Component({
  selector: "app-teacher-day",
  templateUrl: "./teacher-day.component.html",
  styleUrls: ["./teacher-day.component.css"],
})
export class TeacherDayComponent implements OnInit {
  order: Order;
  userName: string;
  form: FormGroup;
  holiday: string = "День учителя и дошкольного работника 2024";
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
  notSaved: Boolean = true;
  hide: Boolean = false;
  ready: Boolean = false;
  order_id: any;
  contactReminder: string = "";
  spinner: Boolean = false;
  /*  addressFilter: string = "any";
  genderFilter: string = "any";
  regions: Array<string> = []; */
  teacherDays: Array<any> = [];
  clientFirstName: string = "";

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
  showList = true;
  isForInstitutes = false;

  showIndexes: false;
  showInstruction: false;

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
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private listService: ListService,
    private clientService: ClientService,
    private clipboard: Clipboard,
    public dialog: MatDialog
  ) {
    this.userName = this.cookieService.get("session_user");
  }

  displayedColumns = [
    "check",
    "plusAmount",
    "name",
    "DOB",
    "holiday",
    "house",
    "region",
  ];

  dataSource: MatTableDataSource<TeacherDay>;
  selection = new SelectionModel<TeacherDay>(true, []);

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

    this.form = this.fb.group({
      clientFirstName: [null],
      clientPatronymic: [null],
      clientLastName: [null],
      //email: [null, Validators.compose([Validators.email])],
      contactType: [this.defaultType],
      contact: [null, [Validators.required]],
      //institute: [null],
      institutes: this.fb.array([]),
      amount: [
        null,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],
      isAccepted: [false],
      source: [null, Validators.compose([Validators.required])],
      comment: [null],
      nameOfInstitute: [null],
      categoryOfInstitute: [null],
    });

    this.filteredOptions = this.form.controls.contact.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value || ""))
    );

    this.listService.findAllTeacherDayLists().subscribe(
      (res) => {
        this.teacherDays = res["data"];
        this.teacherDays.sort((prev, next) =>
          prev.nursingHome > next.nursingHome ? 1 : -1
        );
        this.teacherDays.sort(
          (prev, next) => prev.monthHoliday - next.monthHoliday
        );
        this.dataSource = new MatTableDataSource(this.teacherDays);
        console.log(this.teacherDays);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  private addCheckboxes() {
    this.clientInstitutes.forEach(() =>
      this.institutes.push(new FormControl(false))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    /*     console.log("value");
    console.log(value);
    console.log("this.options");
    console.log(this.options); */

    let result = this.options.filter((option) => option.includes(filterValue));
    return result;
  }

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
            this.showList = true;
            this.isForInstitutes = false;
          }
        }
      } else {
        this.client = undefined;
        this.clientInstitutes = [];
        this.previousClient = "";
        this.institutes.clear();
        this.selectedInstitutes = [];
        this.showList = true;
        this.isForInstitutes = false;
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
      this.showList = false;
      //this.isForInstitutes = true;
    } else {
      this.showList = true;
     // this.isForInstitutes = false;
    }
  }

  //***

  clear(): void {
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.clientFirstName = "";
    this.lineItems = [];
    this.canSave = false;
    this.form.reset();
    this.notSaved = true;
    this.hide = false;
    this.selection.clear();
    this.listService.findAllTeacherDayLists().subscribe(
      (res) => {
        this.teacherDays = res["data"];
        this.teacherDays.sort((prev, next) =>
          prev.nursingHome > next.nursingHome ? 1 : -1
        );
        this.teacherDays.sort(
          (prev, next) => prev.monthHoliday - next.monthHoliday
        );
        this.dataSource = new MatTableDataSource(this.teacherDays);
      },
      (err) => {
        console.log(err);
      }
    );

    this.showIndexes = false;
    this.showInstruction = false;

    this.holiday = "День учителя и дошкольного работника 2024";
    this.options = [];
    this.fullOptions = [];
    this.clientInstitutes = [];
    this.client = undefined;
    this.previousClient = "";
    this.form.controls.contactType.setValue(this.defaultType);
    this.showList = true;
    this.isForInstitutes = false;

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

  checkOrder() {
    
     const selectedInstitutes = this.form.value.institutes
      .map((checked, i) => (checked ? this.clientInstitutes[i] : null))
      .filter((v) => v !== null);

      console.log("коллектив проверка");
      console.log(this.client.institutes.length);
      console.log(this.form.controls.amount.value);
      console.log(selectedInstitutes.length);


      if (
        (this.client.institutes.length > 0 ||
          this.form.controls.amount.value > 20) &&
        selectedInstitutes.length == 0
      ) {
        console.log("коллектив?");
        this.confirmationService.confirm({
          message: "Вы уверены, что эта заявка не для колллектива?",
          accept: () => this.createOrder(),
        });
      } else {
        this.createOrder();
  }
}

  createOrder() {
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.clientFirstName = "";
    this.lineItems = [];
    this.canSave = false;
      if (!this.form.controls.contact.value) {
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Обязательно укажите email или другой возможный контакт!",
          },
          disableClose: true,
          width: "fit-content",
        });
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
        } else {
          let temporaryLineItems = [];
          if (this.showList) {
            for (let value of this.selection["_selection"]) {
              temporaryLineItems.push(value);
            }

            console.log(
              "temporaryLineItems.length != this.form.controls.amount.value"
            );
            console.log(temporaryLineItems.length);
            console.log(this.form.controls.amount.value);
          }

          if (
            temporaryLineItems.length != this.form.controls.amount.value &&
            this.showList
          ) {
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message:
                  "Количества выбранных и указанных адресов должны совпадать.",
              },
              disableClose: true,
              width: "fit-content",
            });
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
            } else {
              console.log("orderService.checkDoubleOrder");
              this.orderService
                .checkDoubleOrder(this.holiday, this.client._id)
                .subscribe(
                  async (res) => {
                    let result = res["data"];
                    console.log("result");
                    console.log(result);
                    if (!result) {
                      console.log("!result");
                      console.log(result);
                      if (this.showList) {
                        this.saveOrder(temporaryLineItems);
                      } else {
                        this.createOrderForInstitute();
                      }
                    } else {
                      let usernameList = "";
                      for (let user of result.users) {
                        usernameList =
                          usernameList.length == 0
                            ? user
                            : usernameList + ", " + user;
                      }
                      this.confirmationService.confirm({
                        message:
                          "Пользователь с такими контактами уже получил адреса на праздник '" +
                          this.holiday +
                          "' у волонтера(ов): " +
                          usernameList +
                          ". Вы уверены, что это не дубль?",
                        accept: () => {
                          if (this.showList) {
                            this.saveOrder(temporaryLineItems);
                          } else {
                            this.createOrderForInstitute();
                          }
                        },
                      });
                    }
                  },
                  (err) => {
                    this.errorMessage = err.error.msg + " " + err.message;
                    console.log(err);
                  }
                );
            }
          }
        }
      }
    }
  

  createOrderForInstitute() {
    this.isForInstitutes = true;
    const selectedInstitutes = this.form.value.institutes
      .map((checked, i) => (checked ? this.clientInstitutes[i] : null))
      .filter((v) => v !== null);

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
      institutes: selectedInstitutes,
      amount: this.form.controls.amount.value,
      isAccepted: this.form.controls.isAccepted.value ? true : false,
      source: this.form.controls.source.value,
      comment: this.form.controls.comment.value,
      orderDate: this.orderDate,
      dateOfOrder: new Date(),
      // temporaryLineItems: temporaryLineItems,
    };

    console.log("newOrder");
    console.log(newOrder);

    this.orderService.createOrderForTeacherDayForInstitute(newOrder).subscribe(
      async (res) => {
        this.spinner = false;
        this.hide = true;
        this.notSaved = false;
        let result = res["data"]["result"];
        if (typeof result == "string") {
          this.errorMessage = result;
          console.log(this.errorMessage);
        } else {
          //alert(res.msg);
          console.log("result");
          console.log(result);
          console.log(this.notSaved);
          this.lineItems = result;

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
          console.log(res);
        }
      },
      (err) => {
        this.spinner = false;
        this.errorMessage = err.error.msg + " " + err.message;
        console.log(err);
      }
    );
  }

  saveOrder(temporaryLineItems) {
    this.isForInstitutes = false;

    const selectedInstitutes = this.form.value.institutes
      .map((checked, i) => (checked ? this.clientInstitutes[i] : null))
      .filter((v) => v !== null);

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
      institutes: selectedInstitutes,
      amount: this.form.controls.amount.value,
      isAccepted: this.form.controls.isAccepted.value ? true : false,
      source: this.form.controls.source.value,
      comment: this.form.controls.comment.value,
      orderDate: this.orderDate,
      dateOfOrder: new Date(),
      temporaryLineItems: temporaryLineItems,
    };

    console.log("newOrder");
    console.log(newOrder);
    console.log(this.selection);
    this.orderService.createOrderForTeacherDay(newOrder).subscribe(
      async (res) => {
        this.spinner = false;
        this.hide = true;
        this.notSaved = false;
        let result = res["data"]["result"];
        if (typeof result == "string") {
          this.errorMessage = result;
          console.log(this.errorMessage);
        } else {
          //alert(res.msg);
          console.log("result");
          console.log(result);
          console.log(this.notSaved);
          this.lineItems = result;
          let i = 0;
          for (let lineItem of this.lineItems) {
            for (let celebrator of lineItem.celebrators) {
              celebrator.index = i + 1;
              i++;
            }
          }
          this.canSave = true;
          this.successMessage =
            "Ваша заявка сформирована и сохранена. Пожалуйста, скопируйте список и отправьте поздравляющему. Если список вас не устраивает, удалите эту заявку и обратитесь к администратору.";
          this.contactReminder = " для " + res["data"]["contact"];
          this.clientFirstName = res["data"]["clientFirstName"];
          console.log(res);
        }
      },
      (err) => {
        this.spinner = false;
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
        "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ письмами/открытками (НЕ заказными).\n – Каждому адресату отправляйте отдельную открытку в отдельном конверте или отдельную почтовую открытку без конверта.\n – Учтите, что по России письма идут 14-20 дней.\n\n" +
        "Как писать поздравления?\n – Используйте обращение на 'Вы' и по имени-отчеству (если отчество указано).\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n – По возможности укажите ваш обратный адрес (кроме случаев, когда мы просим этого не делать)*.\n – Адрес и ИО получателя на конверте или почтовой открытке укажите обязательно в правом нижнем углу.\n\n" +
        "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде не указывайте ваш телефон (даже, если есть такое поле на конверте), если не готовы на 200%, что вам начнут звонить и писать в любое время.\n – Если написано, что поздравления нужно отправлять без указания обратного адреса, не давайте свой обратный адрес и любые другие контакты*.\n\n" +
        "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваша открытка вернулась, также сообщите нам.\n\n" +
        "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, бандероли, заказные/ценные письма, письма первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
        "Помогите обеспечить горячей едой одиноких пожилых людей. Сделайте пожертвование на - https://starikam.org/campaign/lyudyam-nuzhna-goryachaya-eda/\n\n" +
        "Примите нашу искреннюю благодарность за помощь!\nБудут вопросы — обращайтесь!\n\n" +
        "* - Мы просим отправлять без указания обратного адреса поздравления в психоневрологические интернаты (ПНИ) и специальные интернаты по настоятельной просьбе администрации этих учреждений, чтобы их жители не потревожили поздравляющих ответными письмами. Если в вашем списке есть такой адрес, то под ним обязательно идет соответствующий комментарий: (администрация настоятельно просит не указывать ваш личный адрес на отправлениях в этот интернат, в графе откуда укажите адрес вашего почтового отделения, в графе от кого – Волонтер и ваше имя). Если такого комментария нет, то можете указать свой личный адрес.";
    } else {
      top =
        "Пожалуйста, подтвердите получение этого письма, ответив на него!\n\n" +
        "Мы получили вашу заявку и очень рады вашему участию!\n\n" +
        "В правила поздравления были внесены изменения, поэтому сообщаю вам только адреса интернатов и количество поздравляемых, то есть открытки будут не именные.\n Открытки нужно будет отправить ПРОСТОЙ бандеролью на адрес интерната через Почту России. НЕ заказной, НЕ ценной, НЕ первого класса и никакой другой регистрируемой. Потому что простую бандероль почтальон приносит в интернат, а за регистрируемыми отправлениями нужно идти на почту с доверенностью. Правда, к сожалению, простая бандероль не имеет трек номера и ее нельзя отследить.\n То есть все открытки нужно упаковать в один почтовый пакет (или конверт), заполнить адресную часть и отнести на почту, там отправить ПРОСТУЮ бандероль через оператора. Если вес будет менее 100 г, то отправление оформят как простое письмо с доплатой за вес. Часто работники почты уговаривают отправителей на заказные или ценные бандероли, говорят, что это быстрее и надежнее, но нам такой вариант совершенно не подходит, так как такие отправления с 99% вероятностью вернутся обратно.\n\n" +
        "ДЕНЬ УЧИТЕЛЯ - 5 октября 2024" +
        "\n" +
        "Если какие-то адреса вам не подходят, обязательно возвращайте - заменю.\n" +
        "Если вы не сможете отправить открытки, сообщите мне, как можно скорее, чтобы я могла их передать другому поздравляющему.\n\n";
      bottom =
        "Отправляйте письма правильно!\n – Открытки отправляйте Почтой России только ПРОСТЫМИ бандеролями (от 100 г до 5 кг) или ПРОСТЫМИ письмами (до 100 г).\n – Рассчитывайте, что срок доставки будет примерно 14-20 дней.\n – В графе 'кому' указывайте название интерната (учреждения). Указывать ФИО получателя совершенно не обязательно.\n – На конверте/пакете укажите название праздника/праздников. (Например, 'День учителя').\n\n" +
        "Как писать поздравления?\n – Начните ваше поздравление с приветствия: 'Добрый день! Поздравляю Вас...' или 'Добрый день! Поздравляю Вас...'.\n –  В поздравлениях с Днем учителя можно использовать обращения: 'Дорогая учительница!', 'Уважаемый преподаватель!'. \n – Не используйте такие обращения, как 'дедушка' или 'бабушка': в интернатах проживают и молодые люди - инвалиды.\n – Обязательно используйте обращение на 'Вы'.\n – Пишите поздравления от себя лично (не от организации, не от школы, не от фонда).\n – Подпишитесь своим именем, укажите город и добавьте пару слов о себе.\n\n" +
        "Что писать не надо.\n – Не желайте семейного уюта, любви близких, финансового благополучия и т.п.\n – Нигде в открытке (или на конверте, если каждая открытка в конверте) не указывайте ваш телефон, если не готовы на 200%, что вам начнут звонить и писать в любое время.\n\n" +
        "Получили ответ?\n – Если получили ответ от жителя интерната, обязательно сообщите об этом нам.\n – Не вступайте в переписку с ответившим до того, как это будет согласовано с координатором.\n – Если ваше отправление вернулось, также сообщите нам.\n\n" +
        "Чего просим не делать.\n – Запрещены любые публикации (в соцсетях, на сайтах учебных заведений, на личных страницах и т.д.) адресов и/или ФИО наших подопечных (в т.ч. фото конвертов или открыток, на которых указаны адрес и/или ФИО подопечного).\n – Не отправляйте подарки, сувениры и гостинцы, чтобы не омрачить праздник других людей.\n – Не отправляйте посылки, заказные/ценные бандероли, заказные/ценные письма, письма и бандероли первого класса и прочие регистрируемые отправления, так как возможны проблемы с получением подобной корреспонденции и ваше отправление может вернуться.\n – По указанным адресам нужно отправить открытки только один раз: не нужно поздравлять людей со всеми праздниками или писать им письма!\n\n" +
        "Помогите обеспечить горячей едой одиноких пожилых людей. Сделайте пожертвование на - https://starikam.org/campaign/lyudyam-nuzhna-goryachaya-eda/\n\n" +
        "Примите нашу искреннюю благодарность за помощь!\nБудут вопросы — обращайтесь!\n\n";
    }
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
      if (!this.isForInstitutes) {
        for (let celebrator of lineItem.celebrators) {
          addresses =
            addresses +
            (this.showIndexes ? celebrator.index + ". " : "") +
            celebrator.lastName +
            " " +
            celebrator.firstName +
            " " +
            celebrator.patronymic +
            " (" +
            celebrator.yearBirthday +
            "г.р.) " +
            celebrator.comment1 +
            " - " +
            celebrator.teacher +
            " " +
            (celebrator.linkPhoto ? celebrator.linkPhoto : "") +
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
    }
    if (this.showInstruction) {
      addresses = greeting + top + addresses + bottom;
    }
    console.log("addresses");
    console.log(addresses);
    const successful = this.clipboard.copy(addresses);
    console.log("successful");
    console.log(successful);
  }
}
