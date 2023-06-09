/*
============================================

; APIs for the list
;===========================================
*/

const express = require("express");
const List = require("../models/list");
const NewYear = require("../models/new-year");
const May9 = require("../models/may-9");
const May19 = require("../models/may-19");
const NameDay = require("../models/name-day");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Senior = require("../models/senior");
const Period = require("../models/period");
const TeacherDay = require("../models/teacher-day");
const House = require("../models/house");
const Order = require("../models/order");
const February23 = require("../models/february-23");
const March8 = require("../models/march-8");
//const SpecialDay = require("../models/senior");

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

  let notActiveHouses = await House.find({ isActive: false });
  let notActiveHousesNames = [];
  for (let house of notActiveHouses) {
    notActiveHousesNames.push(house.nursingHome);
  }
  console.log("notActiveHousesNames");
  console.log(notActiveHousesNames);

  let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: { $nin: notActiveHousesNames } });
 // let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: "ЖЕЛЕЗНОГОРСК", dateEnter: { $lt: new Date("2023-03-15") } }); //
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    let cloneSpecialComment = await specialComment(
      2023 - celebrator["yearBirthday"]
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
      if (celebrator.yearBirthday < 1942) {
        cloneOldest = true;
      }
      if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
        cloneCategory = "oldWomen";
      } else {
        if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
          cloneCategory = "oldMen";
        } else {
          if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
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
      holyday: 'ДР июля 2023',
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

  let notActiveHouses = await House.find({ $or: [{ isActive: false }, { dateLastUpdate: { $lt: new Date("2022-9-1") } }] });
  let notActiveHousesNames = [];
  for (let house of notActiveHouses) {
    notActiveHousesNames.push(house.nursingHome);
  }
  console.log("notActiveHousesNames");
  console.log(notActiveHousesNames);

  console.log("1- inside findAllMonthNameDays newList");
  let list = await Senior.find({ "monthNameDay": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: { $nin: notActiveHousesNames } });
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
      holyday: 'Именины июля 2023',
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
  //let updatedNursingHome = await House.find({isActive: true, nursingHome:"#"});
 // let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: ["ЕЛИЗАВЕТОВКА", "ЛАШМА", "ГАВРИЛОВ-ЯМ", "ВИШЕНКИ", "СЕВЕРООНЕЖСК", "СТАРОДУБ", "ИЛОВАТКА", "ПАНКРУШИХА", "АЛЕКСАНДРОВКА", "САВИНСКИЙ", "КРИПЕЦКОЕ"] } });
  //let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: ["СТАРОДУБ", "КИРЖАЧ", "САДОВЫЙ", "ВОЛГОГРАД_ВОСТОЧНАЯ", "ВОНЫШЕВО", "МОСАЛЬСК", "ИЛЬИНСКОЕ", "МАРКОВА", "УСТЬ-ИЛИМСК", "КАШИРСКОЕ", "БЕГИЧЕВСКИЙ"] } });
  //let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: ["КАЛИНИНГРАД_КАРТАШЕВА", "ПИОНЕРСКИЙ"] } });
 //const ready = ["КАЛИНИНГРАД_КАРТАШЕВА", "ПИОНЕРСКИЙ", "СТАРОДУБ", "КИРЖАЧ", "САДОВЫЙ", "ВОЛГОГРАД_ВОСТОЧНАЯ", "ВОНЫШЕВО", "МОСАЛЬСК", "ИЛЬИНСКОЕ", "МАРКОВА", "УСТЬ-ИЛИМСК", "КАШИРСКОЕ", "БЕГИЧЕВСКИЙ", "ЕЛИЗАВЕТОВКА", "ЛАШМА", "ГАВРИЛОВ-ЯМ", "ВИШЕНКИ", "СЕВЕРООНЕЖСК", "СТАРОДУБ", "ИЛОВАТКА", "ПАНКРУШИХА", "АЛЕКСАНДРОВКА", "САВИНСКИЙ", "КРИПЕЦКОЕ"];
 const ready = ["РЖЕВ"];
 let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: ready }, dateLastUpdate: {$gt: new Date("2023-01-01")} });



  //let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: ["НОГИНСК"] } });
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

  console.log(namesOfUpdatedNursingHome);

  let list = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome }, comment1: "(1 корп. 2 этаж)" }); //
  //let list = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: "МИХАЙЛОВ", dateEnter: {$gt: new Date("2022-10-25")} });
  console.log(list.length);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*       let cloneSpecialComment = await specialComment(
            2022 - celebrator["yearBirthday"]
          ); */

    let cloneCelebrator = await createCloneCelebrator(celebrator);

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

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length - finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 

  return result;
  //return true;
}
async function createCloneCelebrator(celebrator) {

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
    holyday: 'Пасха 2023',
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
  return cloneCelebrator;

}


/////////////////////////////////////////

// Create February23 and March8 list API 
router.post("/february-23/create", async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findAllGenderCelebrators("Male");
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

router.post("/march-8/create", async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findAllGenderCelebrators("Female");
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

async function findAllGenderCelebrators(gender) {

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside findAllMonthCelebrators newList");

  //let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: [] } });

  // let namesOfUpdatedNursingHome = ["ШИПУНОВО", "ПЕРВОМАЙСКИЙ", "АВДОТЬИНКА", "НИКИТИНКА", "НОВОСЕЛЬЕ", "НОВОСИБИРСК_ЖУКОВСКОГО", "БОЛЬШОЕ_КАРПОВО", "НОВОСЛОБОДСК", "ШИПУНОВО_БОА", "КЫТМАНОВО"];
  //let namesOfUpdatedNursingHome = ["ВИШЕРСКИЙ", "ВИШЕНКИ", "ЖЕЛЕЗНОГОРСК", "ДИМИТРОВГРАД", "ПИОНЕРСКИЙ", "СЕБЕЖ", "ТАМБОВСКИЙ_ЛЕСХОЗ", "ТОЛЬЯТТИ", "ЖИГУЛЕВСК", "КАРДЫМОВО", "ПАРФИНО", "НОГИНСК", "ЭЛЕКТРОГОРСК", "ИРКУТСК_КУРОРТНАЯ", "ОКТЯБРЬСКИЙ", "НЯНДОМА", "ЦЕЛИННОЕ", "ПОБЕДИМ"];
  //let namesOfUpdatedNursingHome = ["ОСТРОВ"];
  // let namesOfUpdatedNursingHome = ["ОКТЯБРЬСКИЙ"]; //lastName: "Чеботарева", 
  // let namesOfUpdatedNursingHome = ["ПРЕОБРАЖЕНСКИЙ", "СТАРОЕ_ШАЙГОВО", "ВЫСОКОВО", "НОВОСЕЛЬЕ", "ЧЕРНЫШЕВКА"];
  //let namesOfUpdatedNursingHome = ["НОГИНСК"]; // dateEnter: {$gt: new Date("2023-01-01")}, 
  //let namesOfUpdatedNursingHome = ["БЛАГОВЕЩЕНСК_ЗЕЙСКАЯ", "БЛАГОВЕЩЕНСК_ТЕАТРАЛЬНАЯ", "ЖУКОВКА", "ПАПУЛИНО", "ВОЛГОГРАД_КРИВОРОЖСКАЯ", "ВОЛГОГРАД_ВОСТОЧНАЯ", "ДОШИНО", "ИЛЬИНСКИЙ_ПОГОСТ", "КЛИН", "СЛОБОДА-БЕШКИЛЬ", "УВАРОВО", "СТОЛЫПИНО", "САРАТОВ_КЛОЧКОВА", "РЯЗАНЬ", "НОВАЯ_ЦЕЛИНА", "МИХАЙЛОВКА", "МАЛАЯ_РОЩА", "РОМАНОВКА", "НОВОТУЛКА", "КАНДАБУЛАК", "МАЙСКОЕ", "ДЕВЛЕЗЕРКИНО", "ПЕТРОВКА", "ЗАБОРОВЬЕ", "ВОРОНЦОВО", "МОСКВА_РОТЕРТА", "ХВОЙНЫЙ", "АНДРЕЕВСКИЙ", "БОЛШЕВО", "ПЕСЬ", "КРАСНАЯ_ГОРА", "НЕБОЛЧИ", "МОШЕНСКОЕ", "АНЦИФЕРОВО" ];
 // let namesOfUpdatedNursingHome = ["СЫЗРАНЬ_ПОЖАРСКОГО", "СЫЗРАНЬ_КИРОВОГРАДСКАЯ", "МАРКОВА", "ИРКУТСК_ЯРОСЛАВСКОГО", "ПРЯМУХИНО", "ВЯЗЬМА", "ЯРЦЕВО", "БОГОЛЮБОВО", "ОТРАДНЫЙ", "СО_ВЕЛИКИЕ_ЛУКИ", "БЕРЕЗНИКИ", "ДОЛБОТОВО", "ОКТЯБРЬСКИЙ", "КУГЕЙСКИЙ", "ВЕРХНИЙ_УСЛОН","БЛАГОВЕЩЕНКА", "ЯГОТИНО", "БЫТОШЬ", "БАЗГИЕВО","ПРОШКОВО", "ВОЛГОДОНСК","КАРГОПОЛЬ", "УСТЬ-ОРДЫНСКИЙ", "СТАРОДУБ" ]; //lastName: "Чеботарева",
  //let namesOfUpdatedNursingHome = ["ЧЕЛЯБИНСК", "СЕБЕЖ", "ШОЛОХОВСКИЙ", "ЛИТВИНОВКА", "ГОРНЯЦКИЙ", "УСОЛЬЕ", "БЕЛАЯ_КАЛИТВА", "УСТЬ-МОСИХА", "КРАСНОБОРСК", "ГЛОДНЕВО", "МАЧЕХА", "СЕЛЬЦО"];
  let namesOfUpdatedNursingHome = ["АНИСИМОВО"];
  /*   for (let home of updatedNursingHome) {
      namesOfUpdatedNursingHome.push(home.nursingHome);
    } */

  console.log(namesOfUpdatedNursingHome);

  let list = await Senior.find({ dateEnter: { $lt: new Date("2023-01-26") }, isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome }, gender: gender });
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*       let cloneSpecialComment = await specialComment(
            2022 - celebrator["yearBirthday"]
          ); */

    let cloneCelebrator = createCloneCelebratorGender(celebrator);

    updatedCelebrators.push(cloneCelebrator);
  }

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);
  // newList = newList1.slice();

  console.log("2.5 - " + newList.length);

  const options = { ordered: false };
  let finalList = gender == "Male" ? await February23.insertMany(newList, options) : await March8.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length - finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 

  return result;
  //return true;
}
function createCloneCelebratorGender(celebrator) {

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
    if (celebrator.yearBirthday < 1942) {
      cloneOldest = true;
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
      cloneCategory = "oldWomen";
    } else {
      if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
        cloneCategory = "oldMen";
      } else {
        if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
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
    holyday: celebrator.gender == "Male" ? '23 февраля 2023' : '8 марта 2023',
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
  // console.log(cloneCelebrator);
  //console.log("cloneCelebrator");
  return cloneCelebrator;

}

//////////////////////////////////////////

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

//Find all February23 lists API
router.get("/february-23", async (req, res) => {
  try {
    February23.find({ absent: { $ne: true } }, function (err, lists) {
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

//Find all March8 lists API
router.get("/march-8", async (req, res) => {
  try {
    March8.find({ absent: { $ne: true }}, function (err, lists) {
      //, nursingHome: {$in : ['АНДРЕЕВСКИЙ',	'БЕГИЧЕВСКИЙ',	'БЕРЕЗНИКИ',	'ВЕРБИЛКИ',	'ВИШЕРСКИЙ',	'ВОЛГОГРАД_КРИВОРОЖСКАЯ',	'ИЛЬИНСКИЙ_ПОГОСТ',	'ИРКУТСК_КУРОРТНАЯ',	'КАРДЫМОВО',	'КАШИРСКОЕ',	'КЛИН',	'МОСКВА_РОТЕРТА',	'НОВОСЕЛЬЕ',	'НОВОСИБИРСК_ЖУКОВСКОГО',	'НОГИНСК',	'НЯНДОМА',	'ОКТЯБРЬСКИЙ',	'ОСТРОВ',	'ПАРФИНО',	'ПЕРВОМАЙСКИЙ',	'ПОБЕДИМ',	'РЯЗАНЬ',	'СОЛИКАМСК_ДУБРАВА',	'СОЛИКАМСК_СЕЛА',	'СОСНОВКА',	'ТАМБОВСКИЙ_ЛЕСХОЗ',	'ТОВАРКОВСКИЙ_ДИПИ',	'ЦЕЛИННОЕ',	'ЭЛЕКТРОГОРСК']} }
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


/////correct doubles
router.get("/new-year/correct", async (res) => {
  try {

    let doubles = await NewYear.find({ plusAmount: 2, nursingHome: "НОВОТУЛКА" });//secondTime: false,

    console.log("doubles");
    console.log(doubles);
    for (let i = 71; i < 142; i++) {
      await NewYear.updateOne({ nursingHome: "НОВОТУЛКА", fullData: doubles[i].fullData, plusAmount: 2, _id: { $ne: doubles[i]._id } }, { $inc: { plusAmount: 2 } });//secondTime: true, 
      await NewYear.deleteOne({ _id: doubles[i]._id });
    }

    const findAllListsResponse = new BaseResponse("200", "Query successful", res);
    //res.json(findAllListsResponse.toObject());


  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

/////correct doubles
router.get("/new-year/check-orders", async (res) => {
  try {

    let orders = ['elenamikhno02@mail.ru', 'liz.grinberg3@gmail.com', 'dariarazumova@yahoo.com', 'yulaleto@mail.ru', 'veronika1555@yandex.ru', 'pashenkodas@gmail.com', 'tata.mann@yandex.ru', 'puma777777@mail.ru', 'Vtsinoeva@gmail.com', 'V_goldman@bk.ru', 'anastasiya.sarantseva@yandex.ru', 'nesterova_ri30@icloud.com', 'coraline13.10@yandex.ru', 'Ekerimova@lenta.ru', 'akopianstella@yandex.ru', 'Nushanja00@mail.ru', 'valeriyaa_cvetkova@mail.ru', 'Lena3174@yandex.ru', 'lika-saz99@mail.ru', 'ae_video_ru@mail.ru', 'juliana.24@yandex.ru', '@jul-tag@yandex.ru', 'Delmis@list.ru', 'irasharafutdinova26@icloud.com', 'your.orange@mail.ru', 'Chudnova.nadezhda@mail.ru', 'babuhina.olya@gmail.com', 'Lisovetc@bk.ru', 'arinaliagina@yandex.ru', 'Tatyanas-88@mail.ru', 'kar15mash08kina08@yandex.ru', 'Poliakovaka@mail.ru', 'mrs.lazarev@mail.ru', 'Vinychenko.i@yandex.ru', 'natali1992_92@mail.ru', 'Ambre21@mail.ru', 'ju-liyah@yandex.ru', 'arnulftatiana@gmail.com', 'kas40289@mail.ru', 'gembickaya_yana@mail.ru', 'Danchenkoira@yahoo.com', 'ok.medwe2011@yandex.ru', 'smaalina@yandex.ru', 'linasokolova96@mail.ru', 'a.nadtochikh@yandex.ru', 'O.sheiko1986@mail.ru', 'mrs_evgeniyavolkova@gmail.com', 'domonova@icloud.con', 'Lena.izhevsk@gmail.com', 'Mashde@yandex.ru', 'Lenusik_11@mail.ru', 'rogulina89@bk.ru', 'daryadarya18@icloud.com', 'tanya19mail@gmail.com', 'Vika.vika.ivlieva@mail.ru', 'l.oksana123@yandex.ru', 'bekk-e@bk.ru', 'annbarinova15@yandex.ru', 'luckyanna-1987@mail.ru', 'bahshieva-job@mail.ru', 'di.fyodorowa@yandex.ru', 'Ljk_90@mail.ru', 'voronina_alex@mail.ru', 'Teabetkam@gmail.com', 'Devochka_vesna87@bk.ru', 'gushkan2014@yandex.ru', 'Elena.Kireeva2707@gmail.com', 'Arhinova@yandex.ru', 'angelinad9@mail.ru', 'fantutta@gmail.com', 'Camizmn@list.ru', 'jakson.86@mail.ru', 'Kat.sizikova2015@yandex.ru', 'zaharcevaolya@mail.ru', 'amatsievskaya@bk.ru', 'a.valkova2702@mail.ru', 'dmukhovskaya@mail.ru', 'Sontasya@yandex.ru', 'kuzzmina96@bk.ru', 'dmargo133@yahoo.com', 'sealight_@mail.ru', 'karabejanova@mail.ru', 'kat_13357@mail.ru', '79995994313@ya.ru', '8894675@gmail.com', 'i_kutsenko@list.ru', 'katya_danilova@list@ru', 'Feliz_21.7@mail.ru', 'thekitika@yandex.ru', 'febacold@yandex.ru',];
    let ordersToDo = [];

    for (let item of orders) {
      let foundOrder = await Order.find({ holyday: "Пасха 2023", email: item });
      if (!foundOrder) { ordersToDo.push(item); }
    }
    console.log("orders");
    console.log(ordersToDo);
    // const findAllListsResponse = new BaseResponse("200", "Query successful", ordersToDo);
    //  res.json(findAllListsResponse.toObject());


  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

/////absents
router.get("/new-year/absents", async (res) => {
  try {
    let absents = await Senior.find({ dateExit: { $gt: new Date("2022-10-22") } });//secondTime: false,

    console.log("absents");
    console.log(absents);
    let i = 0;
    for (let item of absents) {
      let output = await NewYear.updateOne({ nursingHome: item.nursingHome, fullData: (item.nursingHome + item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday), absent: false }, { $set: { absent: true } });//secondTime: true, 
      if (output.nModified == 1) { i++; }

    }
    console.log(i);
    //const findAllListsResponse = new BaseResponse("200", "Query successful", res);
    //res.json(findAllListsResponse.toObject());


  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

// check NY doubles
router.post("/new-year/check-doubles", async (req, res) => {
  try {

    console.log("0- check NY doubles" + req.body.nursingHome);
    let result = await findAllNYDoubles(req.body.nursingHome);
    console.log("4-check NY doubles " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function findAllNYDoubles(house) {
  let fullHouse = await March8.find({ nursingHome: house, absent: false }, { fullData: 1, plusAmount: 1 });
  let fullDataHouse = [];
  /*   console.log("fullHouse");
    console.log(fullHouse); */
  for (let item of fullHouse) {
    fullDataHouse.push(item.fullData);
  }
  /*   console.log("fullDataHouse");
    console.log(fullDataHouse); */
  let duplicates = [];
  fullDataHouse.sort();

  //console.log(tempArray);
  for (let i = 0; i < fullDataHouse.length - 1; i++) {
    if (fullDataHouse[i + 1] == fullDataHouse[i]) {
      duplicates.push(fullDataHouse[i]);
    }
  }
  console.log("duplicates");
  console.log(duplicates);
  if (duplicates.length == 0) return '0';

  for (let senior of duplicates) {
    let someHouses = fullHouse.filter(item => item.fullData == senior);
    console.log("someHouses");
    console.log(someHouses);
    let plusAmount = 0;
    for (let senior of someHouses) {
      plusAmount = plusAmount + senior.plusAmount;
    }
    for (let i = 0; i < someHouses.length; i++) {
      if (i == 0) {
        await March8.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
      } else {
        await March8.deleteOne({ _id: someHouses[i]._id });
      }
    }
  }
  return duplicates.length.toString();


}



// check NY fullness
router.post("/new-year/check-fullness", async (req, res) => {
  try {

    console.log("0- check NY fullness " + req.body.nursingHome);
    let result = await checkAllNYFullness(req.body.nursingHome);
    console.log("4-check NY fullness " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function checkAllNYFullness(house) {

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house });
  console.log("seniors " + seniors.length);
  let fullHouse = await NewYear.find({ nursingHome: house, absent: false }, { fullData: 1 }); //
  console.log("fullHouse " + fullHouse.length);
  let amount = 0;
  for (let senior of seniors) {
    let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
    let seniorIndex = fullHouse.findIndex(item => item.fullData == fullData);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amount++;
      let celebrator = await createCloneCelebrator(senior);

      console.log(celebrator);
      let newCelebrator = await NewYear.create(celebrator);
      console.log(newCelebrator.fullData);
    }

    /*     let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
        let fullData2 = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic);
        console.log("fullData2 " + fullData2);
        let seniorIndex = fullHouse.findIndex(item => (item.nursingHome + item.lastName + item.firstName + item.patronymic) == fullData2);
        console.log("seniorIndex " + seniorIndex);
        if (seniorIndex > -1) {
          await NewYear.updateOne({ _id: fullHouse[seniorIndex]._id }, { $set: { fullData: fullData } });
          amount++;
        } */
  }

  return amount.toString();

}

// check HB doubles
router.post("/birthday/check-doubles", async (req, res) => {
  try {

    console.log("0- check HB doubles" + req.body.nursingHome);
    let result = await findAllHBDoubles(req.body.nursingHome);
    console.log("4-check HB doubles " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function findAllHBDoubles(house) {
  let fullHouse = await List.find({ nursingHome: house, absent: false }, { fullData: 1, plusAmount: 1 });
  let fullDataHouse = [];
  /*   console.log("fullHouse");
    console.log(fullHouse); */
  for (let item of fullHouse) {
    fullDataHouse.push(item.fullData);
  }
  /*   console.log("fullDataHouse");
    console.log(fullDataHouse); */
  let duplicates = [];
  fullDataHouse.sort();

  //console.log(tempArray);
  for (let i = 0; i < fullDataHouse.length - 1; i++) {
    if (fullDataHouse[i + 1] == fullDataHouse[i]) {
      duplicates.push(fullDataHouse[i]);
    }
  }
  console.log("duplicates");
  console.log(duplicates);
  if (duplicates.length == 0) return '0';

  for (let senior of duplicates) {
    let someHouses = fullHouse.filter(item => item.fullData == senior);
    console.log("someHouses");
    console.log(someHouses);
    let plusAmount = 0;
    for (let senior of someHouses) {
      plusAmount = plusAmount + senior.plusAmount;
    }
    for (let i = 0; i < someHouses.length; i++) {
      if (i == 0) {
        await List.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
      } else {
        await List.deleteOne({ _id: someHouses[i]._id });
      }
    }
  }
  return duplicates.length.toString();


}

// check HB fullness
router.post("/birthday/check-fullness", async (req, res) => {
  try {

    console.log("0- check HB doubles " + req.body.nursingHome);
    let result = await checkAllHBFullness(req.body.nursingHome);
    console.log("4-check HB doubles " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function checkAllHBFullness(house) {

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, monthBirthday: 6, isRestricted: false, nursingHome: house });
  console.log("seniors " + seniors.length);
  let fullHouse = await List.find({ nursingHome: house, absent: false }, { fullData: 1 }); //
  console.log("fullHouse " + fullHouse.length);
  let amount = 0;
  for (let senior of seniors) {
    let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
    let seniorIndex = fullHouse.findIndex(item => item.fullData == fullData);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amount++;
      let celebrator = await createCloneCelebrator(senior);

      console.log(celebrator);
      let newCelebrator = await List.create(celebrator);
      console.log(newCelebrator.fullData);
    }


  }

  return amount.toString();

}
const SpecialDay = require("../models/senior");
//Find special lists API
router.get("/holiday/special-list", async (req, res) => {
  try {
    let notActiveHouses = await House.find({ isActive: false });
    let notActiveHousesNames = [];
    for (let house of notActiveHouses) {
      notActiveHousesNames.push(house.nursingHome);
    }
    console.log("notActiveHousesNames");
    console.log(notActiveHousesNames);

    //  let nameDays = await SpecialDay.find({ absent: { $ne: true }, $or: [{ dateNameDay: 25 }, { dateNameDay: 27 }] });
    //  let nameDays = await SpecialDay.find({isRestricted: false, isReleased: false, dateEnter: {$gt:  new Date("2023-1-1") }, dateExit: null});
   // let nameDays = await SpecialDay.find({ isRestricted: false, isReleased: false, dateExit: null, nursingHome:{$in: ["ЕКАТЕРИНБУРГ", "БЕРЕЗОВСКИЙ"]}});
    let nameDays = await SpecialDay.find({ isRestricted: false, isReleased: false, dateExit: null, monthBirthday:8, dateBirthday: {$lt:6, $gt: 0}, yearBirthday: {$lt: 2023}, nursingHome: {$nin: notActiveHousesNames } });
    
    let updatedNursingHome = await House.find({ isActive: true });
    let namesOfUpdatedNursingHome = [];
    for (let home of updatedNursingHome) {
      namesOfUpdatedNursingHome.push(home.nursingHome);
    }
    //let nameDays = await SpecialDay.find({nursingHome: {$in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null, region: "БАШКОРТОСТАН", gender: "Female" , comment2: {$in: {nursingHome: {$in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null, gender: "Male" , monthBirthday : 3, dateBirthday: 2, yearBirthday: {$lt: 1953}});
    //let nameDays = await SpecialDay.find({ nursingHome: { $in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null, gender: "Male", comment2: { $in: ["ветеран ВОВ, труженик тыла", "ВВОВ,труженик тыла", "Ветеран ВОВ", "Афганистан", "участник боевых действий", "Ветеран ВОВ,  Ветеран  труда", "Ветеран ВОВ,  Ветеран  труда", "военный водитель", "малолетний узник, ветеран ВОВ"] } });
    //let nameDays = await SpecialDay.find({nursingHome: {$in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null, monthBirthday : 4, dateBirthday: 1, yearBirthday: {$lt: 1953}});
   // let nameDays = await SpecialDay.find({nursingHome: {$in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null,  region: "ТЮМЕНСКАЯ", gender: "Female"});
    let lineItems = [];
    let nursingHomes = await House.find({});

    nameDays.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));

    for (let person of nameDays) {
      console.log("person");
      console.log(person);
      //console.log(lineItems);
      let index = -1;
      //console.log(lineItems.length);
      if (lineItems.length > 0) {
        index = lineItems.findIndex(
          (item) => item.nursingHome == person.nursingHome
        );
      }
      // console.log(index);
      if (index > -1) {
        lineItems[index].celebrators.push(person);
      } else {
        let foundHouse = nursingHomes.find(
          (item) => item.nursingHome == person.nursingHome
        );
        //console.log(foundHouse);
        //console.log(person.nursingHome);
        if (!foundHouse) {
          console.log(`Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${person.nursingHome}.`);
          const findAllListsMongodbErrorResponse = new BaseResponse("500", `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${person.nursingHome}.`, err);
          res.status(500).send(findAllListsMongodbErrorResponse.toObject());
        }
        lineItems.push({
          region: foundHouse.region,
          nursingHome: foundHouse.nursingHome,
          address: foundHouse.address,
          infoComment: foundHouse.infoComment,
          adminComment: foundHouse.adminComment,
          noAddress: foundHouse.noAddress,
          celebrators: [person],
        });
      }
    }
    //console.log(nameDays);

    const findAllListsResponse = new BaseResponse("200", "Query successful", lineItems);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

// check holiday fullness
router.post("/holiday/check-fullness/:holiday", async (req, res) => {
  try {

    console.log("0- check NY fullness " + req.body.nursingHome);
    let result = await checkAllHolidayFullness(req.body.nursingHome, req.params.holiday);
    console.log("4-check NY fullness " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function checkAllHolidayFullness(house, holiday) {
  const Holiday = holiday == "february23" ? February23 : March8;

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house, gender: holiday == "february23" ? "Male" : "Female" });
  console.log("seniors " + seniors.length);
  let fullHouse = await Holiday.find({ nursingHome: house, absent: false }, { fullData: 1 }); //
  console.log("fullHouse " + fullHouse.length);
  let amountAdded = 0;
  for (let senior of seniors) {
    let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
    let seniorIndex = fullHouse.findIndex(item => item.fullData == fullData);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amountAdded++;
      let celebrator = await createCloneCelebrator(senior);

      console.log(celebrator);
      let newCelebrator = await Holiday.create(celebrator);
      console.log("newCelebrator.fullData");
      console.log(newCelebrator.fullData);
    }
  }

  let amountDeleted = 0;
  let ordersToAware = [];
  for (let senior of fullHouse) {
    //let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
    let seniorIndex = seniors.findIndex(item => (item.nursingHome + item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday) == senior.fullData);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amountDeleted++;

      await Holiday.updateOne({ _id: senior._id }, { $set: { absent: true } });
      let orders = await Order.find({ "lineItems.celebrators.celebrator_id": senior._id.toString() });
      let absentSenior = {
        fullData: senior.fullData,
        clientsContacts: [],
        userNames: []
      }
      for (let order of orders) {
        if (order.email) {
          absentSenior.clientsContacts.push(order.email);
        } else {
          absentSenior.clientsContacts.push(order.contact)
        }
        absentSenior.userNames.push(order.userName);
      }
      ordersToAware.push(absentSenior);

    }
  }

  return {
    amountAdded: amountAdded.toString(),
    amountDeleted: amountDeleted.toString(),
    ordersToAware: ordersToAware
  }

}

/////////////////////////////////////////

// Create May9 list API 
router.post("/9may/create", async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findAllMay9Celebrators();
    console.log("4-inside Create list API "); // + result
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


async function findAllMay9Celebrators() {

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside findAllMonthCelebrators newList");
  let busyNursingHome = await May9.find({},{_id: 0, nursingHome:1});
  let busyNursingHome2 = [];
  for (let home of busyNursingHome) {
    busyNursingHome2.push(home.nursingHome);
  }

  let notToAdd = Array.from (new Set(busyNursingHome2));
  //let updatedNursingHome = await House.find({isActive: true, isReleased: false, nursingHome: {$nin:notToAdd }, dateLastUpdate: {$lt: new Date("2023-03-31"), $gt: new Date("2023-03-28")}});
  let updatedNursingHome = await House.find({isActive: true, isReleased: false, nursingHome: {$nin:notToAdd }, dateLastUpdate: {$lt: new Date("2022-12-01"), $gt: new Date("2022-08-31")}});
  //let updatedNursingHome = await House.find({isActive: true, dateLastUpdate: {$lt: new Date("2023-03-01"), $gt: new Date("2022-12-31")}});
  // let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: ["ЕЛИЗАВЕТОВКА", "ЛАШМА", "ГАВРИЛОВ-ЯМ", "ВИШЕНКИ", "СЕВЕРООНЕЖСК", "СТАРОДУБ", "ИЛОВАТКА", "ПАНКРУШИХА", "АЛЕКСАНДРОВКА", "САВИНСКИЙ", "КРИПЕЦКОЕ"] } });
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

  console.log(namesOfUpdatedNursingHome);
 // let list = await Senior.find({ yearBirthday: {$gt: 0, $lt: 1946}, isDisabled: false, dateEnter: {$gt: new Date("2023-04-28")}, dateExit: null, isRestricted: false, nursingHome: "НИКИТИНКА"});
  let list = await Senior.find({ child: {$ne: ""},yearBirthday: {$gt: 0, $lt: 1946}, comment2: {$ne: "только ДР и НГ"}, isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: [
      'АРХАНГЕЛЬСК_ДАЧНАЯ',
    'БОР',           'БУРЕГИ',
    'ВЕРХНЕУРАЛЬСК', 'ДУБНА',
    'КАМЕНОЛОМНИ',   'ЛЕУЗА',
    'МЕТЕЛИ',        'МИСЦЕВО',
    'МОЛОДОЙ_ТУД',   'НОВЛЯНКА',
    'НОГУШИ',
    'ОДОЕВ',        
    'ПАВЛОВСК',      'ПЕРЕЛОЖНИКОВО',
    'СЕРГИЕВСКИЙ',   'СОЛЬЦЫ',
    'СЯВА',          'УФА'
  ]  } }); //namesOfUpdatedNursingHome
  //let list = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: "МИХАЙЛОВ", dateEnter: {$gt: new Date("2022-10-25")} });
  console.log(list.length);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*       let cloneSpecialComment = await specialComment(
            2022 - celebrator["yearBirthday"]
          ); */

    let cloneCelebrator = await createCloneCelebrator9May(celebrator);

    updatedCelebrators.push(cloneCelebrator);
  }

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);
  // newList = newList1.slice();

  console.log("2.5 - " + newList.length);

  const options = { ordered: false };
  let finalList = await May9.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length - finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 

  return result;
  //return true;
}
async function createCloneCelebrator9May(celebrator) {



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
    veteran: celebrator.veteran,
    child: celebrator.child,    
    linkPhoto: celebrator.linkPhoto,   
    noAddress: celebrator.noAddress,
    isReleased: celebrator.isReleased,
    plusAmount: 0,
    //specialComment: cloneSpecialComment,
    holyday: '9 мая 2023',
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
  return cloneCelebrator;

}

//Find all NY lists API
router.get("/9may", async (req, res) => {
  try {
    //List.find({region: "НОВОСИБИРСКАЯ"}, function (err, lists) {
    May9.find({ absent: { $ne: true } }, function (err, lists) {
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


/////////////////////////////////////////


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
