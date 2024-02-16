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
//import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
import { Order } from "src/app/shared/interfaces/order.interface";
//import { ConfirmationService } from "primeng/api";
//import { MessageService } from "primeng/api";

@Component({
  selector: "app-order-details",
  templateUrl: "./order-details.component.html",
  styleUrls: ["./order-details.component.css"],
})
export class OrderDetailsComponent implements OnInit {
  order: Order;
  text: string;
  orderId: string;
  form: FormGroup;
  fullName: string;
  needAccepting: string;
  noRestricted: string;
  contact: string;
  userName: string;
  isEdit = false;
  isNotLate = false;
  isNotOnlyOne = true;
  openHolidays = [
    "Дни рождения марта 2024",
    "Дни рождения февраля 2024",
    "Дни рождения апреля 2024",
    "Именины марта 2024",
    "Именины февраля 2024",
    "Именины апреля 2024",
    "Новый год 2024",
    "8 марта 2024",
    "23 февраля 2024"
  ];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private resultDialog: MatDialog,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private confirmationService: ConfirmationService
  ) {
    this.orderId = this.route.snapshot.paramMap.get("id");
    console.log(this.orderId);
  }

  ngOnInit(): void {
    this.orderService.findOrderById(this.orderId).subscribe(
      (res) => {
        this.findOrder(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  findOrder(res) {
    console.log(res["data"]);
    this.order = res["data"];
    this.needAccepting = !this.order.isAccepted
      ? "Требует подтверждения"
      : "Не требует подтверждения";
    this.noRestricted = this.noRestricted ? "Без БОА" : "";
    let institutes = "";
    for (let item of this.order.institutes) {
      institutes = institutes + " " + item.name;
    }
    this.fullName =
      (this.order.clientLastName ? this.order.clientLastName : "") +
      " " +
      (this.order.clientFirstName ? this.order.clientFirstName : "") +
      " " +
      (this.order.clientPatronymic ? this.order.clientPatronymic : "") + " " + institutes;

    this.contact =
      (this.order.email ? this.order.email : "") +
      " " +
      (this.order.contactType ? this.order.contactType : "") +
      " " +
      (this.order.contact ? this.order.contact : "");
    console.log("this.order.holiday");
    console.log(this.order.holiday);

    if (this.openHolidays.find((item) => item == this.order.holiday)) {
      this.isNotLate = true;
      console.log("this.isNotLate");
      console.log(this.isNotLate);
    }

    if (this.order.amount == 1) {
      this.isNotOnlyOne = false;
    }
    console.log;

    console.log(
      "Conditions:" +
        !this.order.isOverdue +
        !this.order.isReturned +
        this.isNotOnlyOne +
        this.isNotLate
    );
  }

  editList() {
    this.isEdit = true;
  }

  viewList() {
    this.isEdit = false;
  }

  deleteDestination(idCelebrator: string) {
    // console.log("start");

    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить этого адресата?",
      accept: () => {
        this.orderService
          .deleteDestinationFromOrder(this.orderId, idCelebrator)
          .subscribe(
            (res) => {
              this.findOrder(res);
            },
            (err) => {
              console.log(err);
            }
          );
      },
    });
  }

  close(): void {
    this.userName = this.cookieService.get("session_user");
    this.router.navigate(["/orders/find/" + this.userName]);
    //alert("Order information is canceled.");
  }
}
