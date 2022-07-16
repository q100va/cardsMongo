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

@Component({
  selector: "app-all-absents",
  templateUrl: "./all-absents.component.html",
  styleUrls: ["./all-absents.component.css"],
})
export class AllAbsentsComponent implements AfterViewInit {
  orders = [];
  userName: string;
  isShowAll: boolean = true;

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
    "userName",
    "orderDate",
    "amount",
    "fullName",
    "contact",
    "isAccepted",
    "holiday",
    "absents",
    "edit",
  ];
  dataSource: MatTableDataSource<Order>;

  ngAfterViewInit() {
    this.orderService.findAllOrdersWithAbsents().subscribe(
      (res) => {
        console.log(res);
        this.orders = res["data"];
        console.log(this.orders);
        this.orders.reverse();

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
}
