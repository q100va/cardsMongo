/*
============================================

; APIs for the list
;===========================================
*/

const express = require("express");
const mongoose = require('mongoose');
let List = require("../models/list");
let ListNext = require("../models/list-next");
let ListBefore = require("../models/list-previous");
const NewYear = require("../models/new-year");
const May9 = require("../models/may-9");
//const May19 = require("../models/may-19");
const NameDay = require("../models/name-day");
const NameDayBefore = require("../models/name-day-previous");
const NameDayNext = require("../models/name-day-next");
const Client = require("../models/client");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Senior = require("../models/senior");
const Period = require("../models/period");
const TeacherDay = require("../models/teacher-day");
const House = require("../models/house");
const Region = require("../models/region");
const Order = require("../models/order");
const SeniorDay = require("../models/senior-day");
const February23 = require("../models/february-23");
const March8 = require("../models/march-8");
const FamilyDay = require("../models/family-day");
const checkAuth = require("../middleware/check-auth");
const Easter = require("../models/easter");

//const SpecialDay = require("../models/senior");

//const User = require("../models/user");

// Delete double birthday list API 

router.delete("/double", checkAuth, async (req, res) => {
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
router.post("/:month", checkAuth, async (req, res) => {
  try {
    console.log("0- inside Create list API" + req.params.month);
    let result = await findAllMonthCelebrators(req.params.month);
    //let result = await findAllMonthCelebrators(10);
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

  //let notActiveHouses = await House.find({ isActive: false });

  let notActiveHouses = await House.find({ $or: [{ isActive: false }, { dateLastUpdate: { $lt: new Date("2025-6-30") } }] });

  let notActiveHousesNames = [];
  for (let house of notActiveHouses) {
    notActiveHousesNames.push(house.nursingHome);
  }
  console.log("notActiveHousesNames");
  console.log(notActiveHousesNames);

  let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: { $nin: notActiveHousesNames } });

  //let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: "МОСКВА_РОТЕРТА" });
  //let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: "КРАСНОВИШЕРСК", dateEnter: { $lt: new Date("2023-06-15") } });
  // let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: "ЖЕЛЕЗНОГОРСК", dateEnter: { $lt: new Date("2023-03-15") } }); //
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    let cloneSpecialComment = await specialComment(
      2026 - celebrator["yearBirthday"]
    );


    let cloneFullDayBirthday = `${celebrator.dateBirthday > 9
      ? celebrator.dateBirthday
      : "0" + celebrator.dateBirthday}.${celebrator.monthBirthday > 9
        ? celebrator.monthBirthday
        : "0" + celebrator.monthBirthday}${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;

    let cloneCategory = '';
    let cloneOldest = false;

    if (celebrator["noAddress"]) {
      if (celebrator.gender == "Female") {
        cloneCategory = "specialWomen";
      }
      if (celebrator.gender == "Male") {
        cloneCategory = "specialMen";
      }

    } else {
      if (celebrator.yearBirthday < 1942 && celebrator.yearBirthday > 0) {
        cloneOldest = true;
      }
      if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
        cloneCategory = "oldWomen";
      }
      if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
        cloneCategory = "oldMen";
      }
      if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
        if (celebrator.gender == "Female") {
          cloneCategory = "yangWomen";
        }
        if (celebrator.gender == "Male") {
          cloneCategory = "yangMen";
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
      holyday: month == 12 ? 'Дни рождения декабря 2025' : 'Дни рождения января 2026',
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
      dateOfSignedConsent: celebrator.dateOfSignedConsent,
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
  //console.log(newList);

  const options = { ordered: false };
  let finalList;
  if (month == 11) { finalList = await ListBefore.insertMany(newList, options); }
  if (month == 12) { finalList = await List.insertMany(newList, options); }
  if (month == 1) { finalList = await ListNext.insertMany(newList, options); }

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
  if (age > 103 || age < 18) {
    console.log(`Strange age: ${age}`);
    return special;
  }
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
router.post("/name-day/:month", checkAuth, async (req, res) => {
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

  let notActiveHouses = await House.find({ $or: [{ isActive: false }, { dateLastUpdate: { $lt: new Date("2024-9-1") } }] });
  let notActiveHousesNames = [];
  for (let house of notActiveHouses) {
    notActiveHousesNames.push(house.nursingHome);
  }
  console.log("notActiveHousesNames");
  console.log(notActiveHousesNames);

  console.log("1- inside findAllMonthNameDays newList");
  let list = await Senior.find({ "monthNameDay": month, "isDisabled": false, dateExit: null, isRestricted: false, nursingHome: { $nin: notActiveHousesNames } });
  //let list = await Senior.find({ "monthNameDay": month, "isDisabled": false, dateExit: null, isRestricted: false, lastName: { $in: ["Чекалин"] } });
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
    let holiday;
    if (month == 4) holiday = 'Именины марта 2025';
    if (month == 5) holiday = 'Именины апреля 2025';

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
      holyday: holiday,
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
      dateOfSignedConsent: celebrator.dateOfSignedConsent,
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
  let finalList;
  if (month == 4) finalList = await NameDay.insertMany(newList, options);
  if (month == 5) finalList = await NameDayNext.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length < finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 
  return result;
}


/////////////////////////////////////////

/////////////////////////////////////////

// Create teacher day list API 
router.post("/teacher-day/create", checkAuth, async (req, res) => {
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
  //let list = await Senior.find({ $or: [{ "comment2": /учителя/ }, { "comment2": /дошкольного/ }], "isDisabled": false, dateExit: null, isRestricted: false });
  let list = await Senior.find({ teacher: { $ne: "" }, isDisabled: false, dateExit: null, isRestricted: false });
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*     let cloneSpecialComment;
        if (celebrator.yearBirthday) {
          cloneSpecialComment = celebrator.yearBirthday + ' г.р.';
        } */

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
      //comment2: celebrator.comment2,
      teacher: celebrator.teacher,
      linkPhoto: celebrator.linkPhoto,
      noAddress: celebrator.noAddress,
      isReleased: celebrator.isReleased,
      plusAmount: 0,
      //specialComment: cloneSpecialComment,
      //fullDayBirthday: cloneFullDayBirthday,
      /* oldest: cloneOldest,
      category: cloneCategory, */
      holyday: 'День учителя и дошкольного работника 2024',
      dateHoliday: celebrator.teacher.includes("учителя") ? 5 : 27,
      monthHoliday: celebrator.teacher.includes("учителя") ? 10 : 9,
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
      dateOfSignedConsent: celebrator.dateOfSignedConsent,
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
  console.log("newList.length");
  console.log(newList.length);
  let existedList = await TeacherDay.aggregate([{ $project: { _id: 0, fullData: 1 } }]);
  console.log("existedList");
  console.log(existedList);

  for (let teacher of existedList) {
    let index = newList.findIndex(item => item.fullData == teacher.fullData);
    if (index > -1) newList.splice(index, 1);
  }




  const options = { ordered: false };
  let finalList = await TeacherDay.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length < finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 
  return result;
}

/////////////////////////////////////////

// Create senior day list API 
router.post("/senior-day/create", checkAuth, async (req, res) => {
  try {
    console.log("0- inside Create list API");
    let result = await findSeniors();
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

async function findSeniors() {

  //throw new Error("Something bad happened");
  let result = [];
  //console.log("1- inside findAllMonthNameDays newList");
  let notActiveHouses = await House.find({ isActive: false });
  let notActiveHousesNames = [];
  for (let house of notActiveHouses) {
    notActiveHousesNames.push(house.nursingHome);
  }
  //let houses = ["ЧИСТОПОЛЬ", "ЧИТА_ТРУДА", "ЯСНОГОРСК", "ВОЗНЕСЕНЬЕ", "УЛЬЯНКОВО", "КУГЕСИ", "ВЛАДИКАВКАЗ", "ВЫСОКОВО", "СЛОБОДА-БЕШКИЛЬ", "ПЕРВОМАЙСКИЙ", "СКОПИН", "РЯЗАНЬ"];
  //let houses = ["ДОНЕЦК", "ТИМАШЕВСК"];
  // let houses = ["ОКТЯБРЬСКИЙ", "НОГУШИ", "МЕТЕЛИ", "ЛЕУЗА", "КУДЕЕВСКИЙ", "БАЗГИЕВО"];
  //let houses = ["ВЫШНИЙ_ВОЛОЧЕК", "ЖИТИЩИ", "КОЗЛОВО", "МАСЛЯТКА", "МОЛОДОЙ_ТУД", "ПРЯМУХИНО", "РЖЕВ", "СЕЛЫ", "СТАРАЯ_ТОРОПА", "СТЕПУРИНО", "ТВЕРЬ_КОНЕВА", "ЯСНАЯ_ПОЛЯНА", "УЛЬЯНКОВО", "КРАСНЫЙ_ХОЛМ"];
  //let houses = ["ЗОЛОТАРЕВКА"];
  //let houses = ["БЫТОШЬ", "ГЛОДНЕВО", "ДОЛБОТОВО", "ЖУКОВКА", "СЕЛЬЦО", "СТАРОДУБ"];
  //let houses = ["УСТЬ-МОСИХА", "ЕВПАТОРИЯ"];

  //let list = await Senior.find({ nursingHome: { $in: houses }, isDisabled: false, dateExit: null, isRestricted: false, noAddress: false, isReleased: false, yearBirthday: { $lt: 1965 } });
  let list = await Senior.find({ nursingHome: { $nin: notActiveHousesNames }, isDisabled: false, dateExit: null, isRestricted: false, noAddress: false, isReleased: false, yearBirthday: { $lt: 1965 } });
  // let list = await Senior.find({ nursingHome: { $nin: notActiveHousesNames }, isDisabled: false, dateExit: null, isRestricted: false, noAddress: true, yearBirthday: { $lt: 1965 } });
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*     let cloneSpecialComment;
        if (celebrator.yearBirthday) {
          cloneSpecialComment = celebrator.yearBirthday + ' г.р.';
        } */

    let cloneCelebrator = {
      region: celebrator.region,
      nursingHome: celebrator.nursingHome,
      lastName: celebrator.lastName,
      firstName: celebrator.firstName,
      patronymic: celebrator.patronymic,
      //dateBirthday: celebrator.dateBirthday,
      //monthBirthday: celebrator.monthBirthday,
      yearBirthday: celebrator.yearBirthday,
      gender: celebrator.gender,
      comment1: celebrator.comment1,
      comment2: celebrator.comment2,
      //teacher: celebrator.teacher,
      linkPhoto: celebrator.linkPhoto,
      noAddress: celebrator.noAddress,
      isReleased: celebrator.isReleased,
      plusAmount: 0,
      //specialComment: cloneSpecialComment,
      //fullDayBirthday: cloneFullDayBirthday,
      /* oldest: cloneOldest,
      category: cloneCategory, */
      holyday: 'День пожилого человека 2024',
      //dateHoliday: celebrator.teacher.includes("учителя") ? 5 : 27,
      //monthHoliday: celebrator.teacher.includes("учителя") ? 10 : 9,
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.yearBirthday,
      dateOfSignedConsent: celebrator.dateOfSignedConsent,
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
  console.log("newList.length");
  console.log(newList.length);
  let existedList = await SeniorDay.find({ absent: false });
  //existedList = await checkDoubles(existedList);
  console.log("existedList");
  console.log(existedList.length);


  await findSeniorDayDoubles(existedList);
  await checkSeniorDayFullness(newList, existedList);

  existedList = await SeniorDay.find({ absent: false });

  console.log("existedList");
  console.log(existedList.length);

  for (let senior of existedList) {
    let index = newList.findIndex(item => item.fullData == senior.fullData);
    if (index > -1) newList.splice(index, 1);
  }

  const options = { ordered: false };
  let finalList = await SeniorDay.insertMany(newList, options);

  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length < finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 
  return result;
}

async function findSeniorDayDoubles(existedList) {
  let fullDataHouse = [];

  for (let item of existedList) {
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
    let someHouses = existedList.filter(item => item.fullData == senior);
    console.log("someHouses");
    console.log(someHouses);
    let plusAmount = 0;
    for (let senior of someHouses) {
      plusAmount = plusAmount + senior.plusAmount;
    }
    for (let i = 0; i < someHouses.length; i++) {
      if (i == 0) {
        await SeniorDay.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
      } else {
        await SeniorDay.deleteOne({ _id: someHouses[i]._id });
      }
    }
  }
  // return duplicates.length.toString();


}

async function checkSeniorDayFullness(newList, existedList) {
  let amountOfAbsents = 0;

  for (let senior of existedList) {
    let index = newList.findIndex(item => item.fullData == senior.fullData);
    /*     console.log("indexOfAbsents");
        console.log(index); */
    if (index == -1) {
      amountOfAbsents++;
      await SeniorDay.updateOne({ _id: senior._id }, { $set: { absent: true } });
      console.log("deleted:");
      console.log(senior.fullData);
    }
  }
  console.log("Amount of all deleted:");
  console.log(amountOfAbsents);

  // console.log("newList.length");
  // console.log(newList.length);
  // console.log("existedList");
  // console.log(existedList.length);

}


/////////////////////////////////////////

// Create NY list API 
router.post("/new-year/create", checkAuth, async (req, res) => {
  try {
    const houses = req.body.list;
    console.log("0- inside Create list API");
    let result = await findAllNYCelebrators(houses);
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


async function findAllNYCelebrators(houses) {

  /*     let activeHouses = await House.find({isActive: true});
      for (let house of activeHouses) {
        let amount = await Senior.find({nursingHome: house.nursingHome, isDisabled: false, isRestricted: false, dateExit: null}).count();
         console.log('AMOUNT', amount);
         console.log('nursingHome', house.nursingHome);
        await House.updateOne({nursingHome: house.nursingHome}, {$set :{"statistic.newYear.amount": amount}});
      }   */

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside findAllMonthCelebrators newList");

  let namesOfUpdatedNursingHome = [];
  for (let home of houses) {
    namesOfUpdatedNursingHome.push(home.nursingHome);
    await House.updateOne({ nursingHome: home.nursingHome }, { $set: { "statistic.newYear.amount": 0 } });
  }
  console.log(namesOfUpdatedNursingHome);


  let list = await Senior.find(
    {
      isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome }
    }
  );
  console.log(list.length);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);

  /*   await House.updateMany({},
      {$set:{
        "statistic.newYear.time": 0,
        "statistic.newYear.plus0": 0,
        "statistic.newYear.plus1": 0,
        "statistic.newYear.plus2": 0,
        "statistic.newYear.plus3": 0,
        "statistic.newYear.specialMen": 0,
        "statistic.newYear.specialWomen": 0,
        "statistic.newYear.oldMen": 0,
        "statistic.newYear.oldWomen": 0,
        "statistic.newYear.yangMen": 0,
        "statistic.newYear.yangWomen": 0,
        "statistic.newYear.amount": 0,
        "statistic.newYear.specialMenPlus": 0,
        "statistic.newYear.specialWomenPlus": 0,
        "statistic.newYear.oldMenPlus": 0,
        "statistic.newYear.oldWomenPlus": 0,
        "statistic.newYear.yangMenPlus": 0,
        "statistic.newYear.yangWomenPlus": 0,
      }
    
    }); */

  let updatedCelebrators = [];


  for (let celebrator of list) {

    //      let cloneSpecialComment = await specialComment(
    //   2022 - celebrator["yearBirthday"]
    //  );

    let cloneCelebrator = await createCloneCelebratorNY(celebrator);



    if (cloneCelebrator.category == "specialMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.newYear.specialMen": 1, "statistic.newYear.amount": 1, "statistic.newYear.plus0": 1 } });
    }
    if (cloneCelebrator.category == "specialWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.newYear.specialWomen": 1, "statistic.newYear.amount": 1, "statistic.newYear.plus0": 1 } });
    }
    if (cloneCelebrator.category == "oldMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.newYear.oldMen": 1, "statistic.newYear.amount": 1, "statistic.newYear.plus0": 1 } });
    }
    if (cloneCelebrator.category == "oldWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.newYear.oldWomen": 1, "statistic.newYear.amount": 1, "statistic.newYear.plus0": 1 } });
    }
    if (cloneCelebrator.category == "yangMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.newYear.yangMen": 1, "statistic.newYear.amount": 1, "statistic.newYear.plus0": 1 } });
    }
    if (cloneCelebrator.category == "yangWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.newYear.yangWomen": 1, "statistic.newYear.amount": 1, "statistic.newYear.plus0": 1 } });
    }

    updatedCelebrators.push(cloneCelebrator);
  }
  await House.updateMany({ nursingHome: { $in: namesOfUpdatedNursingHome } }, { $inc: { "statistic.newYear.time": 1 } });

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
    if (celebrator.gender == "Female") {
      cloneCategory = "specialWomen";
    }
    if (celebrator.gender == "Male") {
      cloneCategory = "specialMen";
    }

  } else {
    if (celebrator.yearBirthday < 1942 && celebrator.yearBirthday > 0) {
      cloneOldest = true;
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
      cloneCategory = "oldWomen";
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
      cloneCategory = "oldMen";
    }
    if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
      if (celebrator.gender == "Female") {
        cloneCategory = "yangWomen";
      }
      if (celebrator.gender == "Male") {
        cloneCategory = "yangMen";
      }
    }
  }
  let holiday;
  if (celebrator.monthBirthday == 11) { holiday = 'Дни рождения ноября 2025' };
  if (celebrator.monthBirthday == 12) { holiday = 'Дни рождения декабря 2025' };
  if (celebrator.monthBirthday == 1) { holiday = 'Дни рождения января 2026' };

  let cloneCelebrator = {
    seniorId: celebrator._id,
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
    holyday: holiday,
    fullData: celebrator.nursingHome +
      celebrator.lastName +
      celebrator.firstName +
      celebrator.patronymic +
      celebrator.dateBirthday +
      celebrator.monthBirthday +
      celebrator.yearBirthday,
    dateOfSignedConsent: celebrator.dateOfSignedConsent,
  };
  //console.log("special - " + celebrator["specialComment"]);
  //console.log("fullday - " + celebrator.fullDayBirthday);
  //console.log(celebrator);
  return cloneCelebrator;

}

async function createCloneCelebratorNY(celebrator) {

  let cloneFullDayBirthday = `${celebrator.dateBirthday > 9
    ? celebrator.dateBirthday
    : "0" + celebrator.dateBirthday}.${celebrator.monthBirthday > 9
      ? celebrator.monthBirthday
      : "0" + celebrator.monthBirthday}${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;

  let cloneCategory = '';
  let cloneOldest = false;

  if (celebrator["noAddress"]) {
    if (celebrator.gender == "Female") {
      cloneCategory = "specialWomen";
    }
    if (celebrator.gender == "Male") {
      cloneCategory = "specialMen";
    }

  } else {
    if (celebrator.yearBirthday < 1943 && celebrator.yearBirthday > 0) {
      cloneOldest = true;
    }
    if (celebrator.yearBirthday < 1960 && celebrator.gender == "Female") {
      cloneCategory = "oldWomen";
    }
    if (celebrator.yearBirthday < 1960 && celebrator.gender == "Male") {
      cloneCategory = "oldMen";
    }
    if (celebrator.yearBirthday > 1959 || !celebrator.yearBirthday) {
      if (celebrator.gender == "Female") {
        cloneCategory = "yangWomen";
      }
      if (celebrator.gender == "Male") {
        cloneCategory = "yangMen";
      }
    }
  }

  let cloneCelebrator = {
    seniorId: celebrator._id,
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
    holyday: 'Новый год 2026',
    fullData: celebrator.nursingHome +
      celebrator.lastName +
      celebrator.firstName +
      celebrator.patronymic +
      celebrator.dateBirthday +
      celebrator.monthBirthday +
      celebrator.yearBirthday,
    dateOfSignedConsent: celebrator.dateOfSignedConsent,
  };
  //console.log("special - " + celebrator["specialComment"]);
  //console.log("fullday - " + celebrator.fullDayBirthday);
  //console.log(celebrator);
  return cloneCelebrator;

}



/////////////////////////////////////////

// Create February23 and March8 list API 
router.post("/february-23/create", checkAuth, async (req, res) => {
  try {
    const houses = req.body.list;
    console.log("0- inside Create list API");
    let result = await findAllGenderCelebrators("Male", houses);
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

router.post("/march-8/create", checkAuth, async (req, res) => {
  try {
    const houses = req.body.list;
    console.log("0- inside Create list API");
    let result = await findAllGenderCelebrators("Female", houses);
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

async function findAllGenderCelebrators(gender, houses) {

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside gender newList");

  //let updatedNursingHome = await House.find({ isActive: true, nursingHome: { $in: [] } });

  // let namesOfUpdatedNursingHome = ["ШИПУНОВО", "ПЕРВОМАЙСКИЙ", "АВДОТЬИНКА", "НИКИТИНКА", "НОВОСЕЛЬЕ", "НОВОСИБИРСК_ЖУКОВСКОГО", "БОЛЬШОЕ_КАРПОВО", "НОВОСЛОБОДСК", "ШИПУНОВО_БОА", "КЫТМАНОВО"];
  /*   for (let home of updatedNursingHome) {
      namesOfUpdatedNursingHome.push(home.nursingHome);
    } */

  let namesOfUpdatedNursingHome = [];
  for (let home of houses) {
    namesOfUpdatedNursingHome.push(home.nursingHome);
  }
  console.log(namesOfUpdatedNursingHome);


  /*   let activeHouses = await House.find({ isActive: true });
    for (let house of activeHouses) {
      let amount = await Senior.find({ isDisabled: false, dateExit: null, nursingHome: house.nursingHome }).countDocuments();
      await House.updateOne({ nursingHome: house.nursingHome }, { $set: { "statistic.spring.amount": amount } });
    }
   */


  let list = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome }, gender: gender });
  //console.log(list);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);
  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*       let cloneSpecialComment = await specialComment(
            2022 - celebrator["yearBirthday"]
          ); */

    let cloneCelebrator = createCloneCelebratorGender(celebrator);

    if (cloneCelebrator.category == "specialMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.spring.specialMen": 1, "statistic.spring.plus0": 1 } });
    }
    if (cloneCelebrator.category == "specialWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.spring.specialWomen": 1, "statistic.spring.plus0": 1 } });
    }
    if (cloneCelebrator.category == "oldMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.spring.oldMen": 1, "statistic.spring.plus0": 1 } });
    }
    if (cloneCelebrator.category == "oldWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.spring.oldWomen": 1, "statistic.spring.plus0": 1 } });
    }
    if (cloneCelebrator.category == "yangMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.spring.yangMen": 1, "statistic.spring.plus0": 1 } });
    }
    if (cloneCelebrator.category == "yangWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.spring.yangWomen": 1, "statistic.spring.plus0": 1 } });
    }

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
    if (celebrator.gender == "Female") {
      cloneCategory = "specialWomen";
    }
    if (celebrator.gender == "Male") {
      cloneCategory = "specialMen";
    }

  } else {
    if (celebrator.yearBirthday < 1942 && celebrator.yearBirthday > 0) {
      cloneOldest = true;
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
      cloneCategory = "oldWomen";
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
      cloneCategory = "oldMen";
    }
    if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
      if (celebrator.gender == "Female") {
        cloneCategory = "yangWomen";
      }
      if (celebrator.gender == "Male") {
        cloneCategory = "yangMen";
      }
    }
  }

  let cloneCelebrator = {
    seniorId: celebrator._id,
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
    comment2: celebrator.veteran && celebrator.gender == "Male" ? celebrator.veteran : celebrator.comment2,
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
    holyday: celebrator.gender == "Male" ? '23 февраля 2025' : '8 марта 2025',
    fullData: celebrator.nursingHome +
      celebrator.lastName +
      celebrator.firstName +
      celebrator.patronymic +
      celebrator.dateBirthday +
      celebrator.monthBirthday +
      celebrator.yearBirthday,
    dateOfSignedConsent: celebrator.dateOfSignedConsent,

  };
  //console.log("special - " + celebrator["specialComment"]);
  //console.log("fullday - " + celebrator.fullDayBirthday);
  //console.log(celebrator);
  return cloneCelebrator;
}

//////////////////////////////////////////

/**
 * API to delete all
 */
router.delete("/", checkAuth, async (req, res) => {
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
router.get("/", checkAuth, async (req, res) => {
  try {
    //List.find({region: "НОВОСИБИРСКАЯ"}, function (err, lists) {
    //ListBefore.find({ absent: { $ne: true } }, function (err, lists) {
    List.find({ absent: { $ne: true } }, function (err, lists) {
      //ListNext.find({ absent: { $ne: true } }, function (err, lists) {
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
router.get("/new-year", checkAuth, async (req, res) => {
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
router.get("/february-23", checkAuth, async (req, res) => {
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
router.get("/march-8", checkAuth, async (req, res) => {
  try {
    March8.find({ absent: { $ne: true } }, function (err, lists) {
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


/*     let deletedClients = await Client.find({isDisabled: true});
    for (let client of deletedClients) {
      let orders = await Order.find({clientId: client._id});
      if (orders.length > 0) {
        console.log (client._id);
      }
    }

 */

router.get("/name-day/:month", checkAuth, async (req, res) => {
  try {

    if (req.params.month == "NameDay") {
      NameDay.find({ absent: { $ne: true } }, function (err, nameDays) {
        if (err) {
          console.log(err);
          const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
          res.status(500).send(findAllListsMongodbErrorResponse.toObject());
        } else {
          // console.log(nameDays);
          const findAllListsResponse = new BaseResponse("200", "Query successful", nameDays);
          res.json(findAllListsResponse.toObject());
        }
      });
    }
    if (req.params.month == "NameDayBefore") {
      NameDayBefore.find({ absent: { $ne: true } }, function (err, nameDays) {
        if (err) {
          console.log(err);
          const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
          res.status(500).send(findAllListsMongodbErrorResponse.toObject());
        } else {
          // console.log(nameDays);
          const findAllListsResponse = new BaseResponse("200", "Query successful", nameDays);
          res.json(findAllListsResponse.toObject());
        }
      });
    }
    if (req.params.month == "NameDayNext") {
      NameDayNext.find({ absent: { $ne: true } }, function (err, nameDays) {
        if (err) {
          console.log(err);
          const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
          res.status(500).send(findAllListsMongodbErrorResponse.toObject());
        } else {
          // console.log(nameDays);
          const findAllListsResponse = new BaseResponse("200", "Query successful", nameDays);
          res.json(findAllListsResponse.toObject());
        }
      });
    }




  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

//Find all teacher day lists API
router.get("/teacher-day", checkAuth, async (req, res) => {
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

//Find all teacher day lists API
router.get("/senior-day", checkAuth, async (req, res) => {
  try {

    SeniorDay.find({ absent: { $ne: true } }, function (err, seniorDays) {
      if (err) {
        console.log(err);
        const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
        res.status(500).send(findAllListsMongodbErrorResponse.toObject());
      } else {
        console.log(seniorDays);
        const findAllListsResponse = new BaseResponse("200", "Query successful", seniorDays);
        res.json(findAllListsResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

//Find all Easter lists API
router.get("/easter", checkAuth, async (req, res) => {
  try {
    //List.find({region: "НОВОСИБИРСКАЯ"}, function (err, lists) {
    Easter.find({ absent: { $ne: true } }, function (err, lists) {
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


/////correct doubles
router.get("/new-year/correct", checkAuth, async (res) => {
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
router.get("/new-year/check-orders", checkAuth, async (res) => {
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
router.get("/new-year/absents", checkAuth, async (res) => {
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
router.post("/new-year/check-doubles", checkAuth, async (req, res) => {
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
  let fullHouse = await NewYear.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1, plusAmount: 1 });
  let fullDataHouse = [];
  /*   console.log("fullHouse");
    console.log(fullHouse); */
  for (let item of fullHouse) {
    fullDataHouse.push(item.seniorId);
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
  console.log("duplicates1");
  console.log(duplicates);
  if (duplicates.length !== 0) {
    for (let senior of duplicates) {
      let someHouses = fullHouse.filter(item => item.seniorId == senior);
      console.log("someHouses1");
      console.log(someHouses);
      let plusAmount = 0;
      for (let senior of someHouses) {
        plusAmount = plusAmount + senior.plusAmount;
      }
      for (let i = 0; i < someHouses.length; i++) {
        if (i == 0) {
          await NewYear.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
        } else {
          await NewYear.deleteOne({ _id: someHouses[i]._id });
        }
      }
    }
    console.log("All duplicates1");
    console.log(duplicates.length.toString());
  }

  fullHouse = await NewYear.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1, plusAmount: 1 });
  let tempArray = [];
  let duplicatesFullData = [];
  for (let person of fullHouse) {
    tempArray.push(person.fullData);
  }
  //console.log("tempArray", tempArray);
  tempArray.sort();
  //console.log(tempArray);
  for (let i = 0; i < tempArray.length - 1; i++) {
    if (tempArray[i + 1] == tempArray[i]) {
      duplicatesFullData.push(tempArray[i]);
    }
  }
  //console.log(duplicates);
  if (duplicatesFullData.length > 0) {
    for (let senior of duplicatesFullData) {
      let someHouses = fullHouse.filter(item => item.fullData == senior);
      console.log("someHouses2");
      console.log(someHouses);
      let plusAmount = 0;
      for (let s of someHouses) {
        plusAmount = plusAmount + s.plusAmount;
      }
      for (let i = 0; i < someHouses.length; i++) {
        if (i == 0) {
          await NewYear.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
        } else {
          await NewYear.deleteOne({ _id: someHouses[i]._id });
          await Senior.deleteOne({ _id: someHouses[i].seniorId });
        }
      }
    }


    //console.log("There are duplicates! They were deleted from the list.");
    
  } else { //console.log("There are not duplicates!"); 
    }

  console.log("All duplicates2");
      console.log(duplicatesFullData.length);
    console.log(duplicatesFullData);
  return (duplicates.length + duplicatesFullData.length).toString();


}



// check NY fullness
router.post("/new-year/check-fullness", checkAuth, async (req, res) => {
  try {

    console.log("0- check NY fullness " + req.body.nursingHome);

    let result = await checkAllNYFullness(req.body.nursingHome);

    //   let houses = await House.find({dateLastUpdate: { $gt: new Date("2024-9-1") }} )

    /*     let houses = [
          "ТВЕРЬ_КОНЕВА",
          "МАСЛЯТКА",
          "СУЗУН",
          "СЯВА",
          "РАДЮКИНО",
          "НОВОСЛОБОДСК",
          "МЕДЫНЬ",
          "ИЛЬИНСКОЕ",
                
                 "СТАРОЕ_ШАЙГОВО", 
                 "БИЙСК",
                 "КАНДАЛАКША",
                 "КАРДЫМОВО",
                 "СЫЗРАНЬ_ПОЖАРСКОГО",
                 "КУГЕЙСКИЙ",
                 "ПЕРВОМАЙСКИЙ",
                 "КУГЕСИ"  
    
        ]; */
    /*     for (let house of houses) {
          await checkAllNYFullness(house.nursingHome);
          //await checkAllNYFullness(house);
        } */


    //let result = await checkAllNYFullness("СЛАВГОРОД");


    //await makeDoubtAvailable();

    // let result = "ok";
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


async function makeDoubtAvailable() {
  let doubt = await Order.find({ isDisabled: false, isOverdue: false, isReturned: false, isAccepted: false, holiday: "Новый год 2026" });
  for (let order of doubt) {
    for (let house of order.lineItems) {
      for (let celebrator of house.celebrators) {
        let result = await NewYear.updateOne({ _id: celebrator.celebrator_id, plusAmount: 1, absent: false }, { $set: { secondTime: true, finished: false } });
        console.log(result);
      }
    }
  }
}


async function checkAllNYFullness(house) {
  let check = await NewYear.findOne({ nursingHome: house }, { fullData: 1, seniorId: 1, plusAmount: 1 });
  if (!check) return false;

  await findAllNYDoubles(house);

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house });
  console.log("seniors " + seniors.length);
  let fullHouse = await NewYear.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1 }); //
  console.log("fullHouse " + fullHouse.length);
  let amount = 0;
  for (let senior of seniors) {

    let seniorIndex = fullHouse.findIndex(item => item.seniorId == senior._id);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amount++;
      let celebrator = await createCloneCelebratorNY(senior);
      let newCelebrator = await NewYear.create(celebrator);
      console.log("added");
      console.log(newCelebrator.fullData);
    }
  }
  console.log("All added");
  console.log(amount);

  fullHouse = await NewYear.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1 });
  let count = 0;
  for (let celebrator of fullHouse) {
    let celebratorIndex = seniors.findIndex(item => item._id == celebrator.seniorId);
    if (celebratorIndex == -1) {

      await NewYear.updateOne({ seniorId: celebrator.seniorId }, { $set: { absent: true } });
      count++;
      console.log("deleted");
      console.log(celebrator.fullData);

    }
  }
  console.log("All deleted");
  console.log(count);


  /*   let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
    let seniorIndex = fullHouse.findIndex(item => item.fullData == fullData);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amount++;
      let celebrator = await createCloneCelebrator(senior);
  
      console.log(celebrator);
      let newCelebrator = await NewYear.create(celebrator);
      console.log(newCelebrator.fullData);
    } */
  /*     let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
      let fullData2 = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic);
      console.log("fullData2 " + fullData2);
      let seniorIndex = fullHouse.findIndex(item => (item.nursingHome + item.lastName + item.firstName + item.patronymic) == fullData2);
      console.log("seniorIndex " + seniorIndex);
      if (seniorIndex > -1) {
        await NewYear.updateOne({ _id: fullHouse[seniorIndex]._id }, { $set: { fullData: fullData } });
        amount++;
      } */


  //*****/

  /*   let seniorsAbsent = await Senior.find({ isDisabled: false, dateExit: { $ne: null }, isRestricted: false, nursingHome: house });
    console.log("seniorsAbsent");
    console.log(seniorsAbsent);
  
    let fullHouseAbsent = await NewYear.find({ nursingHome: house, absent: true }, { seniorId: 1 }); //
    console.log("fullHouseAbsent");
    console.log(fullHouseAbsent);
  
    for (let senior of seniorsAbsent) {
      // let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
      let seniorIndex = fullHouseAbsent.findIndex(item => item.seniorId == senior._id);
      console.log("seniorIndex " + seniorIndex);
  
      if (seniorIndex == -1) {
  
        let result = await NewYear.updateOne({ seniorId: senior._id }, { $set: { absent: true } });
        console.log(result.nModified);
  
      } else {
        //console.log("seniorIndex " + seniorIndex);
      }
  
    } */

  await findAllNYDoubles(house);
  await restoreNYStatistic(house);

  return true;//amount.toString();

}

async function restoreNYStatistic(activeHouse) {
  /*   console.log("restoreStatistic");
    console.log(activeHouse); */

  let house = await House.findOne({ nursingHome: activeHouse });
      //  console.log("house");
      //  console.log(house); 

/*   let houses = await House.find({ isActive: true });

  for (let house of houses) {
 */

    let plus0 = await NewYear.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0 } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    console.log("plus0");
    console.log(plus0);

    await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus0": plus0[0]?.count ? plus0[0].count : 0 } });

    let plus1 = await NewYear.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 1 } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

   console.log("plus1");
    console.log(plus1);
    await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus1": plus1[0]?.count ? plus1[0].count : 0 } });

    let plus2 = await NewYear.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 2 } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    /* 
      console.log("plus2");
      console.log(plus2); */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus2": plus2[0]?.count ? plus2[0].count : 0 } });

    /* let plus3 = await NewYear.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 3 } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]); */

    /*   console.log("plus3");
      console.log(plus3); */

    /*   await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus3": plus3[0]?.count ? plus3[0].count : 0 } });
    
      let plus4 = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 4 } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]); */

    /*   console.log("plus3");
      console.log(plus3); */

    /*   await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus4": plus4[0]?.count ? plus4[0].count : 0 } });
     */
    if (house.noAddress) {
      let specialMenPlus = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialMen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.specialMenPlus": specialMenPlus[0]?.count ? specialMenPlus[0].count : 0 } });

      let specialWomenPlus = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialWomen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.specialWomenPlus": specialWomenPlus[0]?.count ? specialWomenPlus[0].count : 0 } });

    } else {
      let oldMenPlus = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldMen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*   console.log("oldMenPlus");
        console.log(oldMenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.oldMenPlus": oldMenPlus[0]?.count ? oldMenPlus[0].count : 0 } });

      let oldWomenPlus = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldWomen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*     console.log("oldWomenPlus");
          console.log(oldWomenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.oldWomenPlus": oldWomenPlus[0]?.count ? oldWomenPlus[0].count : 0 } });

      let yangMenPlus = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangMen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*     console.log("yangMenPlus");
          console.log(yangMenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.yangMenPlus": yangMenPlus[0]?.count ? yangMenPlus[0].count : 0 } });

      let yangWomenPlus = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangWomen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*     console.log("yangWomenPlus");
          console.log(yangWomenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.yangWomenPlus": yangWomenPlus[0]?.count ? yangWomenPlus[0].count : 0 } });

    }

    /*   let amount = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]); */

    let amount = await Senior.aggregate([
      { $match: { nursingHome: house.nursingHome, dateExit: null, isRestricted: false, isDisabled: false } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.amount": amount[0].count } });

    console.log("amount");
    console.log(amount);

    if (house.noAddress) {
      let specialMen = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialMen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.specialMen": specialMen[0]?.count ? specialMen[0].count : 0 } });

      let specialWomen = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialWomen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.specialWomen": specialWomen[0]?.count ? specialWomen[0].count : 0 } });

    } else {
      let oldMen = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldMen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*   console.log("oldMen");
        console.log(oldMen);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.oldMen": oldMen[0]?.count ? oldMen[0].count : 0 } });

      let oldWomen = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldWomen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*     console.log("oldWomen");
          console.log(oldWomen);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.oldWomen": oldWomen[0]?.count ? oldWomen[0].count : 0 } });

      let yangMen = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangMen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*     console.log("yangMen");
          console.log(yangMen);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.yangMen": yangMen[0]?.count ? yangMen[0].count : 0 } });

      let yangWomen = await NewYear.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangWomen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*     console.log("yangWomen");
          console.log(yangWomen); */

      await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.yangWomen": yangWomen[0]?.count ? yangWomen[0].count : 0 } });


    }

//  }

  /*   } */
}

async function checkAllNDFullness(house) {

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house, monthNameDay: 9 });
  console.log("seniors " + seniors.length);
  let fullHouse = await NameDay.find({ nursingHome: house, absent: false }, { fullData: 1 }); //
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
      let newCelebrator = await NameDay.create(celebrator);
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
router.post("/birthday/check-doubles", checkAuth, async (req, res) => {
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
  // let fullHouse = await ListNext.find({ nursingHome: house, absent: false }, { fullData: 1, plusAmount: 1 });
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
        // await ListNext.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
      } else {
        await List.deleteOne({ _id: someHouses[i]._id });
        // await ListNext.deleteOne({ _id: someHouses[i]._id });
      }
    }
  }
  return duplicates.length.toString();


}

// check HB fullness
router.post("/birthday/check-fullness", checkAuth, async (req, res) => {
  try {

    console.log("0- check HB fullness " + req.body.nursingHome);
    let result = await checkAllHBFullness(req.body.nursingHome);
    //let result = await checkAllHBFullness("УЛАН-УДЭ_ЛЕСНАЯ"); //ИСПРАВИТЬ
    console.log("4-check HB fullness " + result);
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
  const nursingHome = await House.findOne({ isActive: true, nursingHome: house, });//dateLastUpdate: { $gt: new Date("2025-06-30") } 
  if (!nursingHome) return '-1';

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, monthBirthday: 12, isRestricted: false, nursingHome: house });//, { dateLastUpdate: { $lt: new Date("2025-6-1") } }

  console.log("seniors HB" + seniors.length);
  //let fullHouse = await ListBefore.find({ nursingHome: house, absent: false }, { fullData: 1 });
  let fullHouse = await List.find({ nursingHome: house, absent: false }, { fullData: 1 }); //
  //let fullHouse = await ListNext.find({ nursingHome: house, absent: false }, { fullData: 1 }); //
  console.log("fullHouse HB" + fullHouse.length);
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
     // let newCelebrator = await ListNext.create(celebrator);
      //let newCelebrator = await ListBefore.create(celebrator);
      console.log("added:");
      console.log(newCelebrator.fullData);
    }
  }


  fullHouse = await List.find({ nursingHome: house, absent: false }, { _id: 1, fullData: 1 });
  // fullHouse = await ListNext.find({ nursingHome: house, absent: false }, { _id: 1, fullData: 1 });
  // fullHouse = await ListBefore.find({ nursingHome: house, absent: false }, { _id: 1, fullData: 1 });
  for (let item of fullHouse) {
    //let fullData = (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday);
    let seniorIndex = seniors.findIndex(senior => (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday) == item.fullData);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {

      /* amount++;
      let celebrator = await createCloneCelebrator(senior);

      console.log(celebrator);
     // let newCelebrator = await List.create(celebrator);
       let newCelebrator = await ListNext.create(celebrator);
      // let newCelebrator = await ListBefore.create(celebrator);
      console.log(newCelebrator.fullData); */


     await List.updateOne({ _id: item._id }, { $set: { absent: true } });
       //  await ListNext.updateOne({ _id: item._id }, { $set: { absent: true } });
      //await ListBefore.updateOne({ _id: item._id }, { $set: { absent: true } });
      console.log("deleted:");
      console.log(item.fullData);
    }
  }

  return amount.toString();

}

const SpecialDay = require("../models/senior");
//const SpecialDay = require("../models/list");
//const SpecialDay = require("../models/new-year");
//const { convertCompilerOptionsFromJson } = require("typescript");
//Find special lists API
router.get("/holiday/special-list", checkAuth, async (req, res) => {
  try {
    let notActiveHouses = await House.find({ isActive: false });
    let notActiveHousesNames = [];
    for (let house of notActiveHouses) {
      notActiveHousesNames.push(house.nursingHome);
    }
    console.log("notActiveHousesNames");
    console.log(notActiveHousesNames);
    // let ordersM = await Order.find({ contact: { $in: ["@tterros", "@tterros_2", "@kseniyaefi_3", "@kseniyaefi_2", "@kseniyaefi"] }, isDisabled: false, holiday: ["8 марта 2025", "23 февраля 2025"] });
    let ordersM = await Order.find({ contact: { $in: ["l.filchukova@starikam.org"] }, isDisabled: false, holiday: ["Дни рождения января 2026"] });
    let lineItemsM = [];
    for (let order of ordersM) {
      for (let item of order.lineItems) {
        for (let i of item.celebrators) {
          lineItemsM.push(i);
        }

      }
    }
    /*      let lineItemsM_3 = [];
         for (let line of lineItemsM) {
           if (lineItemsM_3.length == 0 || lineItemsM_3.filter(item => item.seniorId == line.seniorId) != -1) {
     
             let someseniors = lineItemsM.filter(item => item.seniorId == line.seniorId);
             if (someseniors.length == 3) {
               lineItemsM_3.push(line);
             }
           }
     
           console.log(lineItemsM_3.length);
         }  */

    let nameDays = lineItemsM;

    //let housesForMagnit = Array.from(new Set(housesM));
    // let housesForMagnit = ["ЖУКОВКА", "ТУТАЕВ", "МАГАДАН_АРМАНСКАЯ", "УГЛИЧ", "БЕРДСК", "СОСНОВКА"]; //"ОКТЯБРЬСКИЙ", "УВАРОВО", "НОВОСИБИРСК_ЖУКОВСКОГО", "КАНДАЛАКША"
    // let nameDays = await SpecialDay.find({ nursingHome: { $in: housesForMagnit }, dateExit: null, isRestricted: false, monthBirthday: 10 });

    // let nameDays = await SpecialDay.find({ nursingHome: "ВОЛГОГРАД_КРИВОРОЖСКАЯ", yearBirthday: 0, dateExit: null, isDisabled: false });
    //  let nameDays = await SpecialDay.find({ absent: { $ne: true }, $or: [{ dateNameDay: 25 }, { dateNameDay: 27 }] });
    //  let nameDays = await SpecialDay.find({isRestricted: false, isReleased: false, dateEnter: {$gt:  new Date("2023-1-1") }, dateExit: null});
    //let nameDays = await SpecialDay.find({ isRestricted: false, isReleased: false, dateExit: null, nursingHome:{$in: ["НОГИНСК"]}});
    //let nameDays = await SpecialDay.find({ absent: false, nursingHome: { $in: ["НОГИНСК"] } });
    //let nameDays = await SpecialDay.find({ isRestricted: false, isReleased: false, noAddress: false, dateExit: null, monthBirthday: 2, dateBirthday: { $lt: 6, $gt: 0 }, nursingHome: { $nin: notActiveHousesNames } });//yearBirthday: { $lt: 2023 }
    // let nameDays = await SpecialDay.find({  isReleased: false, absent: false, plusAmount:3, monthBirthday:6, dateBirthday: {$lt:31, $gt: 28}, yearBirthday: {$lt: 2023}, nursingHome: {$nin: notActiveHousesNames } });

    /*   let updatedNursingHome = await House.find({ isActive: true , "statistic.spring.amount" :{$gt: 300}});
      let namesOfUpdatedNursingHome = [];
      for (let home of updatedNursingHome) {
        namesOfUpdatedNursingHome.push(home.nursingHome);
      }
      let nameDays = await SpecialDay.find({nursingHome: {$in:[ "ВЕРХНЕУРАЛЬСК", "ЧЕРНЫШЕВКА"] }, isRestricted: false, isReleased: false, dateExit: null, noAddress: false});
      //let nameDays = await SpecialDay.find({ nursingHome: { $in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null, gender: "Male", comment2: { $in: ["ветеран ВОВ, труженик тыла", "ВВОВ,труженик тыла", "Ветеран ВОВ", "Афганистан", "участник боевых действий", "Ветеран ВОВ,  Ветеран  труда", "Ветеран ВОВ,  Ветеран  труда", "военный водитель", "малолетний узник, ветеран ВОВ"] } });
      //let nameDays = await SpecialDay.find({nursingHome: {$in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null, monthBirthday : 4, dateBirthday: 1, yearBirthday: {$lt: 1953}});
      // let nameDays = await SpecialDay.find({nursingHome: {$in: namesOfUpdatedNursingHome }, isRestricted: false, isReleased: false, dateExit: null,  region: "ТЮМЕНСКАЯ", gender: "Female"});
      */
    let lineItems = [];
    let nursingHomes = await House.find({});

    nameDays.sort((prev, next) => prev.nursingHome.localeCompare(next.nursingHome));
    let i = 0;
    for (let person of nameDays) {
      console.log(i++);
      // console.log(person);
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
    console.log("nameDays");
    console.log(nameDays);

    const findAllListsResponse = new BaseResponse("200", "Query successful", lineItems);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

// check holiday fullness
/* router.post("/holiday/check-fullness/:holiday", checkAuth, async (req, res) => {
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

} */

/////////////////////////////////////////

// Create May9 list API 
router.post("/9may/create", checkAuth, async (req, res) => {
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
  let busyNursingHome = await May9.find({}, { _id: 0, nursingHome: 1 });
  let busyNursingHome2 = [];
  for (let home of busyNursingHome) {
    busyNursingHome2.push(home.nursingHome);
  }

  let notToAdd = Array.from(new Set(busyNursingHome2));
  //let updatedNursingHome = await House.find({isActive: true, isReleased: false, nursingHome: {$nin:notToAdd }, dateLastUpdate: {$lt: new Date("2023-03-31"), $gt: new Date("2023-03-28")}});
  let updatedNursingHome = await House.find({ isActive: true, isReleased: false, nursingHome: { $nin: notToAdd }, dateLastUpdate: { $lt: new Date("2022-12-01"), $gt: new Date("2022-08-31") } });
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
  let list = await Senior.find({
    child: { $ne: "" }, yearBirthday: { $gt: 0, $lt: 1946 }, comment2: { $ne: "только ДР и НГ" }, isDisabled: false, dateExit: null, isRestricted: false, nursingHome: {
      $in: [
        'АРХАНГЕЛЬСК_ДАЧНАЯ',
        'БОР', 'БУРЕГИ',
        'ВЕРХНЕУРАЛЬСК', 'ДУБНА',
        'КАМЕНОЛОМНИ', 'ЛЕУЗА',
        'МЕТЕЛИ', 'МИСЦЕВО',
        'МОЛОДОЙ_ТУД', 'НОВЛЯНКА',
        'НОГУШИ',
        'ОДОЕВ',
        'ПАВЛОВСК', 'ПЕРЕЛОЖНИКОВО',
        'СЕРГИЕВСКИЙ', 'СОЛЬЦЫ',
        'СЯВА', 'УФА'
      ]
    }
  }); //namesOfUpdatedNursingHome
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
    holyday: '9 мая 2025',
    fullData: celebrator.nursingHome +
      celebrator.lastName +
      celebrator.firstName +
      celebrator.patronymic +
      celebrator.dateBirthday +
      celebrator.monthBirthday +
      celebrator.yearBirthday,
    dateOfSignedConsent: celebrator.dateOfSignedConsent,
  };

  //console.log("special - " + celebrator["specialComment"]);
  //console.log("fullday - " + celebrator.fullDayBirthday);
  //console.log(celebrator);
  return cloneCelebrator;

}

//Find all NY lists API
router.get("/9may", checkAuth, async (req, res) => {
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

// FAMILIES LIST
router.post("/create/family-day", checkAuth, async (req, res) => {
  let arrayOfFamilies = req.body.listOfFamilies;
  try {


    let result = await createAllFamilies(arrayOfFamilies);

    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


async function createAllFamilies(arrayOfFamilies) {
  //console.log(arrayOfFamilies);
  let added = [];
  let notFound = [];
  for (let family of arrayOfFamilies) {
    let result = await checkCouple(family);
    if (result) {
      added.push(family)
    } else {
      notFound.push(family)
    }
  }
  return {
    addedFamilies: added,
    notFoundFamilies: notFound
  };
}

/* async function checkCouple(family) {
  //console.log(family);
  let husband = await Senior.findOne({ lastName: family.husbandLastName, firstName: family.husbandFirstName, patronymic: family.husbandPatronymic, nursingHome: family.nursingHome });
  //console.log(husband.region);
  if (!husband) {
    console.log("husband");
    return false;
  }
  let wife = await Senior.findOne({ lastName: family.wifeLastName, firstName: family.wifeFirstName, patronymic: family.wifePatronymic, nursingHome: family.nursingHome });
  if (!wife) {
    console.log("wife");
    return false;
  }
  console.log(husband.region);
  let cloneFamily = {
    region: husband.region,
    nursingHome: husband.nursingHome,
    husbandLastName: husband.lastName,
    husbandFirstName: husband.firstName,
    husbandPatronymic: husband.patronymic ? husband.patronymic : "(отчество не указано)",
    husbandYearBirthday: husband.yearBirthday ? husband.yearBirthday : "г.р. не указан",
    wifeLastName: wife.lastName,
    wifeFirstName: wife.firstName,
    wifePatronymic: wife.patronymic ? wife.patronymic : "(отчество не указано)",
    wifeYearBirthday: wife.yearBirthday ? wife.yearBirthday : "г.р. не указан",
    comment1: "",
    plusAmount: 0,
    noAddress: husband.noAddress,
    isReleased: husband.isReleased,
    fullData: husband.region + husband.nursingHome + husband.lastName + husband.firstName + wife.lastName + wife.firstName,
    holiday: "День семьи 2023",
    absent: false
  }
  await FamilyDay.create(cloneFamily);
  return true;

} */

async function checkCouple(family) {
  //console.log(family);

  let house = await House.findOne({ nursingHome: family.nursingHome });
  let cloneFamily = {
    region: house.region,
    nursingHome: house.nursingHome,
    husbandLastName: family.husbandLastName,
    husbandFirstName: family.husbandFirstName,
    husbandPatronymic: family.husbandPatronymic ? family.husbandPatronymic : "(отчество не указано)",
    husbandYearBirthday: family.husbandYearBirthday ? family.husbandYearBirthday : "г.р. не указан",
    wifeLastName: family.wifeLastName,
    wifeFirstName: family.wifeFirstName,
    wifePatronymic: family.wifePatronymic ? family.wifePatronymic : "(отчество не указано)",
    wifeYearBirthday: family.wifeYearBirthday ? family.wifeYearBirthday : "г.р. не указан",
    comment1: "",
    plusAmount: 0,
    noAddress: house.noAddress,
    isReleased: house.isReleased,
    fullData: house.region + house.nursingHome + family.husbandLastName + family.husbandFirstName + family.wifeLastName + family.wifeFirstName,
    holiday: "День семьи 2024",
    absent: false
  }
  await FamilyDay.create(cloneFamily);
  return true;

}


//Find all family day lists API
router.get("/family-day", checkAuth, async (req, res) => {
  try {

    let list = await Order.find({ isDisabled: false, holiday: "День семьи 2024" });
    let families = [];
    for (let order of list) {
      for (let item of order.lineItems) {
        for (let family of item.celebrators) {
          family.fullData = family.nursingHome + family.husbandLastName + family.wifeLastName;
          families.push(family);
        }
      }
    }

    let tempArray = [];
    let duplicates = [];
    for (let family of families) {
      tempArray.push(family.fullData);
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
        /*       let flag = true;
              while(flag) {
        
              } */
        let index = families.findIndex(item => item.fullData == duplicate);
        if (index > -1) {
          families.splice(index, 1);
        }
      }
    } else { console.log("There are not duplicates!"); }
    const findAllListsResponse = new BaseResponse("200", "Query successful", families);
    res.json(findAllListsResponse.toObject());


    //console.log(array);


    /*     FamilyDay.find({ absent: { $ne: true } }, function (err, lists) {
          if (err) {
            console.log(err);
            const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
            res.status(500).send(findAllListsMongodbErrorResponse.toObject());
          } else {
            console.log(lists);
            const findAllListsResponse = new BaseResponse("200", "Query successful", lists);
            res.json(findAllListsResponse.toObject());
          }
        }); */
  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

//Find all family day lists API
router.get("/family-day/less", checkAuth, async (req, res) => {
  try {

    FamilyDay.find({ absent: { $ne: true }, plusAmount: { $lt: 5 } }, function (err, lists) {
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

//howManyVolunteers ОТЧЕТ
//const Order = require("../models/order");
router.get("/amountOfVolunteers", checkAuth, async (req, res) => {
  try {

    console.log("start");
    let regionsAndHouses = await countRegionsAndHouses();
    //let birthdayAmount = await countHB();
    //let nameDayAmount = await countND();
    //let newYearAmount = await countNY();
    //let seniorDayAmount = await countSD(); 
    //let february23Amount = await countF23();
    let march8Amount = await countM8();
    //let easterAmount = await countEaster();
    //let may9Amount = await countMay9();

    let amount = await countVolonteers();
    //await report();
    await reportListOfHouses();
    //await reportSources();
    await overdue();
    // await amountNY();
    // await spareRegions();

    let result = {
      housesAmount: regionsAndHouses.housesAmount - 3, //ШИПУНОВО_БОА, ПОБЕДИМ_БОА, ПЕРВОМАЙСКИЙ_СОТРУДНИКИ
      regionsAmount: regionsAndHouses.regionsAmount,
      // plusesHBAmount: birthdayAmount.plusesAmount,
      //celebratorsHBAmount: birthdayAmount.celebratorsAmount,
      //plusesF23Amount: february23Amount.plusesAmount,
      //celebratorsF23Amount: february23Amount.celebratorsAmount,

      // plusesNDAmount: nameDayAmount.plusesAmount,
      // celebratorsNDAmount: nameDayAmount.celebratorsAmount,
      // plusesNYAmount: newYearAmount.plusesAmount,
      // celebratorsNYAmount: newYearAmount.celebratorsAmount,
      // plusesSDAmount: seniorDayAmount.plusesAmount,
      // celebratorsSDAmount: seniorDayAmount.celebratorsAmount, 
      plusesM8Amount: march8Amount.plusesAmount,
      //celebratorsM8Amount: march8Amount.celebratorsAmount,
      // plusesEasterAmount: easterAmount.plusesAmount,
      //celebratorsEasterAmount: easterAmount.celebratorsAmount,
      // plusesMay9Amount: may9Amount.plusesAmount,
      // celebratorsMay9Amount: may9Amount.celebratorsAmount,

      volunteersAmount: amount.volunteersAmount,
      schoolsAmount: amount.schoolsAmount,
      institutesAmount: amount.institutesAmount,

    }
    console.log("result");
    console.log(result);


    const findAllListsResponse = new BaseResponse("200", "Query successful", result);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

async function amountNY() {
  //const houses = await House.find({ isActive: true, nursingHome: { $nin: ["САРАТОВ_КЛОЧКОВА", "ДИМИТРОВГРАД"] }, noAddress: false });
  /*   const houses = await House.find({ isActive: true, nursingHome: { $in: [
      'ПЛЕСЕЦК',                'УВАРОВО',
      'ДУБНА_ТУЛЬСКАЯ',         'ВЕРХНЕУРАЛЬСК',
      'НОВОСИБИРСК_ЖУКОВСКОГО', 'ВЫШНИЙ_ВОЛОЧЕК',
      'ЧИТА_ТРУДА',             'ОКТЯБРЬСКИЙ',
      'МАРКОВА',                'АЛАКУРТТИ',
      'ВЯЗЬМА',                 'ПЕРВОМАЙСКИЙ',
      'ТОЛЬЯТТИ',               'РОСТОВ-НА-ДОНУ',
      'КАНДАЛАКША',             'АВДОТЬИНКА',
      'БИЙСК',                  'ТВЕРЬ_КОНЕВА',
      'БОГРАД'
    ] }, noAddress: false }); */
  /*   const houses = await House.find({ isActive: true, nursingHome: { $in: [
      'АЛНАШИ',                'ВОЛГОГРАД_ВОСТОЧНАЯ',
      'ДМИТРИЕВКА',  
    ] }, noAddress: false }); */

  /*  const houses = await House.find({ isActive: true, nursingHome: { $nin: ["САРАТОВ_КЛОЧКОВА", "ДИМИТРОВГРАД", 'ПЕРВОМАЙСКИЙ_СОТРУДНИКИ', 'ПОРЕЧЬЕ-РЫБНОЕ',
  
   ] }, noAddress: false, }); */



  //const houses = await House.find({ isActive: true, nursingHome: { $nin: ["САРАТОВ_КЛОЧКОВА", "ДИМИТРОВГРАД"] }, noAddress: false, dateLastUpdate: { $lt: new Date('2024-09-01')} });

  /*   const houses = await House.find({ nursingHome: { $in: ['АВДОТЬИНКА',
   
    ] }}); */

  //const houses = await House.find({isDisabled: false, isActive: true, noAddress: false, "statistic.newYear.forNavigators" : undefined });

  /*const houses =await House.find( { nursingHome: { $nin:  [
   
 
   'АВДОТЬИНКА',
     
     
     ]}, 
     isDisabled: false, isActive: true, noAddress: false, dateLastUpdate: { $gt: new Date('2024-09-01')},
      "statistic.newYear.plus0": 0, 
     "statistic.newYear.plus1": { $ne: 0 }, 
     "statistic.newYear.plus2": 0, 
     "statistic.newYear.forInstitute":  { $ne: 0 },
     "statistic.newYear.amount": { $lt: 50 }  
   }); */

  // const houses = await House.find({isDisabled: false, isActive: false, noAddress: false});
  /*   const houses = await House.find({ 
      isDisabled: false, isActive: true, noAddress: false, 
      "statistic.newYear.plus0": 0, 
      "statistic.newYear.plus1": { $ne: 0 }, 
      "statistic.newYear.forInstitute":  { $ne: 0 }, 
      "statistic.newYear.amount": { $gt: 200 }
    }); */

  let amountOfSeniors = 0;
  const seniors = await NewYear.find({ absent: false, noAddress: false, onlyForInstitute: true, plusAmount: 1, forInstitute: 0 });
  //  console.log(seniors.length);
  let setHouses = new Set();
  for (let senior of seniors) {
    setHouses.add(senior.nursingHome);
  }
  let houses = Array.from(setHouses);

  for (let house of houses) {




    // await NewYear.updateMany({ absent: false, nursingHome: house.nursingHome},{$inc: {plusAmountNavigators: 1}});// {plusAmountNavigators: 3});
    //const amount = await NewYear.find({ absent: false, nursingHome: house.nursingHome }).countDocuments();
    //const amount = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, noAddress: false, nursingHome: house.nursingHome }).countDocuments();
    const amount = await NewYear.find({ absent: false, noAddress: false, onlyForInstitute: true, plusAmount: 1, forInstitute: 0, nursingHome: house }).countDocuments();
    /*     console.log("amount");
        console.log(amount); */
    amountOfSeniors += amount;
    /*  if (amount > 49) { */

    // console.log("house");
    /*        await House.updateOne({
              nursingHome: house.nursingHome
            }, {
              $set: {
                "statistic.newYear.forNavigators" : amount + house.statistic.newYear.forNavigators
              }
        
            });   */
    //  console.log(house.nursingHome + "+" + house.address + "+" + amount);

    console.log(house + "+" + amount);
  }



  console.log("amountOfSeniors");
  console.log(amountOfSeniors);
}
async function spareRegions() {

  let regions = [
    'ПРИМОРСКИЙ',
    'ЗАБАЙКАЛЬСКИЙ',
  ];

  let spareRegions = {
    'ПРИМОРСКИЙ': ['АМУРСКАЯ', 'САХАЛИНСКАЯ', 'ЗАБАЙКАЛЬСКИЙ', 'ЕВРЕЙСКАЯ', 'ХАБАРОВСКИЙ',],
    'ЗАБАЙКАЛЬСКИЙ': ['ПРИМОРСКИЙ', 'ИРКУТСКАЯ', 'АМУРСКАЯ', 'БУРЯТИЯ', 'ЯКУТИЯ',],


  };

  for (let region of regions) {
    // console.log("проверяем " + region);
    await Region.updateOne({ name: region }, { $push: { spareRegions: spareRegions[region] } });


    /*     for (let spareRegion of spareRegions[region]) {
          let found = await Region.find({name: spareRegion});
          if (found.length == 0) {
              console.log("не найден " + spareRegion);
          }
        } */
  }


}


async function report() {

  const regions = await Region.find({});


  for (let region of regions) {
    const amountOfHouses = await House.find({ isActive: true, region: region.name }).countDocuments();
    console.log(region.name + " + " + amountOfHouses);

    const houses = await House.find({ isActive: true, region: region.name });
    let amountOfSeniors = 0;
    for (let house of houses) {
      const amount = await Senior.find({ isRestricted: false, nursingHome: house.nursingHome, dateExit: null, isDisabled: false }).countDocuments();
      amountOfSeniors += amount;
    }
    // console.log(region.name + " + " + amountOfSeniors);

  }
  // const amountOfSeniors = await Senior.find({ region: region.name, })
}

async function reportListOfHouses() {
  console.log("reportListOfHouses ");
  /*   const regions = [
      "АМУРСКАЯ",
      "АРХАНГЕЛЬСКАЯ",
      "БАШКОРТОСТАН",
      "БЕЛГОРОДСКАЯ",
      "БРЯНСКАЯ",
      "ВЛАДИМИРСКАЯ",
      "ВОЛГОГРАДСКАЯ",
      "ВОЛОГОДСКАЯ",
      "ВОРОНЕЖСКАЯ",
      "ИРКУТСКАЯ",
      "КРАСНОДАРСКИЙ",
      "КУРСКАЯ",
      "НОВОСИБИРСКАЯ",
      "ПЕНЗЕНСКАЯ",
      "ПЕРМСКИЙ",
      "РОСТОВСКАЯ",
      "САМАРСКАЯ",
      "САХАЛИНСКАЯ",
      "СВЕРДЛОВСКАЯ",
      "СМОЛЕНСКАЯ",
      "СТАВРОПОЛЬСКИЙ",
      "ТАМБОВСКАЯ",
      "ТАТАРСТАН",
      "ТВЕРСКАЯ",
      "ТУЛЬСКАЯ",
      "ТЮМЕНСКАЯ",
  
    ] */

  const regions = await Region.find({});
  let march8 = 0;
  let feb23 = 0;



  for (let region of regions) {
    /*     const listOfHouses = await House.find({
          isActive: true, region: region.name, noAddress: false, isReleased: false, nursingHome: {
            $nin: [
              'АРХАНГЕЛЬСК_ДАЧНАЯ',
              'ПАПУЛИНО',
              'КАШИРСКОЕ',
              'ВОРОНЕЖ_ДНЕПРОВСКИЙ',
              'ВЕРБИЛКИ',
              'ХАТУНЬ',
              'ЛИПИТИНО',
              'ДУБНА',
              'МАРЕВО',
              'СТЕПУРИНО',
              'ЖИТИЩИ',
              'ЕКАТЕРИНБУРГ',
              'АЛЕКСАНДРОВКА',
              'ЕЛИЗАВЕТОВКА',
              'КАМЕНОЛОМНИ',
              'МЕЧЕТИНСКАЯ',
              'ТУТАЕВ',
              'ЧИКОЛА',
              'БИЙСК',
              'МАРКОВА',
              'РАДЮКИНО',
              'КОСТРОМА_МАЛЫШКОВСКАЯ',
              'НОГИНСК',
              'НОВОСИБИРСК_ЖУКОВСКОГО',
              'ТВЕРЬ_КОНЕВА',
              'КАРДЫМОВО',
              'СО_ВЕЛИКИЕ_ЛУКИ',
              'РОСТОВ-НА-ДОНУ',
              'ТАГАНРОГ',
              'ПЕРВОМАЙСКИЙ',
              'ГАВРИЛОВ-ЯМ',
              'БОГРАД',
              'ПЛЕСЕЦК',
              'ВОЗНЕСЕНЬЕ',
              'ЕВПАТОРИЯ',
              'ЧИТА_ТРУДА',
              'ТИМАШЕВСК',
              'ПУЧЕЖ',
              'УЛЬЯНОВСК',
              'ИНОЗЕМЦЕВО',
              'ПЕНЗА',
              'МУРМАНСК_СТАРОСТИНА',
              'АНИСИМОВО',
              'БЛАГОВЕЩЕНКА',
              'ДРУЖБА',
              'КАБАНОВО',
              'КРЕСТЬЯНКА',
              'КЫТМАНОВО',
              'ПАНКРУШИХА',
              'ПОБЕДИМ',
              'СЛАВГОРОД',
              'УСТЬ-МОСИХА',
              'ЦЕЛИННОЕ',
              'ШИПУНОВО',
              'ЯГОТИНО',
              'АРХАРА',
              'БЛАГОВЕЩЕНСК_ЗЕЙСКАЯ',
              'БЛАГОВЕЩЕНСК_ТЕАТРАЛЬНАЯ',
              'БЛАГОВЕЩЕНСК_ЧАЙКОВСКОГО',
              'РАЙЧИХИНСК',
              'ВОЗНЕСЕНСКОЕ',
              'ДВИНСКОЙ',
              'ЗАОЗЕРЬЕ',
              'ИСАКОГОРКА',
              'КАРГОПОЛЬ',
              'КОРЯЖМА',
              'КРАСНОБОРСК',
              'МЕЗЕНЬ',
              'МЫЗА',
              'НЯНДОМА',
              'САВИНСКИЙ',
              'СЕВЕРОДВИНСК',
              'СЕВЕРООНЕЖСК',
              'БАЗГИЕВО',
              'КУДЕЕВСКИЙ',
              'ЛЕУЗА',
              'МЕТЕЛИ',
              'НОГУШИ',
              'ОКТЯБРЬСКИЙ',
              'БЫТОШЬ',
              'ГЛОДНЕВО',
              'ДОЛБОТОВО',
              'ЖУКОВКА',
              'СЕЛЬЦО',
              'СТАРОДУБ',
              'ВЯЗНИКИ',
              'КИРЖАЧ',
              'ПЕРЕЛОЖНИКОВО',
              'САДОВЫЙ',
              'ВОЛГОГРАД_ВОСТОЧНАЯ',
              'МАЧЕХА',
              'ХАРЬКОВКА',
              'ИРКУТСК_ЯРОСЛАВСКОГО',
              'УСТЬ-ОРДЫНСКИЙ',
              'ЕЛЕНСКИЙ',
              'ИЛЬИНСКОЕ',
              'МЕДЫНЬ',
              'МОСАЛЬСК',
              'НОВОСЛОБОДСК',
              'ВОНЫШЕВО',
              'СУХОВЕРХОВО',
              'АРМАВИР',
              'КРАСНОЯРСК',
              'ЖЕЛЕЗНОГОРСК',
              'МАГАДАН_АРМАНСКАЯ',
              'СНЕЖНАЯ_ДОЛИНА',
              'ИНСАР',
              'КОВЫЛКИНО',
              'ПРЕОБРАЖЕНСКИЙ',
              'САРАНСК',
              'СТАРОЕ_ШАЙГОВО',
              'ТАРХАНСКАЯ_ПОТЬМА',
              'ЗАОВРАЖЬЕ',
              'КЛЕМЕНТЬЕВО',
              'ОВЧАГИНО',
              'РАХМАНОВО',
              'СТАРАЯ_КУПАВНА',
              'ЭЛЕКТРОГОРСК',
              'КАНДАЛАКША',
              'БЕЛЫШЕВО',
              'БОЛЬШОЕ_КАРПОВО',
              'ВАХТАН',
              'СЯВА',
              'ШАХУНЬЯ',
              'АНЦИФЕРОВО',
              'БУРЕГИ',
              'ВАЛДАЙ',
              'НЕБОЛЧИ',
              'ОКУЛОВКА',
              'ПАРФИНО',
              'ПЕСЬ',
              'ПОДБОРОВКА',
              'БЕРДСК',
              'ПИХТОВКА',
              'СУЗУН',
              'ВЫШНИЙ_ВОЛОЧЕК',
              'КОЗЛОВО',
              'КРАСНЫЙ_ХОЛМ',
              'МАСЛЯТКА',
              'МОЛОДОЙ_ТУД',
              'ПРЯМУХИНО',
              'РЖЕВ',
              'СЕЛЫ',
              'СТАРАЯ_ТОРОПА',
              'УЛЬЯНКОВО',
              'ЯСНАЯ_ПОЛЯНА',
              'БОГОЛЮБОВО',
              'БОЛШЕВО',
              'ВЯЗЬМА',
              'МОЛЬГИНО',
              'РОСЛАВЛЬ',
              'СТУДЕНЕЦ',
              'ЯРЦЕВО',
              'ТАЛИЦА_КРАСНОАРМЕЙСКАЯ',
              'ТАЛИЦА_УРГА',
              'ТАВРИЧЕСКОЕ',
              'ЗОЛОТАРЕВКА',
              'СОЛИКАМСК_ДУБРАВА',
              'СОЛИКАМСК_СЕЛА',
              'НОВОСЕЛЬЕ',
              'ЦСО_ВЕЛИКИЕ_ЛУКИ',
              'БОЛЬШАЯ_ГЛУШИЦА',
              'ДЕВЛЕЗЕРКИНО',
              'ДУБОВЫЙ_УМЕТ',
              'КАБАНОВКА',
              'КАНДАБУЛАК',
              'МАЙСКОЕ',
              'МАКСИМОВКА',
              'НИКИТИНКА',
              'НОВОТУЛКА',
              'ОРЛОВКА',
              'ОТРАДНЫЙ',
              'ПЕТРОВКА',
              'РОМАНОВКА',
              'ТОЛЬЯТТИ',
              'ЧАПАЕВСК',
              'БОЛЬШАЯ_ОРЛОВКА',
              'ВОЛГОДОНСК',
              'ДОНЕЦК',
              'КУГЕЙСКИЙ',
              'МАЛАЯ_РОЩА',
              'МИХАЙЛОВКА',
              'НОВАЯ_ЦЕЛИНА',
              'НОВЫЙ_ЕГОРЛЫК',
              'ПУХЛЯКОВСКИЙ',
              'СЕМИКАРАКОРСК',
              'ХУТОР_ЛЕНИНА',
              'ЧЕРНЫШЕВКА',
              'АВДОТЬИНКА',
              'ВИЛЕНКА',
              'ЛАШМА',
              'МИХАЙЛОВ',
              'РЯЗАНЬ',
              'СКОПИН',
              'СТОЛЫПИНО',
              'СОСНОВКА',
              'ТАМБОВСКИЙ_ЛЕСХОЗ',
              'УВАРОВО',
              'ВЕРХНИЙ_УСЛОН',
              'ЧИСТОПОЛЬ',
              'ДУБНА_ТУЛЬСКАЯ',
              'СЛОБОДА-БЕШКИЛЬ',
              'ВЕРХНЕУРАЛЬСК',
              'ВЫСОКОВО',
              'ПОРЕЧЬЕ-РЫБНОЕ',
              'УГЛИЧ',
              'ЙОШКАР-ОЛА',
              'ШЕБЕКИНО',
              'ВЛАДИКАВКАЗ',
              'ТОМАРИ',
              'КУГЕСИ',
              'ГРЯЗОВЕЦ',
              'АЛНАШИ',
              'НАВОЛОКИ',
              'СНЕЖНЫЙ',
              'ДАЛЬНЕГОРСК',
              'ДМИТРИЕВКА',
              'СПАССК-ДАЛЬНИЙ',
              'АТАМАНОВКА',
              'ЯСНОГОРСК',
              'ЭЛИСТА',
              'ДАЛМАТОВО',
              'ЛЕВОКУМСКОЕ',
    
    
            ]
          }
        }); */
    const listOfHouses = await House.find({ isActive: true, region: region.name, dateLastUpdate: { $gt: new Date("2024-08-31"), $lt: new Date("2024-11-01") } });
    //const listOfHouses = await House.find({ isActive: false, region: region.name, noAddress: false });
    //console.log("listOfHouses ");
    // console.log(listOfHouses);

    /*     holiday = "february23";
        //holiday = "march8";
            let Holiday
           if (holiday == "february23") {
             Holiday = require("../models/february-23");
           } else {
             Holiday = require("../models/march-8");
           }
        */
    /*        let seniorsNoPluses1 = await February23.find({ absent: false, plusAmount: 0, noAddress: false});
           let seniorsNoPluses2 = await March8.find({ absent: false, plusAmount: 0, noAddress: false});
           let housesSet = new Set();
           for (let senior of seniorsNoPluses1) {
             housesSet.add(senior.nursingHome);
           }
           for (let senior of seniorsNoPluses2) {
            housesSet.add(senior.nursingHome);
          }
           let listOfHouses = Array.from(housesSet);
           console.log('listOfHouses');
           console.log(listOfHouses); */
    //let houses = await House.find({ isActive: true, noAddress: false});

    for (let house of listOfHouses) {
      // house = await House.findOne({nursingHome: house});
      /*  console.log('house');
        console.log(house);*/
      const amountOfSeniors = await Senior.find({ nursingHome: house.nursingHome, dateExit: null, isRestricted: false }).count();
      console.log(house.region + " + " + house.nursingHome + " + " + amountOfSeniors + " + " + house.dateLastUpdateClone + " + " + house.address + " + " + house.notes);

      /*             const amountOfMen = await February23.find({ nursingHome: house.nursingHome, absent: false, plusAmount: 0, noAddress: false }).count();
                  const amountOfWomen = await March8.find({ nursingHome: house.nursingHome, absent: false, plusAmount: 0, noAddress: false }).count(); */

      /*       const amountOfMen = await Senior.find({ nursingHome: house.nursingHome, dateExit: null, isRestricted: false, gender: "Male" }).count();
            const amountOfWomen = await Senior.find({ nursingHome: house.nursingHome, dateExit: null, isRestricted: false, gender: "Female" }).count();
            console.log(house.region + "+" + house.nursingHome + "+" + house.address + "+" + amountOfMen + "+" + amountOfWomen);
            feb23 = feb23 + amountOfMen;
            march8 = march8 + amountOfWomen; */
    }
    // console.log(region.name + " + " + amountOfSeniors);

  }
  // console.log(feb23 + " + " + march8);





  // const amountOfSeniors = await Senior.find({ region: region.name, })

}

async function overdue() {
  const houses = await House.find({ isActive: true, dateLastUpdate: { $lt: new Date('2025-10-01') } });


  for (let house of houses) {
    console.log(house.region + " + " + house.nursingHome + " + " + house.address + " + " + house.dateLastUpdateClone + " + " + house.nameContact + " + " + house.contact + " + " + house.notes);
  }
  // console.log(region.name + " + " + amountOfSeniors);

}


async function reportSources() {
  let sources = ["subscription", "site", "vk", "telegram", "insta", "dobroru", "other"];
  let months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "ноября"] //, "декабря", "декабря", "декабря", "декабря",

  //for (let month of months) {
  for (let source of sources) {
    let plusesAmount = await Order.aggregate(
      [
        {
          $match:
            //{ holiday: "Дни рождения " + month + " 2024", isDisabled: false, isOverdue: false, isReturned: false, source: source }
            { holiday: "Пасха 2025", isDisabled: false, isOverdue: false, isReturned: false, source: source, }          //   contactType: "telegram"

          // { holiday: "Дни рождения " + month + " 2024", isDisabled: false, isOverdue: false, isReturned: false, source: "subscription", contactType: "vKontakte" }
        },
        {
          $group: { _id: null, sum_val: { $sum: "$amount" } }
        }
      ]
    );

    let volunteersAmount = await Order.aggregate(
      [
        {
          $match:
            //{ holiday: "Дни рождения " + month + " 2024", isDisabled: false, isOverdue: false, isReturned: false, source: source }
            { holiday: "Пасха 2025", isDisabled: false, isOverdue: false, isReturned: false, source: source, } //contactType: "telegram"
          // { holiday: "Дни рождения " + month + " 2024", isDisabled: false, isOverdue: false, isReturned: false, source: "subscription", contactType: "vKontakte" }
        },
        {
          $group: { _id: null, count: { $sum: 1 } }
        }
      ]
    );

    if (volunteersAmount[0] && plusesAmount[0]) {
      // console.log(month + " + " + source + " + " + volunteersAmount[0].count + " + " + plusesAmount[0].sum_val);
      console.log("НГ 2024" + " + " + source + " + " + volunteersAmount[0].count + " + " + plusesAmount[0].sum_val);
      //console.log(month + " + " + "subscription" + " + " + volunteersAmount[0].count + " + " + plusesAmount[0].sum_val);
    }

  }
  //}


}


async function countHB() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match:
          { holiday: "Дни рождения ноября 2025", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );

  let orders = await Order.find({ holiday: "Дни рождения ноября 2025", isDisabled: false, isOverdue: false, isReturned: false });
  let celebrators = new Set();
  for (let order of orders) {
    for (let lineItem of order.lineItems) {
      for (let celebrator of lineItem.celebrators) {
        celebrators.add(celebrator.celebrator_id);
        //celebrators.add(celebrator.lastName);
      }
    }
  }
  console.log("celebrators.size");
  console.log(celebrators.size);

  /* 
    let celebratorsAmount = await ListBefore.aggregate(
      [
        {
          $match:
            { absent: false, plusAmount: { $ne: 0 } }
        },
        {
          $group: { _id: null, count: { $sum: 1 } }
        }
      ]
    ); */

  return {
    plusesAmount: plusesAmount[0].sum_val,
    celebratorsAmount: celebratorsAmount[0].count
  }


}

async function countSD() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match: { holiday: "День пожилого человека 2024", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );
  let celebratorsAmount = await SeniorDay.aggregate(
    [
      {
        $match:
          { absent: false, plusAmount: { $ne: 0 } }
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]
  );

  return {
    plusesAmount: plusesAmount[0].sum_val,
    celebratorsAmount: celebratorsAmount[0].count
  }
}

async function countND() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match: { holiday: "Именины ноября 2024", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );
  let orders = await Order.find({ holiday: "Именины ноября 2024", isDisabled: false, isOverdue: false, isReturned: false });
  let celebrators = new Set();
  for (let order of orders) {
    for (let lineItem of order.lineItems) {
      for (let celebrator of lineItem.celebrators) {
        // celebrators.add(celebrator.celebrator_id);
        celebrators.add(celebrator.lastName);
      }
    }
  }
  console.log("celebrators.size");
  console.log(celebrators.size);


  let celebratorsAmount = await NameDayBefore.aggregate(
    [
      {
        $match:
          { absent: false, plusAmount: { $ne: 0 } }
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]
  );

  return {
    plusesAmount: plusesAmount[0].sum_val,
    celebratorsAmount: celebratorsAmount[0].count
  }
}

async function countNY() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match: { holiday: "Новый год 2026", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );
  let celebratorsAmount = await NewYear.aggregate(
    [
      {
        $match:
          { absent: false, plusAmount: { $ne: 0 } }
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]
  );

  return {
    plusesAmount: plusesAmount[0].sum_val,
    celebratorsAmount: celebratorsAmount[0].count
  }
}

async function countF23() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match: { holiday: "23 февраля 2025", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );
  let celebratorsAmount = await February23.aggregate(
    [
      {
        $match:
          { absent: false, plusAmount: { $ne: 0 } }
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]
  );

  return {
    plusesAmount: plusesAmount[0].sum_val,
    celebratorsAmount: celebratorsAmount[0].count
  }
}

async function countM8() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match: { holiday: "8 марта 2025", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );
  /*   let celebratorsAmount = await March8.aggregate(
      [
        {
          $match:
            { absent: false, plusAmount: { $ne: 0 } }
        },
        {
          $group: { _id: null, count: { $sum: 1 } }
        }
      ]
    ); */

  return {
    plusesAmount: plusesAmount[0].sum_val,
    // celebratorsAmount: celebratorsAmount[0].count
  }
}

async function countEaster() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match: { holiday: "Пасха 2025", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );
  let celebratorsAmount = await Easter.aggregate(
    [
      {
        $match:
          { absent: false, plusAmount: { $ne: 0 } }
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]
  );

  return {
    plusesAmount: plusesAmount[0].sum_val,
    celebratorsAmount: celebratorsAmount[0].count
  }
}

async function countMay9() {

  let plusesAmount = await Order.aggregate(
    [
      {
        $match: { holiday: "9 мая 2025", isDisabled: false, isOverdue: false, isReturned: false }
      },
      {
        $group: { _id: null, sum_val: { $sum: "$amount" } }
      }
    ]
  );
  let celebratorsAmount = await May9.aggregate(
    [
      {
        $match:
          { absent: false, plusAmount: { $ne: 0 } }
      },
      {
        $group: { _id: null, count: { $sum: 1 } }
      }
    ]
  );

  return {
    plusesAmount: plusesAmount[0].sum_val,
    celebratorsAmount: celebratorsAmount[0].count
  }
}

async function countRegionsAndHouses() {
  let setRegions = new Set();

  let houses = await House.find({ isActive: true, }); //noAddress: false
  for (let house of houses) {
    setRegions.add(house.region);
  }

  console.log(houses.length);
  console.log(setRegions.size);
  console.log(setRegions);

  /*   let oldRegions = await Region.find({});
    let tempArray = [];
   
    for (let region of oldRegions) {
      tempArray.push(region.name);
    }
    //console.log(tempArray);
    tempArray.sort();
    //console.log(tempArray);
    for (let i = 0; i < tempArray.length - 1; i++) {
      if (tempArray[i + 1] == tempArray[i]) {
        await Region.deleteOne ({name: tempArray[i]});
      }
    } */

  /* 
    let oldRegions = await Region.find({});
  
    for (let value of setRegions) {
      let index = oldRegions.findIndex(item => item.name == value);
      if (index == -1) {
        await Region.create({name : value});
      }
    }  */


  return {
    housesAmount: houses.length,
    regionsAmount: setRegions.size
  };

}

async function countVolonteers() {

  let setClients = new Set();
  let setInstitutes = new Set();
  let setSchools = new Set();
  let ordersBirthday = await Order.find({ holiday: "Дни рождения ноября 2025", isDisabled: false, isOverdue: false, isReturned: false, });
  // let ordersNameDay = await Order.find({ holiday: "Именины ноября 2024", isDisabled: false, isOverdue: false, isReturned: false, });
  //let ordersNY = await Order.find({ holiday: "Новый год 2026", isDisabled: false, isOverdue: false, isReturned: false, });
  //let ordersSeniorDay = await Order.find({ holiday: "День пожилого человека 2024", isDisabled: false, isOverdue: false, isReturned: false, });
  //let ordersFebruary23 = await Order.find({ holiday: "23 февраля 2025", isDisabled: false, isOverdue: false, isReturned: false, });
  let ordersMarch8 = await Order.find({ holiday: "8 марта 2025", isDisabled: false, isOverdue: false, isReturned: false, });
  // let ordersEaster = await Order.find({ holiday: "Пасха 2025", isDisabled: false, isOverdue: false, isReturned: false, });
  // let ordersMay9 = await Order.find({ holiday: "9 мая 2025", isDisabled: false, isOverdue: false, isReturned: false, });

  for (let order of ordersBirthday) {
    setClients.add(order.contact);
    for (let order of ordersMarch8) {
      setClients.add(order.contact);
    }
  }   /*  
  for (let order of ordersFebruary23) {
    setClients.add(order.contact);
  }*/

  /*  for (let order of ordersNameDay) {
    setClients.add(order.contact);
  }

    for (let order of ordersNY) {
      setClients.add(order.contact);
    }
  
  
  
    for (let order of ordersSeniorDay) {
      setClients.add(order.contact);
    }
  
   
  
    for (let order of ordersEaster) {
      setClients.add(order.contact);
    }
  
    for (let order of ordersMay9) {
      setClients.add(order.contact);
    }*/
  console.log("поздравляющих");
  console.log(setClients.size);

  /*   let ordersInstitutes = await Order.find({ holiday: { $in: ["Дни рождения ноября 2025"] }, institutes: { $ne: [] }, isDisabled: false, isOverdue: false, isReturned: false, });//, "Пасха 2025", "9 мая 2025"
    let ordersSchools = await Order.find({ holiday: { $in: ["Дни рождения ноября 2025"] }, "institutes.category": "образовательное учреждение", isDisabled: false, isOverdue: false, isReturned: false, });   //.project({ _id: 0, email: 1, contact: 1,  }); , "institutes.category": "образовательное учреждение", institutes: { $ne: [] }, dateOfOrder: { $gt: new Date('2023-12-31'), $lt: new Date('2024-02-01') }, "Пасха 2025", "9 мая 2025"
  
   */

  let ordersInstitutes = await Order.find({ holiday: { $in: ["8 марта 2025", "Дни рождения ноября 2025"] }, institutes: { $ne: [] }, isDisabled: false, isOverdue: false, isReturned: false, });//, "Пасха 2025", "9 мая 2025"
  let ordersSchools = await Order.find({ holiday: { $in: ["8 марта 2025", "Дни рождения ноября 2025"] }, "institutes.category": "образовательное учреждение", isDisabled: false, isOverdue: false, isReturned: false, });   //.project({ _id: 0, email: 1, contact: 1,  }); , "institutes.category": "образовательное учреждение", institutes: { $ne: [] }, dateOfOrder: { $gt: new Date('2023-12-31'), $lt: new Date('2024-02-01') }, "Пасха 2025", "9 мая 2025"


  for (let order of ordersInstitutes) {
    setInstitutes.add(order.contact);
  }
  console.log("учреждений");
  console.log(setInstitutes.size);

  for (let order of ordersSchools) {
    setSchools.add(order.contact);
  }
  console.log("образовательных");
  console.log(setSchools.size);



  return {
    volunteersAmount: setClients.size,
    schoolsAmount: setSchools.size,
    institutesAmount: setInstitutes.size - setSchools.size,

  };
}

//howManySeniors
//const Order = require("../models/order");
router.get("/amountOfSeniors", checkAuth, async (req, res) => {
  try {

    console.log("start");
    let amount = await countAmountSeniors();
    const findAllListsResponse = new BaseResponse("200", "Query successful", amount);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

async function countAmountSeniors() {
  let amount = 0;
  let set = new Set();
  // let orders = await Order.find({ isDisabled: false, isOverdue: false, isReturned: false, dateOfOrder: { $gt: new Date('2022-09-01'), $lt: new Date('2023-10-01') } });   //.project({ _id: 0, email: 1, contact: 1,  });
  //let orders = await Order.find({ holiday: { $in: ["8 марта 2025"] }, isDisabled: false, isOverdue: false, isReturned: false, });
  let orders = await Order.find({ holiday: { $in: ["День учителя и дошкольного работника 2024"] }, isDisabled: false, isOverdue: false, isReturned: false, });

  for (let order of orders) {
    for (let lineItem of order.lineItems) {
      for (let senior of lineItem.celebrators) {
        let fullData = senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.fullDayBirthday;
        set.add(fullData);
      }
    }
  }
  amount = set.size;

  console.log(set);

  return amount;
}

// uncertain

router.patch("/uncertain", checkAuth, async (req, res) => {
  try {

    console.log("start");
    let listOfUncertain = await findUncertain();
    const findAllListsResponse = new BaseResponse("200", "Query successful", listOfUncertain);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

async function findUncertain() {

  let list = [];
  let listOfUncertain = [];
  let orders = await Order.find({ holiday: "Дни рождения ноября 2025", isDisabled: false, isAccepted: false, isReturned: false, isOverdue: false });   //.project({ _id: 0, email: 1, contact: 1,  });
  for (let order of orders) {
    for (let lineItem of order.lineItems) {
      for (let celebrator of lineItem.celebrators) {
        list.push(mongoose.Types.ObjectId(celebrator.celebrator_id));
      }
    }
  }

  listOfUncertain = await List.find({ _id: { $in: list }, plusAmount: { $lt: 3 } });
  await List.updateMany({ uncertain: true }, { $set: { uncertain: false } });
  let result = await List.updateMany({ _id: { $in: list }, plusAmount: { $lt: 3 } }, { $set: { uncertain: true } });
  console.log(result);
  return listOfUncertain;

}




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




// check SPRING doubles
router.post("/holiday/check-doubles/:holiday", checkAuth, async (req, res) => {
  try {
    console.log("0- check SPRING doubles" + req.body.nursingHome);
    let result = await findAllSpringDoubles(req.body.nursingHome, req.params.holiday);
    console.log("4-check SPRING doubles " + result);
    //const newList = newList1.slice();
    const newListResponse = new BaseResponse(200, "Query Successful", result);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function findAllSpringDoubles(house, holiday) {

  let Holiday = holiday == "february23" ? February23 : March8;


  let fullHouse = await Holiday.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1, plusAmount: 1 });
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
        await Holiday.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
      } else {
        await Holiday.deleteOne({ _id: someHouses[i]._id });
      }
    }
  }
  console.log("All duplicates");
  console.log(duplicates.length.toString());
  return duplicates.length.toString();


}



// check SPRING fullness
router.post("/holiday/check-fullness/:holiday", checkAuth, async (req, res) => {
  try {

    console.log("0- check NY fullness " + req.body.nursingHome);

    let result = await checkAllSpringFullness(req.body.nursingHome, req.params.holiday);
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



async function checkAllSpringFullness(nursingHouse, holiday) {
  /* let restrictedHouses = ["КОСТРОМА_КИНЕШЕМСКОЕ", "МОСКВА_РОТЕРТА", "СЕВЕРО-АГЕЕВСКИЙ", "АЛАКУРТТИ", "ХВОЙНЫЙ", "ВОЛГОГРАД_КРИВОРОЖСКАЯ", "УСОЛЬЕ", "ЧЕРКАССКАЯ_КОНОПЕЛЬКА", "МАМОНТОВО", "ЧЕРМЕНИНО", "ЧЕРЕМХОВО", "КРИВЕЦ", "КРИПЕЦКОЕ"]
  let index = restrictedHouses.findIndex(i => i == house);
  if (index != -1 && holiday == "february23") {
    return { amountAdded: null, amountDeleted: null };
  } */
  //let houses = [ 'СЛАВГОРОД', 'ШИПУНОВО', 'ШИПУНОВО_БОА', 'ПАНКРУШИХА' ];
  //let houses = [ 'САВИНСКИЙ', 'РАЙЧИХИНСК', 'БЛАГОВЕЩЕНСК_ТЕАТРАЛЬНАЯ', 'БЛАГОВЕЩЕНСК_ЗЕЙСКАЯ' ];

  /*   let seniorsWithConsents = await Senior.find({ dateExit: null, dateOfSignedConsent: { '$ne': null } });
    let housesSet = new Set();
    for (let senior of seniorsWithConsents) {
      housesSet.add(senior.nursingHome);
    }
    let houses = Array.from(housesSet);
   */
  let houses = await House.find({ isActive: true, nursingHome: { $in: ["РЯЖСК", "ВОЗНЕСЕНСКОЕ"] } }); //, "СОЛИКАМСК_СЕЛА", "СОЛИКАМСК_ДУБРАВА", "КАРДЫМОВО", "ПЛАСТУН", "МОНТАЖНЫЙ", "СПАССК-ДАЛЬНИЙ"

  holiday = "february23";
  //holiday = "march8";

  for (let oneHouse of houses) {
    let house = await House.findOne({ nursingHome: oneHouse.nursingHome });
    console.log("house.nursingHome " + house.nursingHome);

    await findAllSpringDoubles(house.nursingHome, holiday);
    let Holiday
    if (holiday == "february23") {
      Holiday = require("../models/february-23");
    } else {
      Holiday = require("../models/march-8");
    }
    let seniors;
    if (holiday == "february23") {
      seniors = await Senior.find({ isReleased: false, isDisabled: false, dateExit: null, isRestricted: false, gender: "Male", nursingHome: house.nursingHome });//, dateOfSignedConsent: { $ne: null }
    } else {
      seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house.nursingHome, gender: "Female" });//, dateOfSignedConsent: { $ne: null }
    }


    console.log("seniors " + seniors.length);
    let fullHouse = await Holiday.find({ nursingHome: house.nursingHome, absent: false }, { fullData: 1 }); //, dateOfSignedConsent: { $ne: null }

    for (let senior of seniors) {
      senior.fullData = senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday;
    }

    console.log("fullHouse " + fullHouse.length);
    let amount = 0;
    for (let senior of seniors) {

      let seniorIndex = fullHouse.findIndex(item => item.fullData == senior.fullData);
      //console.log("seniorIndex " + seniorIndex);
      if (seniorIndex == -1) {
        amount++;
        let celebrator = await createCloneCelebrator(senior);
        let newCelebrator = await Holiday.create(celebrator);
        console.log("added");
        console.log(newCelebrator.fullData);
      }
    }
    console.log("All added");
    console.log(amount);

    fullHouse = await Holiday.find({ nursingHome: house.nursingHome, absent: false, }, { fullData: 1, });//dateOfSignedConsent: { $ne: null }
    let count = 0;
    for (let celebrator of fullHouse) {
      let celebratorIndex = seniors.findIndex(item => item.fullData == celebrator.fullData);
      if (celebratorIndex == -1) {

        await Holiday.updateOne({ fullData: celebrator.fullData }, { $set: { absent: true } });
        count++;
        console.log("deleted");
        console.log(celebrator.fullData);

      }
    }
    console.log("All deleted");
    console.log(count);

    await findAllNYDoubles(house.nursingHome, holiday);
    await restoreStatistic(house.nursingHome, holiday);
  }


  return true;
  //return { amountAdded: amount, amountDeleted: count };

}

async function restoreStatistic(activeHouse, holiday) {
  console.log("activeHouse");
  console.log(activeHouse);

  let house = await House.findOne({ nursingHome: activeHouse });

  let Holiday;
  if (holiday == "february23") {
    Holiday = require("../models/february-23");
  } else {
    Holiday = require("../models/march-8");
  }


  for (let i = 0; i < 6; i++) {

    let plusM = await February23.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: i } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    let plusF = await March8.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: i } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    /*     console.log("plusM");
        console.log(plusM);
    
        console.log("plusF");
        console.log(plusF); */

    let plusMen = plusM.length > 0 ? plusM[0].count : 0;
    let plusWomen = plusF.length > 0 ? plusF[0].count : 0;
    let plus = plusMen + plusWomen;

    console.log("plus");
    console.log(plus);


    switch (i) {
      case 0:
        await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.plus0": plus } });
        break;
      case 1:
        await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.plus1": plus } });
        break;
      case 2:
        await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.plus2": plus } });
        break;
      case 3:
        await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.plus3": plus } });
        break;
      case 4:
        await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.plus4": plus } });
        break;
      case 5:
        await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.plus5": plus } });
        break;
    }


  }

  if (house.noAddress) {

    if (holiday == "february23") {
      let specialMenPlus = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialMen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.specialMenPlus": specialMenPlus[0]?.count ? specialMenPlus[0].count : 0 } });
    } else {
      let specialWomenPlus = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialWomen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.specialWomenPlus": specialWomenPlus[0]?.count ? specialWomenPlus[0].count : 0 } });

    }


  } else {

    if (holiday == "february23") {
      let oldMenPlus = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldMen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*   console.log("oldMenPlus");
        console.log(oldMenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.oldMenPlus": oldMenPlus[0]?.count ? oldMenPlus[0].count : 0 } });
      let yangMenPlus = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangMen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*     console.log("yangMenPlus");
          console.log(yangMenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.yangMenPlus": yangMenPlus[0]?.count ? yangMenPlus[0].count : 0 } });

    } else {
      let oldWomenPlus = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldWomen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*     console.log("oldWomenPlus");
          console.log(oldWomenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.oldWomenPlus": oldWomenPlus[0]?.count ? oldWomenPlus[0].count : 0 } });


      let yangWomenPlus = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangWomen" } },
        { $group: { _id: null, count: { $sum: "$plusAmount" } } }
      ]);
      /*     console.log("yangWomenPlus");
          console.log(yangWomenPlus);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.yangWomenPlus": yangWomenPlus[0]?.count ? yangWomenPlus[0].count : 0 } });

    }


  }

  let amountM = await February23.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  let amountF = await March8.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*     console.log("plusM");
    console.log(plusM);
  
    console.log("plusF");
    console.log(plusF); */

  let amountMen = amountM.length > 0 ? amountM[0].count : 0;
  let amountWomen = amountF.length > 0 ? amountF[0].count : 0;
  let amount = amountMen + amountWomen;

  console.log("amount");
  console.log(amount);

  await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.amount": amount } });



  if (house.noAddress) {

    if (holiday == "february23") {
      let specialMen = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialMen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.specialMen": specialMen[0]?.count ? specialMen[0].count : 0 } });
    } else {

      let specialWomen = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "specialWomen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.specialWomen": specialWomen[0]?.count ? specialWomen[0].count : 0 } });

    }

  } else {

    if (holiday == "february23") {
      let oldMen = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldMen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*   console.log("oldMen");
        console.log(oldMen);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.oldMen": oldMen[0]?.count ? oldMen[0].count : 0 } });

      let yangMen = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangMen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*     console.log("yangMen");
          console.log(yangMen);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.yangMen": yangMen[0]?.count ? yangMen[0].count : 0 } });

    } else {
      let oldWomen = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "oldWomen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*     console.log("oldWomen");
          console.log(oldWomen);  */
      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.oldWomen": oldWomen[0]?.count ? oldWomen[0].count : 0 } });


      let yangWomen = await Holiday.aggregate([
        { $match: { nursingHome: house.nursingHome, absent: false, category: "yangWomen" } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      /*     console.log("yangWomen");
          console.log(yangWomen); */

      await House.updateOne({ _id: house._id }, { $set: { "statistic.spring.yangWomen": yangWomen[0]?.count ? yangWomen[0].count : 0 } });
    }
  }

  /*   } */

  /*   } */
}



///////////////////////////////////////// EASTER

// Create EASTER list API 
router.post("/easter/create", checkAuth, async (req, res) => {
  try {
    const houses = req.body.list;
    console.log("0- inside Create list API");
    // let result = await findAllEasterCelebrators(houses);
    let result = await countAmount();

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

async function countAmount() {
  //let namesOfUpdatedNursingHome = await House.find({ isActive: true }, { nursingHome: 1, _id: 0 });
  // console.log(houses);
  let listHouses = await House.find({ isDisabled: false, isActive: true });
  let namesOfUpdatedNursingHome = [];
  for (let home of listHouses) {
    const senior = await Senior.findOne({ nursingHome: home.nursingHome, isDisabled: false, isRestricted: false, dateExit: null, dateOfSignedConsent: { $ne: null } });
    if (senior) {
      namesOfUpdatedNursingHome.push(senior.nursingHome);
    }
  }

  namesOfUpdatedNursingHome = ['ПОРЕЧЬЕ-РЫБНОЕ', 'ОВЧАГИНО']

  for (let house of namesOfUpdatedNursingHome) {

    await restoreEasterStatistic(house);

    /* 
        let amount = await Senior.aggregate([
          { $match: { nursingHome: house, dateExit: null, isRestricted: false } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        console.log(house);
        console.log(amount[0].count);
    
        let update = await House.updateOne({ nursingHome: house }, { $set: { "statistic.easter.amount": amount[0].count } });
        console.log(update); */
  }

  return true;
}



async function findAllEasterCelebrators(houses) {

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside findAllMonthCelebrators newList");
  /* let listHouses = await House.find({isDisabled: false, isActive: true});
  let namesOfUpdatedNursingHome = [];
  for (let home of listHouses) {
    const senior = await Senior.findOne({nursingHome: home.nursingHome, isDisabled: false, isRestricted: false, dateExit: null, dateOfSignedConsent: {$ne:null}});
    if(senior){
      namesOfUpdatedNursingHome.push(senior.nursingHome);
    }  
  }
  
  console.log(namesOfUpdatedNursingHome);
  console.log("namesOfUpdatedNursingHome");
   */
  let restrictedId = [];
  let namesOfUpdatedNursingHome = [];
  for (let home of houses) {
    let foundId = await Easter.find({ nursingHome: home.nursingHome });
    foundId = foundId.map(item => item.seniorId);
    restrictedId = [...restrictedId, ...foundId];

    namesOfUpdatedNursingHome.push(home.nursingHome);
  }
  console.log(namesOfUpdatedNursingHome);


  let list = await Senior.find(
    {
      isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome }, _id: { $nin: restrictedId } // dateOfSignedConsent: { $ne: null }, 
    }
  );
  console.log(list.length);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);

  /*   await House.updateMany({},
      {$set:{
        "statistic.easter.time": 0,
        "statistic.easter.plus0": 0,
        "statistic.easter.plus1": 0,
        "statistic.easter.plus2": 0,
        "statistic.easter.plus3": 0,
        "statistic.easter.specialMen": 0,
        "statistic.easter.specialWomen": 0,
        "statistic.easter.oldMen": 0,
        "statistic.easter.oldWomen": 0,
        "statistic.easter.yangMen": 0,
        "statistic.easter.yangWomen": 0,
        "statistic.easter.amount": 0,
        "statistic.easter.specialMenPlus": 0,
        "statistic.easter.specialWomenPlus": 0,
        "statistic.easter.oldMenPlus": 0,
        "statistic.easter.oldWomenPlus": 0,
        "statistic.easter.yangMenPlus": 0,
        "statistic.easter.yangWomenPlus": 0,
      }
    
    }); */

  let updatedCelebrators = [];
  for (let celebrator of list) {

    /*       let cloneSpecialComment = await specialComment(
            2022 - celebrator["yearBirthday"]
          ); */

    let cloneCelebrator = await createCloneEasterCelebrator(celebrator);



    if (cloneCelebrator.category == "specialMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.easter.specialMen": 1, "statistic.easter.plus0": 1 } }); //"statistic.easter.amount": 1,
    }
    if (cloneCelebrator.category == "specialWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.easter.specialWomen": 1, "statistic.easter.plus0": 1 } });//"statistic.easter.amount": 1,
    }
    if (cloneCelebrator.category == "oldMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.easter.oldMen": 1, "statistic.easter.plus0": 1 } });//"statistic.easter.amount": 1,
    }
    if (cloneCelebrator.category == "oldWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.easter.oldWomen": 1, "statistic.easter.plus0": 1 } });//"statistic.easter.amount": 1,
    }
    if (cloneCelebrator.category == "yangMen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.easter.yangMen": 1, "statistic.easter.plus0": 1 } });//"statistic.easter.amount": 1,
    }
    if (cloneCelebrator.category == "yangWomen") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.easter.yangWomen": 1, "statistic.easter.plus0": 1 } });//"statistic.easter.amount": 1,
    }

    updatedCelebrators.push(cloneCelebrator);
  }
  await House.updateMany({ nursingHome: { $in: namesOfUpdatedNursingHome } }, { $inc: { "statistic.easter.time": 1 } });

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);
  // newList = newList1.slice();

  console.log("2.5 - " + newList.length);

  const options = { ordered: false };
  let finalList = await Easter.insertMany(newList, options);


  //console.log(finalList);

  console.log(`3- ${finalList.length} documents were inserted`);

  result = (finalList.length == newList.length) ? 'The list has been formed successfully ' : `${newList.length - finalList.insertedCount} record(s) from ${newList.length} weren't included in the list`
  //console.log("3 - final" + finalList); 

  return result;
  //return true;
}
async function createCloneEasterCelebrator(celebrator) {

  let cloneFullDayBirthday = `${celebrator.dateBirthday > 9
    ? celebrator.dateBirthday
    : "0" + celebrator.dateBirthday}.${celebrator.monthBirthday > 9
      ? celebrator.monthBirthday
      : "0" + celebrator.monthBirthday}${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;

  let cloneCategory = '';
  let cloneOldest = false;

  if (celebrator["noAddress"]) {
    if (celebrator.gender == "Female") {
      cloneCategory = "specialWomen";
    }
    if (celebrator.gender == "Male") {
      cloneCategory = "specialMen";
    }

  } else {
    if (celebrator.yearBirthday < 1942 && celebrator.yearBirthday > 0) {
      cloneOldest = true;
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
      cloneCategory = "oldWomen";
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
      cloneCategory = "oldMen";
    }
    if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
      if (celebrator.gender == "Female") {
        cloneCategory = "yangWomen";
      }
      if (celebrator.gender == "Male") {
        cloneCategory = "yangMen";
      }
    }
  }

  let cloneCelebrator = {
    seniorId: celebrator._id,
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
    holyday: 'Пасха 2025',
    fullData: celebrator.nursingHome +
      celebrator.lastName +
      celebrator.firstName +
      celebrator.patronymic +
      celebrator.dateBirthday +
      celebrator.monthBirthday +
      celebrator.yearBirthday,
    dateOfSignedConsent: celebrator.dateOfSignedConsent,
  };
  //console.log("special - " + celebrator["specialComment"]);
  //console.log("fullday - " + celebrator.fullDayBirthday);
  //console.log(celebrator);
  return cloneCelebrator;

}



//////////////////////////////////////////////////////////////////////////// check EASTER doubles
router.post("/easter/check-doubles", checkAuth, async (req, res) => {
  try {

    console.log("0- check NY doubles" + req.body.nursingHome);
    let result = await findAllEasterDoubles(req.body.nursingHome);
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

async function findAllEasterDoubles(house) {
  let fullHouse = await Easter.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1, plusAmount: 1 });
  let fullDataHouse = [];
  /*   console.log("fullHouse");
    console.log(fullHouse); */
  for (let item of fullHouse) {
    fullDataHouse.push(item.seniorId);
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
    let someHouses = fullHouse.filter(item => item.seniorId == senior);
    console.log("someHouses");
    console.log(someHouses);
    let plusAmount = 0;
    for (let senior of someHouses) {
      plusAmount = plusAmount + senior.plusAmount;
    }
    for (let i = 0; i < someHouses.length; i++) {
      if (i == 0) {
        await Easter.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
      } else {
        await Easter.deleteOne({ _id: someHouses[i]._id });
      }
    }
  }
  console.log("All duplicates");
  console.log(duplicates.length.toString());
  return duplicates.length.toString();


}



// check EASTER fullness
router.post("/easter/check-fullness", checkAuth, async (req, res) => {
  try {

    console.log("0- check NY fullness " + req.body.nursingHome);

    let housesSet = new Set();
    const celebratorsEaster = await Easter.find({ absent: false });
    for (let celebrator of celebratorsEaster) {
      housesSet.add(celebrator.nursingHome);
    }
    let houses = Array.from(housesSet);

    //  let houses = ["БИЙСК"];

    for (let house of houses) {
      await checkAllEasterFullness(house);
      await restoreEasterStatistic(house);
    }


    const newListResponse = new BaseResponse(200, "Query Successful", true);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});



async function checkAllEasterFullness(house) {

  await findAllEasterDoubles(house);

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house });
  console.log("seniors " + seniors.length);
  let fullHouse = await Easter.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1 }); //
  console.log("fullHouse " + fullHouse.length);
  let amount = 0;
  for (let senior of seniors) {

    let seniorIndex = fullHouse.findIndex(item => item.seniorId == senior._id);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amount++;
      let celebrator = await createCloneCelebratorEaster(senior);
      let newCelebrator = await Easter.create(celebrator);
      console.log("added");
      console.log(newCelebrator.fullData);
    }
  }
  console.log("All added");
  console.log(amount);

  fullHouse = await Easter.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1 });
  let count = 0;
  for (let celebrator of fullHouse) {
    let celebratorIndex = seniors.findIndex(item => item._id == celebrator.seniorId);
    if (celebratorIndex == -1) {

      await Easter.updateOne({ seniorId: celebrator.seniorId }, { $set: { absent: true } });
      count++;
      console.log("deleted");
      console.log(celebrator.fullData);

    }
  }
  console.log("All deleted");
  console.log(count);

  await findAllEasterDoubles(house);
  await restoreEasterStatistic(house);

  return { amountAdded: amount, amountDeleted: count };


}

async function restoreEasterStatistic(activeHouse) {
  console.log("activeHouse");
  console.log(activeHouse);

  let house = await House.findOne({ nursingHome: activeHouse });
  /*       console.log("house");
        console.log(house); */


  /*   for (let house of houses) {

   */
  let plus0 = await Easter.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   console.log("plus0");
    console.log(plus0); */

  await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.plus0": plus0[0]?.count ? plus0[0].count : 0 } });

  console.log("plus0");
  console.log(plus0[0]?.count);

  if (plus0[0]?.count < 50) {
    console.log("noName " + activeHouse);
    await Easter.updateMany({ nursingHome: house.nursingHome, plusAmount: 0, absent: false }, { $set: { noName: false } });
  }


  let plus1 = await Easter.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 1 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);


  /*   console.log("plus1");
    console.log(plus1); */
  await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.plus1": plus1[0]?.count ? plus1[0].count : 0 } });

  let plus2 = await Easter.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 2 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  /* 
    console.log("plus2");
    console.log(plus2); */
  await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.plus2": plus2[0]?.count ? plus2[0].count : 0 } });

  let plus3 = await Easter.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 3 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   console.log("plus3");
    console.log(plus3); */

  await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.plus3": plus3[0]?.count ? plus3[0].count : 0 } });

  let plus4 = await Easter.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 4 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   console.log("plus3");
    console.log(plus3); */

  await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.plus4": plus4[0]?.count ? plus4[0].count : 0 } });

  if (house.noAddress) {
    let specialMenPlus = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "specialMen" } },
      { $group: { _id: null, count: { $sum: "$plusAmount" } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.specialMenPlus": specialMenPlus[0]?.count ? specialMenPlus[0].count : 0 } });

    let specialWomenPlus = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "specialWomen" } },
      { $group: { _id: null, count: { $sum: "$plusAmount" } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.specialWomenPlus": specialWomenPlus[0]?.count ? specialWomenPlus[0].count : 0 } });

  } else {
    let oldMenPlus = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "oldMen" } },
      { $group: { _id: null, count: { $sum: "$plusAmount" } } }
    ]);
    /*   console.log("oldMenPlus");
      console.log(oldMenPlus);  */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.oldMenPlus": oldMenPlus[0]?.count ? oldMenPlus[0].count : 0 } });

    let oldWomenPlus = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "oldWomen" } },
      { $group: { _id: null, count: { $sum: "$plusAmount" } } }
    ]);
    /*     console.log("oldWomenPlus");
        console.log(oldWomenPlus);  */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.oldWomenPlus": oldWomenPlus[0]?.count ? oldWomenPlus[0].count : 0 } });

    let yangMenPlus = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "yangMen" } },
      { $group: { _id: null, count: { $sum: "$plusAmount" } } }
    ]);
    /*     console.log("yangMenPlus");
        console.log(yangMenPlus);  */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.yangMenPlus": yangMenPlus[0]?.count ? yangMenPlus[0].count : 0 } });

    let yangWomenPlus = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "yangWomen" } },
      { $group: { _id: null, count: { $sum: "$plusAmount" } } }
    ]);
    /*     console.log("yangWomenPlus");
        console.log(yangWomenPlus);  */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.yangWomenPlus": yangWomenPlus[0]?.count ? yangWomenPlus[0].count : 0 } });

  }

  let amount = await Easter.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.amount": amount[0].count } });

  console.log("amount Easter");
  console.log(amount);

  if (house.noAddress) {
    let specialMen = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "specialMen" } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.specialMen": specialMen[0]?.count ? specialMen[0].count : 0 } });

    let specialWomen = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "specialWomen" } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.specialWomen": specialWomen[0]?.count ? specialWomen[0].count : 0 } });

  } else {
    let oldMen = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "oldMen" } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    /*   console.log("oldMen");
      console.log(oldMen);  */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.oldMen": oldMen[0]?.count ? oldMen[0].count : 0 } });

    let oldWomen = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "oldWomen" } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    /*     console.log("oldWomen");
        console.log(oldWomen);  */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.oldWomen": oldWomen[0]?.count ? oldWomen[0].count : 0 } });

    let yangMen = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "yangMen" } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    /*     console.log("yangMen");
        console.log(yangMen);  */
    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.yangMen": yangMen[0]?.count ? yangMen[0].count : 0 } });

    let yangWomen = await Easter.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, category: "yangWomen" } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    /*     console.log("yangWomen");
        console.log(yangWomen); */

    await House.updateOne({ _id: house._id }, { $set: { "statistic.easter.yangWomen": yangWomen[0]?.count ? yangWomen[0].count : 0 } });


  }

}

async function createCloneCelebratorEaster(celebrator) {

  let cloneFullDayBirthday = `${celebrator.dateBirthday > 9
    ? celebrator.dateBirthday
    : "0" + celebrator.dateBirthday}.${celebrator.monthBirthday > 9
      ? celebrator.monthBirthday
      : "0" + celebrator.monthBirthday}${celebrator.yearBirthday > 0 ? "." + celebrator.yearBirthday : ""}`;

  let cloneCategory = '';
  let cloneOldest = false;

  if (celebrator["noAddress"]) {
    if (celebrator.gender == "Female") {
      cloneCategory = "specialWomen";
    }
    if (celebrator.gender == "Male") {
      cloneCategory = "specialMen";
    }

  } else {
    if (celebrator.yearBirthday < 1942 && celebrator.yearBirthday > 0) {
      cloneOldest = true;
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
      cloneCategory = "oldWomen";
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
      cloneCategory = "oldMen";
    }
    if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
      if (celebrator.gender == "Female") {
        cloneCategory = "yangWomen";
      }
      if (celebrator.gender == "Male") {
        cloneCategory = "yangMen";
      }
    }
  }

  let cloneCelebrator = {
    seniorId: celebrator._id,
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
    holyday: 'Пасха 2025',
    fullData: celebrator.nursingHome +
      celebrator.lastName +
      celebrator.firstName +
      celebrator.patronymic +
      celebrator.dateBirthday +
      celebrator.monthBirthday +
      celebrator.yearBirthday,
    noName: false,
    dateOfSignedConsent: celebrator.dateOfSignedConsent,
  };
  //console.log("special - " + celebrator["specialComment"]);
  //console.log("fullday - " + celebrator.fullDayBirthday);
  //console.log(celebrator);
  return cloneCelebrator;


}

////////////VETERANS//////////////////////////// 

// Create VETERANS list API 
router.post("/veterans/create", checkAuth, async (req, res) => {
  try {
    const houses = req.body.list;
    console.log("0- inside Create list API");
    let result = await findAllVeteransCelebrators(houses);
    // let result = await countAmount();

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


async function findAllVeteransCelebrators(houses) {

  //throw new Error("Something bad happened");
  let result = [];
  console.log("1- inside findAllMonthCelebrators newList");

  /*   let listHouses = await House.find({ isDisabled: false, isActive: true });
    let namesOfUpdatedNursingHome = [];
    for (let home of listHouses) {
      if (home.nursingHome != 'РЖЕВ' && home.noAddress == false) {
        const senior = await Senior.findOne({ nursingHome: home.nursingHome, isDisabled: false, isRestricted: false, dateExit: null, dateOfSignedConsent: { $ne: null } });
        if (senior) {
          namesOfUpdatedNursingHome.push(senior.nursingHome);
        }
      }
    } */
  /*   let listHouses = await House.find({ isDisabled: false, isActive: true });
    let namesOfUpdatedNursingHome0 = [];
    for (let home of listHouses) {
      const senior = await May9.findOne({ nursingHome: home.nursingHome, dateOfSignedConsent: null });
      if (senior) {
        namesOfUpdatedNursingHome0.push(senior.nursingHome);
      }
    }
  
    let listHouses2 = await House.find({ isDisabled: false, isActive: true, nursingHome: { $nin: namesOfUpdatedNursingHome0 } });
    let namesOfUpdatedNursingHome = [];
    for (let home of listHouses2) {
      //const senior = await Senior.findOne({ nursingHome: home.nursingHome, isDisabled: false, isRestricted: false, dateExit: null, dateOfSignedConsent: { $ne: null } });
      //   if (senior) {
      namesOfUpdatedNursingHome.push(home.nursingHome);
      //   }
    }
   */


  //let namesOfUpdatedNursingHome = [];
  /*   for (let home of houses) {
      namesOfUpdatedNursingHome.push(home.nursingHome);
    }
    console.log(namesOfUpdatedNursingHome);
   */

  /*   let seniors = await May9.find({});
    for (let celebrator of seniors) {
      if (celebrator["noAddress"]) {
        if (celebrator.gender == "Female") {
          cloneCategory = "specialWomen";
        }
        if (celebrator.gender == "Male") {
          cloneCategory = "specialMen";
        }
  
      } else {
        if (celebrator.yearBirthday < 1960 && celebrator.gender == "Female") {
          cloneCategory = "oldWomen";
        }
        if (celebrator.yearBirthday < 1960 && celebrator.gender == "Male") {
          cloneCategory = "oldMen";
        }
        if (celebrator.yearBirthday > 1959 || !celebrator.yearBirthday) {
          if (celebrator.gender == "Female") {
            cloneCategory = "yangWomen";
          }
          if (celebrator.gender == "Male") {
            cloneCategory = "yangMen";
          }
        }
      }
      await May9.updateOne({ _id: celebrator._id }, { $set: {category: cloneCategory,} });
    } */

  const namesOfUpdatedNursingHome = ['ШИПУНОВО_БОА'];//, 'АНИСИМОВО', 'НОВЫЙ_ЕГОРЛЫК', 'МАЙСКОЕ', 'ПАРФИНО', 'МАКСИМОВКА', 'ЧАПАЕВСК', 'КРЕСТЬЯНКА', 'БАКШЕЕВО'

  let listVeteran = await Senior.find(
    {
      isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome }, veteran: { $ne: "" }, dateOfSignedConsent: { $ne: null }
    }
  );

  // let listChild =[];
  let listChild = await Senior.find(
    {
      gender: 'Female', isDisabled: false, dateExit: null, isRestricted: false, nursingHome: { $in: namesOfUpdatedNursingHome }, child: { $ne: "" }, dateOfSignedConsent: { $ne: null }
    }
  );

  let listOthers = await Senior.find(
    {
      isDisabled: false, dateExit: null, isRestricted: false, noAddress: false, nursingHome: { $in: namesOfUpdatedNursingHome }, child: "", veteran: "", dateOfSignedConsent: null
    }
  );

  let list = listVeteran.concat(listChild);
  list = list.concat(listOthers);


  console.log(list.length);

  if (list.length == 0) return "Не найдены поздравляющие, соответствующие запросу.";
  console.log("2- seniors" + list.length);


  let updatedCelebrators = [];
  for (let celebrator of list) {


    let cloneCelebrator = await createCloneVeteransCelebrator(celebrator);



    if (cloneCelebrator.veteran != "") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.veterans.veteranPlus0": 1 } });
    }
    if (cloneCelebrator.child != "") {
      await House.updateOne({ nursingHome: cloneCelebrator.nursingHome }, { $inc: { "statistic.veterans.childPlus0": 1 } });
    }


    updatedCelebrators.push(cloneCelebrator);
  }

  await House.updateMany({ nursingHome: { $in: namesOfUpdatedNursingHome } }, { $inc: { "statistic.veterans.time": 1 } });

  //console.log(list);
  //console.log("celebrator");
  //console.log("I am here");
  let newList = await checkDoubles(updatedCelebrators);

  //console.log("cloneCelebrator");
  //console.log(cloneCelebrator);
  for (let house of namesOfUpdatedNursingHome) {
    let amount = await Senior.aggregate([
      { $match: { nursingHome: house, dateExit: null, isRestricted: false, yearBirthday: { $gt: 0, $lt: 1946 } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    console.log(house);
    console.log(amount[0]?.count);

    let veteran = await Senior.aggregate([
      { $match: { nursingHome: house, dateExit: null, isRestricted: false, veteran: { $ne: "" } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    console.log(veteran[0]?.count);

    let child = await Senior.aggregate([
      { $match: { nursingHome: house, dateExit: null, isRestricted: false, child: { $ne: "" } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    console.log(child[0]?.count);

    let find = await House.findOne({ nursingHome: house });
    console.log(find.nursingHome);
    let update = await House.updateOne(
      { nursingHome: house },
      {
        $set: {
          "statistic.veterans.amount": amount[0]?.count ? amount[0].count : 0,
          "statistic.veterans.veteran": veteran[0]?.count ? veteran[0].count : 0,
          "statistic.veterans.child": child[0]?.count ? child[0].count : 0,
        }
      });
  }

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
async function createCloneVeteransCelebrator(celebrator) {

  if (celebrator["noAddress"]) {
    if (celebrator.gender == "Female") {
      cloneCategory = "specialWomen";
    }
    if (celebrator.gender == "Male") {
      cloneCategory = "specialMen";
    }

  } else {
    /*     if (celebrator.yearBirthday < 1942 && celebrator.yearBirthday > 0) {
          cloneOldest = true;
        } */
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Female") {
      cloneCategory = "oldWomen";
    }
    if (celebrator.yearBirthday < 1959 && celebrator.gender == "Male") {
      cloneCategory = "oldMen";
    }
    if (celebrator.yearBirthday > 1958 || !celebrator.yearBirthday) {
      if (celebrator.gender == "Female") {
        cloneCategory = "yangWomen";
      }
      if (celebrator.gender == "Male") {
        cloneCategory = "yangMen";
      }
    }
  }

  let cloneCelebrator = {
    seniorId: celebrator._id,
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
    holyday: '9 мая 2025',
    fullData: celebrator.nursingHome +
      celebrator.lastName +
      celebrator.firstName +
      celebrator.patronymic +
      celebrator.dateBirthday +
      celebrator.monthBirthday +
      celebrator.yearBirthday,
    dateOfSignedConsent: celebrator.dateOfSignedConsent,
    category: cloneCategory,
  };

  console.log(cloneCelebrator.seniorId);
  return cloneCelebrator;


}



//////////////////////////////////////////////////////////////////////////// check VETERANS doubles
router.post("/veterans/check-doubles", checkAuth, async (req, res) => {
  try {

    console.log("0- check NY doubles" + req.body.nursingHome);
    let result = await findAllVeteransDoubles(req.body.nursingHome);
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

async function findAllVeteransDoubles(house) {
  let fullHouse = await May9.find({ nursingHome: house, absent: false }, { fullData: 1, seniorId: 1, plusAmount: 1 });
  let fullDataHouse = [];
  /*   console.log("fullHouse");
    console.log(fullHouse); */
  for (let item of fullHouse) {
    fullDataHouse.push(item.seniorId);
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
    let someHouses = fullHouse.filter(item => item.seniorId == senior);
    console.log("someHouses");
    console.log(someHouses);
    let plusAmount = 0;
    for (let senior of someHouses) {
      plusAmount = plusAmount + senior.plusAmount;
    }
    for (let i = 0; i < someHouses.length; i++) {
      if (i == 0) {
        await May9.updateOne({ _id: someHouses[i]._id }, { $set: { plusAmount: plusAmount } })
      } else {
        await May9.deleteOne({ _id: someHouses[i]._id });
      }
    }
  }
  console.log("All duplicates");
  console.log(duplicates.length.toString());
  return duplicates.length.toString();


}



// check VETERANS fullness
router.post("/veterans/check-fullness", checkAuth, async (req, res) => {
  try {

    console.log("0- check NY fullness " + req.body.nursingHome);

    /*    let housesSet = new Set();
       const celebratorsMay9 = await May9.find({ absent: false });
       for (let celebrator of celebratorsMay9) {
         housesSet.add(celebrator.nursingHome);
       }
       let houses = Array.from(housesSet); */

    let houses = await House.find({ isDisabled: false, isActive: true, isReleased: false });

    // let houses = ["РЖЕВ"];

    for (let house of houses) {
      await checkAllVeteransFullness(house.nursingHome);
      //await restoreVeteransStatistic(house);
    }

    const newListResponse = new BaseResponse(200, "Query Successful", true);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});



async function checkAllVeteransFullness(house) {

  await findAllVeteransDoubles(house);

  let seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house, $or: [{ veteran: { $ne: "" } }, { child: { $ne: "" } }] });
  let fullHouse = await May9.find({ nursingHome: house, absent: false, $or: [{ veteran: { $ne: "" } }, { child: { $ne: "" } }] }, { seniorId: 1, veteran: 1, child: 1 }); //

  /*   let seniors = await Senior.find({ isDisabled: false, dateExit: null, isRestricted: false, nursingHome: house, child: {$ne:""} });
    let fullHouse = await May9.find({ nursingHome: house, absent: false, child: {$ne:""} }, { fullData: 1, seniorId: 1 }); //
  
   */
  console.log("seniors " + seniors.length);
  console.log("fullHouse " + fullHouse.length);
  let amount = 0;
  for (let senior of seniors) {

    let seniorIndex = fullHouse.findIndex(item => item.seniorId == senior._id);
    //console.log("seniorIndex " + seniorIndex);
    if (seniorIndex == -1) {
      amount++;
      let celebrator = await createCloneVeteransCelebrator(senior);
      let newCelebrator = await May9.create(celebrator);
      console.log("added");
      console.log(newCelebrator.fullData);
    } else {
      console.log("vet+child");
      console.log(fullHouse[seniorIndex].veteran);
      console.log(senior.veteran);
      console.log(fullHouse[seniorIndex].child);
      console.log(senior.child);

      if (fullHouse[seniorIndex].veteran != senior.veteran || fullHouse[seniorIndex].child != senior.child) {
        await May9.updateOne({ _id: fullHouse[seniorIndex]._id }, { $set: { veteran: senior.veteran, child: senior.child } })
        console.log('changed ' + fullHouse[seniorIndex]._id);
      }
    }
  }
  console.log("All added");
  console.log(amount);

  fullHouse = await May9.find({ nursingHome: house, absent: false, $or: [{ veteran: { $ne: "" } }, { child: { $ne: "" } }] }, { seniorId: 1 });
  //fullHouse = await May9.find({ nursingHome: house, absent: false, child: {$ne:""} }, { fullData: 1, seniorId: 1 });

  let count = 0;
  for (let celebrator of fullHouse) {
    let celebratorIndex = seniors.findIndex(item => item._id == celebrator.seniorId);
    if (celebratorIndex == -1) {

      await May9.updateOne({ seniorId: celebrator.seniorId }, { $set: { absent: true } });
      count++;
      console.log("deleted");
      console.log(celebrator.fullData);

    }
  }
  console.log("All deleted");
  console.log(count);

  await findAllVeteransDoubles(house);
  //await restoreVeteransStatistic(house);

  return { amountAdded: amount, amountDeleted: count };


}

async function restoreVeteransStatistic(activeHouse) {
  console.log("activeHouse");
  console.log(activeHouse);

  let house = await House.findOne({ nursingHome: activeHouse });
  /*       console.log("house");
        console.log(house); */


  /*   for (let house of houses) {
 
   */

  for (let i = 0; i < 6; i++) {
    let plus = await May9.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: i, veteran: { $ne: "" } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { "statistic.veterans.['veteranPlus' + i]": plus[0]?.count ? plus[0].count : 0 } });

  }

  for (let i = 0; i < 3; i++) {
    let plus = await May9.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: i, child: { $ne: "" } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { "statistic.veterans.['childPlus' + i]": plus[0]?.count ? plus[0].count : 0 } });
  }

  let veteranPlus = await May9.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, veteran: { $ne: "" } } },
    { $group: { _id: null, count: { $sum: "$plusAmount" } } }
  ]);
  await House.updateOne({ _id: house._id }, { $set: { "statistic.veterans.veteranPlus": veteranPlus[0]?.count ? veteranPlus[0].count : 0 } });

  let childPlus = await May9.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, child: { $ne: "" } } },
    { $group: { _id: null, count: { $sum: "$plusAmount" } } }
  ]);
  await House.updateOne({ _id: house._id }, { $set: { "statistic.veterans.childPlus": childPlus[0]?.count ? childPlus[0].count : 0 } });


  let amount = await May9.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  await House.updateOne({ _id: house._id }, { $set: { "statistic.veterans.amount": amount[0].count } });

  console.log("amount 9May");
  console.log(amount);


  let veteran = await May9.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, veteran: { $ne: "" } } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  await House.updateOne({ _id: house._id }, { $set: { "statistic.veterans.veteran": veteran[0]?.count ? veteran[0].count : 0 } });

  let child = await May9.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, child: { $ne: "" } } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  await House.updateOne({ _id: house._id }, { $set: { "statistic.veterans.child": child[0]?.count ? child[0].count : 0 } });



  /*   } */

  /*   } */
}


///////statistic

router.get("/statistic", checkAuth, async (req, res) => {
  try {
    // await seniorsVolunteers();
    // await quarta();

    let statistic = [
      {
        name: "ВСЕГО ПОЗДРАВЛЯЕМЫХ",
        amount1: 0, //ДР ноября 2025
        // amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        //  amount5: 0, //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        //   amount5: '-', //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "из них жители ПНИ",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        //   amount5: 0, //Пасха 2025          
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны из ПНИ",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        //   amount5: '-', //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "ПОЗДРАВЛЕНО 4 и более раз",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        //  amount5: 0, //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "из них жителей ПНИ поздравлено 4 и более раз",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        // amount5: 0, //Пасха 2025
        // amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны из ПНИ",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "ПОЗДРАВЛЕНО 3 раза",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        // amount5: 0, //Пасха 2025
        // amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "из них жителей ПНИ поздравлено 3 раза",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        // amount5: 0, //Пасха 2025
        //amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны из ПНИ",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "ПОЗДРАВЛЕНО 2 раза",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        //  amount5: 0, //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "из них жителей ПНИ поздравлено 2 раза",
        amount1: 0, //ДР ноября 2025
        // amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        // amount5: 0, //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны из ПНИ",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "ПОЗДРАВЛЕНО 1 раз",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        //  amount5: 0, //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "из них жителей ПНИ поздравлено 1 раз",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        // amount5: 0, //Пасха 2025
        // amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны из ПНИ",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "НЕ ПОЗДРАВЛЕНО ни разу",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        //  amount5: 0, //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },
      {
        name: "из них жителей ПНИ не поздравлено ни разу",
        amount1: 0, //ДР ноября 2025
        //amount2: 0, //8 марта 2025
        amount3: 0, //ДР декабря 2025
        amount4: 0, //ДР января 2026
        //  amount5: 0, //Пасха 2025
        //  amount6: 0, //9 мая 2025
        amount7: 0, //Новый год 2026
      },
      {
        name: "в т.ч. ветеранов и детей войны из ПНИ",
        amount1: '-', //ДР ноября 2025
        // amount2: -, //8 марта 2025
        amount3: '-', //ДР декабря 2025
        amount4: '-', //ДР января 2026
        amount5: '-', //Пасха 2025
        amount6: 0, //9 мая 2025
        amount7: '-', //Новый год 2026
      },

    ]

    const holidays = [ListBefore, March8, List, ListNext, Easter, May9, NewYear];//

    for (let i = 0; i < holidays.length; i++) {
      if (i != 1 && i != 4 && i != 5) { //1 - March8, 4 - Easter, 5 - May9
        statistic[0]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false });
        statistic[2]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, noAddress: true });
        statistic[4]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, plusAmount: { $gte: 4 } });
        statistic[6]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, noAddress: true, plusAmount: { $gte: 4 } });
        statistic[8]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, plusAmount: 3 });
        statistic[10]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, noAddress: true, plusAmount: 3 });
        statistic[12]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, plusAmount: 2 });
        statistic[14]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, noAddress: true, plusAmount: 2 });
        statistic[16]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, plusAmount: 1 });
        statistic[18]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, noAddress: true, plusAmount: 1 });
        statistic[20]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, plusAmount: 0 });
        statistic[22]['amount' + (i + 1)] = await holidays[i].countDocuments({ absent: false, noAddress: true, plusAmount: 0 });
      }
    }
    /* 
        statistic[1]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], });
        statistic[3]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: true });
        statistic[5]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], plusAmount: { $gte: 4 } });
        statistic[7]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: true, plusAmount: { $gte: 4 } });
        statistic[9]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], plusAmount: 3 });
        statistic[11]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: true, plusAmount: 3 });
        statistic[13]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], plusAmount: 2 });
        statistic[15]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: true, plusAmount: 2 });
        statistic[17]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], plusAmount: 1 });
        statistic[19]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: true, plusAmount: 1 });
        statistic[21]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], plusAmount: 0 });
        statistic[23]['amount6'] = await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: true, plusAmount: 0 });
     */


    /*     statistic[2].amount2 = 10667;
        statistic[4].amount2 = 0;
        statistic[6].amount2 = 0;
        statistic[8].amount2 = 0;
        statistic[10].amount2 = 0; */

    //  statistic[0].amount6 = 25745 + 620;

    //Навигаторы взяли 30000+1500+2500= 34000


    /*     statistic[20].amount6 = statistic[20].amount6 - await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 0 });
        statistic[21].amount6 = statistic[21].amount6 - await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 0 });
        statistic[16]['amount6'] = statistic[16]['amount6'] - await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 1 }) + await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 0 })-8525+5457-146+9078;
        statistic[17]['amount6'] = statistic[17]['amount6'] - await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 1 }) + await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 0 });
        statistic[12]['amount6'] = statistic[12]['amount6'] - await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 2 }) + await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 1 })+8525;
        statistic[13]['amount6'] = statistic[13]['amount6'] - await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 2 }) + await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 1 });
        statistic[8]['amount6'] = statistic[8]['amount6'] - await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 3 }) + await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 2 });
        statistic[9]['amount6'] = statistic[9]['amount6'] - await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 3 }) + await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 2 });
        statistic[4]['amount6'] = statistic[4]['amount6'] - await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 4 }) + await May9.countDocuments({ absent: false, noAddress: false, plusAmount: 3 });
        statistic[5]['amount6'] = statistic[5]['amount6'] - await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 4 }) + await May9.countDocuments({ absent: false, $or: [{ child: { $ne: "" } }, { veteran: { $ne: "" } }], noAddress: false, plusAmount: 3 });
    
     */
    console.log('statistic');
    console.log(statistic);

    statistic = statistic.filter(item => item.name != 'в т.ч. ветеранов и детей войны' && item.name != 'в т.ч. ветеранов и детей войны из ПНИ');

    const newListResponse = new BaseResponse(200, "Query Successful", statistic);
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


/* async function seniorsVolunteers() {
  let orders = await Order.find({ isDisabled: false, "li" });
} */

async function quarta() {
  let orders = await Order.find({
    isDisabled: false, isOverdue: false, isReturned: false,
    dateOfOrder: { $gt: new Date("2025-03-31"), $lt: new Date("2025-07-01") },
    $or: [{ "holiday": 'Дни рождения апреля 2025' },
    { "holiday": 'Дни рождения мая 2025' }, { "holiday": 'Дни рождения ноября 2025' },
    { "holiday": '9 мая 2025' }, { "holiday": 'Пасха 2025' },]
  });
  let celebrators = [];
  let regions = [];
  let houses = [];
  let amount = 0;
  for (let order of orders) {
    for (let item of order.lineItems) {
      for (let celebrator of item.celebrators) {
        celebrators.push(celebrator.lastName + celebrator.firstName + celebrator.patronymic + celebrator.nursingHome + celebrator.fullDayBirthday);
        houses.push(celebrator.nursingHome);
        regions.push(celebrator.region);
      }
    }
    amount = amount + order.amount;
  }

  let c = new Set(celebrators);
  let h = new Set(houses);
  let r = new Set(regions);
  console.log("celebrators");
  console.log(c.size);
  console.log("houses");
  console.log(h.size);
  console.log("regions");
  console.log(r);
  console.log(r.size);
  console.log("amount");
  console.log(amount);
}


///report

router.get("/report/:userName", checkAuth, async (req, res) => {
  try {
    const userName = req.params.userName;
    let orderAmount = await Order.countDocuments({ userName: userName, isDisabled: false, dateOfOrder: { $gt: new Date("2025-10-31"), $lt: new Date("2025-12-01") } });
    let celebratorsAmount = await Order.aggregate(
      [
        {
          $match: { userName: userName, isDisabled: false, dateOfOrder: { $gt: new Date("2025-10-31"), $lt: new Date("2025-12-01") } }
        },
        {
          $group: { _id: null, sum_val: { $sum: "$amount" } }
        }
      ]
    );
    celebratorsAmount = celebratorsAmount[0].sum_val;
    /* 
        console.log('celebratorsAmount');
        console.log(celebratorsAmount[0]); */

    const newListResponse = new BaseResponse(200, "Query Successful", { orderAmount: orderAmount, celebratorsAmount: celebratorsAmount });
    res.json(newListResponse.toObject());

  } catch (e) {
    console.log(e);
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


module.exports = router;
