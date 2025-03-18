import { Component, OnInit } from "@angular/core";

import readXlsxFile from "read-excel-file";
import { SeniorsService } from "src/app/services/seniors.service";
import { HousesService } from "src/app/services/houses.service";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { House } from "src/app/shared/interfaces/houses.interface";
import { ListService } from "src/app/services/list.service";

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

  startDate: Date;
  endDate: Date;
  arrayOfEmails: Array<string>;
  isShowEmail: boolean = false;
  arrayOfHouses: Array<House>;

  file_second: File;
  arrayOfFamilies: Array<any> = [];
  duplicateChanged: Array<any> = [];

  months = [
    {
      id: 1,
      name: "январь",
    },
    {
      id: 2,
      name: "февраль",
    },
    {
      id: 3,
      name: "март",
    },
    {
      id: 4,
      name: "апрель",
    },
    {
      id: 5,
      name: "май",
    },
    {
      id: 6,
      name: "июнь",
    },
    {
      id: 7,
      name: "июль",
    },
    {
      id: 8,
      name: "август",
    },
    {
      id: 9,
      name: "сентябрь",
    },
    {
      id: 10,
      name: "октябрь",
    },
    {
      id: 11,
      name: "ноябрь",
    },
    {
      id: 12,
      name: "декабрь",
    },
  ];
  chosenMonths = [];
  waiting = false;

  /*     accepted_lastName: string ="";
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
    accepted_monthNameDay: number = 0; */

  /*   accepted_lastName: string;
  accepted_firstName: string;
  accepted_patronymic: string;
  accepted_dateBirthday: number;
  accepted_monthBirthday: number;
  accepted_yearBirthday: number;
  accepted_isDisabled: boolean;
  accepted_isRestricted: boolean;
  accepted_noAddress: boolean;
  accepted_isReleased: boolean;
  accepted_dateExit: Date;
  accepted_gender: string;
  accepted_comment1: string;
  accepted_comment2: string;
  accepted_veteran: string;
  accepted_child: string;
  accepted_linkPhoto: string;
  accepted_nameDay: string;
  accepted_dateNameDay: number;
  accepted_monthNameDay: number;
  accepted_dateOfSignedConsent: Date; */
  accepted = [];

  allAccepted = [];

  isStart = false;

  isStartUpload = false;
  addedFamilies = [];
  notFoundFamilies = [];
  isShowFamiliesList = false;

  constructor(
    private seniorsService: SeniorsService,
    private houseService: HousesService,
    private listService: ListService
  ) {}

  displayedColumns = [
    "check",
    "region",
    "nursingHome",
    "dateLastUpdateClone",
    "nameContact",
    "contact",
  ];
  dataSource: MatTableDataSource<House>;
  selection = new SelectionModel<House>(true, []);

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

    for (let list of this.arrayOfLists) {
      let index: number;
      while (index != -1) {
        index = list.findIndex(
          (item) => !item.lastName && !item.firstName && !item.patronymic
        );
        if (index != -1) list.splice(index, 1);
      }
      for (let senior of list) {
        senior.isRestricted = false;

        if (senior.patronymic) {
          senior.patronymic = senior.patronymic.toLowerCase();
          senior.patronymic =
            senior.patronymic[0].toUpperCase() + senior.patronymic.substring(1);
          senior.patronymic = senior.patronymic.replaceAll("ё", "е");
        }
        if (senior.lastName) {
          senior.lastName = senior.lastName.toLowerCase();
          senior.lastName =
            senior.lastName[0].toUpperCase() + senior.lastName.substring(1);
          senior.lastName = senior.lastName.replaceAll("ё", "е");
        }
        if (senior.firstName) {
          senior.firstName = senior.firstName.toLowerCase();
          senior.firstName =
            senior.firstName[0].toUpperCase() + senior.firstName.substring(1);
          senior.firstName = senior.firstName.replaceAll("ё", "е");
        }

        if (!senior.patronymic) {
          senior.comment1 = "(отчество не указано)";
          if (
            senior.lastName.endsWith("ов") ||
            senior.lastName.endsWith("ев") ||
            senior.lastName.endsWith("ин")
          ) {
            senior.gender = "Male";
          } else if (
            senior.lastName.endsWith("ова") ||
            senior.lastName.endsWith("ева") ||
            senior.lastName.endsWith("ина")
          ) {
            senior.gender = "Female";
          }
        } else if (
          senior.patronymic.endsWith("ич") ||
          senior.patronymic.endsWith("оглы") ||
          senior.patronymic.endsWith("Оглы")
        ) {
          senior.gender = "Male";
        } else if (
          senior.patronymic.endsWith("на") ||
          senior.patronymic.endsWith("кызы") ||
          senior.patronymic.endsWith("Кызы")
        ) {
          senior.gender = "Female";
        }
      }
    }
    console.log("this.arrayOfLists");
    console.log(this.arrayOfLists);
  }

  compareLists(arrayOfLists, nursingHome) {
    this.accepted = [];
    //alert("WORKS");
    console.log("WORKS");
    console.log(arrayOfLists);
    this.seniorsService
      .compareListsBackend(arrayOfLists, nursingHome, this.chosenMonths)
      .subscribe(
        async (res) => {
          this.resultOfCompare = await res["data"];
          console.log(this.resultOfCompare);
          this.isShowList = true;
          this.isStart = false;
          this.duplicateChanged = [...this.resultOfCompare.changed];
          for (let person of this.resultOfCompare.changed) {
            this.accepted.push({
              id: person.old._id,
              region: person.old.region,
              nursingHome: person.old.nursingHome,
              lastName: undefined,
              firstName: undefined,
              patronymic: undefined,
              dateBirthday: undefined,
              monthBirthday: undefined,
              yearBirthday: undefined,
              isDisabled: undefined,
              isRestricted: undefined,
              noAddress: undefined,
              isReleased: undefined,
              dateExit: undefined,
              gender: undefined,
              comment1: undefined,
              comment2: undefined,
              veteran: undefined,
              child: undefined,
              linkPhoto: undefined,
              nameDay: undefined,
              monthNameDay: undefined,
              dateOfSignedConsent: undefined,
            });
          }
          console.log("this.accepted");
          console.log(this.accepted);
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
      key: movedFromAbsentsKey,
      old: this.resultOfCompare.absents.find(
        (item) => item.key == movedFromAbsentsKey
      ),
      new: this.resultOfCompare.arrived.find(
        (item) => item.key == movedFromArrivedKey
      ),
    };
    this.resultOfCompare.changed.push(difference);
    this.duplicateChanged.push(difference);
    this.resultOfCompare.absents.splice(
      this.resultOfCompare.absents.findIndex(
        (item) => item.key == movedFromAbsentsKey
      ),
      1
    );
    this.resultOfCompare.arrived.splice(
      this.resultOfCompare.arrived.findIndex(
        (item) => item.key == movedFromArrivedKey
      ),
      1
    );

    this.accepted.push({
      id: difference.old._id,
      region: difference.old.region,
      nursingHome: difference.old.nursingHome,
      lastName: undefined,
      firstName: undefined,
      patronymic: undefined,
      dateBirthday: undefined,
      monthBirthday: undefined,
      yearBirthday: undefined,
      isDisabled: undefined,
      isRestricted: undefined,
      noAddress: undefined,
      isReleased: undefined,
      dateExit: undefined,
      gender: undefined,
      comment1: undefined,
      comment2: undefined,
      veteran: undefined,
      child: undefined,
      linkPhoto: undefined,
      nameDay: undefined,
      monthNameDay: undefined,
      dateOfSignedConsent: undefined,
    });

    console.log("this.accepted");
    console.log(this.accepted);
  }

  moveToChangedFromDoubtful(movedFromDoubtful) {
    const changed = this.resultOfCompare.doubtful.find(
      (item) => item.key == movedFromDoubtful
    );
    this.resultOfCompare.changed.push(changed);
    this.duplicateChanged.push(changed);
    this.resultOfCompare.doubtful.splice(
      this.resultOfCompare.doubtful.findIndex(
        (item) => item.key == movedFromDoubtful
      ),
      1
    );

    this.accepted.push({
      id: changed.old._id,
      region: changed.old.region,
      nursingHome: changed.old.nursingHome,
      lastName: undefined,
      firstName: undefined,
      patronymic: undefined,
      dateBirthday: undefined,
      monthBirthday: undefined,
      yearBirthday: undefined,
      isDisabled: undefined,
      isRestricted: undefined,
      noAddress: undefined,
      isReleased: undefined,
      dateExit: undefined,
      gender: undefined,
      comment1: undefined,
      comment2: undefined,
      veteran: undefined,
      child: undefined,
      linkPhoto: undefined,
      nameDay: undefined,
      monthNameDay: undefined,
      dateOfSignedConsent: undefined,
    });

    console.log("this.accepted");
    console.log(this.accepted);
  }

  moveToAbsentsArrived(movedFromDoubtful) {
    console.log(movedFromDoubtful);
    console.log("movedFromDoubtful");
    const absent = this.resultOfCompare.doubtful.find(
      (item) => item.key == movedFromDoubtful
    );
    this.resultOfCompare.absents.push(absent.old);
    const arrived = this.resultOfCompare.doubtful.find(
      (item) => item.key == movedFromDoubtful
    );
    this.resultOfCompare.arrived.push(arrived.new);
    this.resultOfCompare.doubtful.splice(
      this.resultOfCompare.doubtful.findIndex(
        (item) => item.key == movedFromDoubtful
      ),
      1
    );
  }

  acceptChanges(accepted, key, person) {
    /*     console.log("accepted.dateOfSignedConsent");
    console.log(accepted.dateOfSignedConsent); */

    console.log("person");
    console.log(person._id);
    console.log("accepted.id");
    console.log(accepted.id);
    const cloneAccepted = {
      id: accepted.id ? accepted.id : person._id,
      region: person.region,
      nursingHome: person.nursingHome,
      lastName: accepted.lastName ? accepted.lastName : person.lastName,
      firstName: accepted.firstName ? accepted.firstName : person.firstName,
      patronymic: accepted.patronymic ? accepted.patronymic : person.patronymic,
      dateBirthday: accepted.dateBirthday
        ? accepted.dateBirthday
        : person.dateBirthday,
      monthBirthday: accepted.monthBirthday
        ? accepted.monthBirthday
        : person.monthBirthday,
      yearBirthday: accepted.yearBirthday
        ? accepted.yearBirthday
        : person.yearBirthday,
      isDisabled: accepted.isDisabled ? accepted.isDisabled : person.isDisabled,
      isRestricted: accepted.isRestricted
        ? accepted.isRestricted
        : person.isRestricted,
      noAddress: accepted.noAddress ? accepted.noAddress : person.noAddress,
      isReleased: accepted.isReleased ? accepted.isReleased : person.isReleased,
      dateExit: accepted.dateExit ? accepted.dateExit : person.dateExit,
      gender: accepted.gender ? accepted.gender : person.gender,
      comment1: accepted.comment1 ? accepted.comment1 : person.comment1,
      comment2: accepted.comment2 ? accepted.comment2 : person.comment2,
      veteran: accepted.veteran ? accepted.veteran : person.veteran,
      child: accepted.child ? accepted.child : person.child,
      linkPhoto: accepted.linkPhoto ? accepted.linkPhoto : person.linkPhoto,
      nameDay: accepted.nameDay ? accepted.nameDay : person.nameDay,
      dateNameDay: accepted.dateNameDay
        ? accepted.dateNameDay
        : person.dateNameDay,
      monthNameDay: accepted.monthNameDay
        ? accepted.monthNameDay
        : person.monthNameDay,
      dateOfSignedConsent: accepted.dateOfSignedConsent
        ? new Date(accepted.dateOfSignedConsent)
        : person.dateOfSignedConsent,
    };
    this.allAccepted.push(cloneAccepted);
    this.resultOfCompare.changed.splice(
      this.resultOfCompare.changed.findIndex((item) => item.key == key),
      1
    );
    console.log("cloneAccepted.id");
    console.log(cloneAccepted.id);

    let index = this.accepted.findIndex((item) => item.id == cloneAccepted.id);
    console.log("index");
    console.log(index);

    this.accepted.splice(index, 1);
    console.log("this.accepted");
    console.log(this.accepted);
    /* 
    this.accepted_lastName = undefined;
    this.accepted_firstName = undefined;
    this.accepted_patronymic = undefined;
    this.accepted_dateBirthday = undefined;
    this.accepted_monthBirthday = undefined;
    this.accepted_yearBirthday = undefined;
    this.accepted_isDisabled = undefined;
    this.accepted_isRestricted = undefined;
    this.accepted_noAddress = undefined;
    this.accepted_isReleased = undefined;
    this.accepted_dateExit = undefined;
    this.accepted_gender = undefined;
    this.accepted_comment1 = undefined;
    this.accepted_comment2 = undefined;
    this.accepted_veteran = undefined;
    this.accepted_child = undefined;
    this.accepted_linkPhoto = undefined;
    this.accepted_nameDay = undefined;
    this.accepted_dateNameDay = undefined;
    this.accepted_monthNameDay = undefined;
    this.accepted_dateOfSignedConsent = undefined; */
  }

  acceptAllChanges() {
    console.log("acceptAllChanges");
    this.waiting = true;
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
          this.waiting = false;
          if (this.index == this.arrayOfLists.length) {
            alert("Это был последний лист.");
            this.isShowList = false;
          } else {
            this.dateOfList = null;
            if (this.arrayOfLists[this.index][0]?.nursingHome) {
              this.compareLists(
                this.arrayOfLists[this.index],
                this.arrayOfLists[this.index][0].nursingHome
              );
            } else {
              alert(
                "Невозможно продолжить обновление! Возможно загруженный файл содержит строки без названия интерната."
              );
            }
          }
        },
        (err) => {
          this.waiting = false;
          console.log(err);
          alert(
            "Произошла ошибка, обратитесь к администратору! " + err.message
          );
          //stop = true;
        }
      );
  }

  showEmail(startDate: Date, endDate: Date) {
    this.arrayOfEmails = [];
    console.log("startDate");
    console.log(startDate);
    console.log("endDate");
    console.log(endDate);
    this.houseService.findHousesEmail(startDate, endDate).subscribe(
      async (res) => {
        this.arrayOfHouses = res["data"];
        console.log("this.arrayOfHouses");
        console.log(this.arrayOfHouses);
        this.dataSource = new MatTableDataSource(this.arrayOfHouses);
        this.isShowEmail = true;
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
        //stop = true;
      }
    );
  }

  copyEmail() {
    this.arrayOfEmails = [];

    for (let value of this.selection["_selection"]) {
      this.arrayOfEmails.push(value.contact);
    }
  }

  //FAMILIES LIST

  async uploadFile(event) {
    console.log("START");

    this.file_second = event.target.files[0];

    let rows = await readXlsxFile(this.file_second);

    console.log("rows");
    console.log(rows);

    let columnsNumber = rows[0].length;
    let rowsNumber = rows.length;

    for (let j = 1; j < rowsNumber; j++) {
      let item = {};
      for (let i = 0; i < columnsNumber; i++) {
        let propertyName = rows[0][i];
        item[propertyName.toString()] = rows[j][i];
        this.arrayOfFamilies[j - 1] = item;
      }
    }

    console.log(this.arrayOfFamilies);

    this.isStartUpload = true;
    console.log(this.isStartUpload);
  }

  prepareLists(arrayOfFamilies) {
    //alert("WORKS");

    this.listService.createFamiliesList(arrayOfFamilies).subscribe(
      async (res) => {
        this.addedFamilies = await res["data"]["addedFamilies"];
        this.notFoundFamilies = await res["data"]["notFoundFamilies"];
        //console.log(this.);
        this.isShowFamiliesList = true;
        this.isStartUpload = false;
      },
      (err) => {
        console.log(err);
        alert("Произошла ошибка, обратитесь к администратору! " + err.message);
        //stop = true;
      }
    );
  }
}
