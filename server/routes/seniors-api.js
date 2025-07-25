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
const ListNext = require("../models/list-next");
const ListBefore = require("../models/list-previous");
const Order = require("../models/order");
const NameDay = require("../models/name-day");
const checkAuth = require("../middleware/check-auth");
const NewYear = require("../models/new-year");

// Find all seniors
router.get("/", checkAuth, async (req, res) => {
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
router.get("/one-home/:nursingHome", checkAuth, async (req, res) => {
  try {
    Senior.find({ nursingHome: req.params.nursingHome })
      .where("isDisabled")
      .equals(false)
      .exec(function (err, seniors) {
        if (err) {
          const readSeniorsMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
          res.status(500).send(readSeniorsMongodbErrorResponse.toObject());
        } else {
          seniors.sort(
            (prev, next) => {
              if (prev.lastName < next.lastName) return -1;
              if (prev.lastName > next.lastName) return 1;
            });
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

router.get("/:id", checkAuth, async (req, res) => {
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

router.post("/", checkAuth, async (req, res) => {
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
      dateOfSignedConsent: req.body.dateOfSignedConsent,

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
router.delete("/", checkAuth, async (req, res) => {
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
router.delete("/:id", checkAuth, async (req, res) => {
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

router.put("/update/:id", checkAuth, async (req, res) => {
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
      dateOfSignedConsent: req.body.dateOfSignedConsent,
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
/* router.post("/add-many/", checkAuth, async (req, res) => {
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
      //senior.dateEnter = house.dateLastUpdate;
      senior.dateEnter = Date(11/3/2022);
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

 //console.log(seniors);


    const result = await Senior.insertMany(seniors, { ordered: false });
    //console.log(result);
    const month = await Month.findOne({ isActive: true });

    const celebrators = seniors.filter(item => item.monthBirthday == month.number);
    console.log(celebrators.length);

    const house = await House.findOne({nursingHome: seniors[0].nursingHome});

        if (celebrators.length > 0 && house.isActive == true) {
      let updatedCelebrators = [];
  for (let celebrator of celebrators) {

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
      holyday: 'ДР июня 2024',
      fullData: celebrator.nursingHome +
        celebrator.lastName +
        celebrator.firstName +
        celebrator.patronymic +
        celebrator.dateBirthday +
        celebrator.monthBirthday +
        celebrator.yearBirthday,
    };
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
      //await List.insertMany(celebrators, { ordered: false });
      console.log(finalList);
    }

    const createSeniorResponse = new BaseResponse(200, "Query Successful", result);
    return res.status(200).send(createSeniorResponse.toObject());

  } catch (error) {
    // Server error goes here
    console.log(error);
    const createSeniorCatchErrorResponse = new BaseResponse(500, "Internal server error", error.message);
    res.status(500).send(createSeniorCatchErrorResponse.toObject());
  }
}); */

// Compare seniors lists API

router.put("/compare-lists/", checkAuth, async (req, res) => {
  try {
    console.log("start compare-lists API");
    let newList = req.body.seniors;
    let house = await House.findOne({ nursingHome: req.body.house });
    let months = req.body.months;
    let oldList;
    if (months.length > 0) {
      oldList = await Senior.find({ nursingHome: req.body.house, isDisabled: false, dateExit: null, monthBirthday: { $in: months }, }); //, ,monthBirthday: 3,  monthBirthday : {$in: [2,3,4]}, comment1: "(ПСУ)",  monthBirthday:{$gt:3} , }
    } else {
      oldList = await Senior.find({ nursingHome: req.body.house, isDisabled: false, dateExit: null, }); //, ,monthBirthday: 3,  monthBirthday : {$in: [2,3,4]}, comment1: "(ПСУ)",  monthBirthday:{$gt:3} , }
    }

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
    /*     console.log("req.body.months");
        console.log(req.body.months);
        console.log("oldList");
        console.log(oldList); */

    for (let senior of newList) {
      /*       console.log("senior.dateOfSignedConsent");
            console.log(senior.dateOfSignedConsent); */

      //senior.isRestricted = senior.isRestricted == "false" ? false : true;
      senior.region = house.region;
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
      senior.dateOfSignedConsent = senior.dateOfSignedConsent ? new Date(senior.dateOfSignedConsent) : null;
      /*       console.log("senior.dateOfSignedConsent");
            console.log(senior.dateOfSignedConsent); */
      //console.log(senior.dateExit);
      if (!senior.lastName) senior.lastName = '';
      if (!senior.patronymic) senior.patronymic = '';
      if (!senior.comment1) senior.comment1 = '';
      if (!senior.comment2) senior.comment2 = '';
      if (!senior.veteran) senior.veteran = '';
      if (!senior.child) senior.child = '';
      if (!senior.linkPhoto) senior.linkPhoto = null;
      if (!senior.nameDay) senior.nameDay = '';
      // if (senior.gender == 'ж') senior.gender = 'Female';
      // if (senior.gender == 'м') senior.gender = 'Male';
    }

    let arrived = [];
    let absents = [];
    let changed = [];
    let doubtful = [];
    let key = 0;
    for (let newSenior of newList) {
      let index;
      if (newSenior.nursingHome == "ТАРХАНСКАЯ_ПОТЬМА" || house.nursingHome == "ВОЛГОГРАД_КРИВОРОЖСКАЯ") {
        index = oldList.findIndex(item => (item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday) == (newSenior.lastName + newSenior.firstName + newSenior.patronymic + newSenior.dateBirthday + newSenior.monthBirthday));
      } else if (newSenior.nursingHome == "ИСАКОГОРКА") {//СЛАВГОРОД  
        index = oldList.findIndex(item => (item.lastName + item.firstName + item.patronymic) == (newSenior.lastName + newSenior.firstName + newSenior.patronymic));

      } else {
        index = oldList.findIndex(item => (item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday) == (newSenior.lastName + newSenior.firstName + newSenior.patronymic + newSenior.dateBirthday + newSenior.monthBirthday + newSenior.yearBirthday));
      }
      // let index = oldList.findIndex(item => (item.lastName + item.firstName + item.patronymic) == (newSenior.lastName + newSenior.firstName + newSenior.patronymic));
      // console.log("index");
      // console.log(index);
      if (index == -1) {
        newSenior.key = key;
        key++;
        arrived.push(newSenior);
      } else {
        // await Senior.updateOne({_id: oldList[index]._id}, {$set: {comment1: newSenior.comment1}});
        /*        await Senior.updateOne({_id: oldList[index]._id}, {$set: {comment1: newSenior.comment1,
                dateBirthday: newSenior.dateBirthday,
                monthBirthday: newSenior.monthBirthday,
                yearBirthday: newSenior.yearBirthday,
                
        
              }}); */

        if (newSenior.comment1 != oldList[index].comment1 && oldList[index].comment1 == '') {
          await Senior.updateOne({ _id: oldList[index]._id }, { $set: { comment1: newSenior.comment1 } });
          oldList[index].comment1 = newSenior.comment1;
        }
        if (newSenior.comment2 != oldList[index].comment2 && oldList[index].comment2 == '') {
          await Senior.updateOne({ _id: oldList[index]._id }, { $set: { comment2: newSenior.comment2 } });
          oldList[index].comment2 = newSenior.comment2;
        }
        if (newSenior.comment1 != oldList[index].comment1 && newSenior.comment1 == '') {
          newSenior.comment1 = oldList[index].comment1;
        }
        if (newSenior.comment2 != oldList[index].comment2 && newSenior.comment2 == '') {
          newSenior.comment2 = oldList[index].comment2;
        }
        if (newSenior.dateOfSignedConsent != oldList[index].dateOfSignedConsent && !newSenior.dateOfSignedConsent) {
          newSenior.dateOfSignedConsent = oldList[index].dateOfSignedConsent;
        }
        if (house.nursingHome == "ПОБЕДА" || house.nursingHome == "РОСТОВ-НА-ДОНУ") {
          let comment1 = newSenior.comment1.replace(/\(/g, '');
          comment1 = comment1.replace(/\)/g, '');
          if (!oldList[index].comment1.includes(comment1)) {
            await Senior.updateOne({ _id: oldList[index]._id }, { $set: { comment1: newSenior.comment1 } });
          }
        }
        if (house.nursingHome == "ТАРХАНСКАЯ_ПОТЬМА" || house.nursingHome == "ВОЛГОГРАД_КРИВОРОЖСКАЯ") {
          if (oldList[index].yearBirthday != newSenior.yearBirthday && newSenior.yearBirthday == 0) {
            newSenior.yearBirthday = oldList[index].yearBirthday;
          }
        }
        if (house.nursingHome == "ИСАКОГОРКА") {//СЛАВГОРОД
          if (oldList[index].yearBirthday != newSenior.yearBirthday && oldList[index].yearBirthday == 0) {
            oldList[index].yearBirthday = newSenior.yearBirthday;
            await Senior.updateOne({ _id: oldList[index]._id }, { $set: { yearBirthday: newSenior.yearBirthday } });
          }
          if (oldList[index].monthBirthday != newSenior.monthBirthday && oldList[index].monthBirthday == 0) {
            oldList[index].monthBirthday = newSenior.monthBirthday;
            await Senior.updateOne({ _id: oldList[index]._id }, { $set: { monthBirthday: newSenior.monthBirthday } });
          }
          if (oldList[index].dateBirthday != newSenior.dateBirthday && oldList[index].dateBirthday == 0) {
            oldList[index].dateBirthday=newSenior.dateBirthday;
            await Senior.updateOne({ _id: oldList[index]._id }, { $set: { dateBirthday: newSenior.dateBirthday } });
          }
        }


        //replace all ё on е

        /*                let seniors = await Senior.find({ patronymic: /ё/ });
                        console.log(seniors);
                        await seniors.forEach(async (item) => {
                          const newValue = item.patronymic.replaceAll('ё', 'е');
                          await Senior.updateOne({ _id: item._id }, { $set: { patronymic: newValue } });
                          console.log(newValue);
                        })
                */

        /*         let errors = await Senior.find({
                  firstName: {
                    $in: [
                      'Ковалева',
                      'Зметная',
                      'Федорова',
                      'Переднева',
                      'Киселев',
                      'Шленкин',
                      'Ткачев',
                      'Мурачева',
                      'Четверкин',
                      'Цепалева',
                      'Аксенов',
                      'Федорова',
                      //'Богачева',
                      'Федорова',
                      'Березкин',
                      'Налетов',
                      'Королева',
                      'Ковалева',
                      'Корегин',
                      'Дегтярев',
                      'Королев',
                      'Карасев',
                      'Семенов',
                      'Золотарева',
                      'Ночевка',
                      'Те',
                      'Рулева',
                      'Ковалева',
                      'Серегин',
                      'Еремин',
                      'Силичев',
                      'Кузьмичева',
                      'Парфенов',
                      'Сергачев',
                      'Сычев',
                      'Артемов',
                      'Аксенов',
                      'Нефедов',
                      'Линев',
                      'Рулев',
                      'Шпилев',
                      'Семенов',
                      'Журавлев',
                      'Царев',
                      'Веревкин',
                      'Семенова',
                      'Тювелева',
                      'Шленкина',
                      'Чернышев',
                      'Швырева',
                      'Воробьева',
                      'Пономарев',
                      'Новоселов',
                      'Шерстнев',
                      'Толмачева',
                      'Коростелева',
                      'Еремин',
                      'Ковалева',
                      'Потемкин',
                      'Фомичева',
                      'Пельменев',
                      'Федорова',
                      'Соловьева',
                      'Королев',
                      'Королев',
                      'Федорова',
                    ]
                  }
                });
        
                console.log(errors.length);
        
                for (let item of errors) {
                  let orders = await Order.find({
                    "lineItems.celebrators.nursingHome": item.nursingHome,
                    "lineItems.celebrators.patronymic": item.patronymic,
                    "lineItems.celebrators.dateBirthday": item.dateBirthday,
                    "lineItems.celebrators.monthBirthday": item.monthBirthday,
                    "lineItems.celebrators.yearBirthday": item.yearBirthday,
                  });
                  console.log(item);
                  console.log(item.nursingHome, item.lastName, item.patronymic, item.dateBirthday, item.monthBirthday, item.yearBirthday);
                  let celebrator = '';
                  for (let order of orders) {
                    let list = order.lineItems.find(i => i.nursingHome == item.nursingHome);
                  //  console.log(list.celebrators);
                    celebrator = list.celebrators.find(j => j.patronymic == item.patronymic && j.dateBirthday == item.dateBirthday && j.monthBirthday == item.monthBirthday && j.yearBirthday == item.yearBirthday);
                    if (celebrator) {
                      await Senior.updateOne({ _id: item._id }, { $set: { firstName: celebrator.firstName } });
                      console.log(celebrator);
                      break;
                    }
                  }
                  console.log(item.lastName, item.patronymic, celebrator.lastName, celebrator.firstName, celebrator.patronymic);
                }
        
         */



        /*          if(oldList[index].firstName.includes('ё')){
                  console.log(oldList[index].firstName);
                  await Senior.updateOne({ _id: oldList[index]._id }, { $set: { firstName: oldList[index].firstName.replaceAll('ё', 'е') } });
                }
                if(oldList[index].lastName && oldList[index].lastName.includes('ё')){
                  console.log(oldList[index].lastName);
                  await Senior.updateOne({ _id: oldList[index]._id }, { $set: { lastName: oldList[index].lastName.replaceAll('ё', 'е') } });
                }
                if(oldList[index].patronymic && oldList[index].patronymic.includes('ё')){
                  console.log(oldList[index].patronymic);
                  await Senior.updateOne({ _id: oldList[index]._id }, { $set: { patronymic: oldList[index].patronymic.replaceAll('ё', 'е') } });
                }
         */

        if (
          // newSenior.isRestricted != oldList[index].isRestricted ||
          //  newSenior.dateNameDay != oldList[index].dateNameDay ||
          //  newSenior.monthNameDay != oldList[index].monthNameDay ||
          //  newSenior.isDisabled != oldList[index].isDisabled ||
          //  newSenior.noAddress != oldList[index].noAddress ||
          //  newSenior.isReleased != oldList[index].isReleased ||
          //senior.dateEnter = house.dateLastUpdate;
          //newSenior.dateExit != oldList[index].dateExit ||
          (newSenior.comment1 != oldList[index].comment1 && house.nursingHome != "ПОБЕДА") ||
          newSenior.comment2 != oldList[index].comment2 ||
          //newSenior.veteran != oldList[index].veteran ||
          //newSenior.child != oldList[index].child ||
          //newSenior.linkPhoto != oldList[index].linkPhoto ||
          //newSenior.nameDay != oldList[index].nameDay ||
          newSenior.gender != oldList[index].gender ||
          newSenior.dateOfSignedConsent != oldList[index].dateOfSignedConsent
        ) {
          let difference = {
            key: key,
            new: newSenior,
            old: oldList[index]
          }
          key++;
          changed.push(difference);
        }
      }

    }

    for (let oldSenior of oldList) {
      if (newList.findIndex(item => (item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday) == (oldSenior.lastName + oldSenior.firstName + oldSenior.patronymic + oldSenior.dateBirthday + oldSenior.monthBirthday + oldSenior.yearBirthday)) == -1) {
        // if (newList.findIndex(item => (item.lastName + item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday) == (oldSenior.lastName + oldSenior.firstName + oldSenior.patronymic + oldSenior.dateBirthday + oldSenior.monthBirthday + oldSenior.yearBirthday)) == -1) {
        oldSenior.key = key;
        key++;
        absents.push(oldSenior);
      }
    }
    /*     console.log("absents");
        console.log(absents.length);
        console.log("arrived");
        console.log(arrived.length);
        console.log("changed");
        console.log(changed.length);
        console.log("doubtful");
        console.log(doubtful.length);
     */
    let indexes = [];
    for (let oldSenior of absents) {
      let flag = false;

      let index = arrived.findIndex(item => item.firstName + item.patronymic + item.dateBirthday + item.monthBirthday + item.yearBirthday == oldSenior.firstName + oldSenior.patronymic + oldSenior.dateBirthday + oldSenior.monthBirthday + oldSenior.yearBirthday);
      if (index != -1) {
        flag = true;
      }


      index = arrived.findIndex(item => item.lastName + item.firstName == oldSenior.lastName + oldSenior.firstName);
      if (index != -1) {
        flag = true;
      } else {
        index = arrived.findIndex(item => item.lastName + item.patronymic == oldSenior.lastName + oldSenior.patronymic);
        if (index != -1) {
          flag = true;
        } else {
          index = arrived.findIndex(item => item.lastName + item.firstName + item.patronymic == oldSenior.lastName + oldSenior.firstName + oldSenior.patronymic);
          if (index != -1) {
            flag = true;
          } else {
            index = arrived.findIndex(item => item.firstName + item.patronymic == oldSenior.firstName + oldSenior.patronymic);
            if (index != -1) {
              flag = true;
            }
          }
        }
      }
      // console.log("index");
      //console.log(index);

      if (flag) {
        let strange = {
          key: key,
          new: arrived[index],
          old: oldSenior
        }

        doubtful.push(strange);
        arrived.splice(index, 1);
        //   console.log("oldSenior.key");
        // console.log(oldSenior.key);
        //console.log("index");
        // absents.forEach(item => )

        indexes.push(oldSenior.key);
        key++;
      }
    }
    /*     console.log("indexes");
        console.log(indexes); */

    for (let i of indexes) {
      let deleted = absents.splice(absents.findIndex(item => item.key == i), 1);
      /*       console.log("indexD");
            console.log(i); */
      //console.log("deleted");
      //console.log(deleted);
    }


    /*     console.log("absents");
        console.log(absents.length);
        console.log("arrived");
        console.log(arrived.length);
        console.log("changed");
        console.log(changed.length);
        console.log("doubtful");
        console.log(doubtful.length); */

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
router.put("/update-lists/", checkAuth, async (req, res) => {
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
      //let resAbsent = await Senior.updateOne({ _id: senior._id }, { $set: { isRestricted: true } }, { upsert: false });
      console.log("resAbsent");
      console.log(resAbsent);
      if (senior.monthBirthday == month || senior.monthBirthday == month + 1 || senior.monthBirthday == month - 1) {//
        let foundSenior;
        if (senior.monthBirthday == month) {
          foundSenior = await List.findOne({ fullData: (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday) });
        }
        if (senior.monthBirthday == month + 1) {//
          foundSenior = await ListNext.findOne({ fullData: (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday) });
        }
        if (senior.monthBirthday == month - 1) {//
          foundSenior = await ListBefore.findOne({ fullData: (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday) });
        }

        console.log("foundSenior");
        console.log(foundSenior);
        let resList;
        if (foundSenior) {
          if (senior.monthBirthday == month) {
            resList = await List.updateOne({ _id: foundSenior._id }, { $set: { absent: true } }, { upsert: false });
          }
          if (senior.monthBirthday == month + 1) {//
            resList = await ListNext.updateOne({ _id: foundSenior._id }, { $set: { absent: true } }, { upsert: false });
          }
          if (senior.monthBirthday == month - 1) {//
            resList = await ListBefore.updateOne({ _id: foundSenior._id }, { $set: { absent: true } }, { upsert: false });
          }

          console.log("resList");
          console.log(resList);
          let ordersToChange = await Order.find({ "lineItems.celebrators.celebrator_id": foundSenior._id, isDisabled: false });
          console.log("ordersToChange");
          console.log(ordersToChange);
          if (ordersToChange.length > 0) {
            for (let orderToChange of ordersToChange) {
              console.log("orderToChange");
              console.log(orderToChange);
              for (let line of orderToChange.lineItems) {
                console.log("foundSenior._id.toString()");
                console.log(foundSenior._id.toString());
                console.log("line.celebrators[0].celebrator_id");
                console.log(line.celebrators[0].celebrator_id);
                let index = line.celebrators.findIndex(item => item.celebrator_id == foundSenior._id.toString());
                console.log("index");
                console.log(index);
                if (index != -1) {
                  console.log("line.celebrators");
                  console.log(line.celebrators);
                  line.celebrators[index].absentComment = "ВЫБЫЛ(А), НЕ ПОЗДРАВЛЯТЬ!";
                }

              }
              let resReplacement = await Order.replaceOne({ _id: orderToChange._id }, orderToChange);
              console.log("resReplacement");
              console.log(resReplacement);
            }

          }
        }
      }

      // await NewYear.updateOne({ seniorId: senior._id }, { $set: { absent: true } }, { upsert: false });

      /*       if (senior.monthNameDay == month) {
             let foundSenior = await NameDay.findOne({ fullData: (senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday) });
             console.log("foundSenior");
            console.log(foundSenior);
              let resList = await NameDay.updateOne({ _id: foundSenior._id }, { $set: { absent: true } }, { upsert: false });
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
                  let index = line.celebrators.findIndex(item => item.celebrator_id == foundSenior._id.toString());
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
            } */
    }

    for (let senior of arrived) {
      senior.dateEnter = date;

    }
    console.log("arrived 745");
    console.log(arrived);
    let resArrived = await Senior.insertMany(arrived, { ordered: false });

    console.log("resArrived 747");
    console.log(resArrived);

    for (let celebrator of arrived) {
      if (celebrator.monthBirthday == month || celebrator.monthBirthday == month + 1 || celebrator.monthBirthday == month - 1) {//
        let cloneSpecialComment;
        if (celebrator.monthBirthday == 12) {//month || celebrator.monthBirthday == month - 1
          cloneSpecialComment = await specialComment(
            2024 - celebrator["yearBirthday"]
          );
        } else {
          cloneSpecialComment = await specialComment(
            2025 - celebrator["yearBirthday"]
          );
        }

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
        if (celebrator.monthBirthday == 7) {
          holiday = 'Дни рождения июля 2025';
        }
        if (celebrator.monthBirthday == 8) {
          holiday = 'Дни рождения августа 2025';
        }
        if (celebrator.monthBirthday == 9) {
          holiday = 'Дни рождения сентября 2025';
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
          veteran: celebrator.veteran,
          child: celebrator.child,
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
        if (celebrator.monthBirthday == 7) {
          await ListBefore.create(cloneCelebrator);
        }
        if (celebrator.monthBirthday == 8) {
          await List.create(cloneCelebrator);
        }
        if (celebrator.monthBirthday == 9) {
          await ListNext.create(cloneCelebrator);
        }
      }

      //  let senior = await Senior.findOne(celebrator)
      //   console.log("newCelebrator");
      //   console.log(newCelebrator.seniorId); 
      //  let newCelebrator = await createCloneCelebratorNY(senior);



      //  await NewYear.create(newCelebrator);

    }

    for (let senior of changed) {
      console.log("changedSenior");
      console.log(senior.dateOfSignedConsent);

      let resChanged = await Senior.updateOne({ _id: senior.id }, {
        $set: {
          //seniorId: senior._id,
          region: senior.region,
          nursingHome: senior.nursingHome,
          lastName: senior.lastName,
          firstName: senior.firstName,
          patronymic: senior.patronymic,
          isRestricted: senior.isRestricted,//false,
          dateBirthday: senior.dateBirthday,
          monthBirthday: senior.monthBirthday,
          yearBirthday: senior.yearBirthday,
          gender: senior.gender,
          comment1: senior.comment1,
          comment2: senior.comment2,
          veteran: senior.veteran,
          child: senior.child,
          linkPhoto: senior.linkPhoto,
          nameDay: senior.nameDay,
          dateNameDay: senior.dateNameDay,
          monthNameDay: senior.monthNameDay,
          noAddress: senior.noAddress,
          isReleased: senior.isReleased,
          dateOfSignedConsent: senior.dateOfSignedConsent,
          //dateEnter: senior.dateEnter,
          //dateExit: senior.dateExit,  
        }
      }, { upsert: false });
      console.log("resChanged");
      console.log(resChanged);

      if (senior.dateOfSignedConsent != null) {
        await NewYear.updateOne({ seniorId: senior.id }, { dateOfSignedConsent: senior.dateOfSignedConsent });
        const fullData = senior.nursingHome + senior.lastName + senior.firstName + senior.patronymic + senior.dateBirthday + senior.monthBirthday + senior.yearBirthday;
        await List.updateOne({ fullData: fullData }, { dateOfSignedConsent: senior.dateOfSignedConsent });
        await ListBefore.updateOne({ fullData: fullData }, { dateOfSignedConsent: senior.dateOfSignedConsent });
        await ListNext.updateOne({ fullData: fullData }, { dateOfSignedConsent: senior.dateOfSignedConsent });
      }
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

async function createCloneCelebratorNY(celebrator) {
  console.log(celebrator);

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
    holyday: 'Новый год 2025',
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





/* API to delete from DB senior
router.delete("/:id", checkAuth, async (req, res) => {
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