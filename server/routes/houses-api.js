/*
============================================
; APIs 
;===========================================
*/

const express = require("express");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const House = require("../models/house");
const NewYear = require("../models/new-year");
const checkAuth = require("../middleware/check-auth");
const Senior = require("../models/senior");

// Create  API
router.post("/", checkAuth, async (req, res) => {
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
      notes: req.body.notes,
      noAddress: req.body.noAddress,
      isActive: req.body.isActive,
      dateLastUpdate: req.body.dateLastUpdate,
      dateLastUpdateClone: req.body.dateLastUpdateClone,
      nameContact: req.body.nameContact,
      contact: req.body.contact,
      isDisabled: req.body.isDisabled,
      isReleased: req.body.isReleased,
      website: req.body.website,
      statistic: {
        newYear: {
          oldWomen: 0,
          oldMen: 0,
          yangMen: 0,
          yangWomen: 0,
          specialWomen: 0,
          specialMen: 0,
          amount: 0,
          time: 0,
          plus0: 0,
          plus1: 0,
          plus2: 0,
          plus3: 0,
          oldMenPlus: 0,
          oldWomenPlus: 0,
          yangMenPlus: 0,
          yangWomenPlus: 0,
          specialMenPlus: 0,
          specialWomenPlus: 0,
        },
        spring: {
          oldWomen: 0,
          oldMen: 0,
          yangMen: 0,
          yangWomen: 0,
          specialWomen: 0,
          specialMen: 0,
          amount: 0,
          time: 0,
          plus0: 0,
          plus1: 0,
          plus2: 0,
          plus3: 0,
          oldMenPlus: 0,
          oldWomenPlus: 0,
          yangMenPlus: 0,
          yangWomenPlus: 0,
          specialMenPlus: 0,
          specialWomenPlus: 0,
        },
        easter: {
          oldWomen: 0,
          oldMen: 0,
          yangMen: 0,
          yangWomen: 0,
          specialWomen: 0,
          specialMen: 0,
          amount: 0,
          time: 0,
          plus0: 0,
          plus1: 0,
          plus2: 0,
          plus3: 0,
          oldMenPlus: 0,
          oldWomenPlus: 0,
          yangMenPlus: 0,
          yangWomenPlus: 0,
          specialMenPlus: 0,
          specialWomenPlus: 0,
        },
        veterans: {
          veteran: 0,
          child: 0,          
          amount: 0,
          time: 0,
          veteranPlus0: 0,
          veteranPlus1: 0,
          veteranPlus2: 0,
          veteranPlus3: 0,
          veteranPlus4: 0,
          veteranPlus5: 0,
          childPlus0: 0,
          childPlus1: 0,
          childPlus3: 0,
          veteranPlus: 0,
          childPlus: 0,
          
        }
      }




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
router.get("/:id", checkAuth, async (req, res) => {
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
router.get("/name/:name", checkAuth, async (req, res) => {
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

// Find all houses needed to be updated
router.post("/email", checkAuth, async (req, res) => {
  try {
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    console.log("startDate");
    console.log(startDate);
    console.log("endDate");
    console.log(endDate);
    const houses = await House.find({ dateLastUpdate: { $gte: startDate, $lte: endDate }, isActive: true });
    console.log("houses");
    console.log(houses);
    const findAllResponse = new BaseResponse(200, "Query successful", houses);
    res.json(findAllResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(findAllCatchErrorResponse.toObject());
  }
});

// Find all 
router.get("/", checkAuth, async (req, res) => {
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
          //console.log(houses);
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

// Find all active 
router.get("/find/active", checkAuth, async (req, res) => {
  console.log("houses/find/active");
  try {
     let houses = await House.find({ isActive: true }).sort({ dateLastUpdate: -1, _id: 1 });
    // console.log(houses);

/*     let houses = await House.find({ isActive: true }, { nursingHome: 1, _id: 0 });

    for (let house of houses) {

      let amount = await Senior.aggregate([
        { $match: { nursingHome: house.nursingHome, dateExit: null, isRestricted: false, yearBirthday: { $gt: 0, $lt: 1946 } } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      console.log(house.nursingHome);
      console.log(amount[0]?.count);

      let veteran = await Senior.aggregate([
        { $match: { nursingHome: house.nursingHome, dateExit: null, isRestricted: false, veteran: { $ne: "" } } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);

      console.log(veteran[0]?.count);

      let child = await Senior.aggregate([
        { $match: { nursingHome: house.nursingHome, dateExit: null, isRestricted: false, child: { $ne: "" } } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      console.log(child[0]?.count);

      let find = await House.findOne({ nursingHome: house.nursingHome });
      console.log(find.nursingHome);
      let update = await House.updateOne(
        { nursingHome: house.nursingHome },
        {
          $set: {
            "statistic.veterans.amount": amount[0]?.count ? amount[0].count : 0,
            "statistic.veterans.veteran": veteran[0]?.count ? veteran[0].count : 0,
            "statistic.veterans.child": child[0]?.count ? child[0].count : 0,
            "statistic.veterans.veteranPlus0": 0, //veteran[0]?.count ? veteran[0].count : 
            "statistic.veterans.childPlus0":  0, //child[0]?.count ? child[0].count :
          }
        });
      console.log(update);
    } */




    /*     console.log("houses");
        console.log(houses); */
    //statistic

    /*  let updatedHouses = [];
 
     for (let house of houses) {
       console.log("houses");
       console.log(house.nursingHome);
     //  let statistic = {};
      // let celebrators = await NewYear.find({ absent: false, nursingHome: house.nursingHome });
       //let plus0 = 0, plus1 = 0, plus2 = 0, plus3 = 0;
       //let specialMen = 0, specialWomen = 0, oldMen = 0, oldWomen = 0, yangMen = 0, yangWomen = 0;
      // let specialMenPlus = 0, specialWomenPlus = 0, oldMenPlus = 0, oldWomenPlus = 0, yangMenPlus = 0, yangWomenPlus = 0;
 
       let plus0 = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0 } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.plus0": plus0.count}});
 
       let plus1 = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 1 } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.plus1": plus1.count}});
 
       let plus2 = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 2 } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.plus2": plus2.count}});
 
       let plus3 = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 3 } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.plus3": plus3.count}});
 
       if (house.noAddress) {
       let specialMenPlus = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0, category: "specialMen" } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.specialMenPlus": specialMenPlus.count}});
 
       let specialWomenPlus = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0, category: "specialWomen" } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.specialWomenPlus": specialWomenPlus.count}});
 
     } else {
       let oldMenPlus = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0, category: "oldMen" } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.oldMenPlus": oldMenPlus.count}});
 
       let oldWomenPlus = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0, category: "oldWomen" } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.oldWomenPlus": oldWomenPlus.count}});
 
       let yangMenPlus = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0, category: "yangMen" } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.yangMenPlus": yangMenPlus.count}});
 
       let yangWomenPlus = await NewYear.aggregate([
         { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0, category: "yangWomen" } },
         { $group: { _id: null, count: { $sum: 1 } } }
       ]);
       await House.updateOne({_id: house._id}, {$set: {"statistic.newYear.yangWomenPlus": yangWomenPlus.count}});
 
 
     }
  */


    /*    for (let senior of celebrators) {
 
 
         if (senior.plusAmount == 0) plus0++;
         if (senior.plusAmount == 1) plus1++;
         if (senior.plusAmount == 2) plus2++;
         if (senior.plusAmount == 3) plus3++;
 
         if (senior.category == "specialMen") {
 
           specialMenPlus = specialMenPlus + senior.plusAmount;
         }
         if (senior.category == "specialWomen") {
 
           specialWomenPlus = specialWomenPlus + senior.plusAmount;
         }
         if (senior.category == "oldMen") {
 
           oldMenPlus = oldMenPlus + senior.plusAmount;
         }
         if (senior.category == "oldWomen") {
 
           oldWomenPlus = oldWomenPlus + senior.plusAmount;
         }
         if (senior.category == "yangMen") {
 
           yangMenPlus = yangMenPlus + senior.plusAmount;
         }
         if (senior.category == "yangWomen") {
 
           yangWomenPlus = yangWomenPlus + senior.plusAmount;
         }
       } */

    /*       console.log("house.statistic");
          console.log(plus0);
    
          house.statistic.newYear.plus0 = plus0;
          house.statistic.newYear.plus1 = plus1;
          house.statistic.newYear.plus2 = plus2;
          house.statistic.newYear.plus3 = plus3;
    
          house.statistic.newYear.specialMenPlus = (specialMenPlus / house.statistic.newYear.specialMen).toFixed(1);
          house.statistic.newYear.specialWomenPlus = (specialWomenPlus / house.statistic.newYear.specialWomen).toFixed(1);
          house.statistic.newYear.oldMenPlus = (oldMenPlus / house.statistic.newYear.oldMen).toFixed(1);
          house.statistic.newYear.oldWomenPlus = (oldWomenPlus / house.statistic.newYear.oldWomen).toFixed(1);
          house.statistic.newYear.yangMenPlus = (yangMenPlus / house.statistic.newYear.yangMen).toFixed(1);
          house.statistic.newYear.yangWomenPlus = (yangWomenPlus / house.statistic.newYear.yangWomen).toFixed(1);
    
    
          console.log("house.statistic");
          console.log(house.statistic); 
    
          updatedHouses.push(house);
    
        }*/

    const findAllResponse = new BaseResponse(200, "Query successful", houses);
    res.json(findAllResponse.toObject());


  } catch (e) {
    console.log(e);
    const findAllCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(findAllCatchErrorResponse.toObject());
  }
});

/**
 * API to update  (OK)
 */

router.put("/:id", checkAuth, async (req, res) => {
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
            notes: req.body.notes,
            noAddress: req.body.noAddress,
            isActive: req.body.isActive,
            dateLastUpdate: req.body.dateLastUpdate,
            dateLastUpdateClone: req.body.dateLastUpdateClone,
            nameContact: req.body.nameContact,
            contact: req.body.contact,
            isDisabled: req.body.isDisabled,
            isReleased: req.body.isReleased,
            website: req.body.website,
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
router.delete("/:id", checkAuth, async (req, res) => {
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

/**
 * API to delete many
 */
router.delete("/", checkAuth, async (req, res) => {
  try {

    House.deleteMany({}, function (err, result) {
      if (err) {
        console.log(err);
        const deleteHouseMongoErrorResponse = new BaseResponse("500", "MongoDB Server Error", err);
        res.status(500).send(deleteHouseMongoErrorResponse.toObject());
      } else {
        console.log(result);
        res.json(result);

      }

    });
  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse("500", "MongoDB server error", e);
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
});

// Create many houses  API
router.post("/add-many/", checkAuth, async (req, res) => {

  try {
    let houses = req.body.houses;
    for (let house of houses) {
      house.isActive = true;
      house.dateLastUpdate = '';
      house.dateLastUpdateClone = '';
      house.nameContact = '';
      house.contact = '';
      house.noAddress = false;
      house.isReleased = false;
      house.isDisabled = false;
      house.website = '';
      if (!house.infoComment) house.infoComment = '';
      if (!house.adminComment) house.adminComment = '';
    }

    const result = await House.insertMany(houses, { ordered: false });

    const createHouseResponse = new BaseResponse(200, "Query Successful", result);
    return res.status(200).send(createHouseResponse.toObject());

  } catch (error) {
    // Server error goes here
    console.log(error);
    const createHouseCatchErrorResponse = new BaseResponse(500, "Internal server error", error.message);
    res.status(500).send(createHouseCatchErrorResponse.toObject());
  }
});

module.exports = router;
