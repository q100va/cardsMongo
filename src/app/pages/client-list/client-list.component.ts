/*
============================================
component file
;===========================================
*/

import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Client } from "../../shared/interfaces/client.interface";
import { ClientService } from "src/app/services/client.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationService } from "primeng/api";
import { MessageService } from "primeng/api";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-client-list",
  templateUrl: "./client-list.component.html",
  styleUrls: ["./client-list.component.css"],
})
export class ClientListComponent implements OnInit {
  client: Client[];
  
  displayedColumns = [
    "firstName",
    "patronymic",
    "lastName",
    "gender",
    "email",
    "phoneNumber",
    "whatsApp",
    "telegram",
    "vKontakte",
    "instagram",
    "facebook",
    "country",
    "region",
    "city",
    "nameDay",
    "comments",
    "institute",
    "correspondent",
    "coordinator",
    "isRestricted",
    "edit",
    "delete",
  ];

  constructor(
    private dialog: MatDialog,
    private clientService: ClientService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.clientService.findAllClients().subscribe(
      (res) => {
        this.client = res["data"];
        console.log(this.client);
      },
      (err) => {},
      () => {}
    );
  }

  ngOnInit(): void {}

  //Delete task function
  deleteClient(qId: string) {
    console.log(qId);
    this.confirmationService.confirm({
      message: "Вы уверены, что хотите удалить эту запись?",
      accept: () => {
        if (qId) {
          console.log(qId);
          this.clientService.deleteClient(qId).subscribe(
            (res) => {
              console.log(res);
              //this.client = res["data"];
              this.clientService.findAllClients().subscribe(
                (res) => {
                  this.client = res["data"];
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
              console.log(this.client);
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
  }
}
