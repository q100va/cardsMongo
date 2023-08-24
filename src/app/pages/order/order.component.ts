/*
============================================
 order-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ConfirmationService } from "primeng/api";
import { OrderService } from "src/app/services/order.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { LineItem } from "src/app/shared/interfaces/line-item.interface";
import { Order } from "src/app/shared/interfaces/order.interface";

//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.css"],
})
export class OrderComponent implements OnInit {
  order: Order;
  userName: string;
  form: FormGroup;
  holiday: string = "Дни рождения сентября 2023";
  lineItems: Array<LineItem>;
  types: Array<string> = [
    "phoneNumber",
    "whatsApp",
    "telegram",
    "vKontakte",
    "instagram",
    "facebook",
  ];
  orderDate: string = new Date().toLocaleDateString();
  counter: Array<number> = [];
  successMessage: string = "";
  errorMessage: string = "";
  canSave: Boolean = false;
  ready: Boolean = false;
  order_id: any;
  contactReminder: string = "";
  spinner: Boolean = false;
  clicked: Boolean = false;
  useProportion: Boolean = false;
  addressFilter: string = "any";
  genderFilter: string = "any";
  regions = [];
  nursingHomes = [];
  activeNursingHomes = [];
  actualYear = new Date().getFullYear();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private orderService: OrderService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private fb: FormBuilder
  ) {
    this.userName = this.cookieService.get("session_user");
  }

  ngOnInit(): void {
    /*     this.orderService.getRegions().subscribe(
      async (res) => {
        this.regions = res["data"];
      },
      (err) => {
        console.log(err);
      }
    ); */

    this.orderService.getNursingHomes().subscribe(
      async (res) => {
        this.nursingHomes = res["data"]["nursingHomes"];
        this.activeNursingHomes = res["data"]["nursingHomes"];
        this.regions = res["data"]["regions"];
      },
      (err) => {
        console.log(err);
      }
    );

    this.form = this.fb.group({
      clientFirstName: [null],
      clientPatronymic: [null],
      clientLastName: [null],
      email: [null, Validators.compose([Validators.email])],
      contactType: [null],
      contact: [null],
      institute: [null],
      amount: [null, Validators.compose([Validators.required, Validators.min(1)])],
      isAccepted: [false],
      comment: [null],
      femaleAmount: [null, [Validators.min(1)]],
      maleAmount: [null, [Validators.min(1)]],
      year1: [null, [Validators.min(1900), Validators.max(this.actualYear)]],
      year2: [null, [Validators.min(1900), Validators.max(this.actualYear)]],
      date1: [null, [Validators.min(1), Validators.max(31)]],
      date2: [null, [Validators.min(1), Validators.max(31)]],
      region: [null],
      nursingHome: [null],
      onlyWithPicture: [false],
      onlyAnniversaries: [false],
    });
  }

  correctProportion(genderValue: string) {
    if (genderValue == 'proportion') {
      this.useProportion = true;
    } else {
      this.useProportion = false;
      this.form.controls.femaleAmount.setValue(null),
      this.form.controls.maleAmount.setValue(null)
    }

  }

  changeNursingHomesList(event) {
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

  changeRegionsSelection(event) {
    console.log(this.form.controls.region.value);
    console.log(this.form.controls.nursingHome.value);
    if (this.form.controls.nursingHome.value) {
      console.log("homes were chosen");
      let activeNursingHome = this.nursingHomes.filter(
        (item) => item.nursingHome == this.form.controls.nursingHome.value
      );

      this.form.controls.region.setValue(activeNursingHome[0].region);

      // console.log(this.activeNursingHomes);
    }
  }

  exit() {
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите выйти без сохранения заявки?",
      accept: () => {
        this.successMessage = "";
        this.errorMessage = "";
        this.contactReminder = "";
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
  }

  clear(): void {
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.lineItems = [];
    this.canSave = false;
    this.form.reset();
    this.addressFilter = "any";
    this.genderFilter = "any";
    this.clicked = false;
    this.useProportion = false;

  }
/*   beforeCreateOrder() {
    console.log("this.spinner");
    console.log(this.spinner);
    if (!this.spinner) {
      this.createOrder();
    } else {
      console.log("Clicked twice!");
    }
  } */
  createOrder() {
    this.clicked = true;
    this.successMessage = "";
    this.errorMessage = "";
    this.contactReminder = "";
    this.lineItems = [];
    this.canSave = false;

    if (!this.form.controls.email.value && !this.form.controls.contact.value) {
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
        !this.form.controls.contactType.value &&
        this.form.controls.contact.value
      ) {
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Обязательно выберите тип другого возможного контакта!",
          },
          disableClose: true,
          width: "fit-content",
        });
        this.clicked = false;
      } else {
        if (
          this.form.controls.contactType.value &&
          !this.form.controls.contact.value
        ) {
          this.resultDialog.open(ConfirmationDialogComponent, {
            data: {
              message:
                "Укажите другой контакт или выберите 'пусто' в поле 'Другой контакт'!",
            },
            disableClose: true,
            width: "fit-content",
          });
          this.clicked = false;
        } else {
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

              if(this.genderFilter == "proportion" && this.form.controls.femaleAmount.value + this.form.controls.maleAmount.value != this.form.controls.amount.value) {
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
              this.orderService
                .checkDoubleOrder(
                  this.holiday,
                  this.form.controls.email.value,
                  this.form.controls.contact.value
                )
                .subscribe(
                  async (res) => {
                    let result = res["data"];
                    // console.log("res");
                    // console.log(res);
                    if (!result) {
                      this.fillOrder([]);
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
                          "Пользователь с такими контактами уже получил адреса на этот праздник: " +
                          this.holiday +
                          " у волонтера(ов): " +
                          usernameList +
                          ". Вы уверены, что это не дубль?",
                        accept: () => this.fillOrder(result.seniorsIds),
                        reject: () =>  this.clicked = false
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
          }
        }
      }
    }
  }}

  fillOrder(prohibitedId: []) {
    this.spinner = true;
    let newOrder: Order = {
      userName: this.userName,
      holiday: this.holiday,
      clientFirstName: this.form.controls.clientFirstName.value,
      clientPatronymic: this.form.controls.clientPatronymic.value,
      clientLastName: this.form.controls.clientLastName.value,
      email: this.form.controls.email.value,
      contactType: this.form.controls.contactType.value,
      contact: this.form.controls.contact.value,
      institute: this.form.controls.institute.value,
      amount: this.form.controls.amount.value,
      isAccepted: this.form.controls.isAccepted.value ? true : false,
      comment: this.form.controls.comment.value,
      orderDate: this.orderDate,
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
        onlyWithPicture: this.form.controls.onlyWithPicture.value,
        onlyAnniversaries: this.form.controls.onlyAnniversaries.value,
      },
    };

    //console.log("newOrder");
    //console.log(newOrder);

    this.orderService.createOrder(newOrder, prohibitedId).subscribe(
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
          this.canSave = true;
          this.successMessage =
            "Ваша заявка сформирована и сохранена. Пожалуйста, скопируйте список и отправьте поздравляющему. Если список вас не устраивает, удалите эту заявку и обратитесь к администратору.";
            this.contactReminder = " Эти адреса для " + res["data"]["contact"];
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
}

/*   checkOrder(lineItems, lists) {
    let isDoubles: boolean = false;
    for (let lineItem of lineItems) {
      for (let celebrator of lineItem.celebrators) {
        for (let list of lists) {
          console.log(list);
          let index = list.celebrators.findIndex(
            (item) => item.celebrator_id == celebrator.celebrator_id
          );
          console.log(index);
          console.log(list.celebrators[index]);
          if(index>-1) {
          if (
            (list.celebrators[index].plusAmount > 2 &&
              !list.celebrators[index].oldest) ||
            (list.celebrators[index].plusAmount > 3 &&
              list.celebrators[index].oldest)
          ) {
            isDoubles = true;
          } else {
          }
        }
        }
      }
    }
    return isDoubles;
  } */

/* generateOrder() {
    this.successMessage = "";
    this.lineItems = [];
    this.canSave = false;

    if (!this.form.controls.email.value && !this.form.controls.contact.value) {
      this.resultDialog.open(ConfirmationDialogComponent, {
        data: {
          message: "Обязательно укажите email или другой возможный контакт!",
        },
        disableClose: true,
        width: "fit-content",
      });
    } else {
      if (
        !this.form.controls.contactType.value &&
        this.form.controls.contact.value
      ) {
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Обязательно выберите тип другого возможного контакта!",
          },
          disableClose: true,
          width: "fit-content",
        });
      } else {
        if(this.form.controls.contactType.value &&
          !this.form.controls.contact.value){
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message: "Укажите другой контакт или выберите 'пусто' в поле 'Другой контакт'!",
              },
              disableClose: true,
              width: "fit-content",
            });
          }
        else {
        this.orderService
          .getProportion(this.form.controls.amount.value)
          .subscribe(
            (res) => {
              let proportion = res["data"];
              console.log(res);
              this.orderService.getLists().subscribe(
                (res) => {
                  let allLists = res["data"];
                  console.log(res);
                  this.orderService.findNursingHomes().subscribe(
                    (res) => {
                      let nursingHomes = res["data"];
                      console.log(res);
                      let result = this.orderService.generateOrder(
                        proportion,
                        allLists,
                        nursingHomes
                      );
                      if (!result) {
                        this.successMessage =
                          "Список не может быть сформирован из-за недостатка адресов. Обратитесь к администратору.";
                        console.log(this.successMessage);
                      } else {
                        this.lineItems = result;
                        this.canSave = true;
                        this.successMessage =
                          "Это предварительный список! Не отправляйте его поздравляющему!";
                                         }
                    },
                    (err) => {
                      console.log(err);
                    }
                  );
                },
                (err) => {
                  console.log(err);
                }
              );
            },
            (err) => {
              console.log(err);
            }
          );
      }}
    }
  }
   */
