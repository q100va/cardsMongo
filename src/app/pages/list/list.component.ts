import { Component, OnInit } from "@angular/core";
import { ListService } from "src/app/services/list.service";
import { List } from "src/app/shared/interfaces/list.interface";
import { seniors } from "server/models/seniors_list.js";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.css"],
})
export class ListComponent implements OnInit {
  lists: List[];
  isShowList: Boolean = false;
  listLength: number = 0;
  oldWomen: number = 0;
  oldMen: number = 0;
  yang: number = 0;
  special: number = 0;
  oldest: number = 0;
  correctedSeniors: Array<any> =[];


  constructor(private listService: ListService) {}

  ngOnInit(): void {}

   generate() {
    let res = this.listService.monthLists();
    console.log(res);
/*     if (!res) {
      alert("Что-то не так с обновлением id");
    } else {
      (await this.listService.findAllLists()).subscribe(
        (res) => {
          this.lists = res["data"];
          console.log(this.lists);
        },
        (err) => {
          console.log(err);
        }
      );
    } */
  }

  deleteList() {
    console.log("delete");
this.listService.deleteList().subscribe(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);
}

  async showList(event: any) {
    (await this.listService.findAllLists()).subscribe(
      (res) => {
        this.lists = res["data"];
        this.listLength = 0;
        this.oldWomen = 0;
        this.oldMen = 0;
        this.yang = 0;
        this.special = 0;
        this.oldest = 0;
        for (let list of this.lists) {
          this.listLength = this.listLength + list.celebrators.length;
          this.oldWomen =
            this.oldWomen +
            list.celebrators.filter((item) => item.category == "oldWomen")
              .length;
          /*           console.log(list.celebrators.filter((item) => 
            item.category == "oldWomen"
          )); */
          this.oldMen =
            this.oldMen +
            list.celebrators.filter((item) => item.category == "oldMen").length;
          this.yang =
            this.yang +
            list.celebrators.filter((item) => item.category == "yang").length;
          this.special =
            this.special +
            list.celebrators.filter((item) => item.category == "special")
              .length;
          this.oldest =
            this.oldest +
            list.celebrators.filter((item) => item.oldest == true).length;
        }
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  /*   populateSeniors() {
    this.listService.createSenior().subscribe(
      (res) => {
        this.lists = res["data"];
      },
      (err) => {
        console.log(err);
      }
    );
  } */



  prepareSeniorsList(){
    let correctedSeniors =  this.listService.correctSeniorsList(seniors);

  }



  populateSeniors() {
    let result = this.listService.createSeniorsCollection(seniors);
    console.log(result);
    for (let item of result) {
      if (item != "200") {
        alert(`Что-то пошло не так ${item}`);
      }
    }
  }
}
