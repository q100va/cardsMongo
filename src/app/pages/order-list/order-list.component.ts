/*
============================================
component file
;===========================================
*/

import { HttpClient } from "@angular/common/http";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Order } from "../../shared/interfaces/order.interface";
import { OrderService } from "src/app/services/order.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { MatTableDataSource } from "@angular/material/table";
import { CookieService } from "ngx-cookie-service";
import { MatPaginator } from "@angular/material/paginator";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
//import {MatSort, SortDirection} from '@angular/material/sort';

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.css"],
})
export class OrderListComponent implements AfterViewInit {
  orders: Order[];
  allOrders: Order[];
  notConfirmedOrders: Order[];
  userName: string;
  isShowAll: boolean = false;

  constructor(
    private dialog: MatDialog,
    private orderService: OrderService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private resultDialog: MatDialog
  ) {
    this.userName = this.cookieService.get("session_user");
  }
  @ViewChild("paginator") paginator: MatPaginator;
  displayedColumns = [
    "orderDate",
    "amount",
    "fullName",
    "contact",
    "isAccepted",
    "confirm",
    "edit",
    "delete",
    "holiday",
  ];
  dataSource: MatTableDataSource<Order>;

  ngAfterViewInit() {
    this.orderService.findNotConfirmedOrdersByUserId(this.userName).subscribe(
      (res) => {
        this.orders = res["data"];
        this.orders.reverse();
        //console.log(this.orders);
        this.dataSource = new MatTableDataSource(this.orders);
        //console.log("this.dataSource");
        //console.log(this.dataSource);
        //console.log(this.paginator);
        this.dataSource.paginator = this.paginator;
        //console.log("this.dataSource.paginator");
        //console.log(this.dataSource.paginator);
      },
      (err) => {
        alert(err);
      },
      () => {}
    );
  }

  //ngOnInit(): void {}

  changeShow() {
    this.isShowAll = !this.isShowAll;
    if (this.isShowAll) {
      this.orderService.findAllOrdersByUserId(this.userName).subscribe(
        (res) => {
          this.orders = res["data"];
          this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          this.dataSource.paginator = this.paginator;
        },
        (err) => {
          alert(err);
        },
        () => {}
      );
    } else {
      this.orderService.findNotConfirmedOrdersByUserId(this.userName).subscribe(
        (res) => {
          this.orders = res["data"];
          this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          this.dataSource.paginator = this.paginator;
        },
        (err) => {
          alert(err);
        },
        () => {}
      );
    }
  }

  confirmOrder(orderId: string, isShowAll: boolean) {
    this.orderService.confirmOrder(orderId, isShowAll, this.userName).subscribe(
      (res) => {
        this.orders = res["data"];
        this.orders.reverse();
        this.dataSource = new MatTableDataSource(this.orders);
        this.dataSource.paginator = this.paginator;
      },
      (err) => {
        alert(err);
      },
      () => {}
    );
  }

  moveToOverdue(orderId: string, isShowAll: boolean, isAccepted: boolean) {
    if (isAccepted) {
      this.confirmationService.confirm({
        message: 'Эта заявка имеет статус "подтверждена". Вы уверены, что заявка просрочена?',
        accept: () => {
          this.orderService
            .updateOrderStatus(orderId, isShowAll, this.userName, "isOverdue")
            .subscribe(
              (res) => {
                this.orders = res["data"];
                console.log(this.orders);
                this.orders.reverse();
                this.dataSource = new MatTableDataSource(this.orders);
                this.dataSource.paginator = this.paginator;
              },
              (err) => {
                console.log(err);
                alert(
                  "Произошла ошибка. Сообщите администратору и обновите страницу. " +
                    err
                );
              }
            );
        },
      });
    } else {
      this.orderService
        .updateOrderStatus(orderId, isShowAll, this.userName, "isOverdue")
        .subscribe(
          (res) => {
            this.orders = res["data"];
            this.orders.reverse();
            this.dataSource = new MatTableDataSource(this.orders);
            this.dataSource.paginator = this.paginator;
          },
          (err) => {
            console.log(err);
            alert(
              "Произошла ошибка. Сообщите администратору и обновите страницу. " +
                err
            );
          }
        );
    }
  }

  moveToReturned(orderId: string, isShowAll: boolean) {
    this.orderService
      .updateOrderStatus(orderId, isShowAll, this.userName, "isReturned")
      .subscribe(
        (res) => {
          this.orders = res["data"];
          this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          this.dataSource.paginator = this.paginator;
        },
        (err) => {
          console.log(err);
          alert(
            "Произошла ошибка. Сообщите администратору и обновите страницу. " +
              err
          );
        }
      );
  }

  moveToDisabled(orderId: string, isShowAll: boolean) {
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту заявку?",
      accept: () => {
        this.orderService
          .updateOrderStatus(orderId, isShowAll, this.userName, "isDisabled")
          .subscribe(
            (res) => {
              this.orders = res["data"];
              this.orders.reverse();
              this.dataSource = new MatTableDataSource(this.orders);
              this.dataSource.paginator = this.paginator;
            },
            (err) => {
              console.log(err);
              alert(
                "Произошла ошибка. Сообщите администратору и обновите страницу. " +
                  err
              );
            },
            () => {
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: "Заявка удалена.",
                },
                disableClose: true,
                width: "fit-content",
              });
            }
          );
      },
    });
  }

  //Delete order
  deleteOrder(orderId: string, isShowAll: boolean) {
    /*     this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту заявку?",
      accept: () => {
          this.orderService.deleteOrder(orderId, isShowAll, this.userName).subscribe(
            (res) => {
              this.orders = res["data"];
              this.orders.reverse();
              this.dataSource = new MatTableDataSource(this.orders);
              this.dataSource.paginator = this.paginator;
            },
            (err) => {
              console.log(err);
              alert('Произошла ошибка. Сообщите администратору и обновите страницу. ' + err);
            },
            () => {
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: "Заявка удалена.",
                },
                disableClose: true,
                width: "fit-content",
              });
            }
          );
      },
    }); */
  }
}
