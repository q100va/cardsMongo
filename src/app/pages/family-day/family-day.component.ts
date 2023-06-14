/*
============================================
 order-details component
;===========================================
*/

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ConfirmationService } from "primeng/api";
import { OrderService } from "src/app/services/order.service";
import { ListService } from "src/app/services/list.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { LineItem } from "src/app/shared/interfaces/line-item.interface";
import { FamilyDay } from "src/app/shared/interfaces/family-day.interface";
import { Order } from "src/app/shared/interfaces/order.interface";
import { SelectionModel } from "@angular/cdk/collections";

@Component({
  selector: "app-family-day",
  templateUrl: "./family-day.component.html",
  styleUrls: ["./family-day.component.css"],
})
export class FamilyDayComponent implements OnInit {
  order: Order;
  userName: string;
  form: FormGroup;
  holiday: string = "День семьи 2023";
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
  notSaved: Boolean = true;
  hide: Boolean = false;
  ready: Boolean = false;
  order_id: any;
  spinner: Boolean = false;
  /*  addressFilter: string = "any";
  genderFilter: string = "any";
  regions: Array<string> = []; */
  familyDays: Array<FamilyDay> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private orderService: OrderService,
    private resultDialog: MatDialog,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private listService: ListService
  ) {
    this.userName = this.cookieService.get("session_user");
  }

  displayedColumns = [
    "check",
    "plusAmount",
    "name",
    "comment1",    
    "house",
    "region",
  ];
  dataSource: MatTableDataSource<FamilyDay>;
  selection = new SelectionModel<FamilyDay>(true, []);

  ngOnInit(): void {
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
    });

    this.listService.findLessFamilyDayLists().subscribe(
      (res) => {
        this.familyDays = res["data"];
        this.familyDays.sort((prev, next) => prev.nursingHome > next.nursingHome ? 1 : -1);
        this.dataSource = new MatTableDataSource(this.familyDays);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  clear(): void {
    this.successMessage = "";
    this.errorMessage = "";
    this.lineItems = [];
    this.canSave = false;
    this.form.reset();
    this.notSaved = true;
    this.hide = false;
    this.selection.clear();
    this.listService.findLessFamilyDayLists().subscribe(
      (res) => {
        this.familyDays = res["data"];
        this.familyDays.sort((prev, next) => prev.nursingHome > next.nursingHome ? 1 : -1);
        this.dataSource = new MatTableDataSource(this.familyDays);
      },
      (err) => {
        console.log(err);
      }
    );
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
          let temporaryLineItems = [];

          for (let value of this.selection["_selection"]) {
            temporaryLineItems.push(value);
          }
          console.log(temporaryLineItems);
          if (temporaryLineItems.length != this.form.controls.amount.value) {
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message:
                  "Количества выбранных и указанных адресов должны совпадать.",
              },
              disableClose: true,
              width: "fit-content",
            });
          } else {
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
              temporaryLineItems: temporaryLineItems,
            };

            console.log("newOrder");
            console.log(newOrder);
            console.log(this.selection);

            this.orderService.createOrderForFamilyDay(newOrder).subscribe(
              async (res) => {
                this.spinner = false;
                this.hide = true;
                this.notSaved = false;
                let result = res["data"];
                if (typeof result == "string") {
                  this.errorMessage = res["data"];
                  console.log(res);
                } else {
                  //alert(res.msg);
                  console.log("result");
                  console.log(result);
                  console.log(this.notSaved);
                  this.lineItems = result;
                  this.canSave = true;
                  this.successMessage =
                    "Ваша заявка сформирована и сохранена. Пожалуйста, скопируйте список и отправьте поздравляющему. Если список вас не устраивает, удалите эту заявку и создайте другую.";
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
      }
    }
  }
}
