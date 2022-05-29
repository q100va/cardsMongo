/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: May 4, 2022
; Modified By: Order Gryffindor
; Description: Bob's Computer Repair Shop App orders-api.js file
; APIs for the orders
;===========================================
*/

const express = require("express");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Order = require("../models/order");
const Proportion = require("../models/proportion");
const List = require("../models/list");

// Create order
router.post("/", async (req, res) => {
  try {
    const newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      amount: req.body.amount,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      institute: req.body.institute,
      isRestricted: req.body.isRestricted,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      lineItems: req.body.lineItems,
    };
    Order.create(newOrder, function (err, order) {
      // If statement for an error with Mongo
      if (err) {
        console.log(err);
        const createOrderMongodbErrorResponse = new BaseResponse(500, "Internal server error1", err);
        return res.status(500).send(createOrderMongodbErrorResponse.toObject());
      } else {
      console.log(order);
      const createOrderResponse = new BaseResponse(200, "Query Successful", order);
      return res.status(200).send(createOrderResponse.toObject());
      }
    });
  } catch (error) {
    // Server error goes here
    console.log(error);
    const createOrderCatchErrorResponse = new BaseResponse(500, "Internal server error2", error);
    res.status(500).send(createOrderCatchErrorResponse.toObject());
  }
});



/**
 * API to find order (OK)
 */

router.get("/", async (req, res) => {
  try {
    Order.find({}, function (err, orders) {
      if (err) {
        console.log(err);
        const readOrdersMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readOrdersMongodbErrorResponse.toObject());
      } else {
        console.log(orders);
        const readOrdersResponse = new BaseResponse(200, "Query successful", orders);
        res.json(readOrdersResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const readOrdersCatchErrorResponse = new BaseResponse(500, "Internal server error", e);
    res.status(500).send(readOrdersCatchErrorResponse.toObject());
  }
});

/**
 * API to find order by ID (OK)
 */

router.get("/:id", async (req, res) => {
  try {
    Order.findOne({ _id: req.params.id }, function (err, order) {
      console.log(req.params.id);
      if (err) {
        console.log(err);
        const readUserMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
        if (!order) {
          const response = `Invalid order ID`;
          console.log(response);
          res.send(response);
        } else {
          const readUserResponse = new BaseResponse(200, "Query successful", order);
          console.log(order);
          res.json(readUserResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});

/**
 * API to find orders by userName (OK)
 */

 router.get("/find/:userName", async (req, res) => {
  try {
    Order.find({ userName: req.params.userName }, function (err, orders) {
 
      if (err) {
        console.log(err);
        const readUserMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
          const readUserResponse = new BaseResponse(200, "Query successful", orders);
          console.log(orders);
          res.json(readUserResponse.toObject());
        }
      
    });
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});


/**
 * API to delete
 */
router.delete("/:id", async (req, res) => {
  try {
    Order.findOne({ _id: req.params.id }, function (err, order) {
      if (err) {
        console.log(err);
        const deleteHouseMongoErrorResponse = new BaseResponse("500", "MongoDB Server Error", err);
        res.status(500).send(deleteHouseMongoErrorResponse.toObject());
      } else {
        console.log(order);

        order.set({
          isDisabled: true,
        });
        order.save(function (err, savedHouse) {
          if (err) {
            console.log(err);
            const savedHouseMongodbErrorResponse = BaseResponse("500", "MongoDB server error", err);
            res.status(500).send(savedHouseMongodbErrorResponse.toObject());
          } else {
            console.log(savedHouse);
            const deleteHouseResponse = new BaseResponse("200", "Order deleted", savedHouse);
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
 * API to find proportion (OK)
 */

router.get("/proportion/:amount", async (req, res) => {
  try {
    Proportion.findOne({ amount: req.params.amount }, function (err, proportion) {
      console.log(req.params.amount);
      if (err) {
        console.log(err);
        const readProportionMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readProportionMongodbErrorResponse.toObject());
      } else {
        if (!proportion) {
          const response = `Invalid proportion`;
          console.log(response);
          res.send(response);
        } else {
          const readProportionResponse = new BaseResponse(200, "Query successful", proportion);
          console.log(proportion);
          res.json(readProportionResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readProportionCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readProportionCatchErrorResponse.toObject());
  }
});

/**
 * API to find lists (OK)
 */

router.get("/lists/", async (req, res) => {
  try {
    List.find({}, function (err, lists) {

      if (err) {
        console.log(err);
        const readListMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readListMongodbErrorResponse.toObject());
      } else {
        if (!lists) {
          const response = `Invalid list`;
          console.log(response);
          res.send(response);
        } else {
          const readListResponse = new BaseResponse(200, "Query successful", lists);
          console.log(lists);
          res.json(readListResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readListCatchErrorResponse = new BaseResponse(500, "Internal server error", e);
    res.status(500).send(readListCatchErrorResponse.toObject());
  }
});

/**
 * API to find celebrator (OK)
 */
/* router.get("/celebrator/:condition+:gender", async (req, res) => {
  try {
    List.findOne({ active: true }, function (err, list) {

      if (err) {
        console.log(err);
        const readListMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readListMongodbErrorResponse.toObject());
      } else {
        if (!list) {
          const response = `No active lists`;
          console.log(response);
          res.send(response);

        } else {
          let celebrator;
          switch (req.params.condition) {
            case '$lt':
              celebrator = list.celebrators.find(item => item.gender == req.params.gender && item.yearBirthday < 1950 && item.plusAmount < 3 && item.plusAmount < second);
              break;

            case '$gt':
              celebrator = list.celebrators.find(item => item.gender == req.params.gender && item.yearBirthday > 1949 && item.plusAmount < 3 && item.plusAmount < second);
              break;
          }
          if (!celebrator) {
            celebrator = list.celebrators.find(item => item.gender == req.params.gender && item.oldest == true && item.plusAmount < 4);
          }


          const readListResponse = new BaseResponse(200, "Query successful", celebrator);
          console.log(celebrator);
          res.json(readListResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readListCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readListCatchErrorResponse.toObject());
  }
}
);
 */




module.exports = router;