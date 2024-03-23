  import { Component, OnInit } from "@angular/core";
  import { House } from "src/app/shared/interfaces/houses.interface";
  import { HousesService } from "src/app/services/houses.service";
  import { MatDialog } from "@angular/material/dialog";
  import { ConfirmationService } from "primeng/api";
  import { MessageService } from "primeng/api";
  import { SelectionModel } from "@angular/cdk/collections";
  import { ListService } from "src/app/services/list.service";
  import { MatTableDataSource } from "@angular/material/table";
  import { ConfirmationDialogComponent } from "src/app/shared/confirmation-dialog/confirmation-dialog.component";
  
  @Component({
    selector: 'app-admin-easter',
    templateUrl: './admin-easter.component.html',
    styleUrls: ['./admin-easter.component.css']
  })
  export class AdminEasterComponent implements OnInit {
    houses: House[];
    selection = new SelectionModel<House>(true, []);
  
    displayedColumns = [
      "nursingHome",
      "amount",
      "statistic1",
      "statistic2",
      "statistic3",
      "check",
  
      "dateLastUpdate",
  
      "noAddress",
      "isReleased",
      "region",
      "isActive",
    ];
  
    constructor(
      private dialog: MatDialog,
      private housesService: HousesService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      private resultDialog: MatDialog,
      private listService: ListService
    ) {
      console.log("constructor");
      this.housesService.findActiveHouses().subscribe(
        (res) => {
          this.houses = res["data"];
          console.log(this.houses);
        },
        (err) => {
          console.log(err);
        },
        () => {}
      );
    }
  
    ngOnInit(): void {}
  
    generateEasterList() {
      let EasterList = [];
  
      for (let value of this.selection["_selection"]) {
        EasterList.push(value);
      }
      if (EasterList.length == 0) {
        this.resultDialog.open(ConfirmationDialogComponent, {
          data: {
            message: "Ничего не выбрано.",
          },
          disableClose: true,
          width: "fit-content",
        });
      } else {
        this.listService.createEasterList(EasterList).subscribe(
          async (res) => {
            let result = await res["data"];
            console.log(result);
            alert(result);
          },
          (err) => {
            console.log(err);
            alert(
              "Произошла ошибка, обратитесь к администратору! " + err.message
            );
          }
        );
      }
    }
  }
  


