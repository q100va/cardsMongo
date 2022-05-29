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
import { OrderService } from "src/app/services/order.service";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private resultDialog: MatDialog,
    private fb: FormBuilder,
    private cookieService: CookieService,
  ) {
    this.orderId = this.route.snapshot.paramMap.get("id");
    console.log(this.orderId);

    this.orderService.findOrderById(this.orderId).subscribe(
      (res) => {
        console.log(res["data"]);
        this.order = res["data"];
        this.needAccepting = this.needAccepting
          ? "Требует подтверждения"
          : "Не требует подтверждения";
        this.noRestricted = this.noRestricted ? "Без БОА" : "";
        this.fullName = (this.order.clientLastName
        ? this.order.clientLastName
        : "") + " " + (this.order.clientFirstName
          ? this.order.clientFirstName
          : "") + " " + (this.order.clientPatronymic
          ? this.order.clientPatronymic
          : "") + (this.order.institute
          ? this.order.institute
          : "")
          ;
          this.contact = (this.order.email
          ? this.order.email
          : "") + " " + (this.order.contactType
          ? this.order.contactType
          : "") + " " + (this.order.contact
          ? this.order.contact
          : "") ;

          
      },
      (err) => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {}

  close(): void {
    this.userName = this.cookieService.get("session_user");
    this.router.navigate(["/orders/find/"+ this.userName]);
    //alert("Order information is canceled.");
  }
}
