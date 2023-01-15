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

  index: number = 0;
  isFirst = true;
  isNext = false;
  checkingHouse: string = "";

  index2: number = 0;
  isFirst2 = true;
  isNext2 = false;
  checkingHouse2: string = "";

  constructor(
    private houseService: HousesService,
    private listService: ListService
  ) {}

  ngOnInit(): void {
    this.houseService.findAllHouses().subscribe(
      (res) => {
         console.log(res.data);
         for (let item of res.data) {
          if (item.isActive) {
          this.houses.push(item.nursingHome);
          }
        }   
      //  this.houses = ["НИКИТИНКА"];
     //   this.checkingHouse = this.houses[0];
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );
    
  }
  checkDoubles(index: number) {
     this.checkingHouse = this.houses[this.index];
        this.listService.checkDoubles(this.houses[index]).subscribe(
      (res) => {
        alert("Deleted " + res["data"] + " doubles");
      },
      (err) => {
        alert(err.error.msg + " " + err.message);
        console.log(err);
      }
    );

    this.index++;
   
    if (this.index < this.houses.length) {
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
  this.checkingHouse = this.houses[this.index];
     this.listService.checkDoublesHB(this.houses[index]).subscribe(
   (res) => {
     alert("Deleted " + res["data"] + " doubles");
   },
   (err) => {
     alert(err.error.msg + " " + err.message);
     console.log(err);
   }
 );

 this.index++;

 if (this.index < this.houses.length) {
   this.isNext = true;
   this.isFirst = false;
 } else {
   this.isNext = false;
 }
}

checkFullnessHB(index: number) {
  this.checkingHouse2 = this.houses[this.index2];
     this.listService.checkFullnessHB(this.houses[index]).subscribe(
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


}
