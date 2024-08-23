import { Component, OnInit } from "@angular/core";
import { ListService } from "src/app/services/list.service";
import { HousesService } from "src/app/services/houses.service";
import { List } from "src/app/shared/interfaces/list.interface";
//import { seniors } from "server/models/seniors_list.js";
//import { houses } from "server/models/houses_list.js";
import { SeniorsService } from "src/app/services/seniors.service";
import { ClientService } from "src/app/services/client.service";
import { OrderService } from "src/app/services/order.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.css"],
})
export class ListComponent implements OnInit {
  lists: List[];
  isShowList: Boolean = false;
  isShowSpecialList: Boolean = false;
  isShowFamilyDayList: Boolean = false;
  listLength: number = 0;
  oldWomen: number = 0;
  oldMen: number = 0;
  yangMen: number = 0;
  specialMen: number = 0;
  specialWomen: number = 0;
  yangWomen: number = 0;

  oldest: number = 0;
  correctedSeniors: Array<any> = [];
  amountOfVolunteers = 0;
  amountOfSeniors = 0;
  isShowAmountOfVolunteers = false;
  isShowAmountOfSeniors = false;
  listOfUncertain: List[];
  listOfUncertainLength = 0;
  isShowAListOfUncertain = false;

  disableTakeClients = false;
  disableCheckClient = true;
  index = 0;
  clientsList = [];
  newClient = {};
  controversialData = {};
  idOfSimilarClients = [];
  firstClient = {};
  deletedClients = [];
  isNewClient = false;
  isFirstClient = false;
  isSame = true;
  accepted_clientFirstName = "";
  accepted_clientPatronymic = "";
  accepted_clientLastName = "";
  accepted_email = "";
  accepted_telegram = "";
  accepted_phoneNumber = "";
  accepted_whatsApp = "";
  accepted_vKontakte = "";
  accepted_instagram = "";
  accepted_facebook = "";

  amountOfRegions = 0;
  amountOfHouses = 0;
  plusesHBAmount = 0;
  celebratorsHBAmount = 0;
  plusesNDAmount = 0;
  celebratorsNDAmount = 0;
  //plusesM8Amount = 0;
  //celebratorsM8Amount = 0;
  plusesEasterAmount = 0;
  celebratorsEasterAmount = 0;
  plusesMay9Amount = 0;
  celebratorsMay9Amount = 0;
  volunteersAmount = 0;
  schoolsAmount = 0;
  institutesAmount = 0;

  constructor(
    private listService: ListService,
    private housesService: HousesService,
    private clientService: ClientService,
    private orderService: OrderService,
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

  generateNextBirthday() {
    this.listService.createNextBirthdayList().subscribe(
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

  generateNameDay(month) {
    this.listService.createNameDayList(month).subscribe(
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
  /*   generateEasterList() {
    this.listService.createEasterList().subscribe(
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
 */

  /*   generateNewYearList() {
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
  } */

  /*   generateFebruary23List() {
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
  } */

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
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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

  showEasterList(event: any) {
    this.listService.findAllEasterLists().subscribe(
      (res) => {
        this.lists = res["data"];
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
        //  this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
        this.lists = res["data"].filter((item) => item.plusAmount < 2 ); //&& item.noAddress == false && item.isReleased == false
        this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
        this.lists = res["data"].filter((item) => item.plusAmount < 3);
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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

  showLessPlusEasterList(event: any) {
    this.listService.findAllEasterLists().subscribe(
      (res) => {
        this.lists = res["data"].filter((item) => item.plusAmount < 1);
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
        this.lists = res["data"].filter((item) => item.plusAmount < 1);
        // this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
        this.lists = res["data"].filter((item) => item.plusAmount < 2);
        // this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.listLength = this.lists.length;
        this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yangWomen = this.lists.filter(
          (item) => item.category == "yangWomen"
        ).length;
        this.specialWomen = this.lists.filter(
          (item) => item.category == "specialWomen"
        ).length;
        this.yangMen = this.lists.filter(
          (item) => item.category == "yangMen"
        ).length;
        this.specialMen = this.lists.filter(
          (item) => item.category == "specialMen"
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
    this.listService.findAllNameDayLists("NameDay").subscribe(
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
        this.lists.sort((next, prev) => next.dateHoliday - prev.dateHoliday);
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

  /*   populateSeniors() {
    this.seniorsService.createSeniorsCollection(seniors).subscribe(
      async (res) => {
        let result = await res["data"];
        console.log(result);

        alert(`Добавлено ${result.length} записей из ${seniors.length}.`);
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
        //stop = true;
      }
    );
  } */

  /* 
  prepareSeniorsList() {
    let correctedSeniors = this.listService.correctSeniorsList(seniors);
  }
 */

  /*   addHouses() {
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
 */
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

  showSpecialList(event: any) {
    this.listService.findSpecialLists().subscribe(
      (res) => {
        this.lists = res["data"];
        console.log(this.lists);
              let length = 0;
        for (let house of this.lists) {
          house.celebrators.sort(
            (prev, next) => prev.dateBirthday - next.dateBirthday
          );
          length = length + house.celebrators.length;
        } 

        this.lists.sort((prev, next) =>
          prev.nursingHome.localeCompare(next.nursingHome)
        );

        this.listLength = this.lists.length;

        /*         let i = 0;
        for (let lineItem of this.lists) {
          for (let celebrator of lineItem.celebrators) {
            celebrator.index = i + 1;
            i++;
          }
        } */
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowSpecialList = true;
    //console.log(this.lists);
  }

  generate9mayList() {
    this.listService.create9mayList().subscribe(
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

  show9mayList(event: any) {
    this.listService.findAll9mayLists().subscribe(
      (res) => {
        this.lists = res["data"];
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        //countries.sort( (a, b) => a.localeCompare(b) )
        this.lists.sort((prev, next) =>
          prev.nursingHome.localeCompare(next.nursingHome)
        );
        this.listLength = this.lists.length;
        /*  this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length; */
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  showLess9mayList(event: any) {
    this.listService.findAll9mayLists().subscribe(
      (res) => {
        this.lists = res["data"].filter(
          (item) => item.plusAmount < 1
        ); /* && item.secondTime == true) || (item.plusAmount < 1 && item.secondTime == false) */
        //this.lists = res["data"].filter(item => (item.plusAmount < 1) );
        //this.lists.sort((prev, next) => prev.dateBirthday - next.dateBirthday);
        this.lists.sort((prev, next) =>
          prev.nursingHome.localeCompare(next.nursingHome)
        );
        this.listLength = this.lists.length;
        /* this.oldMen = this.lists.filter(
          (item) => item.category == "oldMen"
        ).length;
        this.yang = this.lists.filter((item) => item.category == "yang").length;
        this.special = this.lists.filter(
          (item) => item.category == "special"
        ).length;
        this.oldest = this.lists.filter((item) => item.oldest == true).length;
        this.oldWomen = this.lists.filter(
          (item) => item.category == "oldWomen"
        ).length; */
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowList = true;
    //console.log(this.lists);
  }

  showFamilyDayList(event: any) {
    this.listService.findAllFamilyDayLists().subscribe(
      (res) => {
        this.lists = res["data"];
        // this.lists.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
        this.listLength = this.lists.length;
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowFamilyDayList = true;
  }

  showAmountOfVolunteers(event: any) {
    this.listService.countAmountOfVolunteers().subscribe(
      (res) => {
        //this.amountOfVolunteers = res["data"];
        this.amountOfRegions = res["data"]["regionsAmount"];
        this.amountOfHouses = res["data"]["housesAmount"];
        this.plusesHBAmount = res["data"]["plusesHBAmount"];
        this.celebratorsHBAmount = res["data"]["celebratorsHBAmount"];
        this.plusesNDAmount = res["data"]["plusesNDAmount"];
        this.celebratorsNDAmount = res["data"]["celebratorsNDAmount"];
        //this.plusesM8Amount = res["data"]["plusesM8Amount"];
        //this.celebratorsM8Amount = res["data"]["celebratorsM8Amount"];
        this.plusesEasterAmount = res["data"]["plusesEasterAmount"];
        this.celebratorsEasterAmount = res["data"]["celebratorsEasterAmount"];
        this.plusesMay9Amount = res["data"]["plusesMay9Amount"];
        this.celebratorsMay9Amount = res["data"]["celebratorsMay9Amount"];
        this.volunteersAmount = res["data"]["volunteersAmount"];
        this.schoolsAmount = res["data"]["schoolsAmount"];
        this.institutesAmount = res["data"]["institutesAmount"];
        this.isShowAmountOfVolunteers = true;
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

  
  }

  countSeniors(event: any) {
    this.listService.countAmountOfSeniors().subscribe(
      (res) => {
        this.amountOfSeniors = res["data"];
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowAmountOfSeniors = true;
  }

  showUncertainList(event: any) {
    this.listService.findUncertain().subscribe(
      (res) => {
        this.listOfUncertain = res["data"];
        this.listOfUncertain.sort(
          (prev, next) => prev.dateBirthday - next.dateBirthday
        );
        this.listOfUncertainLength = this.listOfUncertain.length;
      },
      (err) => {
        console.log(err);
      }
    );

    console.log(event);

    this.isShowAListOfUncertain = true;
  }

  correctOrdersDates(event: any) {
    this.listService.correctOrdersDates().subscribe(
      (res) => {
        alert(res.data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  takeClients() {
    this.listService.takeListOfClients().subscribe(
      (res) => {
        this.disableTakeClients = true;
        this.clientsList = res.data;
        console.log("res");
        console.log(res.data);
        console.log("this.clientsList.length");
        console.log(this.clientsList.length);
        this.disableCheckClient = this.clientsList.length > 0 ? false : true;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  checkClient() {
    this.listService
      .checkListOfClients(this.clientsList[this.index], this.index)
      .subscribe(
        (res) => {
          if (res.data.resume) {
            if (res.data.idOfSimilarClients) {
              console.log("ВНИМАНИЕ!");
              console.log("res");
              console.log(res.data);
              for (let id of this.idOfSimilarClients) {
                let index = this.clientsList.findIndex(
                  (item) => item._id == id
                );
                if (index > this.index) this.clientsList.splice(index, 1);
                console.log(
                  this.clientsList.findIndex((item) => item._id == id)
                );
              }
            }

            this.newClient = res.data.client;
            this.firstClient = {};
            this.isNewClient = true;
            this.isFirstClient = false;
            this.index++;
            if (this.index == this.clientsList.length)
              this.disableCheckClient = true;
            if (!this.disableCheckClient) this.checkClient();
          } else {
            console.log("res");
            console.log(res.data);
            this.controversialData = res.data.controversialData;
            this.idOfSimilarClients = res.data.idOfSimilarClients;

            this.firstClient = res.data.client;
            this.newClient = {};
            this.isNewClient = false;
            this.isFirstClient = true;
            this.isSame = true;
            for (let key in this.controversialData) {
              /*               console.log("key");
              console.log(key); */
              if (this.controversialData[key].length > 0) this.isSame = false;
            }
            this.index++;
            if (this.index == this.clientsList.length)
              this.disableCheckClient = true;
            if (this.isSame && !this.disableCheckClient) this.checkClient(); //
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  saveClient() {
    let updatedClient = {
      firstName:
        this.accepted_clientFirstName != ""
          ? this.accepted_clientFirstName
          : this.firstClient["firstName"],
      patronymic:
        this.accepted_clientPatronymic != ""
          ? this.accepted_clientPatronymic
          : this.firstClient["patronymic"],
      lastName:
        this.accepted_clientLastName != ""
          ? this.accepted_clientLastName
          : this.firstClient["lastName"],

      email:
        this.accepted_email != ""
          ? this.accepted_email
          : this.firstClient["email"],
      phoneNumber:
        this.accepted_phoneNumber != ""
          ? this.accepted_phoneNumber
          : this.firstClient["phoneNumber"],
      whatsApp:
        this.accepted_whatsApp != ""
          ? this.accepted_whatsApp
          : this.firstClient["whatsApp"],
      telegram:
        this.accepted_telegram != ""
          ? this.accepted_telegram
          : this.firstClient["telegram"],
      vKontakte:
        this.accepted_vKontakte != ""
          ? this.accepted_vKontakte
          : this.firstClient["vKontakte"],
      instagram:
        this.accepted_instagram != ""
          ? this.accepted_instagram
          : this.firstClient["instagram"],
      facebook:
        this.accepted_facebook != ""
          ? this.accepted_facebook
          : this.firstClient["facebook"],
      institutes: this.firstClient["institutes"],
      publishers: this.firstClient["publishers"],
      coordinators: this.firstClient["coordinators"],
      otherContact: this.firstClient["otherContact"],
      country: this.firstClient["country"],
      region: this.firstClient["region"],
      city: this.firstClient["city"],
      nameDayCelebration: this.firstClient["nameDayCelebration"],
      comments: this.firstClient["comments"],
      correspondents: this.firstClient["correspondents"],
      isRestricted: this.firstClient["isRestricted"],
      causeOfRestriction: this.firstClient["causeOfRestriction"],
      preventiveAction: this.firstClient["preventiveAction"],
    };
    let id = this.idOfSimilarClients[0];
    console.log("id");
    console.log(id);
    this.idOfSimilarClients.splice(0, 1);

    for (let id of this.idOfSimilarClients) {
      let index = this.clientsList.findIndex((item) => item._id == id);
      if (index > this.index) this.clientsList.splice(index, 1);
    }

    this.listService
      .saveChangedClient(id, updatedClient, this.idOfSimilarClients)
      .subscribe(
        (res) => {
          this.newClient = res.data.savedClient;
          this.firstClient = {};
          this.deletedClients = res.data.deletedClients;
          this.firstClient = {};
          this.isNewClient = true;
          this.isFirstClient = false;
          this.controversialData = [];
          this.idOfSimilarClients = [];
          this.isSame = true;

          this.accepted_clientFirstName = "";
          this.accepted_clientPatronymic = "";
          this.accepted_clientLastName = "";
          this.accepted_email = "";
          this.accepted_telegram = "";
          this.accepted_phoneNumber = "";
          this.accepted_whatsApp = "";
          this.accepted_vKontakte = "";
          this.accepted_instagram = "";
          this.accepted_facebook = "";

          this.checkClient();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  addSearchArray() {
    this.clientService.addSearchArray().subscribe(
      (res) => {
        alert(res + " обновлено");
      },
      (err) => {
        console.log(err);
      }
    );
  }

  moveInstitutes() {
    this.orderService.moveInstitutes().subscribe(
      (res) => {
        alert(res + " обновлено");
      },
      (err) => {
        console.log(err);
      }
    );
  }

  correctContacts() {
    this.clientService.correctContacts().subscribe(
      (res) => {
        alert(res + " обновлено");
      },
      (err) => {
        console.log(err);
      }
    );
  }

  restoreContacts() {
    this.clientService.restoreContacts().subscribe(
      (res) => {
        alert(res + " обновлено");
      },
      (err) => {
        console.log(err);
      }
    );
  }

  restorePluses(holiday) {
    this.orderService.restorePluses(holiday).subscribe(
      (res) => {
        alert(res + " обновлено");
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
