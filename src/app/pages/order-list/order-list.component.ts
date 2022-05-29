/*
============================================
component file
;===========================================
*/

import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Order } from "../../shared/interfaces/order.interface";
import { OrderService } from "src/app/services/order.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { MatTableDataSource } from "@angular/material/table";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.css"],
})
export class OrderListComponent implements OnInit {
  orders: Order[];
  userName: string;
 
  displayedColumns = ["orderDate", "amount", "holiday", "fullName", "contact", "isAccepted", "edit", "delete"];

  constructor(
    private dialog: MatDialog,
    private orderService: OrderService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService,
    private messageService: MessageService
  ) {
    this.userName = this.cookieService.get("session_user");
    this.orderService.findAllOrdersByUserId(this.userName).subscribe(
      (res) => {
        this.orders = res["data"];
        console.log(this.orders);
      },
      (err) => {},
      () => {}
    );
  }

  ngOnInit(): void {}

  //Delete task function
/*   deleteOrder(qId: string) {
    console.log(qId);
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту запись?",
      accept: () => {
        if (qId) {
          console.log(qId);
          this.ordersService.deleteOrder(qId).subscribe(
            (res) => {
              console.log(res);
              //this.order = res["data"];
              this.ordersService.findAllOrders().subscribe(
                (res) => {
                  this.order = res["data"];
                },
                (err) => {},
                () => {}
              );
            },
            (err) => {
              console.log(err);
            },
            () => {
              //this.order = this.order.filter((q) => q._id !== qId);
              console.log(this.order);
              this.messageService.add({ severity: "warn", summary: "bcrs", detail: "Запись удалена." });
            }
          );
        }
      },
    });
  } */
}
