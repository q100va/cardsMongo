/*
============================================
component file
;===========================================
*/

import { HttpClient } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Client } from "../../shared/interfaces/client.interface";
import { ClientService } from "src/app/services/client.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { MatTableDataSource } from "@angular/material/table";
import { CookieService } from "ngx-cookie-service";
import { MatPaginator } from "@angular/material/paginator";
import { PageEvent } from "@angular/material/paginator";
import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-client-list",
  templateUrl: "./client-list.component.html",
  styleUrls: ["./client-list.component.css"],
})
export class ClientListComponent implements OnInit {
  clients: Client[];
  userName: string;
  isShowSubs: boolean = false;
  length = 0;
  currentPage = 1;
  pageSize = 100;
  pageSizeOptions = [10, 15, 20];
  @ViewChild("paginator") paginator: MatPaginator;
  displayedColumns = [
    "fullName",
    "contacts",
    "address",
    "institutes",
    "publishers",
    "isRestricted",
    "correspondents",
    "comments",
    "edit",
    "delete",
  ];
  /*   "email",
  "phoneNumber",
  "whatsApp",
  "telegram",
  "vKontakte",
  "instagram",
  "facebook",  "nameDay","patronymic",
    "lastName",   "country",
    "region",
    "city",   
  */
  dataSource: MatTableDataSource<Client>;
  valueToSearch: string = "";
  isShowFound = false;
  request: string;

  constructor(
    private dialog: MatDialog,
    private clientService: ClientService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private resultDialog: MatDialog
  ) {
    this.userName = this.cookieService.get("session_user");
    /*  this.clientService.findAllClients().subscribe(
      (res) => {
        this.clients = res["data"];
        console.log(this.clients);
      },
      (err) => {},
      () => {}
    ); */
  }

  ngAfterViewInit() {
    console.log("this.isShowSubs");
    console.log(this.isShowSubs);
    this.clientService
      .findAllClientsByUserName(this.userName, this.pageSize, this.currentPage)
      .subscribe(
        (res) => {
          // console.log(res);
          //console.log("res");
          this.clients = res["data"]["clients"];
          this.length = res["data"]["length"];

          console.log(this.clients);
          this.dataSource = new MatTableDataSource(this.clients);
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

  ngOnInit(): void {}

  //Delete task function
  /*  deleteClient(qId: string) {
    console.log(qId);
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту запись?",
      accept: () => {
        if (qId) {
          console.log(qId);
          this.clientService.deleteClient(qId, this.userName).subscribe(
            (res) => {
              console.log(res);
              //this.client = res["data"];
              this.clientService.findAllClients().subscribe(
                (res) => {
                  this.clients = res["data"];
                },
                (err) => {},
                () => {}
              );
            },
            (err) => {
              console.log(err);
            },
            () => {
              //this.client = this.client.filter((q) => q._id !== qId);
              console.log(this.clients);
              this.messageService.add({
                severity: "warn",
                summary: "bcrs",
                detail: "Запись удалена.",
              });
            }
          );
        }
      },
    });
  } */
  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.pageSize = pageData.pageSize;

    console.log("pageData");
    console.log(pageData);

    console.log("this.isShowFound");
    console.log(this.isShowFound);

    //this.postsService.getPosts(this.postsPerPage, this.currentPage);
    // this.isShowSubs = !this.isShowSubs;
    if (!this.isShowFound) {
      if (this.isShowSubs) {
        this.clientService
          .findSubscribersByUserName(
            this.userName,
            this.pageSize,
            this.currentPage
          )
          .subscribe(
            (res) => {
              this.clients = res["data"]["clients"];
              this.length = res["data"]["length"];

              //this.orders.reverse();
              this.dataSource = new MatTableDataSource(this.clients);
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
        this.clientService
          .findAllClientsByUserName(
            this.userName,
            this.pageSize,
            this.currentPage
          )
          .subscribe(
            (res) => {
              this.clients = res["data"]["clients"];
              this.length = res["data"]["length"];
              // this.orders.reverse();
              this.dataSource = new MatTableDataSource(this.clients);
              // this.dataSource.paginator = this.paginator;
            },
            (err) => {
              alert(err);
            },
            () => {}
          );
      }
    } else {
      this.clientService
        .findClientBySearchString(
          this.userName,
          this.pageSize,
          this.currentPage,
          this.request
        )
        .subscribe(
          (res) => {
            this.clients = res["data"]["clients"];
            this.length = res["data"]["length"];
            this.dataSource = new MatTableDataSource(this.clients);
            if (!res["data"]["found"]) {
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message:
                    "Ничего не найдено. Попробуйте изменить параметры поиска.",
                },
                disableClose: true,
                width: "fit-content",
              });
            }
            this.isShowFound = true;
          },
          (err) => {
            console.log(err);
            alert(err.message);
          },
          () => {}
        );
    }
  }
  changeShow(pageData: PageEvent) {
    console.log("pageData");
    console.log(pageData);
    console.log("this.pageSize");
    console.log(this.pageSize);
    console.log("this.isShowSubs");
    console.log(this.isShowSubs);
    this.isShowSubs = !this.isShowSubs;
    this.paginator.firstPage();
    /*     this.currentPage = 1; */
    pageData.pageIndex = 0;
    pageData.pageSize = this.pageSize;

    this.onChangedPage(pageData);
  }

  moveToDisabled(clientId: string, isShowSubs: boolean) {
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту карточку?",
      accept: () => {
        this.clientService
          .deleteClient(
            clientId,
            this.userName,
            this.pageSize,
            this.currentPage,
            isShowSubs
          )
          .subscribe(
            (res) => {
              this.clients = res["data"]["clients"];
              this.length = res["data"]["length"];
              // this.orders.reverse();
              this.dataSource = new MatTableDataSource(this.clients);
              //this.dataSource.paginator = this.paginator;
              this.resultDialog.open(ConfirmationDialogComponent, {
                data: {
                  message: res["data"]["message"]
                    ? res["data"]["message"]
                    : "Карточка удалена.",
                },
                disableClose: true,
                width: "fit-content",
              });
            },
            (err) => {
              console.log(err);
              alert(
                "Произошла ошибка. Сообщите администратору и обновите страницу. " +
                  err
              );
            },
            () => {}
          );
      },
    });
  }

  searchClient(valueToSearch: string) {
    console.log("valueToSearch");
    console.log('"' + valueToSearch + '"');

    console.log("поиск работает");
    this.currentPage = 1;
    this.request = valueToSearch;
    this.isShowFound = true;
    this.paginator.firstPage();
    this.clientService
      .findClientBySearchString(
        this.userName,
        this.pageSize,
        this.currentPage,
        valueToSearch
      )
      .subscribe(
        (res) => {
          this.clients = res["data"]["clients"];
          this.length = res["data"]["length"];
          this.dataSource = new MatTableDataSource(this.clients);
          if (!res["data"]["found"]) {
            this.resultDialog.open(ConfirmationDialogComponent, {
              data: {
                message:
                  "Ничего не найдено. Попробуйте изменить параметры поиска.",
              },
              disableClose: true,
              width: "fit-content",
            });
          }
          if (valueToSearch == "") {
            this.isShowFound = false;
          } else {
            this.isShowFound = true;
          }
        },
        (err) => {
          console.log(err);
          alert(err.message);
        },
        () => {}
      );
  }
  clearSearch(pageData: PageEvent) {
    console.log("this.isShowSubs");
    console.log(this.isShowSubs);
    this.valueToSearch = "";
    this.paginator.firstPage();
    pageData.pageIndex = 0;
    pageData.pageSize = this.pageSize;
    this.isShowFound = false;
    this.isShowSubs = false;
    this.request = "";
    this.onChangedPage(pageData);
  }
}
