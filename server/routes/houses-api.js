/*
============================================
; APIs 
;===========================================
*/

const express = require("express");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const House = require("../models/house");

// Create  API
router.post("/", async (req, res) => {
  let status = 200;
  
  try {
    console.log("1");
    console.log(req.body);
    console.log("2");
    const newHouse = {
      nursingHome: req.body.nursingHome,
      region: req.body.region,
      address: req.body.address,
      infoComment: req.body.infoComment,
      adminComment: req.body.adminComment,
      isRestricted: req.body.isRestricted,
      isActive: req.body.isActive,
      dateStart: req.body.dateStart,
      dateStartClone: req.body.dateStartClone,
      nameContact: req.body.nameContact,
      contact: req.body.contact,
      isDisabled: req.body.isDisabled
    };
    House.create(newHouse, function (err, house) {
      // If statement for an error with Mongo
      if (err) {
        console.log(err);
        status = 500;
        const createHouseMongodbErrorResponse = new BaseResponse(status, "Internal server error", err);
        return res.status(status).send(createHouseMongodbErrorResponse.toObject());
      } else {
        //  new house
        console.log(house);
        const createHouseResponse = new BaseResponse(status, "Query Successful", house);
        return res.status(status).send(createHouseResponse.toObject());
      }
    });
  } catch (error) {
    // Server error goes here
    console.log(error);
    status = 500;
    const createHouseCatchErrorResponse = new BaseResponse(status, "Internal server error", error.message);
    res.status(status).send(createHouseCatchErrorResponse.toObject());
  }
});
// End CreateAPI

// Find  by ID
router.get("/:id", async (req, res) => {
  try {
    House.findOne({ _id: req.params.id }, function (err, house) {
      if (err) {
        const findHouseError = new BaseResponse(500, "MongoDB Server Error", err);
        res.status(500).send(findHouseError.toObject());
      } else {
        console.log(house);
        const findByIdResponse = new BaseResponse(200, "Query Successful", house);
        res.json(findByIdResponse.toObject());
      }
    });
  } catch (e) {
    const findByIdCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(findByIdCatchErrorResponse.toObject());
  }
});

// Find  by name
router.get("/name/:name", async (req, res) => {
  try {
    House.findOne({ nursingHome: req.params.name }, function (err, house) {
      if (err) {
        const findHouseError = new BaseResponse(500, "MongoDB Server Error", err);
        res.status(500).send(findHouseError.toObject());
      } else {
        console.log(house);
        const findByIdResponse = new BaseResponse(200, "Query Successful", house);
        res.json(findByIdResponse.toObject());
      }
    });
  } catch (e) {
    const findByIdCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(findByIdCatchErrorResponse.toObject());
  }
});

// Find all 
router.get("/", async (req, res) => {
  try {
    House.find({} /* )
      .where("isDisabled")
      .equals(false)
      .exec(  */ , function (err, houses) {
        if (err) {
          console.log(err);
          res.status(500).send({
            message: "Server error: " + err.message,
          });
        } else {
          console.log(houses);
          const findAllResponse = new BaseResponse(200, "Query successful", houses);
          res.json(findAllResponse.toObject());
        }
      });
  } catch (e) {
    console.log(e);
    const findAllCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(findAllCatchErrorResponse.toObject());
  }
});

/**
 * API to update  (OK)
 */

router.put("/:id", async (req, res) => {
  try {
    House.findOne({ _id: req.params.id }, function (err, house) {
      if (err) {
        console.log(err);
        const updateHouseMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(updateHouseMongodbErrorResponse.toObject());
      } else {
        if (!house) {
          const response = `Invalid ID`;
          console.log(response);
          res.send(response);
        } else {
          console.log(house);
          house.set({
            nursingHome: req.body.nursingHome,
            region: req.body.region,
            address: req.body.address,
            infoComment: req.body.infoComment,
            adminComment: req.body.adminComment,
            isRestricted: req.body.isRestricted,
            isActive: req.body.isActive,
            dateStart: req.body.dateStart,
            dateStartClone: req.body.dateStartClone,
            nameContact: req.body.nameContact,
            contact: req.body.contact,
            isDisabled: req.body.isDisabled
          });

          house.save(function (err, updatedHouse) {
            if (err) {
              console.log(err);
              const saveHouseInvalidIdResponse = new BaseResponse(500, "Internal server error", err);
              res.status(500).send(saveHouseInvalidIdResponse.toObject);
            } else {
              console.log(updatedHouse);
              const updateHouseResponse = new BaseResponse(200, "Query successful", updatedHouse);
              res.json(updateHouseResponse.toObject());
            }
          });
        }
      }
    });
  } catch (e) {
    console.log(e);
    const updateHouseCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(updateHouseCatchErrorResponse.toObject());
  }
});

/**
 * API to delete
 */
router.delete("/:id", async (req, res) => {
  try {
    House.findOne({ _id: req.params.id }, function (err, house) {
      if (err) {
        console.log(err);
        const deleteHouseMongoErrorResponse = new BaseResponse("500", "MongoDB Server Error", err);
        res.status(500).send(deleteHouseMongoErrorResponse.toObject());
      } else {
        console.log(house);

        house.set({
          isDisabled: true,
        });
        house.save(function (err, savedHouse) {
          if (err) {
            console.log(err);
            const savedHouseMongodbErrorResponse = BaseResponse("500", "MongoDB server error", err);
            res.status(500).send(savedHouseMongodbErrorResponse.toObject());
          } else {
            console.log(savedHouse);
            const deleteHouseResponse = new BaseResponse("200", "House deleted", savedHouse);
            res.json(deleteHouseResponse.toObject());
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse("500", "MongoDB server error", err);
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
});

module.exports = router;
