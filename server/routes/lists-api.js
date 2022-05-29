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
//const User = require("../models/user");

// Create list API 
router.post("/", async (req, res) => {
  try {
    const newList = {

      key: req.body.key,
      period: req.body.period,
      active: req.body.active,
      celebrators: req.body.celebrators,
    };
    List.create(newList, function (err, list) {
      if (err) {
        console.log(err);
        const newListMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(newListMongodbErrorResponse.toObject());
      } else {
        console.log(newList);
        const newListResponse = new BaseResponse(200, "Query Successful", list);
        res.json(newListResponse.toObject());
      }
    });
  } catch (e) {
    const newListCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

/**
 * API to delete
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

/* router.get("/form", async (req, res) => {
  try {
    Senior.find({ "monthBirthday": req.query.month, "dateBirthday": { "$gte": req.query.date1, "$lte": req.query.date2 }, "isRestricted": false, "isDisabled": false}, function (err, lists) {
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
}); */

/**
 * API to update a list (OK)
 */

/* router.put("/:id", async (req, res) => {
  try {
    List.findOne({ _id: req.params.id }, function (err, list) {
      if (err) {
        console.log(err);
        const updateListMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(updateListMongodbErrorResponse.toObject());
      } else {
        if (!list) {
          const response = `Invalid ID`;
          console.log(response);
          res.send(response);
        } else {
          List.findOne({ text: req.body.text }, function (err, existedList) {
            if (err) {
              console.log(err);
              const updateListMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
              res.status(500).send(updateListMongodbErrorResponse.toObject());
            } else {
              if (existedList && (existedList._id != req.params.id)) {
                console.log(existedList._id + " != " + req.params.id);
                const response = `List: ${req.body.text} already exists`;
                console.log(response);
                const listAlreadyExistsErrorResponse = new BaseResponse(400, response, list);
                res.status(400).send(listAlreadyExistsErrorResponse.toObject());
              } else {
                console.log(list);
                list.set({
                  text: req.body.text,
                });
                list.save(function (err, updatedList) {
                  if (err) {
                    console.log(err);
                    const saveListInvalidIdResponse = new BaseResponse(500, "Internal server error", err);
                    res.status(500).send(saveListInvalidIdResponse.toObject);
                  } else {
                    console.log(updatedList);
                    const updateListResponse = new BaseResponse(200, "Query successful", updatedList);
                    res.json(updateListResponse.toObject());
                  }
                });
              }
            }
          });
        }
      }
    });
  } catch (e) {
    console.log(e);
    const updateListCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(updateListCatchErrorResponse.toObject());
  }
}); */

//Find all lists API
router.get("/", async (req, res) => {
  try {
    await List.find({}, function (err, lists) {
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

//Check active list API
router.get("/get/active/", async (req, res) => {
  try {
    List.findOne({active : true}, function (err, list) {
      let result;
      if (err) {
        console.log(err);
        const findAllListsMongodbErrorResponse = new BaseResponse("500", "internal server error", err);
        res.status(500).send(findAllListsMongodbErrorResponse.toObject());
      } else {
        console.log(list);
        if (list.celebrators.filter(item => item.plusAmount > 2).length == list.celebrators.length) { result = true;} else {
           result = false;
        }


        const findAllListsResponse = new BaseResponse("200", "Query successful", result);
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
    List.findOne({ _id: req.params.listId }, function (err, list) {
      if (err) {
        const findListByIdMongodbErrorResponse = new BaseResponse("500", "Internal Server Error", err);
        res.status(500).send(findListByIdMongodbErrorResponse.toObject());
      } else {
        const findListByIdResponse = new BaseResponse("200", "Query Successful", list);
        res.json(findListByIdResponse.toObject());
      }
    });
  } catch (e) {
    const findListByIdCatchErrorResponse = new BaseResponse("500", "Internal Server Error", e.message);
    res.status(500).send(findListByIdCatchErrorResponse.toObject());
  }
});

// Find celebrator by ID
router.patch("/check/:celebratorId", async (req, res) => {
  try {
    List.findOne({ "celebrators.celebrator_id": req.params.celebratorId }, function (err, list) {
      if (err) {
        const findListByIdMongodbErrorResponse = new BaseResponse("500", "Internal Server Error", err);
        res.status(500).send(findListByIdMongodbErrorResponse.toObject());
      } else {
        let index = list.celebrators.findIndex(
          (item) => item.celebrator_id == req.params.celebratorId
        );
        console.log(index);
        console.log(list.celebrators[index]);
        let newAmount = list.celebrators[index].plusAmount + req.body.amount;
        list.celebrators[index].plusAmount = newAmount;



        list.set({
          celebrators: list.celebrators
        });

        list.save(function (err, updatedList) {
          if (err) {
            console.log(err);
            const saveListInvalidIdResponse = new BaseResponse(500, "Internal server error", err);
            res.status(500).send(saveListInvalidIdResponse.toObject);
          } else {
            console.log(updatedList);
            const updateListResponse = new BaseResponse(200, "Query successful", updatedList);
            res.json(updateListResponse.toObject());
          }
        });

      }
    });
  } catch (e) {
    const findListByIdCatchErrorResponse = new BaseResponse("500", "Internal Server Error", e.message);
    res.status(500).send(findListByIdCatchErrorResponse.toObject());
  }
});

// Change active list
router.patch("/change/", async (req, res) => {
  try {
    List.findOne({ active : true}, function (err, list) {
      if (err) {
        const findListByIdMongodbErrorResponse = new BaseResponse("500", "Internal Server Error", err);
        res.status(500).send(findListByIdMongodbErrorResponse.toObject());
      } else {

        list.set({
          active: req.body.active
        });

        list.save(function (err, updatedList) {
          if (err) {
            console.log(err);
            const saveListInvalidIdResponse = new BaseResponse(500, "Internal server error", err);
            res.status(500).send(saveListInvalidIdResponse.toObject);
          } else {
            console.log(updatedList);
            const updateListResponse = new BaseResponse(200, "Query successful", updatedList.key);
            res.json(updateListResponse.toObject());
          }
        });

      }
    });
  } catch (e) {
    const findListByIdCatchErrorResponse = new BaseResponse("500", "Internal Server Error", e.message);
    res.status(500).send(findListByIdCatchErrorResponse.toObject());
  }
});

// Change active list
router.patch("/change/:key", async (req, res) => {
  try {
    List.findOne({ key : req.params.key}, function (err, list) {
      if (err) {
        const findListByIdMongodbErrorResponse = new BaseResponse("500", "Internal Server Error", err);
        res.status(500).send(findListByIdMongodbErrorResponse.toObject());
      } else {

        list.set({
          active: req.body.active
        });

        list.save(function (err, updatedList) {
          if (err) {
            console.log(err);
            const saveListInvalidIdResponse = new BaseResponse(500, "Internal server error", err);
            res.status(500).send(saveListInvalidIdResponse.toObject);
          } else {
            console.log(updatedList);
            const updateListResponse = new BaseResponse(200, "Query successful", updatedList.key);
            res.json(updateListResponse.toObject());
          }
        });

      }
    });
  } catch (e) {
    const findListByIdCatchErrorResponse = new BaseResponse("500", "Internal Server Error", e.message);
    res.status(500).send(findListByIdCatchErrorResponse.toObject());
  }
});

// update by ID
router.patch("/:id", async (req, res) => {
  try {
    await List.findOne({ _id: req.params.id }, function (err, list) {
      if (err) {
        console.log(err);
        const updateListMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(updateListMongodbErrorResponse.toObject());
      } else {
        if (!list) {
          const response = `Invalid ID`;
          console.log(response);
          res.send(response);
        } else {
          console.log(list);
          list.set({
            celebrators: req.body.celebrators
          });

          list.save(function (err, updatedList) {
            if (err) {
              console.log(err);
              const saveListInvalidIdResponse = new BaseResponse(500, "Internal server error", err);
              res.status(500).send(saveListInvalidIdResponse.toObject);
            } else {
              console.log(updatedList);
              const updateListResponse = new BaseResponse(200, "Query successful", updatedList);
              res.json(updateListResponse.toObject());
            }
          });
        }
      }
    });
  } catch (e) {
    console.log(e);
    const updateListCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(updateListCatchErrorResponse.toObject());
  }
});




//Create Senior API

router.post("/seniors", async (req, res) => {
  console.log("step1");
  try {
    console.log("step2");
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
      isDisabled: req.body.isDisabled,
      noAddress: req.body.noAddress,
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


module.exports = router;
