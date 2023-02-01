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

@Component({
  selector: "app-february23",
  templateUrl: "./february23.component.html",
  styleUrls: ["./february23.component.css"],
})
export class February23Component implements OnInit {
  order: Order;
  userName: string;
  form: FormGroup;
  holiday: string = "23 февраля 2023";
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
  spinner: Boolean = false;
  addressFilter: string = "any";
  genderFilter: string = "Male";
  regions: Array<string> = [];

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
    this.orderService.getRegions().subscribe(
      async (res) => {
        this.regions = res["data"];
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
      amount: [null, Validators.compose([Validators.required])],
      isAccepted: [false],
      comment: [null],
      year1: [null],
      year2: [null],
      date1: [null],
      date2: [null],
      region: [null],
      nursingHome: [null],
      onlyWithPicture: [false],
    });
  }

  exit() {
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите выйти без сохранения заявки?",
      accept: () => {
        this.successMessage = "";
        this.errorMessage = "";
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
    this.lineItems = [];
    this.canSave = false;
    this.form.reset();
    this.addressFilter = "any";
    this.genderFilter = "Male";
  }

  createOrder() {
    this.successMessage = "";
    this.errorMessage = "";
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
        } else {
          console.log(this.form.controls.year2.value);
          console.log(this.form.controls.year1.value);
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
            console.log("ERROR");
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
        date1: this.form.controls.date1.value,
        date2: this.form.controls.date2.value,
        region: this.form.controls.region.value,
        nursingHome: this.form.controls.nursingHome.value,
        onlyWithPicture: this.form.controls.onlyWithPicture.value,
      },
    };

    console.log("newOrder");
    console.log(newOrder);

    this.orderService.createOrderSpring(newOrder, prohibitedId).subscribe(
      async (res) => {
        this.spinner = false;
        let result = res["data"]["result"];
        if (typeof result == "string") {
          this.errorMessage = result;
          console.log(res);
        } else {
          //alert(res.msg);
          console.log(res);
          this.lineItems = result;
          this.canSave = true;
          this.successMessage =
            "Ваша заявка сформирована и сохранена. Пожалуйста, скопируйте список и отправьте поздравляющему. Если список вас не устраивает, удалите эту заявку и обратитесь к администратору.";
        }
      },
      (err) => {
        this.spinner = false;
        this.errorMessage = err.error.msg + " " + err.message;
        console.log(err);
      }
    );
  }
}
