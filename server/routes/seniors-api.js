/*
============================================

; API for seniors operations
;===========================================
*/

const express = require("express");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Senior = require("../models/senior");

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

/**
 * API to delete
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

// Update senior API

router.put("/update/:id", async (req, res) => {
  try {
    Senior.findOne({ _id: req.params.id }, function (err, senior) {
      if (err) {
        const updateSeniorMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(updateSeniorMongodbErrorResponse.toObject());
      } else {
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
          noAddress: req.body.noAddress,
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
    });
  } catch (e) {
    const updateSeniorCatchErrorResponse = new BaseResponse(500, "Internal Server Error", updatedSenior);
    res.json(updateSeniorCatchErrorResponse.toObject());
  }
});

// Correct  senior API

router.put("/correct/:id", async (req, res) => {
  try {
    Senior.findOne({ _id: req.params.id}, function (err, senior) {
      if (err) {
        const updateSeniorMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(updateSeniorMongodbErrorResponse.toObject());
      } else {
          senior.set({
            region: senior.region,
            nursingHome: senior.nursingHome,
            lastName: senior.lastName,
            firstName: senior.firstName,
            patronymic: senior.patronymic,
            isRestricted: Boolean(senior.isRestricted),
            dateBirthday: +senior.dateBirthday ,
            monthBirthday:  +senior.monthBirthday,
            yearBirthday:  +senior.yearBirthday,
            gender: senior.gender,
            comment1: senior.comment1,
            comment2: senior.comment2,
            linkPhoto: senior.linkPhoto,
            noAddress: Boolean(senior.noAddress),
            isDisabled: Boolean(senior.isDisabled),
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
      });
    } catch (e) {
    const updateSeniorCatchErrorResponse = new BaseResponse(500, "Internal Server Error", updatedSenior);
    res.json(updateSeniorCatchErrorResponse.toObject());
  }
});

// Update all senior API

/* router.put("/correct/all", async (req, res) => {
  try {
    Senior.find({}, function (err, seniors) {
      if (err) {
        const updateSeniorMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(updateSeniorMongodbErrorResponse.toObject());
      } else {
        console.log(seniors);



        for (let senior of seniors) {
          console.log(senior);
          senior.set({
            region: senior.region,
            nursingHome: senior.nursingHome,
            lastName: senior.lastName,
            firstName: senior.firstName,
            patronymic: senior.patronymic,
            isRestricted: Boolean(senior.isRestricted),
            dateBirthday: +senior.dateBirthday ,
            monthBirthday:  +senior.monthBirthday,
            yearBirthday:  +senior.yearBirthday,
            gender: senior.gender,
            comment1: senior.comment1,
            comment2: senior.comment2,
            linkPhoto: senior.linkPhoto,
            nameDay: senior.nameDay,
           dateNameDay: +senior.dateNameDay,
            monthNameDay: +senior.monthNameDay,
            noAddress: Boolean(senior.noAddress),
            isDisabled: Boolean(senior.isDisabled),
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



      }
    });
  } catch (e) {
    const updateSeniorCatchErrorResponse = new BaseResponse(500, "Internal Server Error", updatedSenior);
    res.json(updateSeniorCatchErrorResponse.toObject());
  }
});
 */



module.exports = router;