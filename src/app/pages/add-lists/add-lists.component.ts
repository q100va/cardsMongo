import { Component, OnInit } from "@angular/core";

import readXlsxFile from "read-excel-file";
import { SeniorsService } from "src/app/services/seniors.service";

@Component({
  selector: "app-add-lists",
  templateUrl: "./add-lists.component.html",
  styleUrls: ["./add-lists.component.css"],
})
export class AddListsComponent implements OnInit {
  file: File;
  dateOfList: Date;
  arrayOfLists: Array<Array<any>> = [];
  index: number = 0;  
  resultOfCompare: any;
  isShowList: boolean = false;
  movedFromArrived: number;
  movedFromAbsents: number;
  movedFromDoubtful: number;

    accepted_lastName: string ="";
    accepted_firstName: string ="";
    accepted_patronymic: string ="";
    accepted_dateBirthday: number = 0;
    accepted_monthBirthday: number = 0;
    accepted_yearBirthday: number = 0;
    accepted_isDisabled:  boolean = false;
    accepted_isRestricted:  boolean = false;
    accepted_noAddress:  boolean = false;
    accepted_isReleased:  boolean = false;
    accepted_dateExit: Date;
    accepted_gender: string ="";
    accepted_comment1: string ="";
    accepted_comment2: string ="";
    accepted_linkPhoto: string ="";
    accepted_nameDay: string ="";
    accepted_dateNameDay: number = 0;
    accepted_monthNameDay: number = 0;

  allAccepted = [];

  isStart = false;

  constructor(private seniorsService: SeniorsService ) {}

  ngOnInit(): void {}


  /*   createLists(result) {

    this.compareLists();
  } */

  async addFile(event) {
    console.log("START");
    this.file = event.target.files[0];
    let result = [];

    let rows = await readXlsxFile(this.file);

    console.log("rows");
    console.log(rows);

    let columnsNumber = rows[0].length;
    let rowsNumber = rows.length;

    for (let j = 1; j < rowsNumber; j++) {
      let item = {};
      for (let i = 0; i < columnsNumber; i++) {
        let propertyName = rows[0][i];
        item[propertyName.toString()] = rows[j][i];
        result[j - 1] = item;
      }
    }

    console.log(result);
    //return result;
    // this.createLists(result);
    let i = 0;
    let setNursingHome = new Set();
    this.arrayOfLists = [];
    for (let item of result) {
      setNursingHome.add(item.nursingHome);
    }
    console.log("setNursingHome");
    console.log(setNursingHome);

    for (let house of setNursingHome) {
      console.log("result.filter((item) => item.nursingHome == house)");
      console.log(result.filter((item) => item.nursingHome == house));
      this.arrayOfLists[i] = result.filter((item) => item.nursingHome == house);
      i++;
    }
    console.log(" this.arrayOfLists");
    console.log(this.arrayOfLists);

    console.log(" this.arrayOfLists[this.index][0].nursingHome");
    console.log(this.arrayOfLists[this.index][0].nursingHome);

    console.log(" this.arrayOfLists[this.index]");
    console.log(this.arrayOfLists[this.index]);
    this.isStart = true;

   //this.compareLists(this.arrayOfLists[this.index], this.arrayOfLists[this.index][0].nursingHome);

  }


 
  compareLists(arrayOfLists, nursingHome) {

    //alert("WORKS");
    
  this.seniorsService.compareListsBackend
      (arrayOfLists, nursingHome
      )
      .subscribe(
        async (res) => {
          this.resultOfCompare = await res["data"];
          console.log(this.resultOfCompare);
          this.isShowList = true;
          this.isStart = false;
        },
        (err) => {
          console.log(err);
          alert(
            "Произошла ошибка, обратитесь к администратору! " + err.message
          );
          //stop = true;
        }
      ); 
  }  

  moveToChanged(movedFromAbsentsKey, movedFromArrivedKey) {
    let difference = {
      key: this.resultOfCompare.changed.length,
      old: this.resultOfCompare.absents[movedFromAbsentsKey],
      new: this.resultOfCompare.arrived[movedFromArrivedKey],
    };
    this.resultOfCompare.changed.push(difference);
    this.resultOfCompare.absents.splice(movedFromAbsentsKey, 1);
    this.resultOfCompare.arrived.splice(movedFromArrivedKey, 1);
  }

  moveToChangedFromDoubtful(movedFromDoubtful) {
    this.resultOfCompare.doubtful[movedFromDoubtful].key =
      this.resultOfCompare.changed.length;
    this.resultOfCompare.changed.push(
      this.resultOfCompare.doubtful[movedFromDoubtful]
    );
    this.resultOfCompare.doubtful.splice(movedFromDoubtful, 1);
  }

  moveToAbsentsArrived(movedFromDoubtful) {
    this.resultOfCompare.doubtful[movedFromDoubtful].old.key =
      this.resultOfCompare.absents.length;
    this.resultOfCompare.doubtful[movedFromDoubtful].new.key =
      this.resultOfCompare.arrived.length;
    this.resultOfCompare.absents.push(
      this.resultOfCompare.doubtful[movedFromDoubtful].old
    );
    this.resultOfCompare.arrived.push(
      this.resultOfCompare.doubtful[movedFromDoubtful].new
    );
    this.resultOfCompare.doubtful.splice(movedFromDoubtful, 1);
  }

  acceptChanges(accepted, key) {
    this.allAccepted.push(accepted);
    this.resultOfCompare.changed.splice(key, 1);
  }

  acceptAllChanges() {
    this.resultOfCompare.accepted = this.allAccepted;

    this.seniorsService
      .applyChanges(
        this.resultOfCompare,
        this.dateOfList,
        this.arrayOfLists[this.index][0].nursingHome
      )
      .subscribe(
        async (res) => {
          alert(res.data);
          this.index++;
          if (this.index == this.arrayOfLists.length) {
            alert("it was the last list");
            this.isShowList = false;            
          } else {
            this.dateOfList = null;
            this.compareLists(this.arrayOfLists[this.index],  this.arrayOfLists[this.index][0].nursingHome);
          }
        },
        (err) => {
          console.log(err);
          alert(
            "Произошла ошибка, обратитесь к администратору! " + err.message
          );
          //stop = true;
        }
      );
  }
}
