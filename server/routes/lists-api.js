/*
============================================

; APIs for the list
;===========================================
*/

const express = require("express");
const List = require("../models/list");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Senior = require("../models/senior");
const Period = require("../models/period");
//const User = require("../models/user");




// Create list API 
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
  let activeRegions = await List.find({});
  let filledRegions = [];
  for (region of activeRegions) {
    filledRegions.push(region.region);
  }

  let list = await Senior.find({ "monthBirthday": month, "isDisabled": false, isRestricted: false, region: {$nin: filledRegions}});
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
      holyday: 'ДР июля 2022',
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

//Find all lists API
router.get("/", async (req, res) => {
  try {
    //List.find({region: "НОВОСИБИРСКАЯ"}, function (err, lists) {
    List.find({}, function (err, lists) {
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

// Find by ID
router.get("/:listId", async (req, res) => {
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
});


module.exports = router;
