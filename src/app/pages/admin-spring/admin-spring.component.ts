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
  selector: 'app-admin-spring',
  templateUrl: './admin-spring.component.html',
  styleUrls: ['./admin-spring.component.css']
})
export class AdminSpringComponent implements OnInit {

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
        this.houses = this.houses.filter(item =>  item.isReleased == false && item.noAddress == true);  
        //this.houses = this.houses.filter(item => item.statistic.spring.amount8 > 100 && item.statistic.spring.amount8 < 131 && item.isReleased == false);   
        //console.log(this.houses);
      },
      (err) => {
        console.log(err);
      },
      () => {}
    );
  }

  ngOnInit(): void {}

  generateFebruary23List() {
    let springList = [];

    for (let value of this.selection["_selection"]) {
      springList.push(value);
    }
    if (springList.length == 0) {
      this.resultDialog.open(ConfirmationDialogComponent, {
        data: {
          message: "Ничего не выбрано.",
        },
        disableClose: true,
        width: "fit-content",
      });
    } else {
      this.listService.createFebruary23List(springList).subscribe(
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



  generateMarch8List() {
    let springList = [];

    for (let value of this.selection["_selection"]) {
      springList.push(value);
    }
    if (springList.length == 0) {
      this.resultDialog.open(ConfirmationDialogComponent, {
        data: {
          message: "Ничего не выбрано.",
        },
        disableClose: true,
        width: "fit-content",
      });
    } else {
      this.listService.createMarch8List(springList).subscribe(
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
