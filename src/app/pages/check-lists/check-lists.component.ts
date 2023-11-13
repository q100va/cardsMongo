import { Component, OnInit } from "@angular/core";

import { HousesService } from "src/app/services/houses.service";
import { ListService } from "src/app/services/list.service";

@Component({
  selector: "app-check-lists",
  templateUrl: "./check-lists.component.html",
  styleUrls: ["./check-lists.component.css"],
})
export class CheckListsComponent implements OnInit {
  houses: string[] = [];

  index1: number = 0;
  index2: number = 0;
  index3: number = 0;
  index4: number = 0;
  index5: number = 0;
  checkingHouse1: string = "";
  checkingHouse2: string = "";
  checkingHouse3: string = "";
  checkingHouse4: string = "";
  checkingHouse5: string = "";
  isFirst = true;
  isNext = false;
  isFirst2 = true;
  isNext2 = false;

  //holiday: string = "";

  constructor(
    private houseService: HousesService,
    private listService: ListService
  ) {}

  ngOnInit(): void {
    this.houseService.findAllHouses().subscribe(
      (res) => {
        console.log(res.data);
  /*        for (let item of res.data) {
          if (item.isActive) {
          this.houses.push(item.nursingHome);
          } 
        }   */ 
        this.houses = ["ТОЛЬЯТТИ", "ВЛАДИКАВКАЗ", "БАЗГИЕВО", "СЕМЕНОВСКОЕ", "ПЕРВОМАЙСКИЙ", "ЖУКОВКА", "" ];
        //   this.checkingHouse = this.houses[0];
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );
  }
  checkDoubles(index: number) {
    this.checkingHouse1 = this.houses[this.index1];
    this.listService.checkDoubles(this.houses[index]).subscribe(
      (res) => {
        alert("Deleted " + res["data"] + " doubles");
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );

    this.index1++;

    if (this.index1 < this.houses.length) {
      this.isNext = true;
      this.isFirst = false;
    } else {
      this.isNext = false;
    }
  }

  checkFullness(index: number) {
    this.checkingHouse2 = this.houses[this.index2];
    this.listService.checkFullness(this.houses[index]).subscribe(
      (res) => {
        alert("Added " + res["data"] + " seniors");
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );

    this.index2++;

    if (this.index2 < this.houses.length) {
      this.isNext2 = true;
      this.isFirst2 = false;
    } else {
      this.isNext2 = false;
    }
  }

  checkDoublesHB(index: number) {
    this.checkingHouse3 = this.houses[this.index3];
    this.listService.checkDoublesHB(this.houses[index]).subscribe(
      (res) => {
        alert("Deleted " + res["data"] + " doubles");
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );

    this.index3++;

    if (this.index3 < this.houses.length) {
      this.isNext = true;
      this.isFirst = false;
    } else {
      this.isNext = false;
    }
  }

  checkFullnessHB(index: number) {
    this.checkingHouse4 = this.houses[this.index4];
    this.listService.checkFullnessHB(this.houses[index]).subscribe(
      (res) => {
        alert("Added " + res["data"] + " seniors");
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );

    this.index4++;

    if (this.index4 < this.houses.length) {
      this.isNext2 = true;
      this.isFirst2 = false;
    } else {
      this.isNext2 = false;
    }
  }

  checkFullnessHolidays(index: number, holiday: string) {
    this.checkingHouse5 = this.houses[this.index5];
    this.listService.checkHolidayFullness(this.houses[index], holiday).subscribe(
      (res) => {
        alert("Added " + res["data"]["amountAdded"] + " seniors" + "Deleted " + res["data"]["amountDeleted"] + " seniors" );
        console.log ("Deleted");
        console.log (res["data"]["ordersToAware"]);
      
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );

    this.index5++;

    if (this.index5 < this.houses.length) {
      this.isNext2 = true;
      this.isFirst2 = false;
    } else {
      this.isNext2 = false;
    }
  }

}
