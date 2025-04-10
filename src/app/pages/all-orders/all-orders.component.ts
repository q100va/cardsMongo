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
import { Router } from "@angular/router";


@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})

export class AllOrdersComponent implements AfterViewInit {
  orders: Order[];
  allOrders: Order[];
  notConfirmedOrders: Order[];
  userName: string;
  isShowAll: boolean = true;

  constructor(
    private dialog: MatDialog,
    private orderService: OrderService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private resultDialog: MatDialog,
    private router: Router
  ) {
    this.userName = this.cookieService.get("session_user");
    //this.userName = "VasilisaFiva";
  }
  @ViewChild("paginator") paginator: MatPaginator;
  displayedColumns = [
    "userName",
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
    this.orderService.findAllOrders().subscribe(
      (res) => {
        this.orders = res["data"];
        this.orders.reverse();
        console.log(this.orders);
        this.dataSource = new MatTableDataSource(this.orders);
        console.log("this.dataSource");
        console.log(this.dataSource);
        console.log(this.paginator);
        this.dataSource.paginator = this.paginator;
        console.log("this.dataSource.paginator");
        console.log(this.dataSource.paginator);
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
      this.orderService.findAllOrders().subscribe(
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
      this.orderService.findAllOrdersNotAccepted().subscribe(
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
    this.orderService.confirmOrder(orderId, isShowAll, this.userName, 10, 1).subscribe(
      (res) => {
        this.router.navigate(["/orders/all"]);
/*         this.orders = res["data"];
        this.orders.reverse();
        this.dataSource = new MatTableDataSource(this.orders);
        this.dataSource.paginator = this.paginator; */
      },
      (err) => {
        alert(err);
      },
      () => {}
    );
  }

  //Delete order
   deleteOrder(orderId: string, isShowAll: boolean) {




/*     this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту заявку?",
      accept: () => {
          this.orderService.deleteOrder(orderId, isShowAll, this.userName).subscribe(
            (res) => {
              this.router.navigate(["/orders/all"]);
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
