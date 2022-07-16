/*
============================================

; API for seniors operations
;===========================================
*/

const express = require("express");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Senior = require("../models/senior");
const House = require("../models/house");
const Month = require("../models/month");
const List = require("../models/list");
const Order = require("../models/order");

// Find all seniors
router.get("/", async (req, res) => {
  try {
    Senior.find({})
      .where("isDisabled")
      .equals(false)
      .exec(function (err, seniors) {
        if (err) {
          const readSeniorsMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
          res.status(500).send(readSeniorsMongodbErrorResponse.toObject());
        } else {
          const readSeniorsResponse = new BaseResponse(200, "Query Successful", seniors);
          res.json(readSeniorsResponse.toObject());
        }
      });
  } catch (e) {
    const readSeniorCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(readSeniorCatchErrorResponse.toObject());
  }
});


// Find all seniors from one home
router.get("/one-home/:nursingHome", async (req, res) => {
  try {
    Senior.find({nursingHome: req.params.nursingHome})
      .where("isDisabled")
      .equals(false)
      .exec(function (err, seniors) {
        if (err) {
          const readSeniorsMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
          res.status(500).send(readSeniorsMongodbErrorResponse.toObject());
        } else {
          const readSeniorsResponse = new BaseResponse(200, "Query Successful", seniors);
          res.json(readSeniorsResponse.toObject());
        }
      });
  } catch (e) {
    const readSeniorCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(readSeniorCatchErrorResponse.toObject());
  }
});

/**
 * API to find senior by ID (OK)
 */

router.get("/:id", async (req, res) => {
  try {
    Senior.findOne({ _id: req.params.id }, function (err, senior) {
      console.log(req.params.id);
      if (err) {
        console.log(err);
        const readSeniorMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readSeniorMongodbErrorResponse.toObject());
      } else {
        if (!senior) {
          console.log(err);
          const invalidSeniorIdErrorResponse = new BaseResponse(400, "Invalid senior ID", err);
          res.status(400).send(invalidSeniorIdErrorResponse.toObject());
        } else {
          const readSeniorResponse = new BaseResponse(200, "Query successful", senior);
          console.log(senior);
          res.json(readSeniorResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readSeniorCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readSeniorCatchErrorResponse.toObject());
  }
});


//Create Senior API

router.post("/", async (req, res) => {
  console.log("step1");
  try {
    console.log("step2");
    let house = await House.findOne({ nursingHome: req.body.nursingHome, });
    const newSenior = {
      region: req.body.region,
      nursingHome: req.body.nursingHome,
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      patronymic: req.body.patronymic,
      isRestricted: req.body.isRestricted,
      dateBirthday: req.body.dateBirthday,
      monthBirthday: req.body.monthBirthday,
      yearBirthday: req.body.yearBirthday,
      gender: req.body.gender,
      comment1: req.body.comment1,
      comment2: req.body.comment2,
      linkPhoto: req.body.linkPhoto,
      nameDay: req.body.nameDay,
      dateNameDay: req.body.dateNameDay,
      monthNameDay: req.body.monthNameDay,
      isDisabled: false,
      noAddress: house.noAddress,
      isReleased: house.isReleased,
      dateEnter: house.dateLastUpdate,
      dateExit: '',

    };
    Senior.create(newSenior, function (err, senior) {
      console.log("step4");
      if (err) {
        console.log("step5");
        console.log(err);
        const newSeniorMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(newSeniorMongodbErrorResponse.toObject());
      } else {
        console.log("step6");
        console.log(newSenior);
        const newSeniorResponse = new BaseResponse(200, "Query Successful", senior);
        res.json(newSeniorResponse.toObject());
      }
    });
  } catch (e) {
    console.log("step3");
    const newSeniorCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(newSeniorCatchErrorResponse.toObject());
  }
});

/**
 * API to delete all
 */
router.delete("/", async (req, res) => {
  try {

    console.log("delete3");
    Senior.deleteMany({}, function (err, seniors) {
      if (err) {
        console.log(err);
        const deleteHouseMongoErrorResponse = new BaseResponse("500", "MongoDB Server Error", err);
        res.status(500).send(deleteHouseMongoErrorResponse.toObject());
      } else {
        console.log(seniors);
        res.json(seniors);

      }

    });
  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse("500", "MongoDB server error", e);
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
});

// Delete senior API
router.delete("/:id", async (req, res) => {
  try {
    Senior.findOne({ _id: req.params.id }, function (err, senior) {
      if (err) {
        console.log(err);
        const deleteSeniorMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        return res.status(500).send(deleteSeniorMongodbErrorResponse.toObject());
      } else {
        // If statement for senior not found in DB
        if (!senior) {
          console.log("Senior not found");
          const deleteSeniorResponse = new BaseResponse(404, "Senior not found");
          return res.status(404).send(deleteSeniorResponse.toObject());
        } else {
          console.log(senior);
          senior.set({
            isDisabled: true,
          });
          senior.save(function (err, savedSenior) {
            // If statement
            if (err) {
              console.log(err);
              const deleteSeniorMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
              return res.status(500).send(deleteSeniorMongodbErrorResponse.toObject());
            } else {
              console.log(savedSenior);
              // This will return the deleted senior
              const deleteSeniorResponse = new BaseResponse(200, "Query successful", senior);
              res.json(deleteSeniorResponse.toObject());
            }
          });
        }
      }
    });
  } catch (e) {
    console.log(e);
    const deleteSeniorCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    return res.status(500).send(deleteSeniorCatchErrorResponse.toObject());
  }
});


// Update senior API

router.put("/update/:id", async (req, res) => {
  try {
    let senior = await Senior.findOne({ _id: req.params.id });
    let house = await House.findOne({ nursingHome: req.body.nursingHome, });
    senior.set({
      region: req.body.region,
      nursingHome: req.body.nursingHome,
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      patronymic: req.body.patronymic,
      isRestricted: req.body.isRestricted,
      dateBirthday: req.body.dateBirthday,
      monthBirthday: req.body.monthBirthday,
      yearBirthday: req.body.yearBirthday,
      gender: req.body.gender,
      comment1: req.body.comment1,
      comment2: req.body.comment2,
      linkPhoto: req.body.linkPhoto,
      nameDay: req.body.nameDay,
      dateNameDay: req.body.dateNameDay,
      monthNameDay: req.body.monthNameDay,
      noAddress: house.noAddress,
      isReleased: house.isReleased,
      //dateEnter: req.body.dateEnter,
      //dateExit: req.body.dateExit, 
    });
    senior.save(function (err, updatedSenior) {
      if (err) {
        const saveSeniorInvalidIdResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(saveSeniorInvalidIdResponse.toObject());
      } else {
        const updateSeniorResponse = new BaseResponse(200, "Query Successful", updatedSenior);
        res.json(updateSeniorResponse.toObject());
      }
    });
  }
  catch (e) {
    const updateSeniorCatchErrorResponse = new BaseResponse(500, "Internal Server Error", updatedSenior);
    res.json(updateSeniorCatchErrorResponse.toObject());
  }
});


// Create many seniors  API
router.post("/add-many/", async (req, res) => {
  try {
    console.log("start API");
    let seniors = req.body.seniors;
    for (let senior of seniors) {
      let house = await House.findOne({ nursingHome: senior.nursingHome });
      senior.isRestricted = senior.isRestricted == "false" ? false : true;
      senior.dateBirthday = +senior.dateBirthday;
      senior.monthBirthday = +senior.monthBirthday;
      senior.yearBirthday = +senior.yearBirthday;
      senior.dateNameDay = senior.dateNameDay ? (+senior.dateNameDay) : 0;
      senior.monthNameDay = senior.monthNameDay ? (+senior.monthNameDay) : 0;
      senior.isDisabled = false;
      senior.noAddress = house.noAddress;
      senior.isReleased = house.isReleased;
      senior.dateEnter = house.dateLastUpdate;
      senior.dateExit = '';
      //console.log(senior.dateExit);
      if (!senior.lastName) senior.lastName = '';
      if (!senior.patronymic) senior.patronymic = '';
      if (!senior.comment1) senior.comment1 = '';
      if (!senior.comment2) senior.comment2 = '';
      if (!senior.linkPhoto) senior.linkPhoto = '';
      if (!senior.nameDay) senior.nameDay = '';
      if (senior.gender == 'ж') senior.gender = 'Female';
      if (senior.gender == 'м') senior.gender = 'Male';
    }

    const result = await Senior.insertMany(seniors, { ordered: false });

    //console.log(result);
    const createSeniorResponse = new BaseResponse(200, "Query Successful", result);
    return res.status(200).send(createSeniorResponse.toObject());

  } catch (error) {
    // Server error goes here
    console.log(error);
    const createSeniorCatchErrorResponse = new BaseResponse(500, "Internal server error", error.message);
    res.status(500).send(createSeniorCatchErrorResponse.toObject());
  }
});

// Compare seniors lists API

router.put("/compare-lists/", async (req, res) => {
  try {
    console.log("start compare-lists API");
    let newList = req.body.seniors;
    let house = await House.findOne({ nursingHome: req.body.house });
    let oldList = await Senior.find({ nursingHome: req.body.house, isDisabled: false, dateExit: null });

    newList.sort(
      (prev, next) => {
        if (prev.lastName < next.lastName) return -1;
        if (prev.lastName > next.lastName) return 1;
      }
    );
    oldList.sort(
      (prev, next) => {
        if (prev.lastName < next.lastName) return -1;
        if (prev.lastName > next.lastName) return 1;
      }
    );


    for (let senior of newList) {
      senior.isRestricted = senior.isRestricted == "false" ? false : true;
      senior.dateBirthday = +senior.dateBirthday;
      senior.monthBirthday = +senior.monthBirthday;
      senior.yearBirthday = +senior.yearBirthday;
      senior.dateNameDay = senior.dateNameDay ? (+senior.dateNameDay) : 0;
      senior.monthNameDay = senior.monthNameDay ? (+senior.monthNameDay) : 0;
      senior.isDisabled = false;
      senior.noAddress = house.noAddress;
      senior.isReleased = house.isReleased;
      //senior.dateEnter = house.dateLastUpdate;
      senior.dateExit = null;
      //console.log(senior.dateExit);
      if (!senior.lastName) senior.lastName = '';
      if (!senior.patronymic) senior.patronymic = '';
      if (!senior.comment1) senior.comment1 = '';
      if (!senior.comment2) senior.comment2 = '';
      if (!senior.linkPhoto) senior.linkPhoto = '';
      if (!senior.nameDay) senior.nameDay = '';
      if (senior.gender == 'ж') senior.gender = 'Female';
      if (senior.gender == 'м') senior.gender = 'Male';
    }

    let arrived = [];
    let absents = [];
    let changed = [];
    let doubtful = [];
    let keyNew = 0;
    let keyChanged = 0;
    for (let newSenior of newList) {
      let index = oldList.findIndex(item => (item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday) == (newSenior.lastName + newSenior.firstName + newSenior.patronymic + newSenior.dateBirthday + newSenior.monthBirthday + newSenior.yearBirthday));
      console.log("index");
      console.log(index);
      if (index == -1) {
        newSenior.key = keyNew;
        keyNew++;
        arrived.push(newSenior);
      } else {
        if (
          newSenior.isRestricted != oldList[index].isRestricted ||
          newSenior.dateNameDay != oldList[index].dateNameDay ||
          newSenior.monthNameDay != oldList[index].monthNameDay ||
          newSenior.isDisabled != oldList[index].isDisabled ||
          newSenior.noAddress != oldList[index].noAddress ||
          newSenior.isReleased != oldList[index].isReleased ||
          //senior.dateEnter = house.dateLastUpdate;
          //newSenior.dateExit != oldList[index].dateExit ||
          newSenior.comment1 != oldList[index].comment1 ||
          newSenior.comment2 != oldList[index].comment2 ||
          newSenior.linkPhoto != oldList[index].linkPhoto ||
          newSenior.nameDay != oldList[index].nameDay ||
          newSenior.gender != oldList[index].gender
        ) {
          let difference = {
            key: keyChanged,
            new: newSenior,
            old: oldList[index]
          }
          keyChanged++;
          changed.push(difference);
        }
      }

    }
    let keyOld = 0;
    for (let oldSenior of oldList) {
      if (newList.findIndex(item => (item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday) == (oldSenior.lastName + oldSenior.firstName + oldSenior.patronymic + oldSenior.dateBirthday + oldSenior.monthBirthday + oldSenior.yearBirthday)) == -1) {
        oldSenior.key = keyOld;
        keyOld++;
        absents.push(oldSenior);
      }
    }
    let flag = false;
    let keyDoubtful = 0;
    for (let oldSenior of absents) {

      let index = arrived.findIndex(item => item.lastName == oldSenior.lastName);
      if (index != -1) {
        flag = true;
      } else {
        index = arrived.findIndex(item => item.lastName + item.firstName == oldSenior.lastName + oldSenior.firstName);
        if (index != -1) {
          flag = true;
        } else {
          index = arrived.findIndex(item => item.lastName + item.patronymic == oldSenior.lastName + oldSenior.patronymic);
          if (index != -1) {
            flag = true;
          }
        }
      }
      if (flag) {
        let strange = {
          key: keyDoubtful,
          new: arrived[index],
          old: oldSenior
        }
        keyDoubtful++;
        doubtful.push(strange);
        arrived.splice(index, 1);
        absents.splice(oldSenior.key);
      }
    }

    const result = {
      arrived: arrived,
      absents: absents,
      changed: changed,
      doubtful: doubtful
    }

    //const result = await Senior.insertMany(seniors, { ordered: false });

    //console.log(result);
    const createSeniorResponse = new BaseResponse(200, "Query Successful", result);
    return res.status(200).send(createSeniorResponse.toObject());

  } catch (error) {
    // Server error goes here
    console.log(error);
    const createSeniorCatchErrorResponse = new BaseResponse(500, "Internal server error", error.message);
    res.status(500).send(createSeniorCatchErrorResponse.toObject());
  }
});

// Update seniors list  API
router.put("/update-lists/", async (req, res) => {
  try {
    console.log("start API update-lists");
    let absents = req.body.absents;
    let arrived = req.body.arrived;
    let changed = req.body.changed;
    let date = req.body.date;
    let house = req.body.house;
    let monthFull = await Month.findOne({ isActive: true });
    let month = monthFull.number;

    console.log("absents");
    console.log(absents);
    console.log("arrived");
    console.log(arrived);
    console.log("changed");
    console.log(changed);
    console.log("date");
    console.log(date);
    console.log("house");
    console.log(house);
    console.log("month");
    console.log(month);

    for (let senior of absents) {
      /*       console.log("senior");
            console.log(senior); */
      let resAbsent = await Senior.updateOne({ _id: senior._id }, { $set: { dateExit: date } }, { upsert: false });
      console.log("resAbsent");
      console.log(resAbsent);
      if (senior.monthBirthday == month || senior.monthNameDay == month) {
        let foundSenior = await List.findOne({ fullData: (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday) });
        console.log("foundSenior");
        console.log(foundSenior);
        let resList = await List.updateOne({ _id: foundSenior._id }, { $set: { absent: true } }, { upsert: false });
        console.log("resList");
        console.log(resList);
        let orderToChange = await Order.findOne({ "lineItems.celebrators.celebrator_id": foundSenior._id, isDisabled: false });
        console.log("orderToChange");
        console.log(orderToChange);

        if (orderToChange) {
          for (let line of orderToChange.lineItems) {
            console.log("foundSenior._id.toString()");
            console.log(foundSenior._id.toString());
            console.log("line.celebrators[0].celebrator_id");
            console.log(line.celebrators[0].celebrator_id);
            let index = line.celebrators.findIndex(item =>  item.celebrator_id == foundSenior._id.toString());
            console.log("index");
            console.log(index);
            console.log("line.celebrators");
            console.log(line.celebrators);
            line.celebrators[index].absentComment = "ВЫБЫЛ(А), НЕ ПОЗДРАВЛЯТЬ!";

          }
          let resReplacement = await Order.replaceOne({ _id: orderToChange._id }, orderToChange);
          console.log("resReplacement");
          console.log(resReplacement);
        }
      }
    }

    for (let senior of arrived) {
      senior.dateEnter = date;

    }
    let resArrived = await Senior.insertMany(arrived, { ordered: false });

    console.log("resArrived");
    console.log(resArrived);

    for (let senior of changed) {

      let resChanged = await Senior.updateOne({ _id: senior.id }, {
        $set: {
          region: senior.region,
          nursingHome: senior.nursingHome,
          lastName: senior.lastName,
          firstName: senior.firstName,
          patronymic: senior.patronymic,
          isRestricted: senior.isRestricted,
          dateBirthday: senior.dateBirthday,
          monthBirthday: senior.monthBirthday,
          yearBirthday: senior.yearBirthday,
          gender: senior.gender,
          comment1: senior.comment1,
          comment2: senior.comment2,
          linkPhoto: senior.linkPhoto,
          nameDay: senior.nameDay,
          dateNameDay: senior.dateNameDay,
          monthNameDay: senior.monthNameDay,
          noAddress: senior.noAddress,
          isReleased: senior.isReleased,
          //dateEnter: senior.dateEnter,
          //dateExit: senior.dateExit,  
        }
      }, { upsert: false });
      console.log("resChanged");
      console.log(resChanged);

    }
    let updatedHouse = await House.findOne({ nursingHome: house });
    let lastDate = updatedHouse.dateLastUpdate;
    date = new Date(date);
    let dateLastUpdateClone = String(date.getDate()).padStart(2, '0') +
      '.' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '.' +
      date.getFullYear();

    if (updatedHouse.dateLastUpdateClone != dateLastUpdateClone) {
      await House.updateOne({ nursingHome: house }, { $push: { datesOfUpdates: lastDate } });
      await House.updateOne({ nursingHome: house }, { $set: { dateLastUpdate: date, dateLastUpdateClone: dateLastUpdateClone } });
    }


    //console.log(result);
    const createSeniorResponse = new BaseResponse(200, "Query Successful", "Список обновлен.");
    return res.status(200).send(createSeniorResponse.toObject());

  } catch (error) {
    // Server error goes here
    console.log(error);
    const createSeniorCatchErrorResponse = new BaseResponse(500, "Internal server error", error.message);
    res.status(500).send(createSeniorCatchErrorResponse.toObject());
  }
});





/* API to delete from DB senior
router.delete("/:id", async (req, res) => {
  try {
    Senior.findByIdAndDelete(
      { _id: req.params.id },
      function (err, senior) {
        if (err) {
          console.log(err);
          res.status(501).send({
            message: `MongoDB Exception: ${err}`,
          });
        } else {
          console.log(senior);
          res.json(senior);
        }
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: `Server Exception: ${e.message}`,
    });
  }
}); */



module.exports = router;