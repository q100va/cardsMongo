import { Component, OnInit } from "@angular/core";
import { ListService } from "src/app/services/list.service";
import { HousesService } from "src/app/services/houses.service";
import { List } from "src/app/shared/interfaces/list.interface";
import { seniors } from "server/models/seniors_list.js";
import { houses } from "server/models/houses_list.js";
import { SeniorsService } from "src/app/services/seniors.service";
import { HttpClient } from "@angular/common/http";

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
  correctedSeniors: Array<any> = [];

  constructor(
    private listService: ListService,
    private housesService: HousesService,
    private seniorsService: SeniorsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  generateBirthday() {
    this.listService.createBirthdayList().subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
  }

  generateNameDay() {
    this.listService.createNameDayList().subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
  }

  generateTeacherDay() {
    this.listService.createTeacherDayList().subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
  }

  generateNewYearList() {
    this.listService.createNewYearList().subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
  }

  generateFebruary23List() {
    this.listService.createFebruary23List().subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
  }

  generateMarch8List() {
    this.listService.createMarch8List().subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
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

  showBirthdayList(event: any) {
    this.listService.findAllBirthdayLists().subscribe(
      (res) => {
        this.lists = res["data"];
        this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  showNewYearList(event: any) {
    this.listService.findAllNewYearLists().subscribe(
      (res) => {
        this.lists = res["data"];
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        //countries.sort( (a, b) => a.localeCompare(b) )
        this.lists.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  showFebruary23List(event: any) {
    this.listService.findAllFebruary23Lists().subscribe(
      (res) => {
        this.lists = res["data"];
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        //countries.sort( (a, b) => a.localeCompare(b) )
        this.lists.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }
  showMarch8List(event: any) {
    this.listService.findAllMarch8Lists().subscribe(
      (res) => {
        this.lists = res["data"];
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        //countries.sort( (a, b) => a.localeCompare(b) )
        this.lists.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  showLessPlus(event: any) {
    this.listService.findAllBirthdayLists().subscribe(
      (res) => {
        this.lists = res["data"].filter(item => item.plusAmount <3);

        this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;

      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  } 

  showLessPlusNewYearList(event: any) {
    this.listService.findAllNewYearLists().subscribe(
      (res) => {
       this.lists = res["data"].filter(item => (item.plusAmount < 1)  );/* && item.secondTime == true) || (item.plusAmount < 1 && item.secondTime == false) */
      //this.lists = res["data"].filter(item => (item.plusAmount < 1) );
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.lists.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;

      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  } 
  showLessPlusFebruary23List(event: any) {
    this.listService.findAllFebruary23Lists().subscribe(
      (res) => {
       this.lists = res["data"].filter(item => (item.plusAmount < 1)  );/* && item.secondTime == true) || (item.plusAmount < 1 && item.secondTime == false) */
      //this.lists = res["data"].filter(item => (item.plusAmount < 1) );
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.lists.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;

      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  } 

  showLessPlusMarch8List(event: any) {
    this.listService.findAllMarch8Lists().subscribe(
      (res) => {
       this.lists = res["data"].filter(item => (item.plusAmount < 1)  );/* && item.secondTime == true) || (item.plusAmount < 1 && item.secondTime == false) */
      //this.lists = res["data"].filter(item => (item.plusAmount < 1) );
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.lists.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length;

      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  } 


  showNameDayList(event: any) {
    this.listService.findAllNameDayLists().subscribe(
      (res) => {
        this.lists = res["data"];
        this.lists.sort((prev, next) => prev.dateNameDay - next.dateNameDay);
        this.listLength = this.lists.length;
        
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  showTeacherDayList(event: any) {
    this.listService.findAllTeacherDayLists().subscribe(
      (res) => {
        this.lists = res["data"];
        this.lists.sort(( next, prev) =>  next.dateHoliday - prev.dateHoliday);
        this.listLength = this.lists.length;
        
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  populateSeniors() {

        this.seniorsService.createSeniorsCollection(seniors).subscribe(
          async (res) => {
            let result = await res["data"];
            console.log(result);

            alert(`Добавлено ${result.length} записей из ${seniors.length}.` );
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


  /* 
  prepareSeniorsList() {
    let correctedSeniors = this.listService.correctSeniorsList(seniors);
  }
 */

  addHouses() {
    this.housesService.addManyHouses(houses).subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result.length);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
  }

  deleteDoubleList() {
    this.listService.deleteDoubleList().subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);
        alert(result);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
      }
    );
    
  }
}
