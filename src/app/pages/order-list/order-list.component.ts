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
import { PageEvent } from "@angular/material/paginator";
//import {MatSort, SortDirection} from '@angular/material/sort';

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.css"],
})
export class OrderListComponent implements AfterViewInit {
  orders: Order[];
  // allOrders: Order[];
  //notConfirmedOrders: Order[];
  userName: string;
  isShowAll: boolean = false;
  length = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 15, 20];

  constructor(
    private dialog: MatDialog,
    private orderService: OrderService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private resultDialog: MatDialog
  ) {
    this.userName = this.cookieService.get("session_user");
    //this.userName = "Ludikmila";
    //this.userName = "Verun";
    //this.userName = "upr_kult89";
    //this.userName = "Fatanya";
    //this.userName = "royrai";
  }
  @ViewChild("paginator") paginator: MatPaginator;
  displayedColumns = [
    "orderDate",
    "amount",
    "fullName",
    "contact",
    "status",
    "confirm",
    "unconfirmed",
    "edit",
    "delete",
    "restore",
    "holiday",
  ];
  dataSource: MatTableDataSource<Order>;
  waiting = false;

  correctDate(date: string) {
    let newDate = new Date(date);
    let localDate = newDate.toLocaleDateString();
    /*       console.log("localDate");
      console.log(localDate); */
    return localDate;
  }

  ngAfterViewInit() {
    this.orderService
      .findNotConfirmedOrdersByUserId(
        this.userName,
        this.pageSize,
        this.currentPage
      )
      .subscribe(
        (res) => {
          // console.log(res);
          //console.log("res");
          this.orders = res["data"]["orders"];
          this.length = res["data"]["length"];
          //this.orders.reverse();
          console.log(this.orders);
          this.dataSource = new MatTableDataSource(this.orders);
          //console.log("this.dataSource");
          //console.log(this.dataSource);

          // this.dataSource.paginator = this.paginator;
          //  console.log("this.dataSource.paginator");
          // console.log(this.dataSource.paginator);
        },
        (err) => {
          alert(err);
        },
        () => {}
      );
  }

  //ngOnInit(): void {}

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.pageSize = pageData.pageSize;

    //this.postsService.getPosts(this.postsPerPage, this.currentPage);
    // this.isShowAll = !this.isShowAll;
    if (this.isShowAll) {
      this.orderService
        .findAllOrdersByUserId(this.userName, this.pageSize, this.currentPage)
        .subscribe(
          (res) => {
            this.orders = res["data"]["orders"];
            this.length = res["data"]["length"];

            //this.orders.reverse();
            this.dataSource = new MatTableDataSource(this.orders);
            //this.dataSource.paginator = this.paginator;

            // console.log("this.orders[this.length-1].dateOfOrder");
            // console.log(typeof this.orders[0].dateOfOrder);
            //console.log(this.orders[0].dateOfOrder.toDateString());
          },
          (err) => {
            console.log(err);
            alert(err.message);
          },
          () => {}
        );
    } else {
      this.orderService
        .findNotConfirmedOrdersByUserId(
          this.userName,
          this.pageSize,
          this.currentPage
        )
        .subscribe(
          (res) => {
            this.orders = res["data"]["orders"];
            this.length = res["data"]["length"];
            // this.orders.reverse();
            this.dataSource = new MatTableDataSource(this.orders);
            // this.dataSource.paginator = this.paginator;
          },
          (err) => {
            alert(err);
          },
          () => {}
        );
    }
  }

  changeShow(pageData: PageEvent) {
    this.isShowAll = !this.isShowAll;
    this.paginator.firstPage();
    /*     this.currentPage = 1; */
    pageData.pageIndex = 0;
    pageData.pageSize = this.pageSize;

    this.onChangedPage(pageData);

    /*     if (this.isShowAll) {      
      this.orderService.findAllOrdersByUserId(this.userName, this.pageSize, this.currentPage).subscribe(
        (res) => {
          this.orders = res["data"]["orders"];
          this.length = res["data"]["length"];
          //this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          //this.dataSource.paginator = this.paginator;
        },
        (err) => {
          alert(err);
        },
        () => {}
      );
    } else {
      this.orderService.findNotConfirmedOrdersByUserId(this.userName, this.pageSize, this.currentPage).subscribe(
        (res) => {
          this.orders = res["data"]["orders"];
          this.length = res["data"]["length"];
         // this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
         // this.dataSource.paginator = this.paginator;
        },
        (err) => {
          alert(err);
        },
        () => {}
      );
    } */
  }

  confirmOrder(orderId: string, isShowAll: boolean) {
    this.waiting = true;
    this.orderService
      .confirmOrder(
        orderId,
        isShowAll,
        this.userName,
        this.pageSize,
        this.currentPage
      )
      .subscribe(
        (res) => {
          this.orders = res["data"]["orders"];
          this.length = res["data"]["length"];
          // this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          //this.dataSource.paginator = this.paginator;
          this.waiting = false;
        },
        (err) => {
          alert(err);
          this.waiting = false;
        },
        () => {}
      );
  }

  cancelConfirmOrder(orderId: string, isShowAll: boolean) {
    this.waiting = true;
    this.orderService
      .cancelConfirmOrder(
        orderId,
        isShowAll,
        this.userName,
        this.pageSize,
        this.currentPage
      )
      .subscribe(
        (res) => {
          this.orders = res["data"]["orders"];
          this.length = res["data"]["length"];
          // this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          //this.dataSource.paginator = this.paginator;
          this.waiting = false;
        },
        (err) => {
          alert(err);
          this.waiting = false;
        },
        () => {}
      );
  }

  restoreOrder(orderId: string, isShowAll: boolean) {
    this.waiting = true;
    this.orderService
      .restoreOrder(
        orderId,
        isShowAll,
        this.userName,
        this.pageSize,
        this.currentPage
      )
      .subscribe(
        (res) => {
          this.orders = res["data"]["orders"];
          this.length = res["data"]["length"];
          // this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          //this.dataSource.paginator = this.paginator;
          this.waiting = false;
        },
        (err) => {
          alert(err);
          this.waiting = false;
        },
        () => {}
      );
  }

  moveToOverdue(orderId: string, isShowAll: boolean, isAccepted: boolean) {
    this.waiting = true;
    if (isAccepted) {
      this.confirmationService.confirm({
        message:
          'Эта заявка имеет статус "подтверждена". Вы уверены, что заявка просрочена?',
        accept: () => {
          this.orderService
            .updateOrderStatus(
              orderId,
              isShowAll,
              this.userName,
              "isOverdue",
              this.pageSize,
              this.currentPage
            )
            .subscribe(
              (res) => {
                this.orders = res["data"]["orders"];
                this.length = res["data"]["length"];
                console.log(this.orders);
                //this.orders.reverse();
                this.dataSource = new MatTableDataSource(this.orders);
                // this.dataSource.paginator = this.paginator;
                this.waiting = false;
              },
              (err) => {
                console.log(err);
                alert(
                  "Произошла ошибка. Сообщите администратору и обновите страницу. " +
                    err
                );
                this.waiting = false;
              }
            );
        },
      });
    } else {
      this.orderService
        .updateOrderStatus(
          orderId,
          isShowAll,
          this.userName,
          "isOverdue",
          this.pageSize,
          this.currentPage
        )
        .subscribe(
          (res) => {
            this.orders = res["data"]["orders"];
            this.length = res["data"]["length"];
            // this.orders.reverse();
            this.dataSource = new MatTableDataSource(this.orders);
            // this.dataSource.paginator = this.paginator;
            this.waiting = false;
          },
          (err) => {
            console.log(err);
            alert(
              "Произошла ошибка. Сообщите администратору и обновите страницу. " +
                err
            );
            this.waiting = false;
          }
        );
    }
  }

  moveToReturned(orderId: string, isShowAll: boolean) {
    this.waiting = true;
    this.orderService
      .updateOrderStatus(
        orderId,
        isShowAll,
        this.userName,
        "isReturned",
        this.pageSize,
        this.currentPage
      )
      .subscribe(
        (res) => {
          this.orders = res["data"]["orders"];
          this.length = res["data"]["length"];
          //this.orders.reverse();
          this.dataSource = new MatTableDataSource(this.orders);
          //this.dataSource.paginator = this.paginator;
          this.waiting = false;
        },
        (err) => {
          console.log(err);
          alert(
            "Произошла ошибка. Сообщите администратору и обновите страницу. " +
              err
          );
          this.waiting = false;
        }
      );
  }

  moveToDisabled(orderId: string, isShowAll: boolean) {
    this.waiting = true;
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту заявку?",
      accept: () => {
        this.orderService
          .updateOrderStatus(
            orderId,
            isShowAll,
            this.userName,
            "isDisabled",
            this.pageSize,
            this.currentPage
          )
          .subscribe(
            (res) => {
              this.orders = res["data"]["orders"];
              this.length = res["data"]["length"];
              // this.orders.reverse();
              this.dataSource = new MatTableDataSource(this.orders);
              //this.dataSource.paginator = this.paginator;
              this.waiting = false;
            },
            (err) => {
              console.log(err);
              alert(
                "Произошла ошибка. Сообщите администратору и обновите страницу. " +
                  err
              );
              this.waiting = false;
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
  /*  deleteOrder(orderId: string, isShowAll: boolean) {
      this.confirmationService.confirm({
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
    }); 
  }*/
}
