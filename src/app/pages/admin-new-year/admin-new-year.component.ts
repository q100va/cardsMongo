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
  selector: "app-admin-new-year",
  templateUrl: "./admin-new-year.component.html",
  styleUrls: ["./admin-new-year.component.css"],
})
export class AdminNewYearComponent implements OnInit {
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
        //console.log(this.houses);
/*         this.houses = this.houses.filter(
          (item) =>
          item.statistic.newYear.plus0 != 0 || 
          (item.statistic.newYear.plus0 == 0 && item.statistic.newYear.plus1 == 0 && item.statistic.newYear.plus2 == 0) 
         // || item.nursingHome == "ФИЛИППОВСКОЕ"
       
          //|| item.nursingHome == "АНИСИМОВО"
          //item.statistic.newYear.plus0 == 0 && item.statistic.newYear.plus1 == 0 && item.noAddress == true && item.isReleased == false && item.statistic.newYear.forInstitute == 0
          //item.statistic.newYear.plus0 != 0 && item.statistic.newYear.plus1 == 0 && item.statistic.newYear.forInstitute == 0 && item.noAddress == false && item.statistic.easter.amount > 200
            //item.statistic.newYear.plus0 != 0 && item.statistic.newYear.plus1 != 0 && item.statistic.newYear.forInstitute == 0 && item.noAddress == false
        ); */  //  && item.statistic.easter.amount < 100&&            item.statistic.easter.plus0 != 0&& item.statistic.newYear.forNavigators == 0 

        for (let house of this.houses){
          console.log('"' + house.nursingHome + '",');
        }
         

        console.log(this.houses);
      
      },
      (err) => {
        console.log(err);
      },
      () => {}
    );
  }

  ngOnInit(): void {}

  generateNewYearList() {
    let NYList = [];

    for (let value of this.selection["_selection"]) {
      NYList.push(value);
    }
    if (NYList.length == 0) {
      this.resultDialog.open(ConfirmationDialogComponent, {
        data: {
          message: "Ничего не выбрано.",
        },
        disableClose: true,
        width: "fit-content",
      });
    } else {
      this.listService.createNewYearList(NYList).subscribe(
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
