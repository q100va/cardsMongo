/*
============================================

; APIs for the list
;===========================================
*/

const express = require("express");
const List = require("../models/list");
const NewYear = require("../models/new-year");
const NameDay = require("../models/name-day");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Senior = require("../models/senior");
const Period = require("../models/period");
const TeacherDay = require("../models/teacher-day");
const House = require("../models/house");

//const User = require("../models/user");

// Delete double birthday list API 

router.delete("/double", async (req, res) => {
  try {
    let lists = await List.find();

    for (let i = 0; i < 1745; i++) {
      //console.log(lists[i]);
      let double = lists.find(item => item.fullData == lists[i].fullData && item._id != lists[i]._id);
      console.log(double);
      if (double) await List.deleteOne({ _id: double._id });
    }

    /*     let fullList = await List.find({});
        for (let item of fullList) {
          let found = await List.find({ fullData: item.fullData, plusAmount: 0, _id: { $ne: item._id } });
          console.log("found");
          console.log(found);
        } */

    const deleteListResponse = new BaseResponse(200, "Query Successful", true);
    res.json(deleteListResponse.toObject());

  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse("500", "MongoDB server error", e);
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
});

/**
 * API to delete double
 */
/* 
 router.delete("/", async (req, res) => {
  try {

    console.log("delete3");
    let lists = await List.find();
    for (let i = 0; i < 2; i++) {
      let double = lists.find(item => item.fullData == lists[i].fullData && item._id != lists[i]._id);
      console.log(double);
      lists.deleteOne({_id: double._id});
    }
    console.log("finish");
    const newListResponse = new BaseResponse(200, "Query Successful");
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse("500", "MongoDB server error", e);
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
}); */

// Create birthday list API 
router.post("/:month", async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findAllMonthCelebrators(req.params.month);
    console.log("4-inside Create list API " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


async function findAllMonthCelebrators(month) {

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside findAllMonthCelebrators newList");
  //let activeList = await List.find({});
  /*   let filledRegions = [];
    for (region of activeRegions) {
      filledRegions.push(region.region);
    } */

  /*   let filledIds = [];
    for (item of activeList) {
      filledIds.push(item._id);
    }
    console.log("filledIds");
    console.log(filledIds); */

  let notActiveHouses = await House.find({ $or: [{isActive: false} , {dateLastUpdate: {$lt: new Date("2022-9-1")}}]});
  let notActiveHousesNames = [];
  for (let house of notActiveHouses) {
    notActiveHousesNames.push(house.nursingHome);
  }
  console.log("notActiveHousesNames");
  console.log(notActiveHousesNames);

  let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: {$nin: notActiveHousesNames}});
  //let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: "УФА", lastName: { $in: ["Андреев", "Салимова"] } }); //
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    let cloneSpecialComment = await specialComment(
      2022 - celebrator["yearBirthday"]
    );


    let cloneFullDayBirthday = `${celebrator.dateBirthday > 9
      ? celebrator.dateBirthday
      : "0" + celebrator.dateBirthday}.${celebrator.monthBirthday > 9
        ? celebrator.monthBirthday
        : "0" + celebrator.monthBirthday}${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;

    let cloneCategory = '';
    let cloneOldest = false;

    if (celebrator["noAddress"]) {
      cloneCategory = "special";
    } else {
      if (celebrator.yearBirthday < 1941) {
        cloneOldest = true;
      }
      if (celebrator.yearBirthday < 1958 && celebrator.gender == "Female") {
        cloneCategory = "oldWomen";
      } else {
        if (celebrator.yearBirthday < 1958 && celebrator.gender == "Male") {
          cloneCategory = "oldMen";
        } else {
          if (celebrator.yearBirthday > 1957 || !celebrator.yearBirthday) {
            cloneCategory = "yang";
          }
        }
      }
    }

    let cloneCelebrator = {
      region: celebrator.region,
      nursingHome: celebrator.nursingHome,
      lastName: celebrator.lastName,
      firstName: celebrator.firstName,
      patronymic: celebrator.patronymic,
      dateBirthday: celebrator.dateBirthday,
      monthBirthday: celebrator.monthBirthday,
      yearBirthday: celebrator.yearBirthday,
      gender: celebrator.gender,
      comment1: celebrator.comment1,
      comment2: celebrator.comment2,
      linkPhoto: celebrator.linkPhoto,
      nameDay: celebrator.nameDay,
      dateNameDay: celebrator.dateNameDay,
      monthNameDay: celebrator.monthNameDay,
      noAddress: celebrator.noAddress,
      isReleased: celebrator.isReleased,
      plusAmount: 0,
      specialComment: cloneSpecialComment,
      fullDayBirthday: cloneFullDayBirthday,
      oldest: cloneOldest,
      category: cloneCategory,
      holyday: 'ДР января 2023',
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
    };
    //console.log("special - " + celebrator["specialComment"]);
    //console.log("fullday - " + celebrator.fullDayBirthday);
    //console.log(celebrator);
    updatedCelebrators.push(cloneCelebrator);
  }

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);
  // newList = newList1.slice();

  console.log("2.5 - " + newList.length);

  const options = { ordered: false };
  let finalList = await List.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length < finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 
  return result;
}


// Add comments
async function specialComment(age) {
  let special = '';
  let specialComments = {
    91: "год",
    92: "года",
    93: "года",
    94: "года",
    96: "лет",
    97: "лет",
    98: "лет",
    99: "лет",
    101: "год",
    102: "года",
    103: "года",
    104: "года",
    106: "лет",
    107: "лет",
    108: "лет",
    109: "лет",
    111: "лет",
    112: "лет",
    113: "лет",
    114: "лет",
    116: "лет",
    117: "лет",
  };
  if (age > 103 || age < 18) console.log(`Strange age: ${age}`);
  if (age % 5 === 0) {
    special = `Юбилей ${age} лет!`;
  } else {
    if (age > 90) {
      special = `${age} ${specialComments[age]}!`;
    } else {
      special = "";
    }
  }
  //console.log(special);
  return special;
}

// Delete duplicates
async function checkDoubles(array) {
  console.log("duplicates");
  let tempArray = [];
  let duplicates = [];
  for (let person of array) {
    tempArray.push(person.fullData);
  }
  //console.log(tempArray);
  tempArray.sort();
  //console.log(tempArray);
  for (let i = 0; i < tempArray.length - 1; i++) {
    if (tempArray[i + 1] == tempArray[i]) {
      duplicates.push(tempArray[i]);
    }
  }
  //console.log(duplicates);
  if (duplicates.length > 0) {
    console.log("There are duplicates! They were deleted from the list.");
    console.log(duplicates);

    for (let duplicate of duplicates) {
      let index = array.findIndex(item => item.fullData == duplicate);
      if (index > -1) {
        array.splice(index, 1);
      }
    }
  } else { console.log("There are not duplicates!"); }

  //console.log(array);
  return array;

}


/////////////////////////////////////////

// Create name day list API 
router.post("/name-day/:month", async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findAllMonthNameDays(req.params.month);
    console.log("4-inside Create list API " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function findAllMonthNameDays(month) {

  //throw new Error("Something bad happened");
  let result = [];

  let notActiveHouses = await House.find({ $or: [{isActive: false} , {dateLastUpdate: {$lt: new Date("2022-9-1")}}]});
  let notActiveHousesNames = [];
  for (let house of notActiveHouses) {
    notActiveHousesNames.push(house.nursingHome);
  }
  console.log("notActiveHousesNames");
  console.log(notActiveHousesNames);

  console.log("1- inside findAllMonthNameDays newList");
  let list = await Senior.find({ "monthNameDay": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: {$nin: notActiveHousesNames} });
  //let list = await Senior.find({ "monthNameDay": month, "isDisabled": false, dateExit: null, isRestricted: false, lastName:"Глазачева"});
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    let cloneFullDayBirthday = `${celebrator.dateBirthday > 9
      ? celebrator.dateBirthday
      : "0" + celebrator.dateBirthday}.${celebrator.monthBirthday > 9
        ? celebrator.monthBirthday
        : "0" + celebrator.monthBirthday}${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;
    let cloneSpecialComment;
    if (celebrator.yearBirthday) {
      cloneSpecialComment = celebrator.monthBirthday == celebrator.monthNameDay ? 'ДР ' + cloneFullDayBirthday : celebrator.yearBirthday + ' г.р.';
    }

    let cloneCelebrator = {
      region: celebrator.region,
      nursingHome: celebrator.nursingHome,
      lastName: celebrator.lastName,
      firstName: celebrator.firstName,
      patronymic: celebrator.patronymic,
      dateBirthday: celebrator.dateBirthday,
      monthBirthday: celebrator.monthBirthday,
      yearBirthday: celebrator.yearBirthday,
      gender: celebrator.gender,
      comment1: celebrator.comment1,
      comment2: celebrator.comment2,
      linkPhoto: celebrator.linkPhoto,
      nameDay: celebrator.nameDay,
      dateNameDay: celebrator.dateNameDay,
      monthNameDay: celebrator.monthNameDay,
      noAddress: celebrator.noAddress,
      isReleased: celebrator.isReleased,
      plusAmount: 0,
      specialComment: cloneSpecialComment,
      fullDayBirthday: cloneFullDayBirthday,
      /* oldest: cloneOldest,
      category: cloneCategory, */
      holyday: 'Именины января 2023',
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
    };
    //console.log("special - " + celebrator["specialComment"]);
    //console.log("fullday - " + celebrator.fullDayBirthday);
    //console.log(celebrator);
    updatedCelebrators.push(cloneCelebrator);
  }

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);
  // newList = newList1.slice();

  console.log("2.5 - " + newList.length);

  const options = { ordered: false };
  let finalList = await NameDay.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length < finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 
  return result;
}


/////////////////////////////////////////

/////////////////////////////////////////

// Create teacher day list API 
router.post("/teacher-day/create", async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findTeachers();
    //console.log("4-inside Create list API " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function findTeachers() {

  //throw new Error("Something bad happened");
  let result = [];
  //console.log("1- inside findAllMonthNameDays newList");
  let list = await Senior.find({ $or: [{ "comment2": /учителя/ }, { "comment2": /дошкольного/ }], "isDisabled": false, dateExit: null, isRestricted: false });
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    let cloneSpecialComment;
    if (celebrator.yearBirthday) {
      cloneSpecialComment = celebrator.yearBirthday + ' г.р.';
    }

    let cloneCelebrator = {
      region: celebrator.region,
      nursingHome: celebrator.nursingHome,
      lastName: celebrator.lastName,
      firstName: celebrator.firstName,
      patronymic: celebrator.patronymic,
      dateBirthday: celebrator.dateBirthday,
      monthBirthday: celebrator.monthBirthday,
      yearBirthday: celebrator.yearBirthday,
      gender: celebrator.gender,
      comment1: celebrator.comment1,
      comment2: celebrator.comment2,
      linkPhoto: celebrator.linkPhoto,
      noAddress: celebrator.noAddress,
      isReleased: celebrator.isReleased,
      plusAmount: 0,
      specialComment: cloneSpecialComment,
      //fullDayBirthday: cloneFullDayBirthday,
      /* oldest: cloneOldest,
      category: cloneCategory, */
      holyday: 'День учителя и дошкольного работника 2022',
      dateHoliday: celebrator.comment2.includes("учителя") ? 5 : 27,
      monthHoliday: celebrator.comment2.includes("учителя") ? 10 : 9,
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
    };
    //console.log("special - " + celebrator["specialComment"]);
    //console.log("fullday - " + celebrator.fullDayBirthday);
    //console.log(celebrator);
    updatedCelebrators.push(cloneCelebrator);
  }

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);
  // newList = newList1.slice();

  console.log("2.5 - " + newList.length);

  const options = { ordered: false };
  let finalList = await TeacherDay.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length < finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 
  return result;
}


/////////////////////////////////////////

// Create NY list API 
router.post("/new-year/create", async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findAllNYCelebrators();
    console.log("4-inside Create list API " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


async function findAllNYCelebrators() {

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside findAllMonthCelebrators newList");
  //let activeList = await List.find({});
  /*   let filledRegions = [];
    for (region of activeRegions) {
      filledRegions.push(region.region);
    } */

  /*   let filledIds = [];
    for (item of activeList) {
      filledIds.push(item._id);
    }
    console.log("filledIds");
    console.log(filledIds); */
  let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: ["ВЕРБИЛКИ", "ДУБНА", "БОР", "БЕРДСК", "УСТЬ-МОСИХА", "ГЛОДНЕВО", "ИЛЬИНСКОЕ", "КРАСНОЯРСК", "ПРОШКОВО", "КОЗЛОВО", "	ВЫШНИЙ_ВОЛОЧЕК", "БЕРЕЗНИКИ", "ВИШЕРСКИЙ", "МОСКВА_РОТЕРТА", "ПОГОРЕЛОВО", "	СО_ВЕЛИКИЕ_ЛУКИ", "	СЫЗРАНЬ_КИРОВОГРАДСКАЯ", "СЫЗРАНЬ_ПОЖАРСКОГО", "АЛЕКСАНДРОВКА", "БЕЛАЯ_КАЛИТВА", "АЛЕКСАНДРОВКА", "БЕЛАЯ_КАЛИТВА", "ГОРНЯЦКИЙ", "ЕЛИЗАВЕТОВКА", "ЛИТВИНОВКА", "РОМАНОВСКАЯ", "ШОЛОХОВСКИЙ", "ШЕБЕКИНО", "БЕЛАЯ_КАЛИТВА_ЖУКОВСКОГО", "СЕБЕЖ", "ШИПУНОВО_БОА"]}, dateLastUpdate: { $gt: new Date("2022-10-21"), $lt: new Date("2022-11-28") } });
  //let updatedNursingHome = await House.find({isActive: true, nursingHome:"ВЯЗЬМА", dateLastUpdate: {$gt: new Date("2022-10-21"), $lt: new Date("2022-11-23")}});
  //let updatedNursingHome = await House.find({isActive: true, region:"ТЮМЕНСКАЯ", dateLastUpdate: {$gt: new Date("2022-10-21"), $lt: new Date("2022-11-11")}});
  //let updatedNursingHome = await House.find({isActive: true, region:"ЧЕЛЯБИНСКАЯ", dateLastUpdate: {$gt: new Date("2022-10-21"), $lt: new Date("2022-11-11")}});
  //let updatedNursingHome = await House.find({isActive: true, region:"ИРКУТСКАЯ", dateLastUpdate: {$gt: new Date("2022-10-21"), $lt: new Date("2022-11-6")}});
  //let updatedNursingHome = await House.find({isActive: true, dateLastUpdate: {$gt: new Date("2022-08-31"), $lt: new Date("2022-10-22")}});
  //console.log(updatedNursingHome);
  let namesOfUpdatedNursingHome = [];
  for (let home of updatedNursingHome) {
    namesOfUpdatedNursingHome.push(home.nursingHome);
  }

  let list = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome } });
  //let list = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: "МИХАЙЛОВ", dateEnter: {$gt: new Date("2022-10-25")} });
  console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*       let cloneSpecialComment = await specialComment(
            2022 - celebrator["yearBirthday"]
          ); */


    let cloneFullDayBirthday = `${celebrator.dateBirthday > 9
      ? celebrator.dateBirthday
      : "0" + celebrator.dateBirthday}.${celebrator.monthBirthday > 9
        ? celebrator.monthBirthday
        : "0" + celebrator.monthBirthday}${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;

    let cloneCategory = '';
    let cloneOldest = false;

    if (celebrator["noAddress"]) {
      cloneCategory = "special";
    } else {
      if (celebrator.yearBirthday < 1941) {
        cloneOldest = true;
      }
      if (celebrator.yearBirthday < 1958 && celebrator.gender == "Female") {
        cloneCategory = "oldWomen";
      } else {
        if (celebrator.yearBirthday < 1958 && celebrator.gender == "Male") {
          cloneCategory = "oldMen";
        } else {
          if (celebrator.yearBirthday > 1957 || !celebrator.yearBirthday) {
            cloneCategory = "yang";
          }
        }
      }
    }

    let cloneCelebrator = {
      region: celebrator.region,
      nursingHome: celebrator.nursingHome,
      lastName: celebrator.lastName,
      firstName: celebrator.firstName,
      patronymic: celebrator.patronymic,
      dateBirthday: celebrator.dateBirthday,
      monthBirthday: celebrator.monthBirthday,
      yearBirthday: celebrator.yearBirthday,
      gender: celebrator.gender,
      comment1: celebrator.comment1,
      comment2: celebrator.comment2,
      linkPhoto: celebrator.linkPhoto,
      nameDay: celebrator.nameDay,
      dateNameDay: celebrator.dateNameDay,
      monthNameDay: celebrator.monthNameDay,
      noAddress: celebrator.noAddress,
      isReleased: celebrator.isReleased,
      plusAmount: 0,
      //specialComment: cloneSpecialComment,
      fullDayBirthday: cloneFullDayBirthday,
      oldest: cloneOldest,
      category: cloneCategory,
      holyday: 'Новый год 2023',
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
    };
    //console.log("special - " + celebrator["specialComment"]);
    //console.log("fullday - " + celebrator.fullDayBirthday);
    //console.log(celebrator);
    updatedCelebrators.push(cloneCelebrator);
  }

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);
  // newList = newList1.slice();

  console.log("2.5 - " + newList.length);

  const options = { ordered: false };
  let finalList = await NewYear.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length < finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 

  return result;
  //return true;
}



////////////////////////////////////////////

/**
 * API to delete all
 */
router.delete("/", async (req, res) => {
  try {

    console.log("delete3");
    List.deleteMany({}, function (err, lists) {
      if (err) {
        console.log(err);
        const deleteHouseMongoErrorResponse = new BaseResponse("500", "MongoDB Server Error", err);
        res.status(500).send(deleteHouseMongoErrorResponse.toObject());
      } else {
        console.log(lists);
        res.json(lists);

      }

    });
  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse("500", "MongoDB server error", e);
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
});

/////////////////////////////////////////




//Find all birthday lists API
router.get("/", async (req, res) => {
  try {
    //List.find({region: "НОВОСИБИРСКАЯ"}, function (err, lists) {
    List.find({ absent: { $ne: true } }, function (err, lists) {
      if (err) {
        console.log(err);
        const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
        res.status(500).send(findAllListsMongodbErrorResponse.toObject());
      } else {
        //console.log(lists);
        const findAllListsResponse = new BaseResponse("200", "Query successful", lists);
        res.json(findAllListsResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

//Find all NY lists API
router.get("/new-year", async (req, res) => {
  try {
    //List.find({region: "НОВОСИБИРСКАЯ"}, function (err, lists) {
    NewYear.find({ absent: { $ne: true } }, function (err, lists) {
      if (err) {
        console.log(err);
        const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
        res.status(500).send(findAllListsMongodbErrorResponse.toObject());
      } else {
        console.log(lists);
        const findAllListsResponse = new BaseResponse("200", "Query successful", lists);
        res.json(findAllListsResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

//Find all name day lists API
router.get("/name-day", async (req, res) => {
  try {

    NameDay.find({ absent: { $ne: true } }, function (err, nameDays) {
      if (err) {
        console.log(err);
        const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
        res.status(500).send(findAllListsMongodbErrorResponse.toObject());
      } else {
        console.log(nameDays);
        const findAllListsResponse = new BaseResponse("200", "Query successful", nameDays);
        res.json(findAllListsResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

//Find all teacher day lists API
router.get("/teacher-day", async (req, res) => {
  try {

    TeacherDay.find({ absent: { $ne: true } }, function (err, teacherDays) {
      if (err) {
        console.log(err);
        const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
        res.status(500).send(findAllListsMongodbErrorResponse.toObject());
      } else {
        console.log(teacherDays);
        const findAllListsResponse = new BaseResponse("200", "Query successful", teacherDays);
        res.json(findAllListsResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

// Find by ID
/* router.get("/:listId", async (req, res) => {
  try {
    List.findOne({ _id: req.params.listId }, function (err, person) {
      if (err) {
        const findListByIdMongodbErrorResponse = new BaseResponse("500", "Internal Server Error", err);
        res.status(500).send(findListByIdMongodbErrorResponse.toObject());
      } else {
        const findListByIdResponse = new BaseResponse("200", "Query Successful", person);
        res.json(findListByIdResponse.toObject());
      }
    });
  } catch (e) {
    const findListByIdCatchErrorResponse = new BaseResponse("500", "Internal Server Error", e);
    res.status(500).send(findListByIdCatchErrorResponse.toObject());
  }
}); */


module.exports = router;
