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
  arrayOfLists = [];
  index: number = 0;
  seniorsService: SeniorsService;
  resultOfCompare: any;
  isShowList: boolean = false;
  movedFromArrived: number;
  movedFromAbsents: number;

  constructor() {}

  ngOnInit(): void {}

  addFile(event: { target: { files: File[] } }) {
    this.file = event.target.files[0];
    readXlsxFile(this.file).then(
      function (rows) {
        console.log(rows);
        let result = [];
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
        this.createLists(result);
      },
      function (error) {
        console.error(error);
      }
    );
  }
  createLists(result) {
    
    let i = 0;
    let setNursingHome = new Set();
    for (let item of result) {
      setNursingHome.add(item.nursingHome);
    }
    for (let house of setNursingHome) {
      this.arrayOfLists[i] = result.filter(item => item.nursingHome == house);
      i++;      
    }

    this.compareLists();

  }

  compareLists() {
  this.seniorsService.compareLists(this.arrayOfLists[this.index], this.arrayOfLists[this.index].nursingHome).subscribe(
    async (res) => {
      this.resultOfCompare = await res["data"];
      console.log(this.resultOfCompare);
      this.isShowList = true;
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
    old: this.resultOfCompare.absents[movedFromAbsentsKey],
    new: this.resultOfCompare.arrived[movedFromArrivedKey]
  }
  this.resultOfCompare.changed.push(difference);
  this.resultOfCompare.absents.splice(movedFromAbsentsKey, 1);
  this.resultOfCompare.arrived.splice(movedFromArrivedKey, 1);
}

moveToChangedFromDoubtful(movedFromOldDoubtful, movedFromNewDoubtful){

}

moveToAbsentsArrived(movedFromOldDoubtful, movedFromNewDoubtful){
  
}

}
