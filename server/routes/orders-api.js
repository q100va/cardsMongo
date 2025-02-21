/*
============================================
; APIs for the orders
;===========================================
*/

const express = require("express");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const Order = require("../models/order");
const Proportion = require("../models/proportion");
const List = require("../models/list");
const ListNext = require("../models/list-next");
const ListBefore = require("../models/list-previous");
const NewYear = require("../models/new-year");
const Period = require("../models/period");
const Month = require("../models/month");
const House = require("../models/house");
const Region = require("../models/region");
const NameDay = require("../models/name-day");
const NameDayNext = require("../models/name-day-next");
const NameDayBefore = require("../models/name-day-previous");
const TeacherDay = require("../models/teacher-day");
const February23 = require("../models/february-23");
const March8 = require("../models/march-8");
const May9 = require("../models/may-9");
const FamilyDay = require("../models/family-day");
const SeniorDay = require("../models/senior-day");
const order = require("../models/order");
const checkAuth = require("../middleware/check-auth");
const Easter = require("../models/easter");
const Senior = require("../models/senior");
const Client = require("../models/client");

//const { getLocaleDayPeriods } = require("@angular/common");

/**
 * API to find lists (OK)
 */

//Create period

router.post("/create/period/", checkAuth, async (req, res) => {
  try {
    let newPeriod = {
      date1: req.params.date1,
      date2: req.params.date2,
      isActive: req.params.isActive,
      key: req.params.key,
      maxPlus: req.params.maxPlus,
      secondTime: req.params.secondTime,
      scoredPluses: 2,
    };
    //console.log(req.body);

    Period.create(newPeriod, function (err, period) {
      if (err) {
        console.log(err);
        const createPeriodMongodbErrorResponse = new BaseResponse(
          500,
          "Internal Server Error",
          err
        );
        res.status(500).send(createPeriodMongodbErrorResponse.toObject());
      } else {
        console.log(period);
        const createPeriodResponse = new BaseResponse(
          200,
          "Query Successful",
          period
        );
        res.json(createPeriodResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const createPeriodCatchErrorResponse = new BaseResponse(
      500,
      "Internal Server Error",
      e.message
    );
    res.status(500).send(createPeriodCatchErrorResponse.toObject());
  }
});


/**
 * API to find all orders (OK)
 */

router.get("/", checkAuth, async (req, res) => {
  try {
    Order.find({ isDisabled: false, userName: { $ne: "okskust" }, isAccepted: false }, function (err, orders) {
      /* Order.find({ isDisabled: false , userName: "royrai"}, function (err, orders) { */
      if (err) {
        console.log(err);
        const readOrdersMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readOrdersMongodbErrorResponse.toObject());
      } else {
        console.log(orders);
        const readOrdersResponse = new BaseResponse(
          200,
          "Query successful",
          orders
        );
        res.json(readOrdersResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const readOrdersCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      e
    );
    res.status(500).send(readOrdersCatchErrorResponse.toObject());
  }
});

/**
 * API to find order by ID (OK)
 */

router.get("/:id", checkAuth, async (req, res) => {
  try {
    Order.findOne({ _id: req.params.id, isDisabled: false }, function (err, order) {
      console.log(req.params.id);
      if (err) {
        console.log(err);
        const readUserMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
        if (!order) {
          const response = `Invalid order ID`;
          console.log(response);
          res.send(response);
        } else {
          const readUserResponse = new BaseResponse(
            200,
            "Query successful",
            order
          );
          console.log(order);
          res.json(readUserResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      err
    );
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});

/**
 * API to find all orders by userName (OK)
 */

router.get("/find/:userName", checkAuth, async (req, res) => {
  try {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const length = await Order.countDocuments({ userName: req.params.userName, isDisabled: false });
    Order.find({ userName: req.params.userName, isDisabled: false }, function (err, orders) {
      if (err) {
        console.log(err);
        const readUserMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
        //  let correctedOrders = correctDate(orders);
        let result = {
          orders: orders,
          length: length
        };
        const readUserResponse = new BaseResponse(
          200,
          "Query successful",
          result
        );
        //console.log(orders);
        res.json(readUserResponse.toObject());
      }
      // }).sort({dateOfOrder: -1}).skip(10).limit(20);
    }).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      err
    );
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});

/**
 * API to find not confirmed orders by userName (OK)
 */

router.get("/findNotConfirmed/:userName", checkAuth, async (req, res) => {
  try {
    console.log('req.query');
    console.log(req.query)
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    /*     let orders = await Order.find({ userName: req.params.userName, isAccepted: false, isDisabled: false });
        console.log("req.params.userName");
        console.log(req.params.userName); */
    const length = await Order.countDocuments({
      $and: [
        {
          isDisabled: false,
          userName: req.params.userName,
        },
        {
          $or: [
            {
              isAccepted: false,
              isOverdue: false,
              isReturned: false
            },
            {
              isOverdue: true,
              holiday: {
                $in: [
                  //"Новый год 2025",
                  "Дни рождения марта 2025",
                  "Дни рождения апреля 2025",
                  "Дни рождения мая 2025",
                  "23 февраля 2025",
                  "8 марта 2025",
                  "Пасха 2025",
                  /*             "Именины февраля 2025",
                              "Именины марта 2025" */
                ]
              }
            },
            {
              isReturned: true,
              holiday: {
                $in: [
                  // "Новый год 2025",
                  "Дни рождения марта 2025",
                  "Дни рождения апреля 2025",
                  "Дни рождения мая 2025",
                  "23 февраля 2025",
                  "8 марта 2025",
                  "Пасха 2025",
                  /*         "Именины февраля 2025",
                          "Именины марта 2025" */
                ]
              }
            }
          ]
        }
      ]
    });

    console.log("length");
    console.log(length);

    await Order.find({
      $and: [
        {
          isDisabled: false,
          userName: req.params.userName,
        },
        {
          $or: [
            {
              isAccepted: false,
              isOverdue: false,
              isReturned: false
            },
            {
              isOverdue: true,
              holiday: {
                $in: [
                  //"Новый год 2025",
                  "Дни рождения марта 2025",
                  "Дни рождения апреля 2025",
                  "Дни рождения мая 2025",
                  "23 февраля 2025",
                  "8 марта 2025",
                  "Пасха 2025",
                  /*       "Именины февраля 2025",
                        "Именины марта 2025" */
                ]
              }
            },
            {
              isReturned: true,
              holiday: {
                $in: [
                  //"Новый год 2025",
                  "Дни рождения марта 2025",
                  "Дни рождения апреля 2025",
                  "Дни рождения мая 2025",
                  "23 февраля 2025",
                  "8 марта 2025",
                  "Пасха 2025",
                  /*         "Именины февраля 2025",
                          "Именины марта 2025" */
                ]
              }
            }
          ]
        }
      ]
    }, function (err, orders) {
      if (err) {
        console.log(err);

        const readUserMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
        console.log("ORDERS");
        console.log(orders);

        // let correctedOrders = correctDate(orders);
        let result = {
          orders: orders,
          length: length
        };
        console.log('pageSize');
        console.log(pageSize)
        console.log('result');
        console.log(result.length);
        console.log("result.ORDERS");
        console.log(result.orders);

        const readUserResponse = new BaseResponse(
          200,
          "Query successful",
          result
        );
        // console.log("findNotConfirmed");
        //console.log(orders);
        res.json(readUserResponse.toObject());
      }
    }).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      err
    );
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});

/**
 * API to find not confirmed orders (OK)
 */

router.get("/all/findAllOrdersNotAccepted/", checkAuth, async (req, res) => {
  try {
    /*     let orders = await Order.find({ userName: req.params.userName, isAccepted: false, isDisabled: false });
        console.log("req.params.userName");
        console.log(req.params.userName); */
    Order.find({ userName: { $ne: "okskust" }, isAccepted: false, isDisabled: false, isReturned: false, isOverdue: false }, function (err, orders) {
      if (err) {
        console.log(err);
        const readUserMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
        const readUserResponse = new BaseResponse(
          200,
          "Query successful",
          orders
        );
        console.log("findNotConfirmed");
        console.log(orders);
        res.json(readUserResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      err
    );
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});


/**
 * API to confirm order
 */
router.patch("/confirm/:id", checkAuth, async (req, res) => {
  try {
    const updatedOrder = await Order.updateOne({ _id: req.params.id }, { $set: { isAccepted: true } }, { upsert: false });
    console.log(updatedOrder);
    console.log(req.body.isShowAll);
    let updatedOrders;
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let length;
    /* 
        db.inventory.find({ $or: [{ quantity: { $lt: 20 } }, { price: 10 }] })
        db.inventory.find({ $or: [{ quantity: { $lt: 20 } }, { price: 10 }] })
        db.inventory.find({ price: { $ne: 1.99, $exists: true } })
        db.inventory.find({
          $and: [
            { $or: [{ qty: { $lt: 10 } }, { qty: { $gt: 50 } }] },
            { $or: [{ sale: true }, { price: { $lt: 5 } }] }
          ]
        })
        db.inventory.find({ $and: [{ price: { $ne: 1.99 } }, { price: { $exists: true } }] }) */


    if (req.body.isShowAll) {
      length = await Order.countDocuments({ userName: req.body.userName, isDisabled: false });
      updatedOrders = await Order.find(
        { userName: req.body.userName, isDisabled: false }
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
    } else {

      length = await Order.countDocuments({
        $and: [
          {
            isDisabled: false,
            userName: req.body.userName,
          },
          {
            $or: [
              {
                isAccepted: false,
                isOverdue: false,
                isReturned: false
              },
              {
                isOverdue: true,
                holiday: {
                  $in: [
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                  ]
                }
              },
              {
                isReturned: true,
                holiday: {
                  $in: [
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                  ]
                }
              }
            ]
          }
        ]
      });
      updatedOrders = await Order.find({
        $and: [
          {
            isDisabled: false,
            userName: req.body.userName,
          },
          {
            $or: [
              {
                isAccepted: false,
                isOverdue: false,
                isReturned: false
              },
              {
                isOverdue: true,
                holiday: {
                  $in: [
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                  ]
                }
              },
              {
                isReturned: true,
                holiday: {
                  $in: [
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                  ]
                }
              }
            ]
          }
        ]
      }).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });



      /*       length = await Order.countDocuments({ isAccepted: false, userName: req.body.userName, isDisabled: false, });//isReturned: false, isOverdue: false 
            updatedOrders = await Order.find(
              { isAccepted: false, userName: req.body.userName, isDisabled: false,  }//isReturned: false, isOverdue: false
            ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 }); */
    }
    //let correctedOrders = correctDate(updatedOrders);
    let result = {
      orders: updatedOrders,
      length: length
    };

    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", result);
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const confirmOrderCatchErrorResponse = new BaseResponse(
      "500",
      "MongoDB server error",
      err
    );
    res.status(500).send(confirmOrderCatchErrorResponse.toObject());
  }
});

router.patch("/unconfirmed/:id", checkAuth, async (req, res) => {
  try {
    const updatedOrder = await Order.updateOne({ _id: req.params.id }, { $set: { isAccepted: false } }, { upsert: false });
    console.log(updatedOrder);
    console.log(req.body.isShowAll);
    let updatedOrders;
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let length;
    if (req.body.isShowAll) {
      length = await Order.countDocuments({ userName: req.body.userName, isDisabled: false });
      updatedOrders = await Order.find(
        { userName: req.body.userName, isDisabled: false }
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
    } else {
      length = await Order.countDocuments({
        $and: [
          {
            isDisabled: false,
            userName: req.body.userName,
          },
          {
            $or: [
              {
                isAccepted: false,
                isOverdue: false,
                isReturned: false
              },
              {
                isOverdue: true,
                holiday: {
                  $in: [
                    // "Новый год 2025",
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                    /*       "Именины февраля 2025",
                          "Именины марта 2025" */
                  ]
                }
              },
              {
                isReturned: true,
                holiday: {
                  $in: [
                    // "Новый год 2025",
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                    /*           "Именины февраля 2025",
                              "Именины марта 2025" */
                  ]
                }
              }
            ]
          }
        ]
      });//isReturned: false, isOverdue: false
      updatedOrders = await Order.find(
        {
          $and: [
            {
              isDisabled: false,
              userName: req.body.userName,
            },
            {
              $or: [
                {
                  isAccepted: false,
                  isOverdue: false,
                  isReturned: false
                },
                {
                  isOverdue: true,
                  holiday: {
                    $in: [
                      //   "Новый год 2025",
                      "Дни рождения марта 2025",
                      "Дни рождения апреля 2025",
                      "Дни рождения мая 2025",
                      "23 февраля 2025",
                      "8 марта 2025",
                      "Пасха 2025",
                      /*            "Именины февраля 2025",
                                 "Именины марта 2025" */
                    ]
                  }
                },
                {
                  isReturned: true,
                  holiday: {
                    $in: [
                      //   "Новый год 2025",
                      "Дни рождения марта 2025",
                      "Дни рождения апреля 2025",
                      "Дни рождения мая 2025",
                      "23 февраля 2025",
                      "8 марта 2025",
                      "Пасха 2025",
                      /*             "Именины февраля 2025",
                                  "Именины марта 2025" */
                    ]
                  }
                }
              ]
            }
          ]
        }//isReturned: false, isOverdue: false
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
    }
    // let correctedOrders = correctDate(updatedOrders);
    let result = {
      orders: updatedOrders,
      length: length
    };

    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", result);
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const confirmOrderCatchErrorResponse = new BaseResponse(
      "500",
      "MongoDB server error",
      err
    );
    res.status(500).send(confirmOrderCatchErrorResponse.toObject());
  }
});

//API to change status of order

router.patch("/change-status/:id", checkAuth, async (req, res) => {
  try {
    //  let updatedOrder;    

    if (req.body.newStatus == "isOverdue") {
      await Order.updateOne({ _id: req.params.id }, { $set: { isOverdue: true } }, { upsert: false });
    }
    if (req.body.newStatus == "isReturned") {
      await Order.updateOne({ _id: req.params.id }, { $set: { isReturned: true } }, { upsert: false });
    }
    if (req.body.newStatus == "isDisabled") {
      await Order.updateOne({ _id: req.params.id }, { $set: { isDisabled: true } }, { upsert: false });
    }

    //console.log(updatedOrder);
    const updatedOrder = await Order.findOne({ _id: req.params.id });
    if ((req.body.newStatus == "isDisabled") && (updatedOrder.isOverdue || updatedOrder.isReturned)) {
      console.log("Pluses were already deleted");
    } else {
      await deletePluses(updatedOrder, true);
    }

    //console.log(req.body.isShowAll);
    let updatedOrders;
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let length;
    if (req.body.isShowAll) {
      length = await Order.countDocuments({ userName: req.body.userName, isDisabled: false });
      updatedOrders = await Order.find(
        { userName: req.body.userName, isDisabled: false }
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
    } else {
      length = await Order.countDocuments({
        $and: [
          {
            isDisabled: false,
            userName: req.body.userName,
          },
          {
            $or: [
              {
                isAccepted: false,
                isOverdue: false,
                isReturned: false
              },
              {
                isOverdue: true,
                holiday: {
                  $in: [
                    // "Новый год 2025",
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                    /*           "Именины февраля 2025",
                              "Именины марта 2025" */
                  ]
                }
              },
              {
                isReturned: true,
                holiday: {
                  $in: [
                    // "Новый год 2025",
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    "23 февраля 2025",
                    "8 марта 2025",
                    "Пасха 2025",
                    /*         "Именины февраля 2025",
                            "Именины марта 2025" */
                  ]
                }
              }
            ]
          }
        ]
      });//isReturned: false, isOverdue: false,
      updatedOrders = await Order.find(
        {
          $and: [
            {
              isDisabled: false,
              userName: req.body.userName,
            },
            {
              $or: [
                {
                  isAccepted: false,
                  isOverdue: false,
                  isReturned: false
                },
                {
                  isOverdue: true,
                  holiday: {
                    $in: [
                      // "Новый год 2025",
                      "Дни рождения марта 2025",
                      "Дни рождения апреля 2025",
                      "Дни рождения мая 2025",
                      "23 февраля 2025",
                      "8 марта 2025",
                      "Пасха 2025",
                      /*          "Именины февраля 2025",
                               "Именины марта 2025" */
                    ]
                  }
                },
                {
                  isReturned: true,
                  holiday: {
                    $in: [
                      // "Новый год 2025",
                      "Дни рождения марта 2025",
                      "Дни рождения апреля 2025",
                      "Дни рождения мая 2025",
                      "23 февраля 2025",
                      "8 марта 2025",
                      "Пасха 2025",
                      /*               "Именины февраля 2025",
                                    "Именины марта 2025" */
                    ]
                  }
                }
              ]
            }
          ]
        }//isReturned: false, isOverdue: false,
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
    }
    //let correctedOrders = correctDate(updatedOrders);
    let result = {
      orders: updatedOrders,
      length: length
    };
    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", result);
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const confirmOrderCatchErrorResponse = new BaseResponse(
      "500",
      "MongoDB server error",
      e
    );
    res.status(500).send(confirmOrderCatchErrorResponse.toObject());
  }
});

async function deletePluses(deletedOrder, full) {
  let deletedLineItems = full ? deletedOrder.lineItems : [deletedOrder.deleted[deletedOrder.deleted.length - 1]];

  if (deletedOrder.holiday == "Дни рождения апреля 2025" || deletedOrder.holiday == "Дни рождения мая 2025" || deletedOrder.holiday == "Дни рождения марта 2025") {
    //удалить плюсы, если они в текущем месяце. откорректировать scoredPluses в периоде, если надо, и активный период.
    const month = await Month.findOne({ isActive: true });
    let monthNumber = month.number;
    const today = new Date();
    const inTwoWeeks = new Date();
    let period, activePeriod, celebrator;
    if (deletedOrder.holiday == "Дни рождения мая 2025") {
      monthNumber = monthNumber + 1;
    }
    if (deletedOrder.holiday == "Дни рождения марта 2025") {
      monthNumber = monthNumber - 1;
    }
    for (let lineItem of deletedLineItems) {
      for (let person of lineItem.celebrators) {
        if (person.monthBirthday == monthNumber) {

          if (deletedOrder.holiday == "Дни рождения мая 2025") {
            await ListNext.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
            celebrator = await ListNext.findOne({ _id: person._id });
          }
          if (deletedOrder.holiday == "Дни рождения апреля 2025") {
            await List.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
            celebrator = await List.findOne({ _id: person._id });
          }
          if (deletedOrder.holiday == "Дни рождения марта 2025") {
            await ListBefore.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
            celebrator = await ListBefore.findOne({ _id: person._id });
          }

          /*           if (deletedOrder.holiday == "Дни рождения апреля 2025") {
                      period = await Period.findOne({ date1: { $lte: celebrator.dateBirthday }, date2: { $gte: celebrator.dateBirthday } });
                      activePeriod = await Period.findOne({ isActive: true });
                      if (celebrator.plusAmount < period.scoredPluses && period.scoredPluses > 2) {
                        period.scoredPluses = period.scoredPluses - 1;
                        if (period.scoredPluses < 3) {
                          await Period.updateOne({ _id: period._id }, { $inc: { scoredPluses: -1 }, secondTime: false, maxPlus: 3 }, { upsert: false });
                        } else {
                          await Period.updateOne({ _id: period._id }, { $inc: { scoredPluses: -1 } }, { upsert: false });
                        }
          
                        const controlDate = period.secondTime ? 14 : 10;//
                        inTwoWeeks.setDate(today.getDate() + controlDate);
                        console.log("inTwoWeeks");
                        console.log(inTwoWeeks);
                        console.log("period.isActive == false");
                        console.log(period.isActive);
                        console.log("period.date1 < activePeriod.date1");
                        console.log("period.date1");
                        console.log(period.date1);
                        console.log("activePeriod.date1");
                        console.log(activePeriod.date1);
                        console.log("period.scoredPluses < 3");
                        console.log(period.scoredPluses);
                        const periodDate2 = new Date(month.year, month.number, period.date2);
                        console.log(month.year);
                        console.log(month.number);
                        console.log(period.date2);
                        console.log("periodDate2 > inTwoWeeks");
                        console.log(periodDate2);
                        if (period.isActive == false && period.date1 < activePeriod.date1 && period.scoredPluses < 3 && periodDate2 > inTwoWeeks) {
                          await Period.updateOne({ _id: activePeriod._id }, { isActive: false }, { upsert: false });
                          await Period.updateOne({ _id: period._id }, { isActive: true }, { upsert: false });
                        }
                      }
                    } */
        }
      }
    }
  } else {
    if (deletedOrder.holiday == "Именины февраля 2025") {
      for (let lineItem of deletedLineItems) {
        for (let person of lineItem.celebrators) {
          await NameDay.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
        }
      }
    } else {
      if (deletedOrder.holiday == "Именины марта 2025") {
        for (let lineItem of deletedLineItems) {
          for (let person of lineItem.celebrators) {
            await NameDayNext.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
          }
        }
      } else {
        if (deletedOrder.holiday == "Именины января 2025") {
          for (let lineItem of deletedLineItems) {
            for (let person of lineItem.celebrators) {
              await NameDayBefore.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
            }
          }
        } else {

          if (deletedOrder.holiday == "День учителя и дошкольного работника 2024") {
            for (let lineItem of deletedLineItems) {
              for (let person of lineItem.celebrators) {
                await TeacherDay.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
              }
            }
          }
          else {
            if (deletedOrder.holiday == "Новый год 2025") {
              for (let lineItem of deletedLineItems) {
                for (let person of lineItem.celebrators) {


                  let senior = await NewYear.findOne({ _id: person._id });
                  let p = senior.plusAmount;
                  let newP = p - 1;
                  let c = senior.category;
                  await House.updateOne(
                    {
                      nursingHome: senior.nursingHome
                    },
                    {
                      $inc: {
                        ["statistic.newYear.plus" + p]: -1,
                        ["statistic.newYear.plus" + newP]: 1,
                        ["statistic.newYear." + c + "Plus"]: -1,
                      }
                    }

                  );

                  if (deletedOrder.institutes.length == 0) await NewYear.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
                  if (deletedOrder.institutes.length > 0 && deletedOrder.contact != "@tterros") {
                    await NewYear.updateOne({ _id: senior._id }, { $inc: { plusAmount: -1, forInstitute: -1 } }, { upsert: false });
                    await House.updateOne(
                      {
                        nursingHome: senior.nursingHome
                      },
                      {
                        $inc: { ["statistic.newYear.forInstitute"]: -1 }
                      });
                  }
                  if (deletedOrder.contact == "@tterros") {
                    await NewYear.updateOne({ _id: senior._id }, { $inc: { plusAmount: -1, forInstitute: -1, forNavigators: -1 } }, { upsert: false });
                    await House.updateOne(
                      {
                        nursingHome: senior.nursingHome
                      },
                      {
                        $inc: {
                          ["statistic.newYear.forInstitute"]: -1,
                          ["statistic.newYear.forNavigators"]: -1
                        }
                      });
                  }
                }
              }
            } else {
              if (deletedOrder.holiday == "8 марта 2025") {
                for (let lineItem of deletedLineItems) {
                  for (let person of lineItem.celebrators) {

                    let senior = await March8.findOne({ _id: person._id });
                    let p = senior.plusAmount;
                    let newP = p - 1;
                    let c = senior.category;
                    await House.updateOne(
                      {
                        nursingHome: senior.nursingHome
                      },
                      {
                        $inc: {
                          ["statistic.spring.plus" + p]: -1,
                          ["statistic.spring.plus" + newP]: 1,
                          ["statistic.spring." + c + "Plus"]: -1,
                        }
                      }

                    );

                    await March8.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
                  }
                }
              } else {
                if (deletedOrder.holiday == "23 февраля 2025") {
                  for (let lineItem of deletedLineItems) {
                    for (let person of lineItem.celebrators) {

                      let senior = await February23.findOne({ _id: person._id });
                      let p = senior.plusAmount;
                      let newP = p - 1;
                      let c = senior.category;
                      await House.updateOne(
                        {
                          nursingHome: senior.nursingHome
                        },
                        {
                          $inc: {
                            ["statistic.spring.plus" + p]: -1,
                            ["statistic.spring.plus" + newP]: 1,
                            ["statistic.spring." + c + "Plus"]: -1,
                          }
                        }

                      );

                      await February23.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
                    }
                  }
                } else {
                  if (deletedOrder.holiday == "9 мая 2024") {
                    for (let lineItem of deletedLineItems) {
                      for (let person of lineItem.celebrators) {
                        await May9.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
                      }
                    }
                  }
                  else {
                    if (deletedOrder.holiday == "День семьи 2024") {
                      for (let lineItem of deletedLineItems) {
                        for (let person of lineItem.celebrators) {
                          await FamilyDay.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
                        }
                      }
                    } else {
                      if (deletedOrder.holiday == "Пасха 2025") {
                        for (let lineItem of deletedLineItems) {
                          for (let person of lineItem.celebrators) {


                            let senior = await Easter.findOne({ _id: person._id });
                            let p = senior.plusAmount;
                            let newP = p - 1;
                            let c = senior.category;
                            await House.updateOne(
                              {
                                nursingHome: senior.nursingHome
                              },
                              {
                                $inc: {
                                  ["statistic.easter.plus" + p]: -1,
                                  ["statistic.easter.plus" + newP]: 1,
                                  ["statistic.easter." + c + "Plus"]: -1,
                                }
                              }

                            );

                            await Easter.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
                          }
                        }
                      } else {
                        if (deletedOrder.holiday == "День пожилого человека 2024") {
                          for (let lineItem of deletedLineItems) {
                            for (let person of lineItem.celebrators) {
                              await SeniorDay.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// API to restore order

router.patch("/restore/:id", checkAuth, async (req, res) => {
  try {
    await Order.updateOne({ _id: req.params.id }, {
      $set: { isOverdue: false, isReturned: false, isAccepted: false }
    }, { upsert: false });

    //console.log(updatedOrder);
    const updatedOrder = await Order.findOne({ _id: req.params.id });

    await restorePluses(updatedOrder);

    //console.log(req.body.isShowAll);
    let updatedOrders;
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let length;
    if (req.body.isShowAll) {
      length = await Order.countDocuments({ userName: req.body.userName, isDisabled: false });
      updatedOrders = await Order.find(
        { userName: req.body.userName, isDisabled: false }
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
    } else {
      length = await Order.countDocuments({
        $and: [
          {
            isDisabled: false,
            userName: req.body.userName,
          },
          {
            $or: [
              {
                isAccepted: false,
                isOverdue: false,
                isReturned: false
              },
              {
                isOverdue: true,
                holiday: {
                  $in: [
                    //  "Новый год 2025",
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    /*         "Именины февраля 2025",
                            "Именины марта 2025" */
                  ]
                }
              },
              {
                isReturned: true,
                holiday: {
                  $in: [
                    // "Новый год 2025",
                    "Дни рождения марта 2025",
                    "Дни рождения апреля 2025",
                    "Дни рождения мая 2025",
                    /*        "Именины февраля 2025",
                           "Именины марта 2025" */
                  ]
                }
              }
            ]
          }
        ]
      });//isReturned: false, isOverdue: false, 
      updatedOrders = await Order.find(
        {
          $and: [
            {
              isDisabled: false,
              userName: req.body.userName,
            },
            {
              $or: [
                {
                  isAccepted: false,
                  isOverdue: false,
                  isReturned: false
                },
                {
                  isOverdue: true,
                  holiday: {
                    $in: [
                      "Новый год 2025",
                      "Дни рождения апреля 2025",
                      "Дни рождения мая 2025",
                      "Именины февраля 2025",
                      "Именины марта 2025"
                    ]
                  }
                },
                {
                  isReturned: true,
                  holiday: {
                    $in: [
                      "Новый год 2025",
                      "Дни рождения апреля 2025",
                      "Дни рождения мая 2025",
                      "Именины февраля 2025",
                      "Именины марта 2025"
                    ]
                  }
                }
              ]
            }
          ]
        }//isReturned: false, isOverdue: false, 
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ dateOfOrder: -1 });
    }
    //let correctedOrders = correctDate(updatedOrders);
    let result = {
      orders: updatedOrders,
      length: length
    };
    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", result);
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const confirmOrderCatchErrorResponse = new BaseResponse(
      "500",
      "MongoDB server error",
      e
    );
    res.status(500).send(confirmOrderCatchErrorResponse.toObject());
  }
});

async function restorePluses(updatedOrder) {
  if (updatedOrder.holiday == "Дни рождения апреля 2025" || updatedOrder.holiday == "Дни рождения мая 2025" || updatedOrder.holiday == "Дни рождения марта 2025") {


    //удалить плюсы, если они в текущем месяце. откорректировать scoredPluses в периоде, если надо, и активный период.
    const month = await Month.findOne({ isActive: true });
    let monthNumber = month.number;
    const today = new Date();
    const inTwoWeeks = new Date();
    let period, activePeriod, celebrator;
    if (updatedOrder.holiday == "Дни рождения мая 2025") {
      monthNumber = monthNumber + 1;
    }

    for (let lineItem of updatedOrder.lineItems) {
      for (let person of lineItem.celebrators) {
        if (person.monthBirthday == month.number) {
          if (updatedOrder.holiday == "Дни рождения мая 2025") {
            await ListNext.updateOne({ _id: person.celebrator_id }, { $inc: { plusAmount: +1 } }, { upsert: false });
          }
          if (updatedOrder.holiday == "Дни рождения апреля 2025") {
            await List.updateOne({ _id: person.celebrator_id }, { $inc: { plusAmount: +1 } }, { upsert: false });
          }
          if (updatedOrder.holiday == "Дни рождения марта 2025") {
            await ListBefore.updateOne({ _id: person.celebrator_id }, { $inc: { plusAmount: +1 } }, { upsert: false });
          }


        }
        /* {  celebrator = await List.findOne({ _id: person.celebrator_id });
           period = await Period.findOne({ date1: { $lte: celebrator.dateBirthday }, date2: { $gte: celebrator.dateBirthday } });
           activePeriod = await Period.findOne({ isActive: true });
           if (celebrator.plusAmount < period.scoredPluses && period.scoredPluses > 2) {
             period.scoredPluses = period.scoredPluses - 1;
             if (period.scoredPluses < 3) {
               await Period.updateOne({ _id: period._id }, { $inc: { scoredPluses: -1 }, secondTime: false, maxPlus: 3 }, { upsert: false });
             } else {
               await Period.updateOne({ _id: period._id }, { $inc: { scoredPluses: -1 } }, { upsert: false });
             } 
 
             const controlDate = period.secondTime ? 14 : 10;//
             inTwoWeeks.setDate(today.getDate() + controlDate);
             console.log("inTwoWeeks");
             console.log(inTwoWeeks);
             console.log("period.isActive == false");
             console.log(period.isActive);
             console.log("period.date1 < activePeriod.date1");
             console.log("period.date1");
             console.log(period.date1);
             console.log("activePeriod.date1");
             console.log(activePeriod.date1);
             console.log("period.scoredPluses < 3");
             console.log(period.scoredPluses);
             const periodDate2 = new Date(month.year, month.number, period.date2);
             console.log(month.year);
             console.log(month.number);
             console.log(period.date2);
             console.log("periodDate2 > inTwoWeeks");
             console.log(periodDate2);
             if (period.isActive == false && period.date1 < activePeriod.date1 && period.scoredPluses < 3 && periodDate2 > inTwoWeeks) {
               await Period.updateOne({ _id: activePeriod._id }, { isActive: false }, { upsert: false });
               await Period.updateOne({ _id: period._id }, { isActive: true }, { upsert: false });
             }
           }
         }*/
      }
    }
  } else {
    if (updatedOrder.holiday == "Именины февраля 2025") {
      for (let lineItem of updatedOrder.lineItems) {
        for (let person of lineItem.celebrators) {
          await NameDay.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
        }
      }
    } else {
      if (updatedOrder.holiday == "Именины января 2025") {
        for (let lineItem of updatedOrder.lineItems) {
          for (let person of lineItem.celebrators) {
            await NameDayBefore.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
          }
        }
      } else {
        if (updatedOrder.holiday == "Именины марта 2025") {
          for (let lineItem of updatedOrder.lineItems) {
            for (let person of lineItem.celebrators) {
              await NameDayNext.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
            }
          }
        } else {

          if (updatedOrder.holiday == "День учителя и дошкольного работника 2024") {
            for (let lineItem of updatedOrder.lineItems) {
              for (let person of lineItem.celebrators) {
                await TeacherDay.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
              }
            }
          }
          else { //ADDED STATISTIC!!!
            if (updatedOrder.holiday == "Новый год 2025") {
              for (let lineItem of updatedOrder.lineItems) {
                for (let person of lineItem.celebrators) {
                  console.log("person");
                  console.log(person);
                  if (updatedOrder.institutes.length == 0) await NewYear.updateOne({ _id: person._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
                  if (updatedOrder.institutes.length > 0 && updatedOrder.contact != "@tterros") {
                    await NewYear.updateOne({ _id: person._id }, { $inc: { plusAmount: 1, forInstitute: 1 } }, { upsert: false });
                    await House.updateOne(
                      {
                        nursingHome: person.nursingHome
                      },
                      {
                        $inc: { ["statistic.newYear.forInstitute"]: 1 }
                      });
                  }

                  if (updatedOrder.contact == "@tterros") {
                    await NewYear.updateOne({ _id: person._id }, { $inc: { plusAmount: 1, forInstitute: 1, forNavigators: 1 } }, { upsert: false });
                    await House.updateOne(
                      {
                        nursingHome: person.nursingHome
                      },
                      {
                        $inc: {
                          ["statistic.newYear.forInstitute"]: 1,
                          ["statistic.newYear.forNavigators"]: 1
                        }
                      });

                  }
                  // await NewYear.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
                  let senior = await NewYear.findOne({ _id: person._id });
                  console.log("senior");
                  console.log(senior);
                  console.log(senior.plusAmount);
                  let newP = senior.plusAmount;
                  let p = newP - 1;
                  let c = senior.category;
                  await House.updateOne(
                    {
                      nursingHome: senior.nursingHome
                    },
                    {
                      $inc: {
                        ["statistic.newYear.plus" + p]: -1,
                        ["statistic.newYear.plus" + newP]: 1,
                        ["statistic.newYear." + c + "Plus"]: 1,
                      }
                    }

                  );
                }
              }
            } else {
              if (updatedOrder.holiday == "8 марта 2025") {
                for (let lineItem of updatedOrder.lineItems) {
                  for (let person of lineItem.celebrators) {
                    await March8.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });

                    let senior = await March8.findOne({ _id: person._id });
                    console.log("senior");
                    console.log(senior);
                    console.log(senior.plusAmount);
                    let newP = senior.plusAmount;
                    let p = newP - 1;
                    let c = senior.category;
                    await House.updateOne(
                      {
                        nursingHome: senior.nursingHome
                      },
                      {
                        $inc: {
                          ["statistic.spring.plus" + p]: -1,
                          ["statistic.spring.plus" + newP]: 1,
                          ["statistic.spring." + c + "Plus"]: 1,
                        }
                      }

                    );


                  }
                }
              } else {
                if (updatedOrder.holiday == "23 февраля 2025") {
                  for (let lineItem of updatedOrder.lineItems) {
                    for (let person of lineItem.celebrators) {
                      await February23.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });

                      let senior = await February23.findOne({ _id: person._id });
                      console.log("senior");
                      console.log(senior);
                      console.log(senior.plusAmount);
                      let newP = senior.plusAmount;
                      let p = newP - 1;
                      let c = senior.category;
                      await House.updateOne(
                        {
                          nursingHome: senior.nursingHome
                        },
                        {
                          $inc: {
                            ["statistic.spring.plus" + p]: -1,
                            ["statistic.spring.plus" + newP]: 1,
                            ["statistic.spring." + c + "Plus"]: 1,
                          }
                        }

                      );

                    }
                  }
                } else {
                  if (updatedOrder.holiday == "9 мая 2024") {
                    for (let lineItem of updatedOrder.lineItems) {
                      for (let person of lineItem.celebrators) {
                        await May9.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
                      }
                    }
                  }
                  else {
                    if (updatedOrder.holiday == "День семьи 2024") {
                      for (let lineItem of updatedOrder.lineItems) {
                        for (let person of lineItem.celebrators) {
                          await FamilyDay.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
                        }
                      }
                    } else {
                      if (updatedOrder.holiday == "Пасха 2025") {
                        for (let lineItem of updatedOrder.lineItems) {
                          for (let person of lineItem.celebrators) {
                            console.log("person");
                            console.log(person);
                            await Easter.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
                            let senior = await Easter.findOne({ _id: person._id });
                            console.log("senior");
                            console.log(senior);
                            console.log(senior.plusAmount);
                            let newP = senior.plusAmount;
                            let p = newP - 1;
                            let c = senior.category;
                            await House.updateOne(
                              {
                                nursingHome: senior.nursingHome
                              },
                              {
                                $inc: {
                                  ["statistic.easter.plus" + p]: -1,
                                  ["statistic.easter.plus" + newP]: 1,
                                  ["statistic.easter." + c + "Plus"]: 1,
                                }
                              }

                            );
                          }
                        }
                      } else if (updatedOrder.holiday == "День пожилого человека 2024") {
                        for (let lineItem of updatedOrder.lineItems) {
                          for (let person of lineItem.celebrators) {
                            await SeniorDay.updateOne({ _id: person._id }, { $inc: { plusAmount: +1 } }, { upsert: false });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/*
function correctDate(updatedOrders) {
   for (let order of updatedOrders) {
    //console.log("HELLO");
    order.dateOfOrder = new Date(order.dateOfOrder);
    console.log(typeof order.dateOfOrder);
  }
  return updatedOrders; 
}*/

/**
 * API to find regions (OK)
 */

router.get("/get/regions/", checkAuth, async (req, res) => {
  try {
    Region.find({}, function (err, regions) {
      if (err) {
        console.log(err);
        const readRegionsMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readRegionsMongodbErrorResponse.toObject());
      } else {
        console.log("regions");
        console.log(regions);
        regions.sort(
          (prev, next) => {
            if (prev.name < next.name) return -1;
            if (prev.name > next.name) return 1;
          });
        const readRegionsResponse = new BaseResponse(
          200,
          "Query successful",
          regions
        );
        res.json(readRegionsResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const readRegionsCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      e
    );
    res.status(500).send(readRegionsCatchErrorResponse.toObject());
  }
});

router.get("/get/nursingHomes/", checkAuth, async (req, res) => {
  try {
    House.find({ isActive: true }, function (err, nursingHomes) {
      if (err) {
        console.log(err);
        const readRegionsMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readRegionsMongodbErrorResponse.toObject());
      } else {
        console.log("nursingHomes");
        // console.log(nursingHomes);
        nursingHomes.sort(
          (prev, next) => {
            if (prev.nursingHome < next.nursingHome) return -1;
            if (prev.nursingHome > next.nursingHome) return 1;
          });

        let setRegions = new Set();

        for (let house of nursingHomes) {
          setRegions.add(house.region);
        }
        let regions = Array.from(setRegions);
        regions.sort();

        const readRegionsResponse = new BaseResponse(
          200,
          "Query successful",
          {
            nursingHomes: nursingHomes,
            regions: regions
          }
        );
        res.json(readRegionsResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const readRegionsCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      e
    );
    res.status(500).send(readRegionsCatchErrorResponse.toObject());
  }
});


/////////////////////////////////////////////////


//check double order

router.post("/check-double/", checkAuth, async (req, res) => {
  try {
    /*   let contact;
       let id = req.body.clientId;
      console.log(req.body.contact);
        if (req.body.contact) {
         if (req.body.contact.toString()[0] == '+') {
           contact = req.body.contact.toString().slice(1, req.body.contact.toString().length)
         } else {
           contact = req.body.contact.toString()
         }
       }
       let e = email ? new RegExp('^' + email.toString() + '$', 'i') : null;
       let c = contact ? new RegExp('^' + contact.toString() + '$', 'i') : null; */
    let conditions = {
      isDisabled: false,
      holiday: req.body.holiday,
      clientId: req.body.clientId,
      //isReturned: false
    };
    console.log("conditions");
    console.log(conditions);
    /*     if (req.body.email && req.body.contact) {
          conditions = {
            
            $or: [{ email: e }, { contact: c }]
          }
        }
        if (req.body.email && !req.body.contact) {
          conditions = {
            isDisabled: false,
            holiday: req.body.holiday,
            email: e
          }
        }
        if (!req.body.email && req.body.contact) {
          conditions = {
            isDisabled: false,
            holiday: req.body.holiday,
            contact: c
          }
        } */
    let result = await checkDoubleOrder(conditions);
    console.log("result inside");
    console.log(result);
    const readRegionsResponse = new BaseResponse(200, "Query successful", result);
    console.log("result response");
    console.log(readRegionsResponse);
    res.json(readRegionsResponse.toObject());

  } catch (e) {
    console.log(e);
    const readRegionsCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      e
    );
    res.status(500).send(readRegionsCatchErrorResponse.toObject());
  }
});

async function checkDoubleOrder(conditions) {
  let result = {};
  let orders = await Order.find(conditions);
  let usernames = [];
  let seniorsIds = [];
  let houses = [];
  let amount = 0;
  if (orders.length > 0) {
    for (let order of orders) {
      usernames.push(order.userName);
      amount += order.amount;
      console.log("order._id");
      console.log(order._id);
      for (let lineItem of order.lineItems) {
        houses.push(lineItem.nursingHome);
        for (let celebrator of lineItem.celebrators) {
          seniorsIds.push(celebrator._id);

        }
      }
    }
    let h = new Set(houses);
    let u = new Set(usernames);
    result.users = Array.from(u);
    result.houses = Array.from(h);
    result.seniorsIds = seniorsIds;
    result.amount = amount;
  } else { result = null; }

  console.log("result checkDoubleOrder");
  // console.log(order);
  console.log(result);


  return result;
}






//create name day order

router.post("/name-day", checkAuth, async (req, res) => {
  let finalResult;
  try {
    console.log("req.body.temporaryLineItems");
    console.log(req.body.temporaryLineItems);
    let newOrder = {

      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      // institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: req.body.temporaryLineItems,
      lineItems: [],
      isCompleted: false,
    };
    console.log("newOrder.temporaryLineItems");
    console.log(newOrder.temporaryLineItems);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    finalResult = await createOrderForNameDay(newOrder);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult.result);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//fill lineItems
async function createOrderForNameDay(order) {
  console.log(order);

  let lineItems = [];
  let nursingHomes = await House.find({});

  order.temporaryLineItems.sort(
    (prev, next) =>
      prev.dateNameDay - next.dateNameDay
  );
  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
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
        return {
          result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${person.nursingHome}.`,
          success: false
        };
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


  let createdOrder = await Order.create(order);
  for (let element of createdOrder.temporaryLineItems) {
    if (order.holiday == "Именины февраля 2025") {
      await NameDay.updateOne({ _id: element._id }, { $inc: { plusAmount: 1 } });
    }
    if (order.holiday == "Именины марта 2025") {
      await NameDayNext.updateOne({ _id: element._id }, { $inc: { plusAmount: 1 } });
    }
    if (order.holiday == "Именины января 2025") {
      await NameDayBefore.updateOne({ _id: element._id }, { $inc: { plusAmount: 1 } });
    }
  }
  await Order.updateOne({ _id: createdOrder._id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  let newOrder = await Order.findOne({ _id: createdOrder._id });
  // await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return {
    result: newOrder.lineItems,
    success: true,
    order_id: newOrder._id

  }
}
////////////////////////////////////////////////////

/////////////////////////////////////////////////

//create teacher day order

router.post("/teacher-day", checkAuth, async (req, res) => {
  let finalResult;
  try {
    console.log("req.body.temporaryLineItems");
    console.log(req.body.temporaryLineItems);
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      // institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: req.body.temporaryLineItems,
      lineItems: [],
      isCompleted: false,
    };
    console.log("newOrder.temporaryLineItems");
    console.log(newOrder.temporaryLineItems);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    finalResult = await createOrderForTeacherDay(newOrder);
    console.log("finalResult");
    console.log(finalResult);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//fill lineItems
async function createOrderForTeacherDay(order) {
  console.log(order);

  let lineItems = [];
  let nursingHomes = await House.find({});

  order.temporaryLineItems.sort(
    (prev, next) =>
      prev.monthHoliday - next.monthHoliday
  );
  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
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
        return {
          result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${person.nursingHome}.`,
          success: false
        };
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


  let createdOrder = await Order.create(order);
  for (let element of createdOrder.temporaryLineItems) {
    await TeacherDay.updateOne({ _id: element._id }, { $inc: { plusAmount: 1 } });
    console.log("pluses");
  }
  await Order.updateOne({ _id: createdOrder._id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  let newOrder = await Order.findOne({ _id: createdOrder._id });
  // await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return {
    result: newOrder.lineItems,
    success: true,
    order_id: newOrder._id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName,

  }
}

//create teacher day order for institute

router.post("/teacher-day-for-institute", checkAuth, async (req, res) => {
  let finalResult;
  try {

    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      // institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: req.body.temporaryLineItems,
      lineItems: [],
      isCompleted: false,
    };
    console.log("newOrder.temporaryLineItems");
    console.log(newOrder.temporaryLineItems);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }
    let doneHouses = await checkDoubleOrder({ isDisabled: false, holiday: req.body.holiday, clientId: req.body.clientId });
    let restrictedHouses;
    if (doneHouses) {
      restrictedHouses = ["ПЕРВОМАЙСКИЙ_СОТРУДНИКИ", "ЧИКОЛА", "КАШИРСКОЕ", "ВОРОНЕЖ_ДНЕПРОВСКИЙ", "АРМАВИР", ...doneHouses.houses];
    } else {
      restrictedHouses = ["ПЕРВОМАЙСКИЙ_СОТРУДНИКИ", "ЧИКОЛА", "КАШИРСКОЕ", "ВОРОНЕЖ_ДНЕПРОВСКИЙ", "АРМАВИР"];
    }


    finalResult = await createOrderForTeacherDayForInstitute(newOrder, restrictedHouses);
    console.log("finalResult");
    console.log(finalResult);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//fill lineItems
async function createOrderForTeacherDayForInstitute(newOrder, restrictedHouses) {
  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  console.log("emptyOrder.dateOfOrder");
  console.log(emptyOrder.dateOfOrder);

  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData = await fillOrderForInstitutes(
    order_id,
    [],
    restrictedHouses,
    newOrder.holiday,
    newOrder.amount
  );

  if (seniorsData.length < newOrder.amount) {

    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }
  const nursingHomes = await House.find({});
  let resultLineItems = await generateLineItems(nursingHomes, order_id);
  // console.log("resultLineItems");
  //console.log(resultLineItems);
  //console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    // console.log("resultLineItems222");
    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName,
    //institutes: newOrder.institutes,
  }
}


///////////////////////////////////////////////////////

//create senior day order

router.post("/senior-day", checkAuth, async (req, res) => {
  let finalResult;
  try {

    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      // institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: req.body.temporaryLineItems,
      lineItems: [],
      isCompleted: false,
    };
    console.log("newOrder.temporaryLineItems");
    console.log(newOrder.temporaryLineItems);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }
    let doneHouses = await checkDoubleOrder({ isDisabled: false, holiday: req.body.holiday, clientId: req.body.clientId });
    console.log("doneHouses");
    console.log(doneHouses);
    let restrictedHouses = [];

    if (doneHouses) restrictedHouses = doneHouses.houses;  //ИСПРАВИТЬ
    console.log("restrictedHouses");
    console.log(restrictedHouses);

    let restrictedId = [];

    /*     let restrictedId = await checkDoubleOrder({ isDisabled: false, holiday: req.body.holiday, clientId: req.body.clientId, });
        restrictedId = restrictedId.seniorsIds;
    
        console.log("restrictedId");
        console.log(restrictedId); */


    finalResult = await createOrderForSeniorDay(newOrder, restrictedHouses, restrictedId);
    console.log("finalResult");
    console.log(finalResult);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//fill lineItems
async function createOrderForSeniorDay(newOrder, restrictedHouses, restrictedId) {
  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  console.log("emptyOrder.dateOfOrder");
  console.log(emptyOrder.dateOfOrder);

  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData = await fillOrderForInstitutes(
    order_id,
    restrictedId,
    restrictedHouses,
    newOrder.holiday,
    newOrder.amount
  );

  if (seniorsData.length < newOrder.amount) {

    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }
  const nursingHomes = await House.find({});
  let resultLineItems = await generateLineItems(nursingHomes, order_id);
  // console.log("resultLineItems");
  //console.log(resultLineItems);
  //console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    // console.log("resultLineItems222");
    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName,
    //institutes: newOrder.institutes,
  }
}



////////////////////////////////////////////////////BIRTHDAY 789

router.post("/birthday/:amount", checkAuth, async (req, res) => {
  let finalResult;

  console.log(" institutes: req.body.institutes,");
  console.log(req.body.institutes,);
  try {
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      //institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: [],
      lineItems: [],
      filter: req.body.filter,
      isCompleted: false
    };

    console.log("newOrder.filter");
    console.log(newOrder.filter);
    // console.log(newOrder.dateOfOrder);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    finalResult = await createOrder(newOrder, req.body.prohibitedId, req.body.restrictedHouses);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.holiday, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//delete pluses because of error 

async function deleteErrorPlus(order_id, holiday, ...userName) {
  try {
    let filter = order_id ? { _id: order_id } : { userName: userName[0], isCompleted: false };
    //console.log("userName[0]");
    //console.log(userName[0]);

    let order = await Order.findOne(filter);  //, { projection: { _id: 0, temporaryLineItems: 1 } }

    if (order) {
      if (order.temporaryLineItems && order.temporaryLineItems.length > 0) {
        let seniors_ids = [];
        for (let person of order.temporaryLineItems) {
          seniors_ids.push(person.celebrator_id);
        }

        if (holiday == "Дни рождения мая 2025") {
          await ListNext.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
        }
        if (holiday == "Дни рождения апреля 2025") {
          await List.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
        }
        if (holiday == "Дни рождения марта 2025") {
          await ListBefore.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
        }


      }
      await Order.deleteOne({ _id: order._id });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    sendMessageToAdmin('something wrong with "deleteErrorPlus"', e);
  }
}


// Create order
async function createOrder(newOrder, prohibitedId, restrictedHouses) {
  let month = await Month.findOne({ isActive: true });
  console.log('month');
  console.log(month);

  //let period = await Period.findOne({ key:0 });
  let period;
  if (newOrder.holiday == "Дни рождения апреля 2025") {
    period = {
      "date1": 1,
      "date2": 5,
      "isActive": true,
      "key": 0,
      "maxPlus": 2, //PLUSES1
      "secondTime": false,
      "scoredPluses": 2
    }
    /*     period = await Period.findOne({ isActive: true });
        if (!period)
          return {
            result: "Обратитесь к администратору. Заявка не сформирована. Не найден активный период.",
            success: false
          };*/ /* CANCEL */
    /*console.log('period');
    console.log(period);
    let periodResult = await checkActivePeriod(period, month);
    console.log('periodResult');
    console.log(periodResult);
    if (!periodResult) return {
      result: "Обратитесь к администратору. Заявка не сформирована. Не найден активный период.",
      success: false
    };
    if (typeof periodResult == "string") period = await Period.findOne({ isActive: true }); */ /* CANCEL */
  }


  if (newOrder.holiday == "Дни рождения марта 2025") {
    period = {
      "date1": 21,
      "date2": 31,
      "isActive": true,
      "key": 0,
      "maxPlus": 2,
      "secondTime": true,
      "scoredPluses": 2
    }
  }
  if (newOrder.holiday == "Дни рождения мая 2025") {
    period = {
      "date1": 1,
      "date2": 5,
      "isActive": true,
      "key": 0,
      "maxPlus": 2,  //PLUSES1
      "secondTime": false,
      "scoredPluses": 2
    }

    console.log('period');
    console.log(period);
  }
  if (newOrder.filter.onlyWithConcent) {
    period.maxPlus = 6;
  }


  let proportion = {};

  if (newOrder.filter.genderFilter != 'proportion') {
    if (newOrder.amount > 50) {
      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {
        oldWomenAmount = Math.round(newOrder.amount * 0.3);
        oldMenAmount = Math.round(newOrder.amount * 0.2);
        specialWomenAmount = Math.round(newOrder.amount * 0.1);
        specialMenAmount = Math.round(newOrder.amount * 0.1);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;

      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.5)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;

        /*       specialWomenAmount = 0
              specialMenAmount = newOrder.filter.maxNoAddress;
       */
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.2);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }


      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.3)
      }
      if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;
    } else {

      /*       let oldWomenAmount = Math.round(newOrder.amount * 0.2) ? Math.round(newOrder.amount * 0.2) : 1;
            let oldMenAmount = Math.round(newOrder.amount * 0.2);
            let yangWomenAmount = Math.round(newOrder.amount * 0.1);
            let yangMenAmount = Math.round(newOrder.amount * 0.1);
            let specialMenAmount = Math.round(newOrder.amount * 0.1);
            let specialWomenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount - specialMenAmount;
       */

      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {
        oldWomenAmount = Math.round(newOrder.amount * 0.2) ? Math.round(newOrder.amount * 0.2) : 1;
        oldMenAmount = Math.round(newOrder.amount * 0.2);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = Math.round(newOrder.amount * 0.1);
        if (newOrder.amount == 5) {
          //yangWomenAmount = 0;
          yangMenAmount = 0;
        }

        // specialMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount;

        specialMenAmount = Math.round(newOrder.amount * 0.1);
        specialWomenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount - specialMenAmount;


      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.5)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;

        /*         specialWomenAmount = 0
                specialMenAmount = newOrder.filter.maxNoAddress; */
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.2);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }
      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.3)
      }
    }


    // proportion = await Proportion.findOne({ amount: newOrder.amount });789
    if (!proportion) {
      return {
        result: `Обратитесь к администратору. Заявка не сформирована. Для количества ${newOrder.amount} не найдена пропорция`,
        success: false
      };
    } else {
      if (!newOrder.filter.maxOneHouse && (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region)) proportion.oneHouse = undefined;
      //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
      console.log("newOrder.filter.region");
      console.log(newOrder.filter.region);

      console.log("proportion.oneHouse");
      console.log(proportion.oneHouse);

      if (!newOrder.filter.onlyWithPicture && !newOrder.filter.region && !newOrder.filter.nursingHome && newOrder.amount < 21) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);

    }

  }


  if (newOrder.filter.genderFilter == 'proportion') {

    let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
    if (!newOrder.filter.maxNoAddress) {
      oldWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.5);
      oldMenAmount = Math.round(newOrder.filter.maleAmount * 0.5);
      specialWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.2);
      specialMenAmount = Math.round(newOrder.filter.maleAmount * 0.2);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;


    } else {

      specialWomenAmount = Math.ceil(newOrder.filter.femaleAmount / newOrder.amount * newOrder.filter.maxNoAddress);
      specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
      oldWomenAmount = Math.round((newOrder.filter.femaleAmount - specialWomenAmount) * 0.5);
      oldMenAmount = Math.round((newOrder.filter.maleAmount - specialMenAmount) * 0.5);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;
    }
    proportion = {
      "amount": newOrder.amount,
      "oldWomen": oldWomenAmount,
      "oldMen": oldMenAmount,
      "specialWomen": specialWomenAmount,
      "specialMen": specialMenAmount,
      "yangWomen": yangWomenAmount,
      "yangMen": yangMenAmount,
      "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.3),
      "oneRegion": Math.ceil(newOrder.amount * 0.33)
    }

    if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region || newOrder.amount > 20) {
      proportion.oneRegion = undefined;
    }
  }
  //proportion.oneRegion = undefined;
  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  console.log("emptyOrder.dateOfOrder");
  console.log(emptyOrder.dateOfOrder);

  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData;
  let filter = {};
  let isOutDate = false;
  const nursingHomes = await House.find({});
  let chosenHome;


  if (newOrder.filter) {

    if (newOrder.filter.nursingHome) {
      chosenHome = nursingHomes.filter(item => item.nursingHome == newOrder.filter.nursingHome)[0];
      if ((chosenHome.isReleased || chosenHome.noAddress) && (newOrder.filter.addressFilter != 'noSpecial' && newOrder.filter.addressFilter != 'forKids' && newOrder.filter.addressFilter != 'noReleased')) {
        proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
        proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
        proportion.oldWomen = 0;
        proportion.oldMen = 0;
        proportion.yangWomen = 0;
        proportion.yangMen = 0;
      }
    }

    if (newOrder.filter.addressFilter == 'noSpecial') {
      proportion.yangWomen = proportion.yangWomen + proportion.specialWomen;
      proportion.yangMen = proportion.yangMen + proportion.specialMen;
      proportion.specialMen = 0;
      proportion.specialWomen = 0;
    }

    if (newOrder.filter.addressFilter == 'onlySpecial') {
      proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
      proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
      proportion.oldWomen = 0;
      proportion.oldMen = 0;
      proportion.yangWomen = 0;
      proportion.yangMen = 0;

    }

    if (newOrder.filter.addressFilter == 'forKids') {
      proportion.oldWomen = proportion.oldWomen + proportion.specialWomen;
      proportion.oldMen = proportion.oldMen + proportion.specialMen;
      proportion.specialWomen = 0;
      proportion.specialMen = 0;

      console.log("forKids");
      console.log(proportion);
      if (!newOrder.filter.year1 && !newOrder.filter.year2) {
        newOrder.filter.year2 = 1963;
      }
    }

    /*}
      else {
  
        if (newOrder.filter.nursingHome) {
          chosenHome = nursingHomes.filter(item => item.nursingHome == newOrder.filter.nursingHome)[0];
          if ((chosenHome.isReleased || chosenHome.noAddress) && (newOrder.filter.addressFilter != 'noSpecial' && newOrder.filter.addressFilter != 'forKids' && newOrder.filter.addressFilter != 'noReleased')) {
            proportion.specialOnly = proportion.yang + proportion.oldWomen + proportion.oldMen + proportion.special;
            proportion.oldWomen = 0;
            proportion.oldMen = 0;
            proportion.yang = 0;
            proportion.special = 0;
            console.log("filter.nursingHome");
            console.log(proportion);
          }
        }
  
        if ((newOrder.filter.onlyWithPicture || newOrder.filter.nursingHome || newOrder.filter.region) && newOrder.filter.addressFilter == 'any') {
          proportion.allCategory = proportion.yang + proportion.oldWomen + proportion.oldMen + proportion.special;
          proportion.oldWomen = 0;
          proportion.oldMen = 0;
          proportion.yang = 0;
          proportion.special = 0;
        }
  
        if (newOrder.filter.addressFilter == 'noSpecial') {
          proportion.yang = proportion.yang + proportion.special;
          proportion.special = 0;
        }
  
        if (newOrder.filter.addressFilter == 'onlySpecial') {
          proportion.specialOnly = proportion.yang + proportion.oldWomen + proportion.oldMen + proportion.special;
          proportion.oldWomen = 0;
          proportion.oldMen = 0;
          proportion.yang = 0;
          proportion.special = 0;
        }
  
        if (newOrder.filter.addressFilter == 'forKids') {
          proportion.oldWomen = proportion.oldWomen + proportion.special;
          proportion.special = 0;
          console.log("forKids");
          console.log(proportion);
          if (!newOrder.filter.year1 && !newOrder.filter.year2) {
            newOrder.filter.year2 = 1972;
          }
        }
      } */

    console.log("proportion");
    console.log(proportion);

    if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: null };
    if (newOrder.filter.onlyAnniversaries) filter.specialComment = /Юбилей/;
    if (newOrder.filter.onlyAnniversariesAndOldest) filter.$or = [{ specialComment: /Юбилей/ }, { oldest: true }];
    if (newOrder.filter.region) filter.region = newOrder.filter.region;
    if (newOrder.filter.nursingHome) filter.nursingHome = newOrder.filter.nursingHome;
    if (newOrder.filter.genderFilter == 'Male') filter.gender = 'Male';
    if (newOrder.filter.genderFilter == 'Female') filter.gender = 'Female';
    if (newOrder.filter.addressFilter == 'noReleased' || newOrder.filter.addressFilter == 'onlySpecial' || newOrder.filter.addressFilter == 'forKids') filter.isReleased = false;
    if (newOrder.filter.addressFilter == 'noSpecial' || newOrder.filter.addressFilter == 'forKids') filter.noAddress = false;
    if (newOrder.filter.addressFilter == 'onlySpecial') filter.noAddress = true;
    if (newOrder.filter.addressFilter == 'forKids') filter.yearBirthday = { $lte: 1963 };
    if (newOrder.filter.year1 || newOrder.filter.year2) {
      if (!newOrder.filter.year1) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: 1900 };
      if (!newOrder.filter.year2) filter.yearBirthday = { $lte: 2022, $gte: newOrder.filter.year1 };
      /*       if (newOrder.filter.year1 > 1958 && newOrder.filter.addressFilter != 'onlySpecial') {
              proportion.yang = proportion.yang + proportion.oldWomen + proportion.oldMen;
              proportion.oldWomen = 0;
              proportion.oldMen = 0;
            } */
      if (newOrder.filter.year1 && newOrder.filter.year2) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: newOrder.filter.year1 };
    }

    let housesForInstitutes = [];
    /*     if (newOrder.institutes.length > 0) {
          let activeHouse = await House.find({ isReleased: false, isActive: true });
    
          for (let house of activeHouse) {
            let count = await List.aggregate([
              { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 5 }, } },
              { $group: { _id: null, count: { $sum: 1 } } }
            ]);
            if (count[0]?.count > 12) { housesForInstitutes.push(house.nursingHome); }
          }
        } */

    if (/* newOrder.institutes.length > 0 &&  */newOrder.filter.onlyWithConcent) {
      filter.dateOfSignedConsent = { $ne: null };
    } else {
      filter.dateOfSignedConsent = null;
    };

    if (newOrder.filter.date1 || newOrder.filter.date2) {
      isOutDate = true;
      /*       if(!newOrder.filter.date1) {
              let day1 = (newOrder.filter.date2-6)<0 ? 1 : newOrder.filter.date2-6;
              filter.dateBirthday = { $lte: newOrder.filter.date2, $gte: day1 };
            }
            if(!newOrder.filter.date2) {
              let day2 = (newOrder.filter.date1+6)<0 ? 1 : newOrder.filter.date1+6;
              filter.dateBirthday = { $lte: day2, $gte: newOrder.filter.date1 };
            } */

      //if(newOrder.filter.date1 && newOrder.filter.date2) filter.dateBirthday = { $lte: newOrder.filter.date2, $gte: newOrder.filter.date1 };

      seniorsData = await fillOrderSpecialDate(housesForInstitutes, proportion, period, order_id, filter, newOrder.filter.date1, newOrder.filter.date2, prohibitedId, restrictedHouses, newOrder.filter, newOrder.holiday);
    } else {
      seniorsData = await fillOrder(housesForInstitutes, proportion, period, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter, newOrder.holiday);
    }
  }
  console.log("seniorsData");
  console.log(seniorsData);


  if (seniorsData.celebratorsAmount < newOrder.amount) {

    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }


  let resultLineItems = await generateLineItems(nursingHomes, order_id);
  // console.log("resultLineItems");
  //console.log(resultLineItems);
  //console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    // console.log("resultLineItems222");
    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  checkActiveList(period, month, isOutDate, seniorsData.date1, seniorsData.date2);
  // CANCEL 
  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName,
    //institutes: newOrder.institutes,
  }
}

// create a list of seniors for the order with special dates

async function fillOrderSpecialDate(housesForInstitutes, proportion, period, order_id, filter, date1, date2, prohibitedId, restrictedHouses, orderFilter, holiday) {
  const categories = ["oldWomen", "oldMen", "yangWomen", "yangMen", "specialWomen", "specialMen",]; // "specialOnly", "allCategory"
  let day1, day2, fixed;

  if (!date1) {
    date1 = 1;
    fixed = 'date2';
  }
  if (!date2) {
    date2 = 31;
    fixed = 'date1';
  }
  if (date1 && date2) {
    fixed = false;
  }

  console.log("filter");
  console.log(filter);
  //ДОБРО РУ
  if (proportion.amount < 1 && !filter.nursingHome && !filter.region && !filter.linkPhoto) {
    console.log("if");
    if (fixed == 'date1') {
      if (date1 < period.date1) {
        day1 = period.date1;
        day2 = period.date2 + 1;
      } else {
        day1 = date1;
        day2 = day1 + 5 < 31 ? day1 + 5 : 31;
      }
    }

    if (fixed == 'date2') {
      if (date2 > period.date2) {
        day1 = period.date1;
        day2 = period.date2 + 1;
      } else {
        day2 = date2;
        day1 = day2 - 5 > 0 ? day2 - 5 : 1;
      }
    }

    if (fixed == false) {
      if (date2 - date1 < 6) {
        day1 = date1;
        day2 = date2;
      } else {
        if (date1 < period.date1 && date2 > period.date2) {
          day1 = period.date1;
          day2 = period.date2 + 1;
        } else {
          day1 = date1;
          day2 = day1 + 5 < 31 ? day1 + 5 : 31;
        }
      }
    }

  } else {
    day1 = date1;
    day2 = date2;
    console.log("else");

  }

  filter.dateBirthday = { $lte: day2, $gte: day1 };
  console.log("filter.dateBirthday");
  console.log(filter.dateBirthday);

  let data = {
    houses: {},
    restrictedHouses: [...restrictedHouses],
    restrictedPearson: [...prohibitedId],
    celebratorsAmount: 0,
    date1: day1,
    date2: day2,
    maxPlus: period.maxPlus,
    filter: filter,
    order_id: order_id,
    //temporaryLineItems: [],
  }


  console.log(data.maxPlus);
  if (proportion.oneRegion) {
    data.regions = {};
    data.restrictedRegions = [];
  }

  for (let category of categories) {

    data.category = category;
    data.proportion = proportion;
    data.counter = 0;
    //console.log(category);
    //console.log(proportion[category]);

    if (proportion[category]) {
      data = await collectSeniors(housesForInstitutes, data, orderFilter, holiday);
      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }

  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  return data;
}


// create a list of seniors for the order 789

async function fillOrder(housesForInstitutes, proportion, period, order_id, filter, prohibitedId, restrictedHouses, orderFilter, holiday) {
  const categories = ["oldWomen", "oldMen", "yangWomen", "yangMen", "specialWomen", "specialMen",]; // "specialOnly", "allCategory"

  let data = {
    houses: {},
    restrictedHouses: [...restrictedHouses],
    restrictedPearson: [...prohibitedId],
    celebratorsAmount: 0,
    /*     date1: period.date1,
        date2: period.date2,
        maxPlus: period.maxPlus, */
    filter: filter,
    order_id: order_id,
    //temporaryLineItems: [],
  }
  if (proportion.oneRegion) {
    data.regions = {};
    data.restrictedRegions = [];
  }

  for (let category of categories) {

    data.category = category;
    data.proportion = proportion;
    data.counter = 0;
    //console.log(category);
    //console.log(proportion[category]);

    if (proportion[category]) {

      data.date1 = period.date1;
      data.date2 = period.date2;
      data.maxPlus = period.maxPlus;

      data = await collectSeniors(housesForInstitutes, data, orderFilter, holiday);

      if (data.counter < proportion[category]) {
        //if (orderFilter.date2 > orderFilter.date1 + 5) { }
        if (period.key == 5) {
          //  data.maxPlus = period.maxPlus + 1;
          data.date1 = period.date1;
          data.date2 = period.date2;
        } else {
          if (proportion.amount < 31) {
            data.maxPlus = period.maxPlus;
            data.date1 = period.date2 + 1;
            data.date2 = period.date2 + 1;
          } else {
            // data.maxPlus = period.key == 4 ? period.maxPlus + 1 : period.maxPlus;
            data.date1 = period.date1 + 5;
            data.date2 = period.date2 + 5;
          }
        }
        data = await collectSeniors(housesForInstitutes, data, orderFilter, holiday);
      }

      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }
  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  return data;
}


//set restrictions for searching

async function collectSeniors(housesForInstitutes, data, orderFilter, holiday) {
  if (holiday == "Дни рождения мая 2025") {
    console.log('test1');
  }
  console.log('holiday1');
  console.log(holiday);


  /* let test = await List.findOne({dateBirthday: 1});*/
  console.log('data.filter.addressFilter');
  console.log(data.filter);

  let searchOrders = {};

  if (orderFilter.genderFilter != 'proportion') {

    if (data.filter.addressFilter != 'onlySpecial') {
      if (data.filter.region && data.filter.addressFilter != 'forKids') {
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen", "specialWomen", "specialMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen", "specialMen", "specialWomen"],
          yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen", "specialMen", "specialWomen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen", "specialMen", "specialWomen"],
          specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
          specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
        }
      } else {

        if (data.filter.addressFilter == 'forKids') {
          searchOrders = {
            oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
            oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
            yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
            yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"]
          }
        }

        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen", "oldest"],//
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen", "oldest"],//
          yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen", "oldest"],//
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen", "oldest"],//
          specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
          specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
          // specialOnly: ["special", "oldWomen"],
          // allCategory: ["oldMen", "oldWomen", "yang", "oldest", "special"]
        };
      }
    } else {
      searchOrders = {
        /*         oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
                oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
                yangWomen: ["yangWomen", "yangMen", "oldWomen", "oldMen"],
                yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"], */
        specialWomen: ["specialWomen", "specialMen"],
        specialMen: ["specialMen", "specialWomen"],
      };
    }
  }

  if (orderFilter.genderFilter == 'proportion') {
    if (orderFilter.addressFilter != 'onlySpecial') {
      if (data.filter.region && data.filter.addressFilter != 'forKids') {
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "specialWomen",],
          oldMen: ["oldMen", "yangMen", "specialMen",],
          yangWomen: ["yangWomen", "oldWomen", "specialWomen"],
          yangMen: ["yangMen", "oldMen", "specialMen",],
          specialWomen: ["specialWomen", "yangWomen", "oldWomen",],
          specialMen: ["specialMen", "yangMen", "oldMen",],
        }
      } else {
        if (data.filter.addressFilter == 'forKids') {
          searchOrders = {
            oldWomen: ["oldWomen", "yangWomen"],
            oldMen: ["oldMen", "yangMen"],
            yangWomen: ["yangWomen", "oldWomen"],
            yangMen: ["yangMen", "oldMen"]
          }
        }
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen"],
          oldMen: ["oldMen", "yangMen"],
          yangWomen: ["yangWomen", "oldWomen"],
          yangMen: ["yangMen", "oldMen"],
          specialWomen: ["specialWomen", "yangWomen", "oldWomen"],
          specialMen: ["specialMen", "yangMen", "oldMen"],
        };
      }
    } else {
      searchOrders = {
        /*         oldWomen: ["oldWomen", "yangWomen"],
                oldMen: ["oldMen", "yangMen"],
                yangWomen: ["yangWomen", "oldWomen"],
                yangMen: ["yangMen", "oldMen"], */
        specialWomen: ["specialWomen"],
        specialMen: ["specialMen"],
      };
    }
  }


  console.log("searchOrders");
  console.log(searchOrders);

  for (let kind of searchOrders[data.category]) {
    let barrier = data.proportion[data.category] - data.counter;

    outer1: for (let i = 0; i < barrier; i++) {
      let result = await searchSenior(
        housesForInstitutes,
        kind,
        data,
        holiday

      );
      if (result) {
        //console.log(result);
        await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
        if (holiday == "Дни рождения мая 2025") {
          await ListNext.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        }
        if (holiday == "Дни рождения апреля 2025") {
          await List.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        }
        if (holiday == "Дни рождения марта 2025") {
          await ListBefore.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        }

        data.celebratorsAmount++;
        data.restrictedPearson.push(result.celebrator_id);
        data.counter++;
        // console.log("data.proportion.oneHouse");
        // console.log(data.proportion.oneHouse);
        if (data.proportion.oneHouse) data.houses[result["nursingHome"]] = (!data.houses[result["nursingHome"]]) ? 1 : data.houses[result["nursingHome"]] + 1;
        if (data.proportion.oneRegion) data.regions[result["region"]] = (!data.regions[result["region"]]) ? 1 : data.regions[result["region"]] + 1;
        // console.log("data.regions");
        // console.log(data.regions);

        if (data.proportion.oneHouse) {
          if (data.houses[result["nursingHome"]] == data.proportion["oneHouse"]) {
            data.restrictedHouses.push(result["nursingHome"]);
          }
        }
        if (data.proportion.oneRegion) {
          if (data.regions[result["region"]] == data.proportion["oneRegion"]) {
            data.restrictedRegions.push(result["region"]);
          }
        }

      } else {
        break outer1;
      }
    }
  }
  return data;
}

// get senior
async function searchSenior(
  housesForInstitutes,
  kind,
  data, holiday
  /*   restrictedHouses,
    restrictedPearson,
    date1,
    date2,
    maxPlus,
    orderFilter */
) {

  console.log('holiday2');
  console.log(holiday);

  /*  data.restrictedHouses,
      data.restrictedPearson,
      data.date1,
      data.date2,
      data.maxPlus,
      data.filter */


  //data.restrictedHouses= [];

  let standardFilter = {
    nursingHome: { $nin: data.restrictedHouses },  //PLUSES
    // nursingHome: { $in: ["БЛАГОВЕЩЕНСК_ЗЕЙСКАЯ"] },//, , , "СЫЗРАНЬ_КИРОВОГРАДСКАЯ""ЕЛАТЬМА""ГРЯЗОВЕЦ"
    // nursingHome: { $in: housesForInstitutes },    
    //firstName: "Нина",
    /* 
        lastName: {$in: [
          'Михай',
          'Мохначева',
          'Мысина',
          'Нахрачева',
          'Неизвестная',
          'Новичкова',
          'Новоселова',
          'Певная',
          'Петрухина',     
          
        ]}, */

    //nursingHome: { $in: ["ТАМБОВСКИЙ_ЛЕСХОЗ", "МОСКВА_РОТЕРТА", "ШЕБЕКИНО", "РАДЮКИНО", "САДОВЫЙ", "МАЧЕХА", "ТВЕРЬ_КОНЕВА", "ЯРЦЕВО", "СОЛИКАМСК_ДУБРАВА", "СОЛИКАМСК_СЕЛА", "СЕВЕРОДВИНСК", "КРИПЕЦКОЕ", "ЧЕРМЕНИНО", "ГАВРИЛОВ-ЯМ", "ЙОШКАР-ОЛА", "КРАСНОВИШЕРСК", "ЗЕРНОГРАД_МИРА", "ЗЕРНОГРАД_САМОХВАЛОВА", "НОВОЧЕРКАССК", "БЕРЕЗОВСКИЙ", "АЛАКУРТТИ", "ТОВАРКОВСКИЙ_ДИПИ", "КОСТРОМА_КИНЕШЕМСКОЕ", "ТОЛЬЯТТИ", "СЫЗРАНЬ_КИРОВОГРАДСКАЯ", "УСОЛЬЕ", "ДМИТРОВСКИЙ_ПОГОСТ_ОКТЯБРЬСКАЯ", "СЫЗРАНЬ_ПОЖАРСКОГО", "АНДРЕЕВСКИЙ", "ВОЛГОГРАД_ВОСТОЧНАЯ", "ПРОШКОВО", "АВДОТЬИНКА", "ИРКУТСК_ЯРОСЛАВСКОГО", "ВОРОНЕЖ_ДНЕПРОВСКИЙ","ДИМИТРОВГРАД","БЕРДСК",] }, 
    // nursingHome: { $in: ["РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК", "МАГАДАН_АРМАНСКАЯ","ОКТЯБРЬСКИЙ",] }, 
    //nursingHome: { $in: ["РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК", "МАГАДАН_АРМАНСКАЯ","ОКТЯБРЬСКИЙ","РОСТОВ-НА-ДОНУ", "НОВОСИБИРСК_ЖУКОВСКОГО", "ДУБНА_ТУЛЬСКАЯ", "БИЙСК", "СОСНОВКА", "СКОПИН", "МАРКОВА", "НОГИНСК", "ВЕРХНЕУРАЛЬСК", "НОВОСИБИРСК_ЖУКОВСКОГО", "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ", "ТАЛИЦА_УРГА", "КРАСНОЯРСК",] }, 
    //nursingHome: { $in: [ "ШЕБЕКИНО", "РАДЮКИНО", "САДОВЫЙ", "МАЧЕХА", "ТВЕРЬ_КОНЕВА", "ЯРЦЕВО", "СОЛИКАМСК_ДУБРАВА", "СОЛИКАМСК_СЕЛА", "СЕВЕРОДВИНСК", "ГАВРИЛОВ-ЯМ", "ЙОШКАР-ОЛА", "ТОЛЬЯТТИ",  "АВДОТЬИНКА", "ИРКУТСК_ЯРОСЛАВСКОГО", ] }, 

    //nursingHome: { $in: ["МАРКОВА", "НОГИНСК", "ВЕРХНЕУРАЛЬСК", "НОВОСИБИРСК_ЖУКОВСКОГО", "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ", "ТАЛИЦА_УРГА", "КРАСНОЯРСК", "РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК",  "ДУБНА_ТУЛЬСКАЯ", "БИЙСК",] }, 

    //nursingHome: { $in: ["МАГАДАН_АРМАНСКАЯ","ОКТЯБРЬСКИЙ", "РОСТОВ-НА-ДОНУ", "НОВОСИБИРСК_ЖУКОВСКОГО", "БОГРАД", "ВЛАДИКАВКАЗ", "ДУБНА_ТУЛЬСКАЯ", "БИЙСК", "КАНДАЛАКША",  "РАЙЧИХИНСК",  "СОСНОВКА", "СКОПИН", "ЖЕЛЕЗНОГОРСК", "ТОЛЬЯТТИ", "МАРКОВА", "НОГИНСК", "ВЕРХНЕУРАЛЬСК", "НОВОСИБИРСК_ЖУКОВСКОГО", "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ", "ТАЛИЦА_УРГА", "КРАСНОЯРСК", "РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК", ]}, //ДОБРО РУ    //uncertain: true, // DELETE
    //specialComment: {$ne: ""},
    _id: { $nin: data.restrictedPearson },

    dateBirthday: { $gte: data.date1, $lte: data.date2 },
    absent: { $ne: true },
    //plusAmount: 5,
    //dateOfSignedConsent: { $ne: null }, //PLUSES1
    //firstName: "Светлана"
  };
  if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions };
  if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
  // console.log("DATA");
  //console.log(data);
  if ((data.proportion.amount > 12 || data.proportion.amount < 5) && (!data.filter.nursingHome)) {
    //standardFilter.isReleased = false;
  }

  /*   console.log("data.filter.addressFilter");
    console.log(data.filter.addressFilter);
  
    if (data.filter.addressFilter == 'noReleased') {
      standardFilter.isReleased = false;
         console.log("standardFilter");
    console.log(standardFilter);
    } */

  /*   if (data.proportion.amount > 12) {
      standardFilter.isReleased = false;
    } */
  //standardFilter.isReleased = false;

  //console.log("maxPlus");
  //console.log(maxPlus);

  let filter = Object.assign(standardFilter, data.filter);
  //console.log("FILTER");
  //console.log(filter);

  let celebrator;
  //CHANGE!!!
  //let maxPlusAmount = 3;  
  //let maxPlusAmount = 3; 
  let maxPlusAmount = data.maxPlus; //PLUSES1
  if (standardFilter.oldest || standardFilter.category == "oldWomen" || standardFilter.category == "yangWomen") {
    maxPlusAmount = 4;
  }
  if (standardFilter.category == "oldMen" || standardFilter.category == "yangMen") {//|| standardFilter.category == "specialWomen"
    maxPlusAmount = 3;
  }

  // let maxPlusAmount = standardFilter.oldWomen ? 4 : data.maxPlus;
  if (!standardFilter.oldest) {
    // filter.specialComment = /Юбилей/;
    // filter.yearBirthday = { $lt: 1944 };
  };
  // 

  //console.log("maxPlusAmount");
  //console.log(maxPlusAmount);

  for (let plusAmount = 1; plusAmount <= maxPlusAmount; plusAmount++) {
    filter.plusAmount = { $lt: plusAmount };


    console.log("filter");
    console.log(filter);

    if (holiday == "Дни рождения мая 2025") {
      celebrator = await ListNext.findOne(filter);
    }
    if (holiday == "Дни рождения апреля 2025") {
      celebrator = await List.findOne(filter);
    }
    if (holiday == "Дни рождения марта 2025") {
      celebrator = await ListBefore.findOne(filter);
    }


    // console.log("celebrator List");
    //  console.log(celebrator);
    if (celebrator) {
      //await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
      //await List.updateOne({ _id: celebrator._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
      celebrator.celebrator_id = celebrator._id.toString();
      return celebrator;
    }
  }

  if (!celebrator) {
    return false;
  }
}

//fill lineItems
async function generateLineItems(nursingHomes, order_id) {
  //console.log(nursingHomes);

  let lineItems = [];
  let order = await Order.findOne({ _id: order_id })
  order.temporaryLineItems.sort(
    (prev, next) =>
      prev.dateBirthday - next.dateBirthday
  );
  // console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
    // console.log("person");
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
      if (!foundHouse) { return person.nursingHome; }
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
  await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return lineItems;
}

function sendMessageToAdmin(text, e) { console.log(text + e); }

// check is active period actual

async function checkActivePeriod(period, month) {
  if (month.number == 1) {
    let today = new Date();
    let inTwoWeeks = new Date();
    let controlDate = period.secondTime ? 14 : 10;//
    inTwoWeeks.setDate(today.getDate() + controlDate);

    console.log("inTwoWeeks");
    console.log(inTwoWeeks);
    let periodDate2 = new Date(month.year, month.number - 1, period.date2);

    console.log("periodDate2");
    console.log(periodDate2);

    if (inTwoWeeks > periodDate2) {
      await Period.updateOne({ _id: period._id }, { $set: { isActive: false } }, { upsert: false });
      if (period.key != 5) {
        let maxPlus = period.secondTime ? 4 : 3;
        let secondTime = period.secondTime ? true : false;
        let scoredPluses = period.secondTime ? 3 : 2;
        let check = false;

        for (let i = 0; i < (27 - inTwoWeeks.getDate()); i = i + 5) {
          console.log("inTwoWeeks.getDate() + i");
          console.log(inTwoWeeks.getDate() + i);

          let foundPeriod = await Period.updateOne({ date1: { $gte: inTwoWeeks.getDate() + i, $lte: inTwoWeeks.getDate() + i + 4 }, scoredPluses: scoredPluses }, { $set: { isActive: true, maxPlus: maxPlus, secondTime: secondTime } }, { upsert: false });

          console.log("foundPeriod");
          console.log(foundPeriod);

          if (foundPeriod.nModified == 1) {
            check = true;
            break;
          }
        }
        if (!check) {
          if (period.secondTime) {
            sendMessageToAdmin('Всех, кого возможно поздравили 2 раза. Нет доступных периодов.', null);
            return false;
          } else {
            let today = new Date();
            let inTwoWeeks = new Date();
            inTwoWeeks.setDate(today.getDate() + 14);
            let scoredPluses = 3;
            //console.log("inTwoWeeks");
            //console.log(inTwoWeeks);
            for (let i = 0; i < (27 - inTwoWeeks.getDate()); i = i + 5) {
              let foundPeriod = await Period.updateOne({ date1: { $gte: inTwoWeeks.getDate() + i, $lte: inTwoWeeks.getDate() + i + 4 }, scoredPluses: scoredPluses }, { $set: { isActive: true, secondTime: true } }, { upsert: false });
              if (foundPeriod.modifiedCount == 1) {
                check = true;
                break;
              }
            }
          }
        }
        if (!check) {
          sendMessageToAdmin('Всех, кого возможно поздравили 2 раза. Нет доступных периодов.', null);
          return false;
        }
        return 'Обновите выбранный период.';

      } else {
        sendMessageToAdmin('The list is old', null);
        return false;
      }
    } else {
      return true;
    }
  }
}

//check if active period is close TODO!!!!!

async function checkActiveList(period, month, isOutDate, minDate, maxDate) {
  if (month == 1) {
    try {

      if (isOutDate) {
        let foundPeriods = await Period.find({ date1: { $gte: minDate - 4, $lte: maxDate }, isActive: false }, { upsert: false });
        console.log("foundPeriods");
        console.log(foundPeriods);
        for (let checkingPeriod of foundPeriods) {
          let seniorToGreet = await List.findOne({
            "plusAmount": { $lt: checkingPeriod.maxPlus },
            "dateBirthday": { $gte: checkingPeriod.date1, $lte: checkingPeriod.date2 },
            "absents": { $ne: null }
          });
          if (!seniorToGreet) {
            await Period.updateOne({ _id: checkingPeriod._id }, { $set: { maxPlus: 4, scoredPluses: checkingPeriod.maxPlus, secondTime: true } }, { upsert: false });
          }
          console.log("seniorToGreet1");
          console.log(seniorToGreet);
        }
      }

      let seniorToGreet = await List.findOne({
        "plusAmount": { $lt: period.maxPlus },
        "dateBirthday": { $gte: period.date1, $lte: period.date2 },
        "absent": { $ne: true }
      });
      //console.log("seniorToGreet2");
      //console.log(seniorToGreet);
      let check;

      if (!seniorToGreet) {
        await Period.updateOne({ _id: period._id }, { $set: { isActive: false, maxPlus: 4, secondTime: true }, $inc: { scoredPluses: 1 } }, { upsert: false });
        if (period.key != 5) {
          let maxPlus = period.secondTime ? 4 : 3;
          let secondTime = period.secondTime ? true : false;
          let scoredPluses = period.secondTime ? 3 : 2;
          check = false;
          console.log("maxPlus+secondTime+scoredPluses+check");
          console.log(maxPlus + secondTime + scoredPluses + check);
          console.log(period);
          console.log(period.key);
          console.log(period.date1);

          for (let i = 1; i < 6 - period.key; i++) {
            console.log(6 - period.key);
            let foundPeriod = await Period.updateOne({ key: period.key + i, scoredPluses: scoredPluses }, { $set: { isActive: true, maxPlus: maxPlus, secondTime: secondTime } }, { upsert: false });
            console.log("foundPeriod");
            console.log(foundPeriod);
            console.log("foundPeriod.nModified");
            console.log(foundPeriod.nModified);
            if (foundPeriod.nModified == 1) {
              console.log(foundPeriod.nModified);
              check = true;
              break;
            }
          }

          if (!check) {
            if (period.secondTime) {
              sendMessageToAdmin('Всех, кого возможно поздравили 2 раза. Нет доступных периодов. ОДИН', null);
            } else {
              let today = new Date();
              let inTwoWeeks = new Date();
              inTwoWeeks.setDate(today.getDate() + 14);
              let scoredPluses = 3;
              //console.log("inTwoWeeks");
              //console.log(inTwoWeeks);
              let firstDate = new Date(month.year, month.month, 1);
              let startDate = inTwoWeeks < firstDate ? 1 : inTwoWeeks;

              for (let i = 0; i < (27 - startDate.getDate()); i = i + 5) {
                let foundPeriod = await Period.updateOne({ date1: { $gte: startDate.getDate() + i, $lte: startDate.getDate() + i + 4 }, scoredPluses: scoredPluses }, { $set: { isActive: true, secondTime: true } }, { upsert: false });
                if (foundPeriod.nModified == 1) {
                  check = true;
                  break;
                }
              }
            }
          }

        } else {
          let today = new Date();
          let inTwoWeeks = new Date();
          inTwoWeeks.setDate(today.getDate() + 14);
          let scoredPluses = 3;
          //console.log("inTwoWeeks");
          //console.log(inTwoWeeks);
          let firstDate = new Date(month.year, month.month, 1);
          let startDate = inTwoWeeks < firstDate ? 1 : inTwoWeeks;

          for (let i = 0; i < (27 - startDate.getDate()); i = i + 5) {
            let foundPeriod = await Period.updateOne({ date1: { $gte: startDate.getDate() + i, $lte: startDate.getDate() + i + 4 }, scoredPluses: scoredPluses }, { $set: { isActive: true, secondTime: true } }, { upsert: false });
            if (foundPeriod.modifiedCount == 1) {
              check = true;
              break;
            }
          }
        }
        if (!check) {
          sendMessageToAdmin('Всех, кого возможно поздравили 2 раза. Нет доступных периодов.ДВА', null);
        }
      }

    }
    catch (e) { sendMessageToAdmin('Ошибка в "checkActiveList"', e); }
  }
}


//////////////////////////////////////////////////


/**
 * API to delete
 */
router.delete("/", checkAuth, async (req, res) => {
  try {

    console.log("delete3");
    Order.deleteMany({}, function (err, orders) {
      if (err) {
        console.log(err);
        const deleteHouseMongoErrorResponse = new BaseResponse("500", "MongoDB Server Error", err);
        res.status(500).send(deleteHouseMongoErrorResponse.toObject());
      } else {
        console.log(orders);
        res.json(orders);

      }

    });
  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse("500", "MongoDB server error", e);
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
});

// API to find all orders with absents

router.get("/absents/all", checkAuth, async (req, res) => {
  try {
    let orders = await Order.find({ isDisabled: false, "lineItems.celebrators.absentComment": "ВЫБЫЛ(А), НЕ ПОЗДРАВЛЯТЬ!" });

    let result = upgradeOrders(orders);
    console.log("result");
    console.log(result);
    const readOrdersResponse = new BaseResponse(
      200,
      "Query successful",
      result
    );
    res.json(readOrdersResponse.toObject());

  } catch (e) {
    console.log(e);
    const readOrdersCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      e
    );
    res.status(500).send(readOrdersCatchErrorResponse.toObject());
  }
});

function upgradeOrders(orders) {
  console.log("orders");
  console.log(orders);

  for (let order of orders) {
    order.absents = [];
    for (let line of order.lineItems) {
      let absentSeniors = line.celebrators.filter(item => item.absentComment == "ВЫБЫЛ(А), НЕ ПОЗДРАВЛЯТЬ!");
      console.log("absentSeniors");
      console.log(absentSeniors);
      for (let senior of absentSeniors) {
        senior.address = line.address;
        senior.infoComment = line.infoComment;
        senior.adminComment = line.adminComment;
        order.absents.push(senior);
      }
      console.log("order.absents");
      console.log(order.absents);
    }
    //order.absents.concat(absentSeniors);
  }

  console.log("orders");
  console.log(orders);
  return orders;
}



////////////////////////////////////////////////////  NY

router.post("/new-year/:amount", checkAuth, async (req, res) => {
  let finalResult;
  try {
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      //institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: [],
      lineItems: [],
      filter: req.body.filter,
      isCompleted: false
    };
    /*     console.log("req.body.restrictedHouses");
        console.log(req.body.restrictedHouses); */

    console.log("req.body.filter");
    console.log(req.body.filter);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    finalResult = await createOrderNewYear(newOrder, req.body.prohibitedId, req.body.restrictedHouses);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//delete pluses because of error 

async function deleteErrorPlusNewYear(order_id, ...userName) {
  try {
    let filter = order_id ? { _id: order_id } : { userName: userName[0], isCompleted: false };
    //console.log("userName[0]");
    //console.log(userName[0]);

    let order = await Order.findOne(filter);  //, { projection: { _id: 0, temporaryLineItems: 1 } }
    if (order) {
      if (order.temporaryLineItems && order.temporaryLineItems.length > 0) {
        let seniors_ids = [];
        for (let person of order.temporaryLineItems) {
          seniors_ids.push(person.celebrator_id);
        }

        for (let id of seniors_ids) {
          let senior = await NewYear.findOne({ _id: id });
          let p = senior.plusAmount;
          let newP = p - 1;
          let c = senior.category;
          await House.updateOne(
            {
              nursingHome: senior.nursingHome
            },
            {
              $inc: {
                ["statistic.newYear.plus" + p]: -1,
                ["statistic.newYear.plus" + newP]: 1,
                ["statistic.newYear." + c + "Plus"]: -1,
              }
            }

          );
          if (order.institutes.length > 0) {

            await House.updateOne(
              {
                nursingHome: senior.nursingHome
              },
              {
                $inc: {
                  ["statistic.forInstitute"]: -1,
                }
              }

            );
          }

        }
        await NewYear.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
        if (order.institutes.length > 0) {
          await NewYear.updateMany({ _id: { $in: seniors_ids } }, { $inc: { forInstitute: - 1 } }, { upsert: false });
        }


      }
      await Order.deleteOne({ _id: order._id });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    sendMessageToAdmin('something wrong with "deleteErrorPlus"', e);
  }
}


// Create order
async function createOrderNewYear(newOrder, prohibitedId, restrictedHouses) {


  /*   let proportion = {};
  
    if (newOrder.amount > 50) {
      let oldWomenAmount = Math.round(newOrder.amount * 0.2);
      let oldMenAmount = Math.round(newOrder.amount * 0.3);
      let specialAmount = Math.round(newOrder.amount * 0.2);
      let yangAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialAmount;
  
      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "special": specialAmount,
        "yang": yangAmount,
        "oneHouse": 5 //Math.round(newOrder.amount * 0.2)
      }
      if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;
    } else {
      proportion = await Proportion.findOne({ amount: newOrder.amount }); */

  let proportion = {};

  if (newOrder.filter.genderFilter != 'proportion') {
    if (newOrder.amount > 50) {
      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {
        oldWomenAmount = Math.round(newOrder.amount * 0.2);
        oldMenAmount = Math.round(newOrder.amount * 0.2);
        specialWomenAmount = Math.round(newOrder.amount * 0.2);
        specialMenAmount = Math.round(newOrder.amount * 0.2);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;

      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.2)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }


      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2)
      }
      if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;
    } else {

      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {


        oldWomenAmount = Math.round(newOrder.amount * 0.2) > 0 ? Math.round(newOrder.amount * 0.2) : 1;
        oldMenAmount = Math.round(newOrder.amount * 0.1);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = Math.round(newOrder.amount * 0.1);
        specialWomenAmount = Math.round(newOrder.amount * 0.1);
        specialMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount - specialWomenAmount;

        if (newOrder.amount == 4) {
          oldWomenAmount = 1;
          oldMenAmount = 1;
          yangWomenAmount = 0;
          yangMenAmount = 0;
          specialWomenAmount = 1;
          specialMenAmount = 1;
        }
        if (newOrder.amount == 5) {
          oldWomenAmount = 1;
          oldMenAmount = 1;
          yangWomenAmount = 0;
          yangMenAmount = 0;
          specialWomenAmount = 1;
          specialMenAmount = 2;
        }
        if (newOrder.amount == 6) {
          oldWomenAmount = 1;
          oldMenAmount = 1;
          yangWomenAmount = 0;
          yangMenAmount = 0;
          specialWomenAmount = 2;
          specialMenAmount = 2;
        }
        if (newOrder.amount == 7) {
          oldWomenAmount = 2;
          oldMenAmount = 1;
          yangWomenAmount = 0;
          yangMenAmount = 0;
          specialWomenAmount = 2;
          specialMenAmount = 2;
        }
        if (newOrder.amount == 8) {
          oldWomenAmount = 3;
          oldMenAmount = 1;
          yangWomenAmount = 0;
          yangMenAmount = 0;
          specialWomenAmount = 2;
          specialMenAmount = 2;
        }
        if (newOrder.amount == 9) {
          oldWomenAmount = 3;
          oldMenAmount = 1;
          yangWomenAmount = 0;
          yangMenAmount = 0;
          specialWomenAmount = 3;
          specialMenAmount = 2;
        }



      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.2)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }
      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2)
      }
    }

    if (!proportion) {
      return {
        result: `Обратитесь к администратору. Заявка не сформирована. Для количества ${newOrder.amount} не найдена пропорция`,
        success: false
      };
    } else {
      if (!newOrder.filter.maxOneHouse && (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region)) proportion.oneHouse = undefined;
      //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
      console.log("newOrder.filter.region");
      console.log(newOrder.filter.region);

      console.log("proportion.oneHouse");
      console.log(proportion.oneHouse);

      if (!newOrder.filter.onlyWithPicture && !newOrder.filter.region && !newOrder.filter.nursingHome && newOrder.amount < 21) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);

    }

  }


  if (newOrder.filter.genderFilter == 'proportion') {

    let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
    if (!newOrder.filter.maxNoAddress) {
      oldWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.5);
      oldMenAmount = Math.round(newOrder.filter.maleAmount * 0.5);
      specialWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.4);
      specialMenAmount = Math.round(newOrder.filter.maleAmount * 0.4);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;


    } else {

      specialWomenAmount = Math.ceil(newOrder.filter.femaleAmount / newOrder.amount * newOrder.filter.maxNoAddress);
      specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
      oldWomenAmount = Math.round((newOrder.filter.femaleAmount - specialWomenAmount) * 0.5);
      oldMenAmount = Math.round((newOrder.filter.maleAmount - specialMenAmount) * 0.5);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;
    }
    proportion = {
      "amount": newOrder.amount,
      "oldWomen": oldWomenAmount,
      "oldMen": oldMenAmount,
      "specialWomen": specialWomenAmount,
      "specialMen": specialMenAmount,
      "yangWomen": yangWomenAmount,
      "yangMen": yangMenAmount,
      "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2),
      "oneRegion": Math.ceil(newOrder.amount * 0.33)
    }

    if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region || newOrder.amount > 20) {
      proportion.oneRegion = undefined;
    }
    //proportion.oneRegion = 14; //удалить
  }
  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  console.log("emptyOrder.dateOfOrder");
  console.log(emptyOrder.dateOfOrder);

  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData;
  let filter = {};
  const nursingHomes = await House.find({});
  let chosenHome;


  if (newOrder.filter) {

    if (newOrder.filter.nursingHome) {
      chosenHome = nursingHomes.filter(item => item.nursingHome == newOrder.filter.nursingHome)[0];
      if ((chosenHome.isReleased || chosenHome.noAddress) && (newOrder.filter.addressFilter != 'noSpecial' && newOrder.filter.addressFilter != 'forKids' && newOrder.filter.addressFilter != 'noReleased')) {
        proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
        proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
        proportion.oldWomen = 0;
        proportion.oldMen = 0;
        proportion.yangWomen = 0;
        proportion.yangMen = 0;
      }
    }

    if (newOrder.filter.addressFilter == 'noSpecial') {
      proportion.yangWomen = proportion.yangWomen + proportion.specialWomen;
      proportion.yangMen = proportion.yangMen + proportion.specialMen;
      proportion.specialMen = 0;
      proportion.specialWomen = 0;
    }

    if (newOrder.filter.addressFilter == 'onlySpecial') {
      proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
      proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
      proportion.oldWomen = 0;
      proportion.oldMen = 0;
      proportion.yangWomen = 0;
      proportion.yangMen = 0;
      console.log("onlySpecial");
      console.log(proportion);
    }

    if (newOrder.filter.addressFilter == 'forKids') {
      proportion.oldWomen = proportion.oldWomen + proportion.specialWomen;
      proportion.oldMen = proportion.oldMen + proportion.specialMen;
      proportion.specialWomen = 0;
      proportion.specialMen = 0;

      console.log("forKids");
      console.log(proportion);
      if (!newOrder.filter.year1 && !newOrder.filter.year2) {
        newOrder.filter.year2 = 1963;
      }
    }


    //console.log("order");
    //console.log(order);


    console.log("proportion");
    console.log(proportion);

    if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: null };
    if (newOrder.filter.onlyAnniversaries) filter.specialComment = /Юбилей/;
    if (newOrder.filter.onlyAnniversariesAndOldest) filter.$or = [{ specialComment: /Юбилей/ }, { oldest: true }];
    if (newOrder.filter.region) filter.region = newOrder.filter.region;
    if (newOrder.filter.nursingHome) filter.nursingHome = newOrder.filter.nursingHome;
    if (newOrder.filter.genderFilter == 'Male') filter.gender = 'Male';
    if (newOrder.filter.genderFilter == 'Female') filter.gender = 'Female';
    if (newOrder.filter.addressFilter == 'noReleased' || newOrder.filter.addressFilter == 'onlySpecial' || newOrder.filter.addressFilter == 'forKids') filter.isReleased = false;
    if (newOrder.filter.addressFilter == 'noSpecial' || newOrder.filter.addressFilter == 'forKids') filter.noAddress = false;
    if (newOrder.filter.addressFilter == 'onlySpecial') filter.noAddress = true;
    if (newOrder.filter.addressFilter == 'forKids') filter.yearBirthday = { $lte: 1963 };
    if (newOrder.filter.year1 || newOrder.filter.year2) {
      if (!newOrder.filter.year1) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: 1900 };
      if (!newOrder.filter.year2) filter.yearBirthday = { $lte: 2022, $gte: newOrder.filter.year1 };
      /*       if (newOrder.filter.year1 > 1958 && newOrder.filter.addressFilter != 'onlySpecial') {
              proportion.yang = proportion.yang + proportion.oldWomen + proportion.oldMen;
              proportion.oldWomen = 0;
              proportion.oldMen = 0;
            } */
      if (newOrder.filter.year1 && newOrder.filter.year2) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: newOrder.filter.year1 };
    }


    if ((newOrder.institutes.length > 0 && newOrder.filter.onlyWithConcent) || newOrder.filter.onlyWithConcent) {
      filter.dateOfSignedConsent = { $ne: null };
    } else {
      filter.dateOfSignedConsent = null; //РУЧНАЯ
      //filter.lastName = "Чернов";
    };

    proportion.oneRegion = undefined; //РУЧНАЯ

    seniorsData = await fillOrderNewYear(proportion, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter);

  }

  if (seniorsData.celebratorsAmount < newOrder.amount) {

    await deleteErrorPlusNewYear(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }

  //НАВИГАТОРЫ

  let resultLineItems = await generateLineItemsNewYear(nursingHomes, order_id);
  // console.log("resultLineItems");
  // console.log(resultLineItems);
  // console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    // console.log("resultLineItems222");
    await deleteErrorPlusNewYear(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName
  }
}

// create a list of seniors for the order 789

async function fillOrderNewYear(proportion, order_id, filter, prohibitedId, restrictedHouses, orderFilter) {

  const categories = ["oldWomen", "oldMen", "yangWomen", "yangMen", "specialWomen", "specialMen",]; // "specialOnly", "allCategory"
  /*   restrictedHouses.push("ПОРЕЧЬЕ-РЫБНОЕ");
   restrictedHouses.push("СЕВЕРОДВИНСК");
  restrictedHouses.push("РЖЕВ");
   restrictedHouses.push("ПЕРВОМАЙСКИЙ");
   restrictedHouses.push("ВЯЗЬМА"); */
  let data = {
    houses: {},
    restrictedHouses: [...restrictedHouses],
    restrictedPearson: [...prohibitedId],
    celebratorsAmount: 0,
    /*     date1: period.date1,
        date2: period.date2,
        maxPlus: period.maxPlus, */
    filter: filter,
    order_id: order_id,
    //temporaryLineItems: [],
  }
  if (proportion.oneRegion) {
    data.regions = {};
    data.restrictedRegions = [];
  }


  ///// 


  for (let category of categories) {

    data.category = category;
    data.proportion = proportion;
    data.counter = 0;
    //console.log(category);
    //console.log(proportion[category]);

    if (proportion[category]) {

      data.maxPlus = 1;

      data = await collectSeniorsNewYear(data, orderFilter);

      if (data.counter < proportion[category]) {
        data.maxPlus = 2;

        data = await collectSeniorsNewYear(data, orderFilter);
      }

      if (data.counter < proportion[category]) { //РУЧНАЯ
        data.maxPlus = 3;

        data = await collectSeniorsNewYear(data, orderFilter);
      }
      /* 
     
           if (data.counter < proportion[category]) {
             data.maxPlus = 4;
     
             data = await collectSeniorsNewYear(data, orderFilter);
           }
            if (data.counter < proportion[category]) {
                   data.maxPlus = 5;
           
                   data = await collectSeniorsNewYear(data, orderFilter);
                 }    */
      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }
  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  return data;
}


//set restrictions for searching 789

async function collectSeniorsNewYear(data, orderFilter) {

  let searchOrders = {};
  //console.log("data.category");
  //console.log(data.category);

  if (orderFilter.genderFilter != 'proportion') {

    if (data.filter.addressFilter != 'onlySpecial') {
      if (data.filter.region && data.filter.addressFilter != 'forKids') {

        console.log("HERE");
        console.log(data.category);

        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen", "specialWomen", "specialMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen", "specialMen", "specialWomen"],
          yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen", "specialMen", "specialWomen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen", "specialMen", "specialWomen"],
          specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
          specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
        }
      } else {

        if (data.filter.addressFilter == 'forKids') {
          searchOrders = {
            oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
            oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
            yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
            yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"]
          }
        }

        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
          yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"],
          specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
          specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
          // specialOnly: ["special", "oldWomen"],
          // allCategory: ["oldMen", "oldWomen", "yang", "oldest", "special"]
        };
      }
    } else {
      searchOrders = {
        /*   oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
          yangWomen: ["yangWomen", "yangMen", "oldWomen", "oldMen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"], */
        specialWomen: ["specialWomen", "specialMen"],
        specialMen: ["specialMen", "specialWomen"],
      };
    }
  }

  if (orderFilter.genderFilter == 'proportion') {
    if (orderFilter.addressFilter != 'onlySpecial') {
      if (data.filter.region && data.filter.addressFilter != 'forKids') {
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "specialWomen",],
          oldMen: ["oldMen", "yangMen", "specialMen",],
          yangWomen: ["yangWomen", "oldWomen", "specialWomen"],
          yangMen: ["yangMen", "oldMen", "specialMen",],
          specialWomen: ["specialWomen", "yangWomen", "oldWomen",],
          specialMen: ["specialMen", "yangMen", "oldMen",],
        }
      } else {
        if (data.filter.addressFilter == 'forKids') {
          searchOrders = {
            oldWomen: ["oldWomen", "yangWomen"],
            oldMen: ["oldMen", "yangMen"],
            yangWomen: ["yangWomen", "oldWomen"],
            yangMen: ["yangMen", "oldMen"]
          }
        }
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen"],
          oldMen: ["oldMen", "yangMen"],
          yangWomen: ["yangWomen", "oldWomen"],
          yangMen: ["yangMen", "oldMen"],
          specialWomen: ["specialWomen", "yangWomen", "oldWomen"],
          specialMen: ["specialMen", "yangMen", "oldMen"],
        };
      }
    } else {
      searchOrders = {
        /*         oldWomen: ["oldWomen", "yangWomen"],
                oldMen: ["oldMen", "yangMen"],
                yangWomen: ["yangWomen", "oldWomen"],
                yangMen: ["yangMen", "oldMen"], */
        specialWomen: ["specialWomen"],
        specialMen: ["specialMen"],
      };
    }
  }


  for (let kind of searchOrders[data.category]) {
    let barrier = data.proportion[data.category] - data.counter;

    outer1: for (let i = 0; i < barrier; i++) {
      let result = await searchSeniorNewYear(
        kind,
        data

      );
      if (result) {
        //console.log(result);
        await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
        await NewYear.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });

        let senior = await NewYear.findOne({ _id: result.celebrator_id });
        let newP = senior.plusAmount;
        let p = newP - 1;
        let c = senior.category;
        await House.updateOne(
          {
            nursingHome: senior.nursingHome
          },
          {
            $inc: {
              ["statistic.newYear.plus" + p]: -1,
              ["statistic.newYear.plus" + newP]: 1,
              ["statistic.newYear." + c + "Plus"]: 1,
            }
          }

        );


        data.celebratorsAmount++;
        data.restrictedPearson.push(result.celebrator_id);
        data.counter++;
        console.log("data.proportion.oneHouse");
        console.log(data.proportion.oneHouse);
        if (data.proportion.oneHouse) data.houses[result["nursingHome"]] = (!data.houses[result["nursingHome"]]) ? 1 : data.houses[result["nursingHome"]] + 1;
        if (data.proportion.oneRegion) data.regions[result["region"]] = (!data.regions[result["region"]]) ? 1 : data.regions[result["region"]] + 1;
        console.log("data.regions");
        console.log(data.regions);

        if (data.proportion.oneHouse) {
          if (data.houses[result["nursingHome"]] == data.proportion["oneHouse"]) {
            data.restrictedHouses.push(result["nursingHome"]);
          }
        }
        if (data.proportion.oneRegion) {
          if (data.regions[result["region"]] == data.proportion["oneRegion"]) {
            data.restrictedRegions.push(result["region"]);
          }
        }

      } else {
        break outer1;
      }
    }
  }
  return data;
}

// get senior
async function searchSeniorNewYear(
  kind,
  data
  /*   restrictedHouses,
    restrictedPearson,
    date1,
    date2,
    maxPlus,
    orderFilter */
) {

  /*  data.restrictedHouses,
      data.restrictedPearson,
      data.date1,
      data.date2,
      data.maxPlus,
      data.filter */
  // data.maxPlus = 3;
  let standardFilter = {
    nursingHome: { $nin: data.restrictedHouses },
    secondTime: data.maxPlus > 1 ? true : false,
    // secondTime: true,
    thirdTime: data.maxPlus > 2 ? true : false,
    forthTime: data.maxPlus > 3 ? true : false,
    _id: { $nin: data.restrictedPearson },
    //plusAmount: { $lt: maxPlus },
    //dateBirthday: { $gte: data.date1, $lte: data.date2 },
    absent: { $ne: true },
    finished: false,
    //onlyForInstitute: false
  };

  if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions };
  if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
  /*   if ( (!data.filter.nursingHome)) {//(data.proportion.amount > 12 || data.proportion.amount < 5) &&
      //standardFilter.isReleased = false;
    }  */
  if ((data.proportion.amount > 12 || data.proportion.amount < 5) && (!data.filter.nursingHome)) {
    standardFilter.isReleased = false;
  }
  /*     if (data.proportion.amount > 12 || data.proportion.amount < 5 || data.category == "specialOnly") { 
          standardFilter.isReleased = false;    
      }  */
  /*if (data.proportion.amount > 12) {
    standardFilter.isReleased = false;
  }*/
  //standardFilter.isReleased = false; // CANCEL


  //console.log("maxPlus");
  //console.log(maxPlus);

  //if (standardFilter.isReleased == undefined) standardFilter.isReleased = true;
  let filter = Object.assign(standardFilter, data.filter);
  //console.log("filter");
  //console.log(filter);

  let celebrator;
  //CHANGE!!!


  //let maxPlusAmount = 1
  // let maxPlusAmount = 2;

  let maxPlusAmount = data.maxPlus;
  /*   console.log("filter.category");
    console.log(filter.category);
    console.log(filter.isReleased);
  
     if((filter.category == "specialMen" || filter.category == "specialWomen") && filter.isReleased === false) {
      maxPlusAmount = 2;
      filter.nursingHome = { $in: [ "ФИЛИППОВСКОЕ",]};
  
       console.log("maxPlusAmount");
    console.log(maxPlusAmount);
  
    console.log(filter.nursingHome);
     } */
  //let maxPlusAmount = standardFilter.oldest ? 2 : data.maxPlus;
  //console.log("maxPlusAmount");
  //console.log(maxPlusAmount);
  //maxPlusAmount = 3;
  for (let plusAmount = 1; plusAmount <= maxPlusAmount; plusAmount++) {
    filter.plusAmount = { $lt: plusAmount };
    /*       filter.monthBirthday = 1;
        filter.dateBirthday = {$lt: 32, $gt: 0};  *///HB+NY
    /*   
              filter.lastName = {$in: [
    
                'Янова',
                'Анферова',
                'Дамм',
                'Ташкаева',    
        
         
                ]};  */
    //filter.firstName = "Нэлли";
    //filter.comment1 = "(2 корп. 5 этаж)"; //CANCEL
    // filter.comment1 = {$ne: "(отд. 4)"}; //CANCEL
    // filter.comment2 = /труда/; //CANCEL
    //filter.comment1 = /верующ/; //CANCEL
    // filter.nursingHome = { $in: ["ВЕРХНЕУРАЛЬСК", "ВАЛДАЙ", "ЯГОТИНО", "БЕРДСК", "САВИНСКИЙ", "ДУБНА_ТУЛЬСКАЯ", "ДУБНА", "КАНДАЛАКША", "САДОВЫЙ", "ЯГОТМОЛОДОЙ_ТУДИНО", "КРАСНОЯРСК", "СОЛИКАМСК_ДУБРАВА", "ЧЕРНЫШЕВКА",] }
    //filter.region = {$in: ["АРХАНГЕЛЬСКАЯ", "МОСКОВСКАЯ", "МОРДОВИЯ", ]};
    //
    console.log("filter");
    console.log(filter);
    celebrator = await NewYear.findOne(filter);
    //  console.log("celebrator NewYear");
    // console.log(celebrator);
    if (celebrator) {
      //await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
      //await List.updateOne({ _id: celebrator._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
      celebrator.celebrator_id = celebrator._id.toString();
      return celebrator;
    }
  }

  if (!celebrator) {
    return false;
  }
}

//fill lineItems
async function generateLineItemsNewYear(nursingHomes, order_id) {
  //console.log(nursingHomes);

  let lineItems = [];
  let order = await Order.findOne({ _id: order_id })

  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
    /*   console.log("person");
      console.log(person); */
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
      if (!foundHouse) { return person.nursingHome; }
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
  await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return lineItems;
}


//////////////////////////////////////////////////
//February23 and March8 orders

router.post("/spring/:amount", checkAuth, async (req, res) => {
  let finalResult;
  try {
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      //institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: [],
      lineItems: [],
      filter: req.body.filter,
      isCompleted: false
    };

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    console.log("req.body.restrictedHouses");
    console.log(req.body.restrictedHouses);

    finalResult = await createOrderSpring(newOrder, req.body.prohibitedId, req.body.restrictedHouses);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer;
      if (newOrder.holiday == "23 февраля 2025" || newOrder.holiday == "8 марта 2025") { answer = await deleteErrorPlusSpring(false, req.body.userName) };
      if (newOrder.holiday == "Пасха 2025") { answer = await deleteErrorPlusEaster(false, req.body.userName) };
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//delete pluses because of error 

async function deleteErrorPlusSpring(order_id, ...userName) {
  try {
    let filter = order_id ? { _id: order_id } : { userName: userName[0], isCompleted: false };
    //console.log("userName[0]");
    //console.log(userName[0]);

    let order = await Order.findOne(filter);  //, { projection: { _id: 0, temporaryLineItems: 1 } }
    if (order) {
      if (order.temporaryLineItems && order.temporaryLineItems.length > 0) {
        let seniors_ids = [];
        for (let person of order.temporaryLineItems) {
          seniors_ids.push(person.celebrator_id);
        }
        if (order.holiday == "23 февраля 2025") {

          for (let id of seniors_ids) {
            let senior = await February23.findOne({ _id: id });
            let p = senior.plusAmount;
            let newP = p - 1;
            let c = senior.category;
            await House.updateOne(
              {
                nursingHome: senior.nursingHome
              },
              {
                $inc: {
                  ["statistic.spring.plus" + p]: -1,
                  ["statistic.spring.plus" + newP]: 1,
                  ["statistic.spring." + c + "Plus"]: -1,
                }
              }

            );

          }

          await February23.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
        }
        if (order.holiday == "8 марта 2025") {

          for (let id of seniors_ids) {
            let senior = await March8.findOne({ _id: id });
            let p = senior.plusAmount;
            let newP = p - 1;
            let c = senior.category;
            await House.updateOne(
              {
                nursingHome: senior.nursingHome
              },
              {
                $inc: {
                  ["statistic.spring.plus" + p]: -1,
                  ["statistic.spring.plus" + newP]: 1,
                  ["statistic.spring." + c + "Plus"]: -1,
                }
              }

            );

          }

          await March8.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
        }

      }




      await Order.deleteOne({ _id: order._id });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    sendMessageToAdmin('something wrong with "deleteErrorPlus"', e);
  }
}


// Create order
async function createOrderSpring(newOrder, prohibitedId, restrictedHouses) {


  let proportion = {};

  if (newOrder.filter.genderFilter != 'proportion') {
    if (newOrder.amount > 50) {
      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {
        oldWomenAmount = Math.round(newOrder.amount * 0.2);
        oldMenAmount = Math.round(newOrder.amount * 0.2);
        specialWomenAmount = Math.round(newOrder.amount * 0.2);
        specialMenAmount = Math.round(newOrder.amount * 0.2);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;

      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.2)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }


      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2)
      }
      if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;
    } else {

      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {


        oldWomenAmount = Math.round(newOrder.amount * 0.2) > 0 ? Math.round(newOrder.amount * 0.2) : 1;
        oldMenAmount = Math.round(newOrder.amount * 0.1);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = Math.round(newOrder.amount * 0.1);
        specialWomenAmount = Math.round(newOrder.amount * 0.1);
        specialMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount - specialWomenAmount;
        if (newOrder.holiday != "Пасха 2025") {
          if (newOrder.amount == 4) {
            oldWomenAmount = 1;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 1;
            specialMenAmount = 1;
          }
          if (newOrder.amount == 5) {
            oldWomenAmount = 1;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 1;
            specialMenAmount = 2;
          }
          if (newOrder.amount == 6) {
            oldWomenAmount = 1;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 2;
            specialMenAmount = 2;
          }
          if (newOrder.amount == 7) {
            oldWomenAmount = 2;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 2;
            specialMenAmount = 2;
          }
          if (newOrder.amount == 8) {
            oldWomenAmount = 3;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 2;
            specialMenAmount = 2;
          }
          if (newOrder.amount == 9) {
            oldWomenAmount = 3;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 3;
            specialMenAmount = 2;
          }
        }

        if (newOrder.holiday == "Пасха 2025") {
          oldWomenAmount = Math.round(newOrder.amount * 0.2) > 0 ? Math.round(newOrder.amount * 0.2) : 1;
          oldMenAmount = Math.round(newOrder.amount * 0.2);
          yangWomenAmount = Math.round(newOrder.amount * 0.1);
          yangMenAmount = Math.round(newOrder.amount * 0.1);
          specialWomenAmount = Math.round(newOrder.amount * 0.1);
          specialMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount - specialWomenAmount;

          if (newOrder.amount == 4) {
            oldWomenAmount = 1;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 1;
            specialMenAmount = 1;
          }
          if (newOrder.amount == 5) {
            oldWomenAmount = 1;
            oldMenAmount = 2;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 1;
            specialMenAmount = 1;
          }
          if (newOrder.amount == 6) {
            oldWomenAmount = 2;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 1;
            specialMenAmount = 2;
          }
          if (newOrder.amount == 7) {
            oldWomenAmount = 2;
            oldMenAmount = 2;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 1;
            specialMenAmount = 2;
          }
          if (newOrder.amount == 8) {
            oldWomenAmount = 3;
            oldMenAmount = 1;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 2;
            specialMenAmount = 2;
          }
          if (newOrder.amount == 9) {
            oldWomenAmount = 3;
            oldMenAmount = 2;
            yangWomenAmount = 0;
            yangMenAmount = 0;
            specialWomenAmount = 2;
            specialMenAmount = 2;
          }
        }



      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.2)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }
      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2)
      }
    }

    if (!proportion) {
      return {
        result: `Обратитесь к администратору. Заявка не сформирована. Для количества ${newOrder.amount} не найдена пропорция`,
        success: false
      };
    } else {
      if (!newOrder.filter.maxOneHouse && (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region)) proportion.oneHouse = undefined;
      //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
      console.log("newOrder.filter.region");
      console.log(newOrder.filter.region);

      console.log("proportion.oneHouse");
      console.log(proportion.oneHouse);

      if (!newOrder.filter.onlyWithPicture && !newOrder.filter.region && !newOrder.filter.nursingHome && newOrder.amount < 21) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);

    }

  }


  if (newOrder.filter.genderFilter == 'proportion') {

    let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
    if (!newOrder.filter.maxNoAddress) {
      oldWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.5);
      oldMenAmount = Math.round(newOrder.filter.maleAmount * 0.5);
      specialWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.4);
      specialMenAmount = Math.round(newOrder.filter.maleAmount * 0.4);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;


    } else {

      specialWomenAmount = Math.ceil(newOrder.filter.femaleAmount / newOrder.amount * newOrder.filter.maxNoAddress);
      specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
      oldWomenAmount = Math.round((newOrder.filter.femaleAmount - specialWomenAmount) * 0.5);
      oldMenAmount = Math.round((newOrder.filter.maleAmount - specialMenAmount) * 0.5);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;
    }
    proportion = {
      "amount": newOrder.amount,
      "oldWomen": oldWomenAmount,
      "oldMen": oldMenAmount,
      "specialWomen": specialWomenAmount,
      "specialMen": specialMenAmount,
      "yangWomen": yangWomenAmount,
      "yangMen": yangMenAmount,
      "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2),
      "oneRegion": Math.ceil(newOrder.amount * 0.33)
    }

    if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region || newOrder.amount > 20) {
      proportion.oneRegion = undefined;
    }
    //proportion.oneRegion = 14; //удалить
  }


  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  console.log("emptyOrder.dateOfOrder");
  console.log(emptyOrder.dateOfOrder);

  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData;
  let filter = {};
  const nursingHomes = await House.find({});
  let chosenHome;


  if (newOrder.filter) {

    if (newOrder.filter.nursingHome) {
      chosenHome = nursingHomes.filter(item => item.nursingHome == newOrder.filter.nursingHome)[0];
      if ((chosenHome.isReleased || chosenHome.noAddress) && (newOrder.filter.addressFilter != 'noSpecial' && newOrder.filter.addressFilter != 'forKids' && newOrder.filter.addressFilter != 'noReleased')) {
        proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
        proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
        proportion.oldWomen = 0;
        proportion.oldMen = 0;
        proportion.yangWomen = 0;
        proportion.yangMen = 0;
      }
    }

    if (newOrder.filter.addressFilter == 'noSpecial') {
      proportion.yangWomen = proportion.yangWomen + proportion.specialWomen;
      proportion.yangMen = proportion.yangMen + proportion.specialMen;
      proportion.specialMen = 0;
      proportion.specialWomen = 0;
    }

    if (newOrder.filter.addressFilter == 'onlySpecial') {
      proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
      proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
      proportion.oldWomen = 0;
      proportion.oldMen = 0;
      proportion.yangWomen = 0;
      proportion.yangMen = 0;
      console.log("onlySpecial");
      console.log(proportion);
    }

    if (newOrder.filter.addressFilter == 'forKids') {
      proportion.oldWomen = proportion.oldWomen + proportion.specialWomen;
      proportion.oldMen = proportion.oldMen + proportion.specialMen;
      proportion.specialWomen = 0;
      proportion.specialMen = 0;

      console.log("forKids");
      console.log(proportion);
      if (!newOrder.filter.year1 && !newOrder.filter.year2) {
        newOrder.filter.year2 = 1963;
      }
    }


    //console.log("order");
    //console.log(order);


    console.log("proportion");
    console.log(proportion);

    if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: null };
    if (newOrder.filter.region) filter.region = newOrder.filter.region;
    if (newOrder.filter.regions?.length > 0 && newOrder.filter.regions[0]) {
      console.log("newOrder.filter.regions");
      console.log(newOrder.filter.regions);
      filter.region = { $in: newOrder.filter.regions };
      if (newOrder.filter.spareRegions) {
        let spareRegions = await Region.findOne({ name: newOrder.filter.regions[0] });
        console.log("spareRegions");
        console.log(spareRegions);
        let filterRegions = [...newOrder.filter.regions, ...spareRegions.spareRegions];
        filter.region = { $in: filterRegions };
      }
      proportion.oneHouse = undefined;
    }
    if (newOrder.filter.nursingHome) filter.nursingHome = newOrder.filter.nursingHome;

    if (newOrder.filter.addressFilter == 'noReleased' || newOrder.filter.addressFilter == 'onlySpecial' || newOrder.filter.addressFilter == 'forKids') filter.isReleased = false;
    if (newOrder.filter.addressFilter == 'noSpecial' || newOrder.filter.addressFilter == 'forKids') filter.noAddress = false;
    if (newOrder.filter.addressFilter == 'onlySpecial') filter.noAddress = true;
    if (newOrder.filter.addressFilter == 'forKids') filter.yearBirthday = { $lte: 1963 };
    if (newOrder.filter.year1 || newOrder.filter.year2) {
      if (!newOrder.filter.year1) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: 1900 };
      if (!newOrder.filter.year2) filter.yearBirthday = { $lte: 2025, $gte: newOrder.filter.year1 };
      /*       if (newOrder.filter.year1 > 1958 && newOrder.filter.addressFilter != 'onlySpecial') {
              proportion.yang = proportion.yang + proportion.oldWomen + proportion.oldMen;
              proportion.oldWomen = 0;
              proportion.oldMen = 0;
            } */
      if (newOrder.filter.year1 && newOrder.filter.year2) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: newOrder.filter.year1 };
    }

    if (newOrder.filter.onlyWithConcent) {
      filter.dateOfSignedConsent = { $ne: null };
    } else {
      filter.dateOfSignedConsent = null;
    };

    seniorsData = await fillOrderSpring(proportion, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter, newOrder.holiday);

  }

  if (seniorsData.celebratorsAmount < newOrder.amount) {

    if (newOrder.holiday == "23 февраля 2025" || newOrder.holiday == "8 марта 2025") { await deleteErrorPlusSpring(order_id); };
    if (newOrder.holiday == "Пасха 2025") { await deleteErrorPlusEaster(order_id) };


    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }

  //НАВИГАТОРЫ

  let resultLineItems = await generateLineItemsSpring(nursingHomes, order_id);
  // console.log("resultLineItems");
  // console.log(resultLineItems);
  // console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    // console.log("resultLineItems222");
    if (newOrder.holiday == "23 февраля 2025" || newOrder.holiday == "8 марта 2025") { await deleteErrorPlusSpring(order_id); };
    if (newOrder.holiday == "Пасха 2025") { await deleteErrorPlusEaster(order_id) };

    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName
  }
}

// create a list of seniors for the order

async function fillOrderSpring(proportion, order_id, filter, prohibitedId, restrictedHouses, orderFilter, holiday) {
  const categories = ["oldWomen", "oldMen", "yangWomen", "yangMen", "specialWomen", "specialMen",]; // "specialOnly", "allCategory"
  /*   restrictedHouses.push("ПОРЕЧЬЕ-РЫБНОЕ");
   restrictedHouses.push("СЕВЕРОДВИНСК");
  restrictedHouses.push("РЖЕВ");
   restrictedHouses.push("ПЕРВОМАЙСКИЙ");
   restrictedHouses.push("ВЯЗЬМА"); */
  let data = {
    houses: {},
    restrictedHouses: [...restrictedHouses],
    restrictedPearson: [...prohibitedId],
    celebratorsAmount: 0,
    /*   maxPlus: period.maxPlus, */
    filter: filter,
    order_id: order_id,
    //temporaryLineItems: [],
    holiday: holiday,
  }
  if (proportion.oneRegion) {
    data.regions = {};
    data.restrictedRegions = [];
  }


  ///// 


  for (let category of categories) {

    data.category = category;
    data.proportion = proportion;
    data.counter = 0;
    //console.log(category);
    //console.log(proportion[category]);

    if (proportion[category]) {

      data.maxPlus = 1;// PLUSES1

      if (orderFilter.onlyWithConcent) {
        data.maxPlus = 2;
      }


      console.log("data.filter");
      console.log(data.filter);

      /*       if (!data.filter.dateOfSignedConsent?.$ne) {
              data.maxPlus = 2;
            } */

      data = await collectSeniorsSpring(data, orderFilter);

      /*   if (data.counter < proportion[category]) {
        data.maxPlus = 2;
 
        data = await collectSeniorsNewYear(data, orderFilter);
      }
 
     if (data.counter < proportion[category]) {
        data.maxPlus = 3;
 
        data = await collectSeniorsNewYear(data, orderFilter);
      }  


      if (data.counter < proportion[category]) {
        data.maxPlus = 4;
 
        data = await collectSeniorsNewYear(data, orderFilter);
      }  
   if (data.counter < proportion[category]) {
        data.maxPlus = 5;
 
        data = await collectSeniorsNewYear(data, orderFilter);
      }    */
      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }
  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  return data;
}


//set restrictions for searching

async function collectSeniorsSpring(data, orderFilter) {

  console.log("data.maxPlus");
  console.log(data.maxPlus);

  let searchOrders = {};

  if (data.filter.addressFilter != 'onlySpecial') {
    if (data.filter.region && data.filter.addressFilter != 'forKids') {

      console.log("HERE");
      console.log(data.category);

      searchOrders = {
        oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen", "specialWomen", "specialMen"],
        oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen", "specialMen", "specialWomen"],
        yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen", "specialMen", "specialWomen"],
        yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen", "specialMen", "specialWomen"],
        specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
        specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
      }
    } else {

      if (data.filter.addressFilter == 'forKids') {
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
          yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"]
        }
      }

      searchOrders = {
        oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
        oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
        yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
        yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"],
        specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
        specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
        // specialOnly: ["special", "oldWomen"],
        // allCategory: ["oldMen", "oldWomen", "yang", "oldest", "special"]
      };
    }
  } else {
    searchOrders = {
      /*   oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
        oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
        yangWomen: ["yangWomen", "yangMen", "oldWomen", "oldMen"],
        yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"], */
      specialWomen: ["specialWomen", "specialMen"],
      specialMen: ["specialMen", "specialWomen"],
    };
  }



  for (let kind of searchOrders[data.category]) {
    let barrier = data.proportion[data.category] - data.counter;

    outer1: for (let i = 0; i < barrier; i++) {
      let result = await searchSeniorSpring(
        kind,
        data

      );
      if (result) {
        //console.log(result);
        await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });



        if (data.holiday == "23 февраля 2025") {
          await February23.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
          let senior = await February23.findOne({ _id: result.celebrator_id });
          let newP = senior.plusAmount;
          let p = newP - 1;
          let c = senior.category;
          await House.updateOne(
            {
              nursingHome: senior.nursingHome
            },
            {
              $inc: {
                ["statistic.spring.plus" + p]: -1,
                ["statistic.spring.plus" + newP]: 1,
                ["statistic.spring." + c + "Plus"]: 1,
              }
            }

          );

        }
        if (data.holiday == "8 марта 2025") {
          await March8.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });

          let senior = await March8.findOne({ _id: result.celebrator_id });
          let newP = senior.plusAmount;
          let p = newP - 1;
          let c = senior.category;
          await House.updateOne(
            {
              nursingHome: senior.nursingHome
            },
            {
              $inc: {
                ["statistic.spring.plus" + p]: -1,
                ["statistic.spring.plus" + newP]: 1,
                ["statistic.spring." + c + "Plus"]: 1,
              }
            }

          );
        }



        data.celebratorsAmount++;
        data.restrictedPearson.push(result.celebrator_id);
        data.counter++;
        //console.log("data.proportion.oneHouse");
        // console.log(data.proportion.oneHouse);
        if (data.proportion.oneHouse) data.houses[result["nursingHome"]] = (!data.houses[result["nursingHome"]]) ? 1 : data.houses[result["nursingHome"]] + 1;
        if (data.proportion.oneRegion) data.regions[result["region"]] = (!data.regions[result["region"]]) ? 1 : data.regions[result["region"]] + 1;
        // console.log("data.regions");
        // console.log(data.regions);

        if (data.proportion.oneHouse) {
          if (data.houses[result["nursingHome"]] == data.proportion["oneHouse"]) {
            data.restrictedHouses.push(result["nursingHome"]);
          }
        }
        if (data.proportion.oneRegion) {
          if (data.regions[result["region"]] == data.proportion["oneRegion"]) {
            data.restrictedRegions.push(result["region"]);
          }
        }

      } else {
        break outer1;
      }
    }
  }
  return data;
}

// get senior
async function searchSeniorSpring(
  kind,
  data
  /*   restrictedHouses,
    restrictedPearson,
    date1,
    date2,
    maxPlus,
    orderFilter */
) {

  /*  data.restrictedHouses,
      data.restrictedPearson,
      data.date1,
      data.date2,
      data.maxPlus,
      data.filter */

  let standardFilter = {
    nursingHome: { $nin: data.restrictedHouses },
    //firstName: "Надежда",
    //lastName: "Артамонова",
    // secondTime: data.maxPlus > 1 ? true : false,
    // thirdTime: data.maxPlus === 3 ? true : false,
    _id: { $nin: data.restrictedPearson },
    //plusAmount: { $lt: maxPlus },
    //dateBirthday: { $gte: data.date1, $lte: data.date2 },
    absent: { $ne: true }
  };
  if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions };
  if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
  if (data.proportion.amount > 12 || data.proportion.amount < 5 || data.category == "specialOnly") {
    standardFilter.isReleased = false;
  }
  /*  if (data.proportion.amount > 12 ) { 
     standardFilter.isReleased = false;    
 }  */
  //standardFilter.isReleased = false; // CANCEL


  //console.log("maxPlus");
  //console.log(maxPlus);

  let filter = Object.assign(standardFilter, data.filter);
  //console.log("filter");


  let celebrator;
  //CHANGE!!!
  // let maxPlusAmount = 3;  
  //let maxPlusAmount = 3; 

  let maxPlusAmount = data.maxPlus;
  //let maxPlusAmount = standardFilter.oldest ? 2 : data.maxPlus;
  //console.log("maxPlusAmount");
  //console.log(maxPlusAmount);
  /*   let houses = [
  
      "КРЕСТЬЯНКА",
      "БОЛЬШАЯ_ГЛУШИЦА",
      "РОМАНОВКА",
      "СТОЛЫПИНО",
      "МЕЗЕНЬ",
      "ЦЕЛИННОЕ",
      "УСТЬ-МОСИХА",
      "МОЛЬГИНО",
      "ЖУКОВКА",
      "МАЙСКОЕ",
      "ЛАШМА",
      "НОВЫЙ_ЕГОРЛЫК",
  
  
    ] */

  for (let plusAmount = 1; plusAmount <= maxPlusAmount; plusAmount++) {
    filter.plusAmount = { $lt: plusAmount };
    //filter.comment1 = ""; //CANCEL
    // filter.comment1 = "(1 корп. 4 этаж)"; //CANCEL
    //filter.nursingHome = { $in: houses };
    // console.log("filter");
    // console.log(filter);

    // console.log("data.holiday");
    // console.log(data.holiday);


    if (data.holiday == "23 февраля 2025") {
      //console.log("celebrator23");
      //console.log(celebrator);
      celebrator = await February23.findOne(filter);
    }
    if (data.holiday == "8 марта 2025") {
      celebrator = await March8.findOne(filter);
    }

    if (data.holiday == "Пасха 2025") {
      celebrator = await Easter.findOne(filter);
    }

    // console.log("celebrator");
    //console.log(celebrator);
    if (celebrator) {
      //await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
      //await List.updateOne({ _id: celebrator._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
      celebrator.celebrator_id = celebrator._id.toString();
      return celebrator;
    }
  }

  if (!celebrator) {
    return false;
  }
}

//fill lineItems
async function generateLineItemsSpring(nursingHomes, order_id) {
  //console.log(nursingHomes);

  let lineItems = [];
  let order = await Order.findOne({ _id: order_id })

  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
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
      if (!foundHouse) { return person.nursingHome; }
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
  await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return lineItems;
}

////////////////////////////////////////////////////

router.post("/may9/:amount", checkAuth, async (req, res) => {
  let finalResult;
  try {
    let newOrder = {
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
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      temporaryLineItems: [],
      lineItems: [],
      filter: req.body.filter,
      //filter: { noSpecial: true },
      isCompleted: false
    };

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    finalResult = await createOrderMay9(newOrder);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlusMay9(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//delete pluses because of error 

async function deleteErrorPlusMay9(order_id, ...userName) {
  try {
    let filter = order_id ? { _id: order_id } : { userName: userName[0], isCompleted: false };
    //console.log("userName[0]");
    //console.log(userName[0]);

    let order = await Order.findOne(filter);  //, { projection: { _id: 0, temporaryLineItems: 1 } }
    if (order) {
      if (order.temporaryLineItems && order.temporaryLineItems.length > 0) {
        let seniors_ids = [];
        for (let person of order.temporaryLineItems) {
          seniors_ids.push(person.celebrator_id);
        }
        await May9.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
      }
      await Order.deleteOne({ _id: order._id });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    sendMessageToAdmin('something wrong with "deleteErrorPlus"', e);
  }
}


// Create order
async function createOrderMay9(newOrder) {


  let proportion = {};

  let veterans = Math.round(newOrder.amount * 0.2) > 0 ? Math.round(newOrder.amount * 0.2) : 1;
  let children = newOrder.amount - veterans;

  proportion = {
    "amount": newOrder.amount,
    "veterans": veterans,
    "children": children,
    "oneHouse": Math.round(newOrder.amount * 0.1) > 0 ? Math.round(newOrder.amount * 0.1) : 1
  }
  // if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;

  // if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region) proportion.oneHouse = undefined; //hata
  if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture) proportion.oneHouse = undefined;
  console.log("newOrder.filter.region");
  console.log(newOrder.filter.region);

  console.log("proportion.oneHouse");
  console.log(proportion.oneHouse);

  if (!newOrder.filter.onlyWithPicture && !newOrder.filter.region && !newOrder.filter.nursingHome /* && newOrder.amount < 21 */) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);
  console.log("proportion.oneRegion");
  console.log(proportion.oneRegion);



  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    amount: newOrder.amount,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    institute: newOrder.institute,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    lineItems: [],
    filter: newOrder.filter,

  };
  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData;
  let filter = {};


  if (newOrder.filter) {
    if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: null };
    /*         if ((newOrder.filter.onlyWithPicture || newOrder.filter.nursingHome || newOrder.filter.region) && newOrder.filter.addressFilter == 'any') {
                proportion.allCategory = proportion.yang + proportion.oldWomen + proportion.oldMen + proportion.special;
                proportion.oldWomen = 0;
                proportion.oldMen = 0;
                proportion.yang = 0;
                proportion.special = 0;
            } */
    if (newOrder.filter.addressFilter == 'forKids') {
      filter.noAddress = false;
    }

    if (newOrder.filter.addressFilter == 'noSpecial') {
      filter.noAddress = false;
    }

    if (newOrder.filter.addressFilter == 'onlySpecial') {
      filter.noAddress = true;

    }
    /*     if (newOrder.filter.nursingHome) {
          proportion.anyCategory = proportion.amount;
          proportion.oldWomen = 0;
          proportion.oldMen = 0;
          proportion.yang = 0;
          proportion.special = 0;
        } */

    if (newOrder.filter.region) filter.region = newOrder.filter.region;
    if (newOrder.filter.nursingHome) filter.nursingHome = newOrder.filter.nursingHome;
    if (newOrder.filter.genderFilter == 'Male') filter.gender = 'Male';
    if (newOrder.filter.genderFilter == 'Female') filter.gender = 'Female';
    if (newOrder.filter.year1 || newOrder.filter.year2) {
      if (!newOrder.filter.year1) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: 1900 };
      if (!newOrder.filter.year2) filter.yearBirthday = { $lte: 1945, $gte: newOrder.filter.year1 };
      if (newOrder.filter.year1 > 1943) {
        proportion.children = proportion.children + proportion.veterans;
        proportion.veterans = 0;
      }
      if (newOrder.filter.year1 < 1928) {
        proportion.veterans = proportion.children + proportion.veterans;
        proportion.children = 0;
      }

      if (newOrder.filter.year1 && newOrder.filter.year2) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: newOrder.filter.year1 };
    }
    seniorsData = await fillOrderMay9(proportion, order_id, filter);

  }

  if (seniorsData.celebratorsAmount < newOrder.amount) {

    await deleteErrorPlusMay9(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }

  const nursingHomes = await House.find({});
  let resultLineItems = await generateLineItemsMay9(nursingHomes, order_id);
  console.log("resultLineItems");
  console.log(resultLineItems);
  console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    console.log("resultLineItems222");
    await deleteErrorPlusMay9(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id
  }
}

// create a list of seniors for the order

async function fillOrderMay9(proportion, order_id, filter) {
  const categories = ["veterans", "children"];

  let data = {
    houses: {},
    restrictedHouses: [],//"ВЫШНИЙ_ВОЛОЧЕК"
    restrictedPearson: [],
    celebratorsAmount: 0,
    /*     date1: period.date1,
        date2: period.date2,
        maxPlus: period.maxPlus, */
    filter: filter,
    order_id: order_id,
    //temporaryLineItems: [],
  }
  if (proportion.oneRegion) {
    data.regions = {};
    data.restrictedRegions = [];
  }

  for (let category of categories) {

    data.category = category;
    data.proportion = proportion;
    data.counter = 0;
    //console.log(category);
    //console.log(proportion[category]);

    if (proportion[category]) {

      data.maxPlus = 1;

      data = await collectSeniorsMay9(data);

      if (data.counter < proportion[category]) {
        data.maxPlus = 2;

        data = await collectSeniorsMay9(data);
      }

      if (data.counter < proportion[category]) {
        data.maxPlus = 3;

        data = await collectSeniorsMay9(data);
      }

      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }
  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  return data;
}


//set restrictions for searching

async function collectSeniorsMay9(data) {

  const searchOrders = {
    veterans: ["veterans", "children"],
    children: ["children", "veterans"],
  };
  //console.log("data.category");
  //console.log(data.category);

  for (let kind of searchOrders[data.category]) {
    let barrier = data.proportion[data.category] - data.counter;

    outer1: for (let i = 0; i < barrier; i++) {
      let result = await searchSeniorMay9(
        kind,
        data

      );
      if (result) {
        //console.log(result);
        await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
        await May9.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        data.celebratorsAmount++;
        data.restrictedPearson.push(result.celebrator_id);
        data.counter++;
        console.log("data.proportion.oneHouse");
        console.log(data.proportion.oneHouse);
        if (data.proportion.oneHouse) data.houses[result["nursingHome"]] = (!data.houses[result["nursingHome"]]) ? 1 : data.houses[result["nursingHome"]] + 1;
        if (data.proportion.oneRegion) data.regions[result["region"]] = (!data.regions[result["region"]]) ? 1 : data.regions[result["region"]] + 1;
        console.log("data.regions");
        console.log(data.regions);

        if (data.proportion.oneHouse) {
          if (data.houses[result["nursingHome"]] == data.proportion["oneHouse"]) {
            data.restrictedHouses.push(result["nursingHome"]);
          }
        }
        if (data.proportion.oneRegion) {
          if (data.regions[result["region"]] == data.proportion["oneRegion"]) {
            data.restrictedRegions.push(result["region"]);
          }
        }

      } else {
        break outer1;
      }
    }
  }
  return data;
}

// get senior
async function searchSeniorMay9(
  kind,
  data
  /*   restrictedHouses,
    restrictedPearson,
    date1,
    date2,
    maxPlus,
    orderFilter */
) {

  /*  data.restrictedHouses,
      data.restrictedPearson,
      data.date1,
      data.date2,
      data.maxPlus,
      data.filter */

  let standardFilter = {
    nursingHome: { $nin: data.restrictedHouses },//CHANGE
    //secondTime: data.maxPlus > 1 ? true : false,
    //thirdTime: data.maxPlus === 3 ? true : false,
    _id: { $nin: data.restrictedPearson },
    //plusAmount: { $lt: maxPlus },
    //dateBirthday: { $gte: data.date1, $lte: data.date2 },
    absent: { $ne: true }
  };
  if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions }; //CHANGE
  if (kind == 'veterans') { standardFilter.veteran = { $ne: "" }; } else { standardFilter.child = { $ne: "" }; }
  //if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
  /*  if (data.proportion.amount > 12 || data.proportion.amount < 5 || data.category == "specialOnly") { 
        standardFilter.isReleased = false;    
    } */
  /*  if (data.proportion.amount > 12 ) { 
     standardFilter.isReleased = false;    
 }  */
  //standardFilter.isReleased = false; // CANCEL


  //console.log("maxPlus");
  //console.log(maxPlus);

  let filter = Object.assign(standardFilter, data.filter);
  //console.log("filter");


  let celebrator;
  //CHANGE!!!
  // let maxPlusAmount = 3;  
  let maxPlusAmount = 2;
  if (kind == 'veterans') { maxPlusAmount = 4; }


  //let maxPlusAmount = data.maxPlus;  
  //let maxPlusAmount = standardFilter.oldest ? 2 : data.maxPlus;
  //console.log("maxPlusAmount");
  //console.log(maxPlusAmount);

  for (let plusAmount = 1; plusAmount <= maxPlusAmount; plusAmount++) {
    filter.plusAmount = { $lt: plusAmount };
    //  filter.comment1 = "(1 корп. 2 этаж)"; //CANCEL
    //filter.comment1 = "(2 корп.)"; //CANCEL
    console.log("filter");
    console.log(filter);
    celebrator = await May9.findOne(filter);
    console.log("celebrator May9");
    console.log(celebrator);
    if (celebrator) {
      //await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
      //await List.updateOne({ _id: celebrator._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
      celebrator.celebrator_id = celebrator._id.toString();
      return celebrator;
    }
  }

  if (!celebrator) {
    return false;
  }
}

//fill lineItems
async function generateLineItemsMay9(nursingHomes, order_id) {
  //console.log(nursingHomes);

  let lineItems = [];
  let order = await Order.findOne({ _id: order_id })

  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
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
      if (!foundHouse) { return person.nursingHome; }
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
  await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return lineItems;
}


//////////////////////////////////////////////////

//create family day order

router.post("/family-day", checkAuth, async (req, res) => {
  let finalResult;
  try {
    console.log("req.body.temporaryLineItems");
    console.log(req.body.temporaryLineItems);
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      // institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: req.body.temporaryLineItems,
      lineItems: [],
      isCompleted: false,
    };
    console.log("newOrder.temporaryLineItems");
    console.log(newOrder.temporaryLineItems);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    finalResult = await createOrderForFamilyDay(newOrder);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult.result);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//fill lineItems
async function createOrderForFamilyDay(order) {
  console.log(order);

  let lineItems = [];
  let nursingHomes = await House.find({});

  order.temporaryLineItems.sort((prev, next) => prev.nursingHome > next.nursingHome ? 1 : -1);
  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
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
        return {
          result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${person.nursingHome}.`,
          success: false
        };
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


  let createdOrder = await Order.create(order);
  for (let element of createdOrder.temporaryLineItems) {
    await FamilyDay.updateOne({ _id: element._id }, { $inc: { plusAmount: 1 } });
  }
  await Order.updateOne({ _id: createdOrder._id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  let newOrder = await Order.findOne({ _id: createdOrder._id });
  // await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return {
    result: newOrder.lineItems,
    success: true,
    order_id: newOrder._id

  }
}
////////////////////////////////////////////////////

function sendMessageToAdmin(text, e) { console.log(text + e); }


///////////////////////
// Edit order list

router.patch("/edit/:orderId", checkAuth, async (req, res) => {
  try {
    console.log("req.params.orderId ");
    console.log(req.params.orderId);
    let order = await Order.findOne({ _id: req.params.orderId });
    //console.log("order");
    //console.log(order);

    for (let lineItem of order.lineItems) {
      let deletedCelebratorIndex = lineItem.celebrators.findIndex(item => item._id == req.body.idCelebrator);
      //console.log("deletedCelebratorIndex ");
      //console.log(deletedCelebratorIndex);

      let deletedLineItem;
      if (deletedCelebratorIndex != -1) {
        let deletedCelebrator = lineItem.celebrators.slice(deletedCelebratorIndex, deletedCelebratorIndex + 1);
        console.log("deletedCelebrator ");
        console.log(deletedCelebrator);

        deletedLineItem = {
          region: lineItem.region,
          nursingHome: lineItem.nursingHome,
          address: lineItem.address,
          infoComment: lineItem.infoComment,
          adminComment: lineItem.adminComment,
          noAddress: lineItem.noAddress,
          celebrators: deletedCelebrator
        }
        //console.log("deletedLineItem ");
        //console.log(deletedLineItem);

        lineItem.celebrators.splice(deletedCelebratorIndex, 1);

        // console.log("lineItem.celebrators ");
        // console.log(lineItem.celebrators);

        if (lineItem.celebrators.length == 0) {
          order.lineItems.splice(order.lineItems.indexOf(lineItem), 1);
        }

        console.log("order.lineItems[4] ");
        console.log(order.lineItems[order.lineItems.indexOf(lineItem)]);

        order.deleted.push(deletedLineItem);
        console.log("order.deleted ");
        console.log(order.deleted);

        await Order.updateOne(
          { _id: req.params.orderId },
          {
            $set: {
              lineItems: order.lineItems, deleted: order.deleted, amount: (order.amount - 1)
            }
          }
        );

        console.log("result");
        //console.log(result);

        break;
      }
      /*     
      splice(pos, deleteCount, ...items) – начиная с индекса pos удаляет deleteCount элементов и вставляет items.
      slice(start, end) – создаёт новый массив, копируя в него элементы с индекса start до end (не включая end).
      */
    }
    let updatedOrder = await Order.findOne({ _id: req.params.orderId });

    // console.log("updatedOrder.lineItems[4] ");
    // console.log(updatedOrder.lineItems[4]);

    await deletePluses(updatedOrder, false);

    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", updatedOrder);
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const confirmOrderCatchErrorResponse = new BaseResponse(
      "500",
      "MongoDB server error",
      e
    );
    res.status(500).send(confirmOrderCatchErrorResponse.toObject());
  }
});



//////////
router.patch("/correct-orders-dates", checkAuth, async (req, res) => {
  try {

    /*     let orders = await Order.find({
          userName: "okskust", dateOfOrder: { $lt: new Date("2023-10-1"), $gt: new Date("2022-12-31") }
        }); */
    // let orders = await Order.find({userName: "ligeyalag", dateOfOrder: null }); 
    // let orders = await Order.find({userName: "Veronika"}); 
    //let orders = await Order.find({userName: "Antik"}); "VasilisaFiva""mielolha" Daria793"ekatkacheva"upr_kult89,Blancanieves['KaterinaFrolova', 'Juliksmirnova', 'Djabirma', 'Vertlina', 'Elena77', 'mashap', 'Sashechkaocean', 'LizaVenchik'] ['dripman', 'Marina_Irkutsk', 'Verun', 'Ludikmila', 'royrai']

    let orders = await Order.find(
      {
        userName:
          { $ne: 'okskust' }, dateOfOrder: { $gt: new Date('2023-08-29') }
      });

    let milliseconds = 1;

    for (let order of orders) {
      console.log(order._id);
      let partOfDate = order.orderDate.split(".");
      console.log('partOfDate');
      console.log(partOfDate);
      let newDate = new Date(partOfDate[2] + "-" + partOfDate[1] + "-" + partOfDate[0]);

      newDate.setMilliseconds(newDate.getMilliseconds() + milliseconds);
      await Order.updateOne({ _id: order._id }, { $set: { dateOfOrder: newDate } });
      milliseconds++;
      console.log('newDate');
      console.log(newDate);

    }
    console.log('orders.length');
    console.log(orders.length);
    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", "updated");
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const confirmOrderCatchErrorResponse = new BaseResponse(
      "500",
      "MongoDB server error",
      e
    );
    res.status(500).send(confirmOrderCatchErrorResponse.toObject());
  }
});

//move institute to institutes

router.get("/clients/move-institutes", checkAuth, async (req, res) => {
  try {

    /*     let orders = await Order.find({institute: {$ne: null}}); //({ dateOfOrder: { $gt: new Date('2022-05-01'), $lte: new Date('2022-07-31') } });
        for (let order of orders) {
          await Order.updateOne({_id: order._id}, 
            { $push: { institutes: [{ name: order.institute, category: "образовательное учреждение" }] } })
            console.log(order._id); 
        }*/
    let orders = await Order.find({ email: { $ne: null }, contact: null });
    for (let order of orders) {
      await Order.updateOne({ _id: order._id },
        { $set: { contactType: "email", contact: order.email } })
      console.log(order._id);
    }




    const confirmOrderResponse = new BaseResponse("200", "Orders updated", true);
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      err
    );
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});

//restore plusAmount
// Восстановление плюсов
router.get("/restore-pluses/:holiday", checkAuth, async (req, res) => {
  try {

    /* const celebratorsDecember = await ListBefore.find({ absent: false });
    const celebratorsJanuary = await List.find({ absent: false });
    const celebratorsFebruary = await ListNext.find({ absent: false }); */

    if (req.params.holiday == "birthday") {
      const celebratorsHB = await List.find({ absent: false });// , nursingHome: "ТУТАЕВ"
      for (let celebrator of celebratorsHB) {
        let plusAmount = await Order.find({ "lineItems.celebrators._id": celebrator._id, isDisabled: false, isOverdue: false, isReturned: false, holiday: "Дни рождения апреля 2025" }).countDocuments();
        await List.updateOne({ _id: celebrator._id }, { $set: { plusAmount: plusAmount } });
        let updatedCelebrator = await List.findOne({ _id: celebrator._id });

        console.log("result");
        console.log(updatedCelebrator.fullData + " " + updatedCelebrator.plusAmount);
      }

    }

    if (req.params.holiday == "birthdayBefore") {
      const celebratorsHB = await ListBefore.find({ absent: false });
      for (let celebrator of celebratorsHB) {
        let plusAmount = await Order.find({ "lineItems.celebrators._id": celebrator._id, isDisabled: false, isOverdue: false, isReturned: false, holiday: "Дни рождения марта 2025" }).countDocuments();
        await ListBefore.updateOne({ _id: celebrator._id }, { $set: { plusAmount: plusAmount } });
        let updatedCelebrator = await ListBefore.findOne({ _id: celebrator._id });

        console.log("result");
        console.log(updatedCelebrator.fullData + " " + updatedCelebrator.plusAmount);
      }

    }

    if (req.params.holiday == "birthdayBefore") {
      const celebratorsHB = await ListNext.find({ absent: false });
      for (let celebrator of celebratorsHB) {
        let plusAmount = await Order.find({ "lineItems.celebrators._id": celebrator._id, isDisabled: false, isOverdue: false, isReturned: false, holiday: "Дни рождения мая 2025" }).countDocuments();
        await ListNext.updateOne({ _id: celebrator._id }, { $set: { plusAmount: plusAmount } });
        let updatedCelebrator = await ListNext.findOne({ _id: celebrator._id });

        console.log("result");
        console.log(updatedCelebrator.fullData + " " + updatedCelebrator.plusAmount);
      }

    }


    if (req.params.holiday == "seniorDay") {
      const celebratorsSD = await SeniorDay.find({
        absent: false,
        // nursingHome: { $in: ["ЧИСТОПОЛЬ", "ЧИТА_ТРУДА", "ЯСНОГОРСК", "ВОЗНЕСЕНЬЕ", "УЛЬЯНКОВО", "КУГЕСИ", "ВЛАДИКАВКАЗ", "ВЫСОКОВО", "СЛОБОДА-БЕШКИЛЬ", "ПЕРВОМАЙСКИЙ", "СКОПИН", "РЯЗАНЬ", "ДОНЕЦК", "ТИМАШЕВСК", "ОКТЯБРЬСКИЙ", "НОГУШИ", "МЕТЕЛИ", "ЛЕУЗА", "КУДЕЕВСКИЙ", "БАЗГИЕВО", "ВЫШНИЙ_ВОЛОЧЕК", "ЖИТИЩИ", "КОЗЛОВО", "МАСЛЯТКА", "МОЛОДОЙ_ТУД", "ПРЯМУХИНО", "РЖЕВ", "СЕЛЫ", "СТАРАЯ_ТОРОПА", "СТЕПУРИНО", "ТВЕРЬ_КОНЕВА", "ЯСНАЯ_ПОЛЯНА", "КРАСНЫЙ_ХОЛМ", "ЗОЛОТАРЕВКА", "БЫТОШЬ", "ГЛОДНЕВО", "ДОЛБОТОВО", "ЖУКОВКА", "СЕЛЬЦО", "СТАРОДУБ"] }
        nursingHome: { $in: ["ВОЗНЕСЕНЬЕ"] }
      });
      let count = celebratorsSD.length;
      for (let celebrator of celebratorsSD) {
        let plusAmount = await Order.find({ "lineItems.celebrators._id": celebrator._id, isDisabled: false, isOverdue: false, isReturned: false, holiday: "День пожилого человека 2024" }).countDocuments();
        await SeniorDay.updateOne({ _id: celebrator._id }, { $set: { plusAmount: plusAmount } });
        let updatedCelebrator = await SeniorDay.findOne({ _id: celebrator._id });

        console.log(--count);
        // console.log("result");
        if (plusAmount != celebrator.plusAmount) {
          console.log(updatedCelebrator.fullData + " " + updatedCelebrator.plusAmount);
        }




      }

    }

    if (req.params.holiday == "easter") {
      let housesSet = new Set();
      const celebratorsEaster = await Easter.find({ absent: false });
      for (let celebrator of celebratorsEaster) {
        /*         console.log(celebrator.seniorId);
                let plusAmount = await Order.find({ "lineItems.celebrators.seniorId": celebrator.seniorId, isDisabled: false, isOverdue: false, isReturned: false, holiday: "Пасха 2025" }).countDocuments();
                await Easter.updateOne({ seniorId: celebrator.seniorId }, { $set: { plusAmount: plusAmount } });
                let updatedCelebrator = await Easter.findOne({ seniorId: celebrator.seniorId });
        
                console.log("result");
                console.log(updatedCelebrator.fullData + " " + updatedCelebrator.plusAmount); */
        housesSet.add(celebrator.nursingHome);
      }
      let houses = Array.from(housesSet);



      for (let house of houses) {
        await restoreEasterStatistic(house);
      }

      await countAmount();
    }

    if (req.params.holiday == "veterans") {
      let housesSet = new Set();
      const celebratorsMay9 = await May9.find({ absent: false });
      for (let celebrator of celebratorsMay9) {

        /*         console.log(celebrator.seniorId);
                let plusAmount = await Order.find({ "lineItems.celebrators.seniorId": celebrator.seniorId, isDisabled: false, isOverdue: false, isReturned: false, holiday: "9 мая 2024" }).countDocuments();
                await May9.updateOne({ seniorId: celebrator.seniorId }, { $set: { plusAmount: plusAmount } });
                let updatedCelebrator = await May9.findOne({ seniorId: celebrator.seniorId });
                console.log("result");
                console.log(updatedCelebrator.fullData + " " + updatedCelebrator.plusAmount); */

        housesSet.add(celebrator.nursingHome);

      }
      let houses = Array.from(housesSet);



      for (let house of houses) {
        await restoreVeteransStatistic(house);
      }
    }

    if (req.params.holiday == "newYear") {//обязательно без ДМИТРИЕВКА ПЯТИМОРСК


      /*       let celebrators =  await NewYear.find({ seniorId: null});
            for (let celebrator of celebrators) {
              
              const senior = await Senior.findOne({
                nursingHome: celebrator.nursingHome,
                lastName: celebrator.lastName,
                firstName: celebrator.firstName,
                patronymic: celebrator.patronymic,
              dateBirthday: celebrator.dateBirthday,
                monthBirthday: celebrator.monthBirthday,
                yearBirthday: celebrator.yearBirthday, *
              });
              console.log(senior);
              await NewYear.updateOne({_id: celebrator._id}, { seniorId: senior._id});
      
            } */

      console.log("I AM HERE!!!");
      let housesSet = new Set();
      //  const celebratorsNewYear = await NewYear.find({ absent: false });
      const celebratorsNewYear = await NewYear.find({
        absent: false,
        nursingHome: {
          $in: [
            "СЫЗРАНЬ_ПОЖАРСКОГО",
            /*             "САЛЬСК",
                        "ЯСНАЯ",
                        "ТАРА",
                        "САМОЛЮБОВО",
                        "БЕЛОГОРСК",
                        "МУРМАНСК_СТАРОСТИНА",
                        "ДАЛЬНЕГОРСК",
                        "ЗЕЛЕНЫЙ"
             */



          ]
        }
      });
      let count = celebratorsNewYear.length;
      //  console.log(celebratorsNewYear);
      console.log(count);
      for (let celebrator of celebratorsNewYear) {
        // console.log(celebrator.seniorId);
        let plusAmount = await Order.find({ "lineItems.celebrators.seniorId": celebrator.seniorId, isDisabled: false, isOverdue: false, isReturned: false, holiday: "Новый год 2025" }).countDocuments();
        let forInstitute = await Order.find({ "lineItems.celebrators.seniorId": celebrator.seniorId, isDisabled: false, isOverdue: false, isReturned: false, holiday: "Новый год 2025", institutes: { $ne: [] } }).countDocuments();
        // console.log("forInstitute");
        //console.log(forInstitute);

        //let forNavigators = await Order.find({ "lineItems.celebrators.seniorId": celebrator.seniorId, isDisabled: false, isOverdue: false, isReturned: false, holiday: "Новый год 2025", contact: { $in: ["@tterros"] } }).countDocuments();
        await NewYear.updateOne({ seniorId: celebrator.seniorId }, { $set: { plusAmount: plusAmount, forInstitute: forInstitute, } });//forNavigators: forNavigators
        let updatedCelebrator = await NewYear.findOne({ seniorId: celebrator.seniorId });
        console.log(--count);
        // console.log("result");
        if (plusAmount != celebrator.plusAmount) {
          console.log(updatedCelebrator.fullData + " " + updatedCelebrator.plusAmount);
        }

        housesSet.add(celebrator.nursingHome);
      }
      let houses = Array.from(housesSet);
      //  let houses = [ 'ВОЗНЕСЕНЬЕ',]; 


      for (let house of houses) {
        await restoreNewYearStatistic(house);
      }

      //await countAmount();
    }


    const confirmOrderResponse = new BaseResponse("200", "Plus amounts updated", true);
    res.json(confirmOrderResponse.toObject());
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      e
    );
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});

async function countAmount() {
  let houses = await House.find({ isActive: true }, { nursingHome: 1, _id: 0 });
  console.log(houses);
  for (let house of houses) {

    let amount = await Senior.aggregate([
      { $match: { nursingHome: house.nursingHome, dateExit: null, isRestricted: false } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    console.log(house.nursingHome);
    console.log(amount[0].count);
    let find = await House.findOne({ nursingHome: house.nursingHome });
    console.log(find.nursingHome);
    let update = await House.updateOne({ nursingHome: house.nursingHome }, { $set: { "statistic.easter.amount": amount[0].count } });
    console.log(update);
  }

  return true;
}

async function restoreNewYearStatistic(activeHouse) {
  console.log("activeHouse");
  console.log(activeHouse);

  let house = await House.findOne({ nursingHome: activeHouse });
  /*       console.log("house");
        console.log(house); */


  /*   for (let house of houses) {

   */

  let forInstitute_1 = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, forInstitute: 1 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   let forNavigators_1 = await NewYear.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, forNavigators: 1 } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]); */
  let forInstitute_2 = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, forInstitute: 2 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*  let forNavigators_2 = await NewYear.aggregate([
     { $match: { nursingHome: house.nursingHome, absent: false, forNavigators: 2 } },
     { $group: { _id: null, count: { $sum: 1 } } }
   ]); */

  let forInstitute = (forInstitute_1[0]?.count ? forInstitute_1[0].count : 0) + (forInstitute_2[0]?.count ? forInstitute_2[0].count : 0) * 2;
  // let forNavigators = (forNavigators_1[0]?.count ? forNavigators_1[0].count : 0) + (forNavigators_2[0]?.count ? forNavigators_2[0].count : 0)*2;

  await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.forInstitute": forInstitute } });
  //await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.forNavigators": forNavigators } });

  let plus0 = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 0 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   console.log("plus0");
    console.log(plus0); */

  await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus0": plus0[0]?.count ? plus0[0].count : 0 } });

  let plus1 = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 1 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   console.log("plus1");
    console.log(plus1); */
  await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus1": plus1[0]?.count ? plus1[0].count : 0 } });

  let plus2 = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 2 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  /* 
    console.log("plus2");
    console.log(plus2); */
  await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus2": plus2[0]?.count ? plus2[0].count : 0 } });

  let plus3 = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 3 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   console.log("plus3");
    console.log(plus3); */

  await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus3": plus3[0]?.count ? plus3[0].count : 0 } });

  let plus4 = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: 4 } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  /*   console.log("plus3");
    console.log(plus3); */

  await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.plus4": plus4[0]?.count ? plus4[0].count : 0 } });

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

  let amount = await NewYear.aggregate([
    { $match: { nursingHome: house.nursingHome, absent: false } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  await House.updateOne({ _id: house._id }, { $set: { "statistic.newYear.amount": amount[0].count } });

  console.log("amount NewYear");
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

async function restoreVeteransStatistic(activeHouse) {
  console.log("activeHouse");
  console.log(activeHouse);

  let house = await House.findOne({ nursingHome: activeHouse });
  console.log("house");
  console.log(house.nursingHome);


  /*   for (let house of houses) {

   */

  for (let i = 0; i < 6; i++) {
    let plus = await May9.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: i, veteran: { $ne: "" } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { ["statistic.veterans.veteranPlus" + i]: plus[0]?.count ? plus[0].count : 0 } });
    console.log("plusVeteran" + i);
    console.log(plus[0]?.count);
  }

  for (let i = 0; i < 3; i++) {
    let plus = await May9.aggregate([
      { $match: { nursingHome: house.nursingHome, absent: false, plusAmount: i, child: { $ne: "" } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    await House.updateOne({ _id: house._id }, { $set: { ["statistic.veterans.childPlus" + i]: plus[0]?.count ? plus[0].count : 0 } });
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



//////////////////////////////////////////////////// EASTER

router.post("/easter/:amount", checkAuth, async (req, res) => {
  let finalResult;
  try {
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      //institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: [],
      lineItems: [],
      filter: req.body.filter,
      isCompleted: false
    };
    console.log("req.body.restrictedHouses");
    console.log(req.body.restrictedHouses);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    finalResult = await createOrderEaster(newOrder, req.body.prohibitedId, req.body.restrictedHouses);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlusEaster(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//delete pluses because of error 

async function deleteErrorPlusEaster(order_id, ...userName) {
  try {
    let filter = order_id ? { _id: order_id } : { userName: userName[0], isCompleted: false };
    //console.log("userName[0]");
    //console.log(userName[0]);

    let order = await Order.findOne(filter);  //, { projection: { _id: 0, temporaryLineItems: 1 } }
    if (order) {
      if (order.temporaryLineItems && order.temporaryLineItems.length > 0) {
        let seniors_ids = [];
        for (let person of order.temporaryLineItems) {
          seniors_ids.push(person.celebrator_id);
        }

        for (let id of seniors_ids) {
          let senior = await Easter.findOne({ _id: id });
          let p = senior.plusAmount;
          let newP = p - 1;
          let c = senior.category;
          await House.updateOne(
            {
              nursingHome: senior.nursingHome
            },
            {
              $inc: {
                ["statistic.easter.plus" + p]: -1,
                ["statistic.easter.plus" + newP]: 1,
                ["statistic.easter." + c + "Plus"]: -1,
              }
            }

          );

        }
        await Easter.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });


      }
      await Order.deleteOne({ _id: order._id });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    sendMessageToAdmin('something wrong with "deleteErrorPlus"', e);
  }
}


// Create order
async function createOrderEaster(newOrder, prohibitedId, restrictedHouses) {


  /*   let proportion = {};
  
    if (newOrder.amount > 50) {
      let oldWomenAmount = Math.round(newOrder.amount * 0.2);
      let oldMenAmount = Math.round(newOrder.amount * 0.3);
      let specialAmount = Math.round(newOrder.amount * 0.2);
      let yangAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialAmount;
  
      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "special": specialAmount,
        "yang": yangAmount,
        "oneHouse": 5 //Math.round(newOrder.amount * 0.2)
      }
      if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;
    } else {
      proportion = await Proportion.findOne({ amount: newOrder.amount }); */

  let proportion = {};

  if (newOrder.filter.genderFilter != 'proportion') {
    if (newOrder.amount > 50) {
      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {
        oldWomenAmount = Math.round(newOrder.amount * 0.1);
        oldMenAmount = Math.round(newOrder.amount * 0.3);
        specialWomenAmount = Math.round(newOrder.amount * 0.1);
        specialMenAmount = Math.round(newOrder.amount * 0.1);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;

      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.2)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.2);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }


      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2)
      }
      if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;
    } else {

      let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
      if (!newOrder.filter.maxNoAddress) {
        oldWomenAmount = Math.round(newOrder.amount * 0.1) ? Math.round(newOrder.amount * 0.1) : 1;
        oldMenAmount = Math.round(newOrder.amount * 0.2);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = Math.round(newOrder.amount * 0.1);
        specialWomenAmount = Math.round(newOrder.amount * 0.1);
        specialMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount - specialWomenAmount;

      } else {
        specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.1)
        specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
        oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
        yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.1);
        yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
      }
      proportion = {
        "amount": newOrder.amount,
        "oldWomen": oldWomenAmount,
        "oldMen": oldMenAmount,
        "specialWomen": specialWomenAmount,
        "specialMen": specialMenAmount,
        "yangWomen": yangWomenAmount,
        "yangMen": yangMenAmount,
        "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2)
      }
    }

    if (!proportion) {
      return {
        result: `Обратитесь к администратору. Заявка не сформирована. Для количества ${newOrder.amount} не найдена пропорция`,
        success: false
      };
    } else {
      if (!newOrder.filter.maxOneHouse && (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region)) proportion.oneHouse = undefined;
      //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
      console.log("newOrder.filter.region");
      console.log(newOrder.filter.region);

      console.log("proportion.oneHouse");
      console.log(proportion.oneHouse);

      if (!newOrder.filter.onlyWithPicture && !newOrder.filter.region && !newOrder.filter.nursingHome && newOrder.amount < 21) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);

    }

  }


  if (newOrder.filter.genderFilter == 'proportion') {

    let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
    if (!newOrder.filter.maxNoAddress) {
      oldWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.4);
      oldMenAmount = Math.round(newOrder.filter.maleAmount * 0.4);
      specialWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.2);
      specialMenAmount = Math.round(newOrder.filter.maleAmount * 0.2);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;


    } else {

      specialWomenAmount = Math.ceil(newOrder.filter.femaleAmount / newOrder.amount * newOrder.filter.maxNoAddress);
      specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
      oldWomenAmount = Math.round((newOrder.filter.femaleAmount - specialWomenAmount) * 0.4);
      oldMenAmount = Math.round((newOrder.filter.maleAmount - specialMenAmount) * 0.4);
      yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
      yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;
    }
    proportion = {
      "amount": newOrder.amount,
      "oldWomen": oldWomenAmount,
      "oldMen": oldMenAmount,
      "specialWomen": specialWomenAmount,
      "specialMen": specialMenAmount,
      "yangWomen": yangWomenAmount,
      "yangMen": yangMenAmount,
      "oneHouse": newOrder.filter.maxOneHouse ? newOrder.filter.maxOneHouse : Math.round(newOrder.amount * 0.2),
      "oneRegion": Math.ceil(newOrder.amount * 0.33)
    }

    if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region || newOrder.amount > 20) {
      proportion.oneRegion = undefined;
    }
    //proportion.oneRegion = 14; //удалить
  }
  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  console.log("emptyOrder.dateOfOrder");
  console.log(emptyOrder.dateOfOrder);

  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData;
  let filter = {};
  const nursingHomes = await House.find({});
  let chosenHome;


  if (newOrder.filter) {

    if (newOrder.filter.nursingHome) {
      chosenHome = nursingHomes.filter(item => item.nursingHome == newOrder.filter.nursingHome)[0];
      if ((chosenHome.isReleased || chosenHome.noAddress) && (newOrder.filter.addressFilter != 'noSpecial' && newOrder.filter.addressFilter != 'forKids' && newOrder.filter.addressFilter != 'noReleased')) {
        proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
        proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
        proportion.oldWomen = 0;
        proportion.oldMen = 0;
        proportion.yangWomen = 0;
        proportion.yangMen = 0;
      }
    }

    if (newOrder.filter.addressFilter == 'noSpecial') {
      proportion.yangWomen = proportion.yangWomen + proportion.specialWomen;
      proportion.yangMen = proportion.yangMen + proportion.specialMen;
      proportion.specialMen = 0;
      proportion.specialWomen = 0;
    }

    if (newOrder.filter.addressFilter == 'onlySpecial') {
      proportion.specialWomen = proportion.specialWomen + proportion.oldWomen + proportion.yangWomen;
      proportion.specialMen = proportion.specialMen + proportion.oldMen + proportion.yangMen;
      proportion.oldWomen = 0;
      proportion.oldMen = 0;
      proportion.yangWomen = 0;
      proportion.yangMen = 0;
      console.log("onlySpecial");
      console.log(proportion);
    }

    if (newOrder.filter.addressFilter == 'forKids') {
      proportion.oldWomen = proportion.oldWomen + proportion.specialWomen;
      proportion.oldMen = proportion.oldMen + proportion.specialMen;
      proportion.specialWomen = 0;
      proportion.specialMen = 0;

      console.log("forKids");
      console.log(proportion);
      if (!newOrder.filter.year1 && !newOrder.filter.year2) {
        newOrder.filter.year2 = 1963;
      }
    }


    //console.log("order");
    //console.log(order);


    console.log("proportion");
    console.log(proportion);

    if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: null };
    if (newOrder.filter.onlyAnniversaries) filter.specialComment = /Юбилей/;
    if (newOrder.filter.onlyAnniversariesAndOldest) filter.$or = [{ specialComment: /Юбилей/ }, { oldest: true }];
    if (newOrder.filter.region) filter.region = newOrder.filter.region;
    if (newOrder.filter.nursingHome) filter.nursingHome = newOrder.filter.nursingHome;
    if (newOrder.filter.genderFilter == 'Male') filter.gender = 'Male';
    if (newOrder.filter.genderFilter == 'Female') filter.gender = 'Female';
    if (newOrder.filter.addressFilter == 'noReleased' || newOrder.filter.addressFilter == 'onlySpecial' || newOrder.filter.addressFilter == 'forKids') filter.isReleased = false;
    if (newOrder.filter.addressFilter == 'noSpecial' || newOrder.filter.addressFilter == 'forKids') filter.noAddress = false;
    if (newOrder.filter.addressFilter == 'onlySpecial') filter.noAddress = true;
    if (newOrder.filter.addressFilter == 'forKids') filter.yearBirthday = { $lte: 1963 };
    if (newOrder.filter.year1 || newOrder.filter.year2) {
      if (!newOrder.filter.year1) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: 1900 };
      if (!newOrder.filter.year2) filter.yearBirthday = { $lte: 2022, $gte: newOrder.filter.year1 };
      /*       if (newOrder.filter.year1 > 1958 && newOrder.filter.addressFilter != 'onlySpecial') {
              proportion.yang = proportion.yang + proportion.oldWomen + proportion.oldMen;
              proportion.oldWomen = 0;
              proportion.oldMen = 0;
            } */
      if (newOrder.filter.year1 && newOrder.filter.year2) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: newOrder.filter.year1 };
    }
    seniorsData = await fillOrderEaster(proportion, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter);

  }

  if (seniorsData.celebratorsAmount < newOrder.amount) {

    await deleteErrorPlusEaster(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }

  //НАВИГАТОРЫ

  let resultLineItems = await generateLineItemsEaster(nursingHomes, order_id);
  // console.log("resultLineItems");
  // console.log(resultLineItems);
  // console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    // console.log("resultLineItems222");
    await deleteErrorPlusEaster(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName
  }
}

// create a list of seniors for the order 789

async function fillOrderEaster(proportion, order_id, filter, prohibitedId, restrictedHouses, orderFilter) {

  const categories = ["oldWomen", "oldMen", "yangWomen", "yangMen", "specialWomen", "specialMen",]; // "specialOnly", "allCategory"
  /*   restrictedHouses.push("ПОРЕЧЬЕ-РЫБНОЕ");
   restrictedHouses.push("СЕВЕРОДВИНСК");
  restrictedHouses.push("РЖЕВ");
   restrictedHouses.push("ПЕРВОМАЙСКИЙ");
   restrictedHouses.push("ВЯЗЬМА"); */
  let data = {
    houses: {},
    restrictedHouses: [...restrictedHouses],
    restrictedPearson: [...prohibitedId],
    celebratorsAmount: 0,
    /*     date1: period.date1,
        date2: period.date2,
        maxPlus: period.maxPlus, */
    filter: filter,
    order_id: order_id,
    //temporaryLineItems: [],
  }
  if (proportion.oneRegion) {
    data.regions = {};
    data.restrictedRegions = [];
  }


  ///// 


  for (let category of categories) {

    data.category = category;
    data.proportion = proportion;
    data.counter = 0;
    //console.log(category);
    //console.log(proportion[category]);

    if (proportion[category]) {

      data.maxPlus = 1;

      data = await collectSeniorsEaster(data, orderFilter);

      /*   if (data.counter < proportion[category]) {
     data.maxPlus = 2;

     data = await collectSeniorsEaster(data, orderFilter);
   }

   if (data.counter < proportion[category]) {
     data.maxPlus = 3;

     data = await collectSeniorsEaster(data, orderFilter);
   }


   if (data.counter < proportion[category]) {
     data.maxPlus = 4;

     data = await collectSeniorsEaster(data, orderFilter);
   }
  if (data.counter < proportion[category]) {
          data.maxPlus = 5;
  
          data = await collectSeniorsEaster(data, orderFilter);
        }    */
      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }
  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  return data;
}


//set restrictions for searching 789

async function collectSeniorsEaster(data, orderFilter) {

  let searchOrders = {};
  //console.log("data.category");
  //console.log(data.category);

  if (orderFilter.genderFilter != 'proportion') {

    if (data.filter.addressFilter != 'onlySpecial') {
      if (data.filter.region && data.filter.addressFilter != 'forKids') {

        console.log("HERE");
        console.log(data.category);

        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen", "specialWomen", "specialMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen", "specialMen", "specialWomen"],
          yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen", "specialMen", "specialWomen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen", "specialMen", "specialWomen"],
          specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
          specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
        }
      } else {

        if (data.filter.addressFilter == 'forKids') {
          searchOrders = {
            oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
            oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
            yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
            yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"]
          }
        }

        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
          yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"],
          specialWomen: ["specialWomen", "specialMen", "yangWomen", "yangMen", "oldWomen", "oldMen"],
          specialMen: ["specialMen", "specialWomen", "yangMen", "yangWomen", "oldMen", "oldWomen"],
          // specialOnly: ["special", "oldWomen"],
          // allCategory: ["oldMen", "oldWomen", "yang", "oldest", "special"]
        };
      }
    } else {
      searchOrders = {
        /*   oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
          oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
          yangWomen: ["yangWomen", "yangMen", "oldWomen", "oldMen"],
          yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"], */
        specialWomen: ["specialWomen", "specialMen"],
        specialMen: ["specialMen", "specialWomen"],
      };
    }
  }

  if (orderFilter.genderFilter == 'proportion') {
    if (orderFilter.addressFilter != 'onlySpecial') {
      if (data.filter.region && data.filter.addressFilter != 'forKids') {
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen", "specialWomen",],
          oldMen: ["oldMen", "yangMen", "specialMen",],
          yangWomen: ["yangWomen", "oldWomen", "specialWomen"],
          yangMen: ["yangMen", "oldMen", "specialMen",],
          specialWomen: ["specialWomen", "yangWomen", "oldWomen",],
          specialMen: ["specialMen", "yangMen", "oldMen",],
        }
      } else {
        if (data.filter.addressFilter == 'forKids') {
          searchOrders = {
            oldWomen: ["oldWomen", "yangWomen"],
            oldMen: ["oldMen", "yangMen"],
            yangWomen: ["yangWomen", "oldWomen"],
            yangMen: ["yangMen", "oldMen"]
          }
        }
        searchOrders = {
          oldWomen: ["oldWomen", "yangWomen"],
          oldMen: ["oldMen", "yangMen"],
          yangWomen: ["yangWomen", "oldWomen"],
          yangMen: ["yangMen", "oldMen"],
          specialWomen: ["specialWomen", "yangWomen", "oldWomen"],
          specialMen: ["specialMen", "yangMen", "oldMen"],
        };
      }
    } else {
      searchOrders = {
        /*         oldWomen: ["oldWomen", "yangWomen"],
                oldMen: ["oldMen", "yangMen"],
                yangWomen: ["yangWomen", "oldWomen"],
                yangMen: ["yangMen", "oldMen"], */
        specialWomen: ["specialWomen"],
        specialMen: ["specialMen"],
      };
    }
  }


  for (let kind of searchOrders[data.category]) {
    let barrier = data.proportion[data.category] - data.counter;

    outer1: for (let i = 0; i < barrier; i++) {
      let result = await searchSeniorEaster(
        kind,
        data

      );
      if (result) {
        //console.log(result);
        await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
        await Easter.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });

        let senior = await Easter.findOne({ _id: result.celebrator_id });
        let newP = senior.plusAmount;
        let p = newP - 1;
        let c = senior.category;
        await House.updateOne(
          {
            nursingHome: senior.nursingHome
          },
          {
            $inc: {
              ["statistic.easter.plus" + p]: -1,
              ["statistic.easter.plus" + newP]: 1,
              ["statistic.easter." + c + "Plus"]: 1,
            }
          }

        );


        data.celebratorsAmount++;
        data.restrictedPearson.push(result.celebrator_id);
        data.counter++;
        console.log("data.proportion.oneHouse");
        console.log(data.proportion.oneHouse);
        if (data.proportion.oneHouse) data.houses[result["nursingHome"]] = (!data.houses[result["nursingHome"]]) ? 1 : data.houses[result["nursingHome"]] + 1;
        if (data.proportion.oneRegion) data.regions[result["region"]] = (!data.regions[result["region"]]) ? 1 : data.regions[result["region"]] + 1;
        console.log("data.regions");
        console.log(data.regions);

        if (data.proportion.oneHouse) {
          if (data.houses[result["nursingHome"]] == data.proportion["oneHouse"]) {
            data.restrictedHouses.push(result["nursingHome"]);
          }
        }
        if (data.proportion.oneRegion) {
          if (data.regions[result["region"]] == data.proportion["oneRegion"]) {
            data.restrictedRegions.push(result["region"]);
          }
        }

      } else {
        break outer1;
      }
    }
  }
  return data;
}

// get senior
async function searchSeniorEaster(
  kind,
  data
  /*   restrictedHouses,
    restrictedPearson,
    maxPlus,
    orderFilter */
) {

  /*  data.restrictedHouses,
      data.restrictedPearson,
      data.maxPlus,
      data.filter */

  let standardFilter = {
    nursingHome: { $nin: data.restrictedHouses },
    secondTime: data.maxPlus > 1 ? true : false,
    // secondTime: true,
    thirdTime: data.maxPlus > 2 ? true : false,
    forthTime: data.maxPlus > 3 ? true : false,
    _id: { $nin: data.restrictedPearson },
    //plusAmount: { $lt: maxPlus },
    //dateBirthday: { $gte: data.date1, $lte: data.date2 },
    absent: { $ne: true }
  };

  if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions };
  if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
  if ((data.proportion.amount > 12 || data.proportion.amount < 5) && (!data.filter.nursingHome)) {
    standardFilter.isReleased = false;
  }
  /*     if (data.proportion.amount > 12 || data.proportion.amount < 5 || data.category == "specialOnly") { 
          standardFilter.isReleased = false;    
      }  */
  /*if (data.proportion.amount > 12) {
    standardFilter.isReleased = false;
  }*/
  //standardFilter.isReleased = false; // CANCEL


  //console.log("maxPlus");
  //console.log(maxPlus);


  let filter = Object.assign(standardFilter, data.filter);
  //console.log("filter");


  let celebrator;
  //CHANGE!!!


  //let maxPlusAmount = 1
  //let maxPlusAmount = 2;

  let maxPlusAmount = data.maxPlus;
  //let maxPlusAmount = standardFilter.oldest ? 2 : data.maxPlus;
  //console.log("maxPlusAmount");
  //console.log(maxPlusAmount);
  //maxPlusAmount = 3;
  for (let plusAmount = 1; plusAmount <= maxPlusAmount; plusAmount++) {
    filter.plusAmount = { $lt: plusAmount };


    //filter.firstName = "Светлана";
    //filter.comment1 = "(2 корп. 5 этаж)"; //CANCEL
    // filter.comment1 = {$ne: "(отд. 4)"}; //CANCEL
    // filter.comment2 = /труда/; //CANCEL
    //filter.comment1 = /верующ/; //CANCEL
    // filter.nursingHome = { $in: [ 'БОГОЛЮБОВО', 'НОВОСЕЛЬЕ', 'КУГЕЙСКИЙ', 'ПУХЛЯКОВСКИЙ', 'САРАТОВ_КЛОЧКОВА' ] }
    //filter.region = {$in: ["АРХАНГЕЛЬСКАЯ", "МОСКОВСКАЯ", "МОРДОВИЯ", ]};
    //
    filter.noName = true; //ОРГАНИЗАЦИИ
    console.log("filter");
    console.log(filter);
    celebrator = await Easter.findOne(filter);
    console.log("celebrator Easter");
    console.log(celebrator);
    if (celebrator) {
      //await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
      //await List.updateOne({ _id: celebrator._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
      celebrator.celebrator_id = celebrator._id.toString();
      return celebrator;
    }
  }

  if (!celebrator) {
    return false;
  }
}

//fill lineItems
async function generateLineItemsEaster(nursingHomes, order_id) {
  //console.log(nursingHomes);

  let lineItems = [];
  let order = await Order.findOne({ _id: order_id })

  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
    /*   console.log("person");
      console.log(person); */
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
      if (!foundHouse) { return person.nursingHome; }
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
  await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  return lineItems;
}


////////////VETERANS ORDER////////////////////////////////////////

router.post("/veterans/:amount", checkAuth, async (req, res) => {
  let finalResult;
  try {
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      //institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: [],
      lineItems: [],
      filter: req.body.filter,
      isCompleted: false
    };

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }
    console.log("veterans1");

    finalResult = await createOrderVeterans(newOrder, req.body.prohibitedId, req.body.restrictedHouses);
    let text = !finalResult.success ? finalResult.result : "Query Successful";
    console.log("veteransF");
    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlusVeterans(false, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});


//delete pluses because of error 

async function deleteErrorPlusVeterans(order_id, ...userName) {
  try {
    let filter = order_id ? { _id: order_id } : { userName: userName[0], isCompleted: false };
    //console.log("userName[0]");
    //console.log(userName[0]);

    let order = await Order.findOne(filter);  //, { projection: { _id: 0, temporaryLineItems: 1 } }
    if (order) {
      if (order.temporaryLineItems && order.temporaryLineItems.length > 0) {
        let seniors_ids = [];
        for (let person of order.temporaryLineItems) {
          seniors_ids.push(person.celebrator_id);
        }

        for (let id of seniors_ids) {
          let senior = await May9.findOne({ _id: id });
          let p = senior.plusAmount;
          let newP = p - 1;
          let c = senior.veteran ? "veteranPlus" : "childPlus";
          await House.updateOne(
            {
              nursingHome: senior.nursingHome
            },
            {
              $inc: {
                ["statistic.veterans." + c + p]: -1,
                ["statistic.veterans." + c + newP]: 1,
                ["statistic.veterans." + c]: -1,
              }
            }

          );

        }

        await May9.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
      }
      await Order.deleteOne({ _id: order._id });
      return true;
    } else {
      return false;
    }
  } catch (e) {
    sendMessageToAdmin('something wrong with "deleteErrorPlus"', e);
  }
}


// Create order
async function createOrderVeterans(newOrder, prohibitedId, restrictedHouses) {


  let proportion = {};

  //let veterans = 4;  //ВЕТЕРАНЫ



  let veterans = Math.round(newOrder.amount * 0.2) > 0 ? Math.round(newOrder.amount * 0.2) : 1;
  let children = newOrder.amount - veterans;

  proportion = {
    "amount": newOrder.amount,
    "veterans": veterans,
    "children": children,
    "oneHouse": Math.round(newOrder.amount * 0.1) > 0 ? Math.round(newOrder.amount * 0.1) : 1
  }
  // if (newOrder.filter.nursingHome) proportion.oneHouse = undefined;

  // if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region) proportion.oneHouse = undefined; //hata
  if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture) proportion.oneHouse = undefined;

  if (newOrder.filter.maxOneHouse) {
    proportion.oneHouse = newOrder.filter.maxOneHouse;
  }
  console.log("newOrder.filter.region");
  console.log(newOrder.filter.region);

  console.log("proportion.oneHouse");
  console.log(proportion.oneHouse);

  if (!newOrder.filter.onlyWithPicture && !newOrder.filter.region && !newOrder.filter.nursingHome /* && newOrder.amount < 21 */) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);
  console.log("proportion.oneRegion");
  console.log(proportion.oneRegion);



  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData;
  let filter = {};


  if (newOrder.filter) {
    if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: null };
    /*         if ((newOrder.filter.onlyWithPicture || newOrder.filter.nursingHome || newOrder.filter.region) && newOrder.filter.addressFilter == 'any') {
                proportion.allCategory = proportion.yang + proportion.oldWomen + proportion.oldMen + proportion.special;
                proportion.oldWomen = 0;
                proportion.oldMen = 0;
                proportion.yang = 0;
                proportion.special = 0;
            } */
    if (newOrder.filter.addressFilter == 'forKids') {
      filter.noAddress = false;
    }

    if (newOrder.filter.addressFilter == 'noSpecial') {
      filter.noAddress = false;
    }

    if (newOrder.filter.addressFilter == 'onlySpecial') {
      filter.noAddress = true;

    }
    /*     if (newOrder.filter.nursingHome) {
          proportion.anyCategory = proportion.amount;
          proportion.oldWomen = 0;
          proportion.oldMen = 0;
          proportion.yang = 0;
          proportion.special = 0;
        } */

    if (newOrder.filter.region) filter.region = newOrder.filter.region;
    if (newOrder.filter.nursingHome) filter.nursingHome = newOrder.filter.nursingHome;
    if (newOrder.filter.genderFilter == 'Male') filter.gender = 'Male';
    if (newOrder.filter.genderFilter == 'Female') filter.gender = 'Female';
    if (newOrder.filter.year1 || newOrder.filter.year2) {
      if (!newOrder.filter.year1) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: 1900 };
      if (!newOrder.filter.year2) filter.yearBirthday = { $lte: 1945, $gte: newOrder.filter.year1 };
      if (newOrder.filter.year1 > 1943) {
        proportion.children = proportion.children + proportion.veterans;
        proportion.veterans = 0;
      }
      if (newOrder.filter.year1 < 1928) {
        proportion.veterans = proportion.children + proportion.veterans;
        proportion.children = 0;
      }

      if (newOrder.filter.year1 && newOrder.filter.year2) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: newOrder.filter.year1 };
    }

    console.log("veterans2");
    seniorsData = await fillOrderVeterans(proportion, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter);

  }

  if (seniorsData.celebratorsAmount < newOrder.amount) {

    await deleteErrorPlusVeterans(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }

  const nursingHomes = await House.find({});
  let resultLineItems = await generateLineItemsVeterans(nursingHomes, order_id);
  console.log("resultLineItems");
  console.log(resultLineItems);
  console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    console.log("resultLineItems222");
    await deleteErrorPlusMay9(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }
  console.log("veterans2F");
  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName
  }
}

// create a list of seniors for the order

async function fillOrderVeterans(proportion, order_id, filter, prohibitedId, restrictedHouses, orderFilter) {
  const categories = ["veterans", "children"];

  let data = {
    houses: {},
    restrictedHouses: [...restrictedHouses],//"ВЫШНИЙ_ВОЛОЧЕК"
    restrictedPearson: [...prohibitedId],
    celebratorsAmount: 0,
    filter: filter,
    order_id: order_id,
    //temporaryLineItems: [],
  }
  if (proportion.oneRegion) {
    data.regions = {};
    data.restrictedRegions = [];
  }

  for (let category of categories) {

    data.category = category;
    data.proportion = proportion;
    data.counter = 0;
    //console.log(category);
    //console.log(proportion[category]);

    if (proportion[category]) {

      data.maxPlus = 1;
      console.log("veterans3");
      data = await collectSeniorsVeterans(data, orderFilter);

      /*       if (data.counter < proportion[category]) {
              data.maxPlus = 2;
      
              data = await collectSeniorsVeterans(data);
            }
      
            if (data.counter < proportion[category]) {
              data.maxPlus = 3;
      
              data = await collectSeniorsVeterans(data);
            }
       */
      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }
  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  console.log("veterans3F");
  return data;
}


//set restrictions for searching

async function collectSeniorsVeterans(data) {

  const searchOrders = {
    veterans: ["veterans", "children"],//"children"
    children: ["children", "veterans"],//
  };
  //console.log("data.category");
  //console.log(data.category);

  for (let kind of searchOrders[data.category]) {
    let barrier = data.proportion[data.category] - data.counter;

    outer1: for (let i = 0; i < barrier; i++) {
      console.log("veterans4");
      let result = await searchSeniorVeterans(
        kind,
        data

      );
      if (result) {
        //console.log(result);
        await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
        await May9.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });


        let senior = await May9.findOne({ _id: result.celebrator_id });
        let newP = senior.plusAmount;
        let p = newP - 1;
        let c = senior.veteran ? "veteranPlus" : "childPlus";
        await House.updateOne(
          {
            nursingHome: senior.nursingHome
          },
          {
            $inc: {
              ["statistic.veterans." + c + p]: -1,
              ["statistic.veterans." + c + newP]: 1,
              ["statistic.veterans." + c]: 1,
            }
          }

        );


        data.celebratorsAmount++;
        data.restrictedPearson.push(result.celebrator_id);
        data.counter++;
        console.log("data.proportion.oneHouse");
        console.log(data.proportion.oneHouse);
        if (data.proportion.oneHouse) data.houses[result["nursingHome"]] = (!data.houses[result["nursingHome"]]) ? 1 : data.houses[result["nursingHome"]] + 1;
        if (data.proportion.oneRegion) data.regions[result["region"]] = (!data.regions[result["region"]]) ? 1 : data.regions[result["region"]] + 1;
        console.log("data.regions");
        console.log(data.regions);

        if (data.proportion.oneHouse) {
          if (data.houses[result["nursingHome"]] == data.proportion["oneHouse"]) {
            data.restrictedHouses.push(result["nursingHome"]);
          }
        }
        if (data.proportion.oneRegion) {
          if (data.regions[result["region"]] == data.proportion["oneRegion"]) {
            data.restrictedRegions.push(result["region"]);
          }
        }

      } else {
        break outer1;
      }
    }
  }
  console.log("veterans4F");
  return data;
}

// get senior
async function searchSeniorVeterans(
  kind,
  data
  /*   restrictedHouses,
    restrictedPearson,
    maxPlus,
    orderFilter */
) {

  /*  data.restrictedHouses,
      data.restrictedPearson,
      data.maxPlus,
      data.filter */

  let standardFilter = {
    nursingHome: { $nin: data.restrictedHouses },//CHANGE
    //secondTime: data.maxPlus > 1 ? true : false,
    //thirdTime: data.maxPlus === 3 ? true : false,
    _id: { $nin: data.restrictedPearson },
    //plusAmount: { $lt: maxPlus },
    //dateBirthday: { $gte: data.date1, $lte: data.date2 },
    absent: { $ne: true }
  };
  if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions }; //CHANGE
  if (kind == 'veterans') { standardFilter.veteran = { $ne: "" }; } else { standardFilter.child = { $ne: "" }; }
  //if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
  /*  if (data.proportion.amount > 12 || data.proportion.amount < 5 || data.category == "specialOnly") { 
        standardFilter.isReleased = false;    
    } */
  /*  if (data.proportion.amount > 12 ) { 
     standardFilter.isReleased = false;    
 }  */
  //standardFilter.isReleased = false; // CANCEL


  //console.log("maxPlus");
  //console.log(maxPlus);

  let filter = Object.assign(standardFilter, data.filter);
  //console.log("filter");


  let celebrator;
  //CHANGE!!!
  // let maxPlusAmount = 3;  
  let maxPlusAmount = 3;
  if (kind == 'veterans') { maxPlusAmount = 4; }


  //let maxPlusAmount = data.maxPlus;  
  //let maxPlusAmount = standardFilter.oldest ? 2 : data.maxPlus;
  //console.log("maxPlusAmount");
  //console.log(maxPlusAmount);

  for (let plusAmount = 1; plusAmount <= maxPlusAmount; plusAmount++) {
    filter.plusAmount = { $lt: plusAmount };
    //  filter.comment1 = "(1 корп. 2 этаж)"; //CANCEL
    //filter.comment1 = "(2 корп.)"; //CANCEL
    filter.noName = true; //ОРГАНИЗАЦИИ
    //filter.nursingHome = {$in: [ "ТАЛИЦА_УРГА", "МАЙСКОЕ", "СЕЛЬЦО", "ЭЛЕКТРОГОРСК", "КОЗЛОВО", "ВЫСОКОВО", "СТАРАЯ_КУПАВНА", "ТОМАРИ", "МЫЗА", "ПУХЛЯКОВСКИЙ", "ЖУКОВКА", "КИРЖАЧ",  "ЯРЦЕВО", "НОВОСЕЛЬЕ", "КАБАНОВКА", "ВИЛЕНКА",
    //"ПРЕОБРАЖЕНСКИЙ", "ВОЛГОДОНСК",  "ХАРЬКОВКА", "ВЕРХНЕУРАЛЬСК"]};
    console.log("filter");
    console.log(filter);
    celebrator = await May9.findOne(filter);
    console.log("celebrator May9");
    console.log(celebrator);
    if (celebrator) {
      //await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
      //await List.updateOne({ _id: celebrator._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
      celebrator.celebrator_id = celebrator._id.toString();
      return celebrator;
    }
  }

  if (!celebrator) {

    console.log("veterans5F");
    return false;
  }
}

//fill lineItems
async function generateLineItemsVeterans(nursingHomes, order_id) {
  //console.log(nursingHomes);

  let lineItems = [];
  let order = await Order.findOne({ _id: order_id })

  console.log("order.temporaryLineItems");
  //console.log(order.temporaryLineItems);

  for (let person of order.temporaryLineItems) {
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
      if (!foundHouse) { return person.nursingHome; }
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
  await Order.updateOne({ _id: order_id }, { $set: { lineItems: lineItems, isCompleted: true }, $unset: { temporaryLineItems: 1 } }, { upsert: false });
  //throw new Error('test1'); //delete
  //console.log("updatedOrder");
  //console.log(updatedOrder);
  // console.log(lineItems);
  console.log("veterans6F");
  return lineItems;
}

//////////////////////////////////////////////////// INSTITUTES

router.post("/forInstitutes/:amount", checkAuth, async (req, res) => {
  let finalResult;

  console.log(" institutes: req.body.institutes,");
  console.log(req.body.institutes,);
  try {
    let newOrder = {
      userName: req.body.userName,
      holiday: req.body.holiday,
      source: req.body.source,
      amount: req.body.amount,
      clientId: req.body.clientId,
      clientFirstName: req.body.clientFirstName,
      clientPatronymic: req.body.clientPatronymic,
      clientLastName: req.body.clientLastName,
      //email: req.body.email,
      contactType: req.body.contactType,
      contact: req.body.contact,
      //institute: req.body.institute,
      institutes: req.body.institutes,
      isAccepted: req.body.isAccepted,
      comment: req.body.comment,
      orderDate: req.body.orderDate,
      dateOfOrder: req.body.dateOfOrder,
      temporaryLineItems: [],
      lineItems: [],
      filter: req.body.filter,
      isCompleted: false
    };

    // console.log("order.dateOfOrder");
    // console.log(req.body.dateOfOrder);
    // console.log(newOrder.dateOfOrder);

    let client = await Client.findOne({ _id: newOrder.clientId });
    let index = client.coordinators.findIndex(item => item == newOrder.userName);
    if (index == -1) {
      await Client.updateOne({ _id: newOrder.clientId }, { $push: { coordinators: newOrder.userName } });
    }

    let restrictedHouses = ["ПЕРВОМАЙСКИЙ_СОТРУДНИКИ", "ПОРЕЧЬЕ-РЫБНОЕ", "КАШИРСКОЕ", "ВОРОНЕЖ_ДНЕПРОВСКИЙ", "АРМАВИР", "ЖУКОВКА", ...req.body.restrictedHouses] //, "ЧИКОЛА"

    /*    let doneHouses = await checkDoubleOrder({ isDisabled: false, holiday: req.body.holiday, clientId: req.body.clientId });
    
       let restrictedHouses;
       if (doneHouses) {
         restrictedHouses = ["ПЕРВОМАЙСКИЙ_СОТРУДНИКИ", "ЧИКОЛА", "КАШИРСКОЕ", "ВОРОНЕЖ_ДНЕПРОВСКИЙ", "АРМАВИР", ...doneHouses.houses];
       } else {
         restrictedHouses = ["ПЕРВОМАЙСКИЙ_СОТРУДНИКИ", "ЧИКОЛА", "КАШИРСКОЕ", "ВОРОНЕЖ_ДНЕПРОВСКИЙ", "АРМАВИР"];
       } */

    finalResult = await createOrderForInstitutes(newOrder, req.body.prohibitedId, restrictedHouses);
    let text = !finalResult.success ? finalResult.result : "Query Successful";

    const newListResponse = new BaseResponse(200, text, finalResult);
    res.json(newListResponse.toObject());
  } catch (e) {
    console.log(e);
    let text = 'Обратитесь к администратору. Заявка не сформирована.';
    if (!finalResult) {
      let answer = await deleteErrorPlus(false, req.body.holiday, req.body.userName);
      console.log("answer");
      console.log(answer);
      if (!answer) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }

    } else {
      if (finalResult && finalResult.success) {
        text = 'Произошла ошибка, но, скорее всего заявка была сформирована и сохранена. Проверьте страницу "Мои заявки" и сообщите об ошибке администратору.'
      }
      if (finalResult && !finalResult.success) {
        text = finalResult.result;
      }
    }
    const newListCatchErrorResponse = new BaseResponse(
      500,
      text,
      e
    );
    res.status(500).send(newListCatchErrorResponse.toObject());
  }
});

async function createOrderForInstitutes(newOrder, prohibitedId, restrictedHouses) {

  const emptyOrder = {
    userName: newOrder.userName,
    holiday: newOrder.holiday,
    source: newOrder.source,
    amount: newOrder.amount,
    clientId: newOrder.clientId,
    clientFirstName: newOrder.clientFirstName,
    clientPatronymic: newOrder.clientPatronymic,
    clientLastName: newOrder.clientLastName,
    // email: newOrder.email,
    contactType: newOrder.contactType,
    contact: newOrder.contact,
    // institute: newOrder.institute,
    institutes: newOrder.institutes,
    //isRestricted: newOrder.isRestricted,
    isAccepted: newOrder.isAccepted,
    comment: newOrder.comment,
    orderDate: newOrder.orderDate,
    dateOfOrder: newOrder.dateOfOrder,
    lineItems: [],
    filter: newOrder.filter,

  };
  //console.log("emptyOrder.dateOfOrder");
  //console.log(emptyOrder.dateOfOrder);

  console.log("newOrder.filter");
  console.log(newOrder.filter);


  let order = await Order.create(emptyOrder);
  let order_id = order._id.toString();

  //console.log("order");
  //console.log(order);

  let seniorsData = await fillOrderForInstitutes(
    order_id,
    prohibitedId,
    restrictedHouses,
    newOrder.holiday,
    newOrder.amount,
    newOrder.filter,
  );

  if (seniorsData.length < newOrder.amount) {

    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса. Требуемых адресов только ` + seniorsData.length,
      success: false

    }
    /*     return {
          result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
          success: false
    
        } */
  }
  const nursingHomes = await House.find({});
  let resultLineItems = await generateLineItems(nursingHomes, order_id);
  // console.log("resultLineItems");
  //console.log(resultLineItems);
  //console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    // console.log("resultLineItems222");
    await deleteErrorPlus(order_id, newOrder.holiday);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id,
    contact: newOrder.email ? newOrder.email : newOrder.contact,
    clientFirstName: newOrder.clientFirstName,
    //institutes: newOrder.institutes,
  }

}

async function fillOrderForInstitutes(
  order_id,
  prohibitedId,
  restrictedHouses,
  holiday,
  amount,
  filter
) {

  console.log("fillOrderForInstitutes");

  let smallerHouses = [];
  let biggerHouse;
  let seniorsData = [];
  let amountInSmallerHouses = 0;

  console.log("restrictedHouses");
  console.log(restrictedHouses);

  console.log("filter.region");
  console.log(filter.region);

  let activeHouse;
  if (!filter.region && filter.addressFilter == 'noSpecial') {
    activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, noAddress: false, });
  }
  if (filter.region && !filter.spareRegions && filter.addressFilter == 'noSpecial') {
    filter.region = [filter.region];
    activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, noAddress: false, region: { $in: filter.region } });

  }
  if (filter.region && filter.spareRegions && filter.addressFilter == 'noSpecial') {
    let spareRegions = await Region.findOne({ name: filter.region });
    console.log("spareRegions");
    console.log(spareRegions);
    filter.region = [filter.region, ...spareRegions.spareRegions];
    activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, noAddress: false, region: { $in: filter.region } });

  }

  /*   if (!filter.region && filter.addressFilter == 'any') {
      activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, isReleased: false, noAddress: false, });
    }
    if (filter.region && !filter.spareRegions && filter.addressFilter == 'any') {
      filter.region = [filter.region];
      activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, isReleased: false, noAddress: false, region: { $in: filter.region } });
  
    }
    if (filter.region && filter.spareRegions && filter.addressFilter == 'any') {
      let spareRegions = await Region.findOne({ name: filter.region });
      console.log("spareRegions");
      console.log(spareRegions);
      filter.region = [filter.region, ...spareRegions.spareRegions];
      activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, isReleased: false, noAddress: false, region: { $in: filter.region } });
  
    }  */

  console.log("filter.region");
  console.log(filter.region);

  //let activeHouse = await House.find({ isReleased: false, noAddress: false, isActive: true, region:"РОСТОВСКАЯ" }); // ИСПРАВИТЬ
  //let activeHouse = await House.find({ isReleased: false, noAddress: true, isActive: true, nursingHome: { $nin: restrictedHouses } }); // ПНИ
  //let activeHouse = await House.find({ isReleased: false, noAddress: false, isActive: true, nursingHome: { $in: ["ЧИСТОПОЛЬ", "ЧИТА_ТРУДА", "ЯСНОГОРСК", "ВОЗНЕСЕНЬЕ", "УЛЬЯНКОВО", "КУГЕСИ", "ВЛАДИКАВКАЗ", "ВЫСОКОВО", "СЛОБОДА-БЕШКИЛЬ", "ПЕРВОМАЙСКИЙ", "СКОПИН", "РЯЗАНЬ", "ДОНЕЦК", "ТИМАШЕВСК", "ОКТЯБРЬСКИЙ", "НОГУШИ", "МЕТЕЛИ", "ЛЕУЗА", "КУДЕЕВСКИЙ", "БАЗГИЕВО", "ВЫШНИЙ_ВОЛОЧЕК", "ЖИТИЩИ", "КОЗЛОВО", "МАСЛЯТКА", "МОЛОДОЙ_ТУД", "ПРЯМУХИНО", "РЖЕВ", "СЕЛЫ", "СТАРАЯ_ТОРОПА", "СТЕПУРИНО", "ТВЕРЬ_КОНЕВА", "ЯСНАЯ_ПОЛЯНА", "КРАСНЫЙ_ХОЛМ", "ЗОЛОТАРЕВКА", "БЫТОШЬ", "ГЛОДНЕВО", "ДОЛБОТОВО", "ЖУКОВКА", "СЕЛЬЦО", "СТАРОДУБ"] } });
  /*   let activeHouse = await House.find({
      isReleased: false, isActive: true,  nursingHome: {//noAddress: false,
         $in: [ 
      "УСТЬ-ОРДЫНСКИЙ",
         
         "МЕТЕЛИ",
         "КУДЕЕВСКИЙ",
         "НОВОСЛОБОДСК",
        "ТОЛЬЯТТИ",
         "БИЙСК",
         "БОГРАД", 
        ]
      }
    });  

  let activeHouse = await House.find({
    isReleased: false, isActive: true, nursingHome: {//noAddress: false, 
      $in: [
        'ПРОШКОВО',  
      ]
    } });  */
  /*         
           "ЧИТА_ТРУДА",
           "НОВОСИБИРСК_ЖУКОВСКОГО", */




  /* 
    let activeHouse = await House.find({
      isReleased: false, noAddress: false, isActive: true, region: {
        $in: [ "МОСКОВСКАЯ"]
      }
    }); */


  console.log("activeHouse");
  console.log(activeHouse.length);

  let count;

  //console.log("prohibitedId");
  // console.log(prohibitedId);


  const region = filter.region ? true : false;

  for (let house of activeHouse) {
    //console.log(house.nursingHome);


    if (holiday == "Дни рождения апреля 2025") {
      if (filter.onlyWithConcent) {
        count = await List.find({
          nursingHome: house.nursingHome,
          //gender: "Female",
          absent: false, plusAmount: { $lt: 6 }, _id: { $nin: prohibitedId },
          dateOfSignedConsent: { $ne: null },
        }).countDocuments();
      } else {
        count = await List.find({
          nursingHome: house.nursingHome,
          //gender: "Female",
          absent: false, plusAmount: { $lt: 4 }, _id: { $nin: prohibitedId }
        }).countDocuments();
      }

    }

    if (holiday == "Дни рождения мая 2025") {
      if (filter.onlyWithConcent) {
        count = await ListNext.find({
          nursingHome: house.nursingHome,
          //gender: "Female",
          absent: false, plusAmount: { $lt: 6 }, _id: { $nin: prohibitedId },
          dateOfSignedConsent: { $ne: null },
        }).countDocuments();
      } else {
        count = await ListNext.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 }, _id: { $nin: prohibitedId }
        }).countDocuments();
      }
    }


    if (holiday == "Дни рождения марта 2025") {
      if (filter.onlyWithConcent) {
        count = await ListBefore.find({
          nursingHome: house.nursingHome,
          //gender: "Female",
          absent: false, plusAmount: { $lt: 6 }, _id: { $nin: prohibitedId },
          dateOfSignedConsent: { $ne: null },
        }).countDocuments();
      } else {
        count = await ListBefore.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 4 }, _id: { $nin: prohibitedId }
        }).countDocuments();
      }
    }

    if (holiday == "День учителя и дошкольного работника 2024") {
      count = await TeacherDay.find({
        teacher: /учителя/, nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 }, _id: { $nin: prohibitedId }
      }).countDocuments();
    }

    if (holiday == "День пожилого человека 2024") {
      count = await SeniorDay.find({
        nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 4 }, _id: { $nin: prohibitedId }
        // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 } // ИСПРАВИТЬ
      }).countDocuments();
    }
    /*     if (holiday == "Новый год 2025" && !filter.region && filter.noNames) { //&& filter.addressFilter == "noSpecial"
             count = await NewYear.find({
               nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 3 }, _id: { $nin: prohibitedId }, forInstitute: 0, finished: false, //dateOfSignedConsent:  null //onlyForInstitute: true, 
               // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
             }).countDocuments();
           }
       
           if (holiday == "Новый год 2025" && filter.region && filter.noNames) {// && filter.addressFilter == "noSpecial"
             count = await NewYear.find({
               nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 3 }, _id: { $nin: prohibitedId }, forInstitute: 0, finished: false, //dateOfSignedConsent:  null //onlyForInstitute: true
               // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 3 } // ИСПРАВИТЬ 
             }).countDocuments();
           }
         */

    if (filter.onlyWithConcent) {
      if (holiday == "Новый год 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await NewYear.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 6 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "Новый год 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await NewYear.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 6 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

    } else {
      if (holiday == "Новый год 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await NewYear.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "Новый год 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await NewYear.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }
    }

    if (filter.onlyWithConcent) {
      if (holiday == "23 февраля 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await February23.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "23 февраля 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await February23.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

    } else {
      if (holiday == "23 февраля 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await February23.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "23 февраля 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await February23.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }
    }

    if (filter.onlyWithConcent) {
      if (holiday == "8 марта 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await March8.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "8 марта 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await March8.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

    } else {
      if (holiday == "8 марта 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await March8.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "8 марта 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await March8.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }
    }

    if (filter.onlyWithConcent) {
      if (holiday == "Пасха 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await Easter.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "Пасха 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await Easter.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, dateOfSignedConsent: { $ne: null }//forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

    } else {
      if (holiday == "Пасха 2025" && !filter.region && filter.minNumberOfHouses) { //&& filter.addressFilter == "noSpecial"
        count = await Easter.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true, 
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }

      if (holiday == "Пасха 2025" && filter.region && filter.minNumberOfHouses) {// && filter.addressFilter == "noSpecial"
        count = await Easter.find({
          nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 1 }, _id: { $nin: prohibitedId }, //forInstitute: 0, finished: falseonlyForInstitute: true
          // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
        }).countDocuments();
      }
    }


    console.log("house.nursingHome");
    console.log(house.nursingHome);

    console.log("count");
    console.log(count);

    if (count == amount) {
      seniorsData = await collectSeniorsForInstitution(order_id, holiday, amount, house.nursingHome, prohibitedId, region, filter);
      return seniorsData;
    }

    if (count > amount) {
      biggerHouse = house.nursingHome;
    }
    // if (count > 2) {

    if (count < amount && count > 2) {
      //if (count < 80 && count > 2) {
      //if (count < amount && count > 0) {
      smallerHouses.push(
        {
          nursingHome: house.nursingHome,
          amount: count
        });
      amountInSmallerHouses += count;
    }
  }

  if (biggerHouse) {
    seniorsData = await collectSeniorsForInstitution(order_id, holiday, amount, biggerHouse, prohibitedId, region, filter);
    return seniorsData;
  }

  console.log("amountInSmallerHouses");
  console.log(amountInSmallerHouses);

  console.log("amount");
  console.log(amount);

  if (amountInSmallerHouses < amount) {
    return [];
  }

  smallerHouses.sort(
    (prev, next) =>
      next.amount - prev.amount
  );

  let currentAmount = amount;
  //  console.log(amount);


  console.log("smallerHouses[0]");
  console.log(smallerHouses[0]);

  /*    for (let house of smallerHouses) {
        let seniors = await collectSeniorsForInstitution(order_id, holiday, 3, house.nursingHome, prohibitedId, region);
            seniorsData = [...seniorsData, ...seniors];
            currentAmount -= 3;
            if (currentAmount == 0)     return seniorsData; 
          
      } */

  if (amount >= smallerHouses[0].amount * 2) {

    for (let i = 0; i < smallerHouses.length; i++) {
      let index = smallerHouses.lastIndexOf(item => item.amount == currentAmount);

      if (index != -1 && index >= i) {
        let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[index].amount, smallerHouses[index].nursingHome, prohibitedId, region, filter);
        seniorsData = [...seniorsData, ...seniors];
        currentAmount -= smallerHouses[index].amount;
        return seniorsData;
      } else {
        if (currentAmount - smallerHouses[i].amount <= 0) {
          let seniors = await collectSeniorsForInstitution(order_id, holiday, currentAmount, smallerHouses[i].nursingHome, prohibitedId, region, filter);
          seniorsData = [...seniorsData, ...seniors];
          currentAmount -= currentAmount;
          return seniorsData;
        } else {
          if (currentAmount - smallerHouses[i].amount >= 3) { // ИСПРАВИТЬ на 3
            let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[i].amount, smallerHouses[i].nursingHome, prohibitedId, region, filter);
            seniorsData = [...seniorsData, ...seniors];
            currentAmount -= smallerHouses[i].amount;
          }
        }
      }
    }
    return [];
  } else {

    console.log("amount<");

    let amount1 = Math.round(amount / 2);
    let amount2 = amount - amount1;


    console.log('amount1');
    console.log(amount1);

    console.log('amount2');
    console.log(amount2);

    while (amount1 > 3) {
      // while (amount1 > 0) {
      let index1 = smallerHouses.findIndex(item => item.amount == amount1);
      let index2 = smallerHouses.findIndex(item => item.amount == amount2);
      if (index1 != -1 && index2 != -1 && index1 != index2) {
        let seniors1 = await collectSeniorsForInstitution(order_id, holiday, amount1, smallerHouses[index1].nursingHome, prohibitedId, region, filter);
        seniorsData = [...seniorsData, ...seniors1];
        let seniors2 = await collectSeniorsForInstitution(order_id, holiday, amount2, smallerHouses[index2].nursingHome, prohibitedId, region, filter);
        seniorsData = [...seniorsData, ...seniors2];

        console.log('seniorsData');
        console.log(seniorsData.length);

        return seniorsData;
      }
      amount1--;
      amount2++;
    }

    amount1 = Math.round(amount / 3);
    amount2 = amount1 + 1;
    let amount3 = amount - amount1 - amount2;

    while (amount1 > 3) {
      let index1 = smallerHouses.findIndex(item => item.amount == amount1);
      let index2 = smallerHouses.findIndex(item => item.amount == amount2);
      let index3 = smallerHouses.findIndex(item => item.amount == amount3);
      if (index1 != -1 && index2 != -1 && index3 != -1 && index1 != index2 && index3 != index2) {
        let seniors1 = await collectSeniorsForInstitution(order_id, holiday, amount1, smallerHouses[index1].nursingHome, prohibitedId, region, filter);
        seniorsData = [...seniorsData, ...seniors1];

        let seniors2 = await collectSeniorsForInstitution(order_id, holiday, amount2, smallerHouses[index2].nursingHome, prohibitedId, region, filter);
        seniorsData = [...seniorsData, ...seniors2];

        let seniors3 = await collectSeniorsForInstitution(order_id, holiday, amount3, smallerHouses[index3].nursingHome, prohibitedId, region, filter);
        seniorsData = [...seniorsData, ...seniors3];

        return seniorsData;
      }
      amount1--;
      amount2++;
    }

    for (let i = 0; i < smallerHouses.length; i++) {
      let index = smallerHouses.findIndex((item, idx) => item.amount == currentAmount && idx >= i);

      if (index != -1 && index >= i) {
        let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[index].amount, smallerHouses[index].nursingHome, prohibitedId, region, filter);
        seniorsData = [...seniorsData, ...seniors];
        currentAmount -= smallerHouses[index].amount;
        return seniorsData;
      } else {
        if (currentAmount - smallerHouses[i].amount <= 0) {
          let seniors = await collectSeniorsForInstitution(order_id, holiday, currentAmount, smallerHouses[i].nursingHome, prohibitedId, region, filter);
          seniorsData = [...seniorsData, ...seniors];
          currentAmount -= currentAmount;
          return seniorsData;
        } else {
          if (currentAmount - smallerHouses[i].amount >= 3) {
            let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[i].amount, smallerHouses[i].nursingHome, prohibitedId, region, filter);
            seniorsData = [...seniorsData, ...seniors];
            currentAmount -= smallerHouses[i].amount;
          }
        }

      }
    }
    await deleteErrorPlusNewYear(order_id);
    return [];
  }
}


async function collectSeniorsForInstitution(order_id, holiday, amount, nursingHome, prohibitedId, region, filter) {

  console.log("amount");
  console.log(amount);

  console.log("nursingHome");
  console.log(nursingHome);


  let seniorsData = [];

  if (holiday == "День учителя и дошкольного работника 2024") {

    seniorsData = await TeacherDay.find({
      nursingHome: nursingHome,
      absent: false,
      plusAmount: { $lt: 2 },
      _id: { $nin: prohibitedId }
    }).limit(amount);

    console.log("seniorsData");
    console.log(nursingHome);
    console.log(seniorsData.length);


    for (let senior of seniorsData) {
      await TeacherDay.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
    }
  }

  if (holiday == "День пожилого человека 2024") {

    seniorsData = await SeniorDay.find({
      nursingHome: nursingHome,
      absent: false,
      plusAmount: { $lt: 4 },
      _id: { $nin: prohibitedId } // ИСПРАВИТЬ
    }).limit(amount);

    console.log("seniorsData");
    console.log(nursingHome);
    console.log(seniorsData.length);


    for (let senior of seniorsData) {
      await SeniorDay.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
    }
  }

  if (holiday == "Новый год 2025" && (filter.noNames || filter.minNumberOfHouses)) {

    /*          if (filter.noNames) {
              if (!region) {
                seniorsData = await NewYear.find({
                  forInstitute: 0,
                  nursingHome: nursingHome,
                  absent: false,
                  plusAmount: { $lt: 3 },
                  _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                  finished: false, //dateOfSignedConsent: null,
                  //onlyForInstitute: true
                }).limit(amount);
              }
              if (region) {
                seniorsData = await NewYear.find({
                  nursingHome: nursingHome,
                  absent: false,
                  plusAmount: { $lt: 3 },
                  _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                  //onlyForInstitute: true, 
                  forInstitute: 0,
                  finished: false, dateOfSignedConsent: null,
                }).limit(amount);
              }
            }  */


    if (filter.minNumberOfHouses && filter.onlyWithConcent) {
      if (!region) {
        seniorsData = await NewYear.find({
          dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 6 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }
      if (region) {
        seniorsData = await NewYear.find({
          dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 6 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
          //onlyForInstitute: true, forInstitute: 0, finished: false


        }).limit(amount);
      }
    }

    if (filter.minNumberOfHouses && !filter.onlyWithConcent) {
      if (!region) {
        seniorsData = await NewYear.find({
          //dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 2 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }
      if (region) {
        seniorsData = await NewYear.find({
          //dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 2 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
          //onlyForInstitute: true, forInstitute: 0, finished: false


        }).limit(amount);
      }
    }

    console.log("seniorsData");
    console.log(nursingHome);
    console.log(seniorsData.length);


    for (let senior of seniorsData) {
/*       if (contact == "@tterros") {
        await NewYear.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1, forInstitute: 1, forNavigators: 1 } }, { upsert: false }); 
      } else*/ {
        await NewYear.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1, forInstitute: 1 } }, { upsert: false });
      }


      senior = await NewYear.findOne({ _id: senior._id });
      let newP = senior.plusAmount;
      let p = newP - 1;
      let c = senior.category;
      await House.updateOne(
        {
          nursingHome: senior.nursingHome
        },
        {
          $inc: {
            ["statistic.newYear.plus" + p]: -1,
            ["statistic.newYear.plus" + newP]: 1,
            ["statistic.newYear." + c + "Plus"]: 1,
            ["statistic.newYear.forInstitute"]: 1,
          }
        }

      );
      /*       if (contact == "@tterros") {
              await House.updateOne(
                {
                  nursingHome: senior.nursingHome
                },
                {
                  $inc: {
                    ["statistic.newYear.forNavigators"]: 1          
                  }
                }
        
              );
            } */


    }
  }

  if ((holiday == "23 февраля 2025" || holiday == "8 марта 2025" || holiday == "Пасха 2025") && (filter.noNames || filter.minNumberOfHouses)) {

    /*          if (filter.noNames) {
              if (!region) {
                seniorsData = await NewYear.find({
                  forInstitute: 0,
                  nursingHome: nursingHome,
                  absent: false,
                  plusAmount: { $lt: 3 },
                  _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                  finished: false, //dateOfSignedConsent: null,
                  //onlyForInstitute: true
                }).limit(amount);
              }
              if (region) {
                seniorsData = await NewYear.find({
                  nursingHome: nursingHome,
                  absent: false,
                  plusAmount: { $lt: 3 },
                  _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                  //onlyForInstitute: true, 
                  forInstitute: 0,
                  finished: false, dateOfSignedConsent: null,
                }).limit(amount);
              }
            }  */


    if (filter.minNumberOfHouses && filter.onlyWithConcent) {
      /*   if (!region) { */

      if (holiday == "23 февраля 2025") {
        seniorsData = await February23.find({
          dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 16 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }
      if (holiday == "8 марта 2025") {
        seniorsData = await March8.find({
          dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 1 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }
      if (holiday == "Пасха 2025") {
        seniorsData = await Easter.find({
          dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 1 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }

      /*          }
               if (region) {
                 seniorsData = await NewYear.find({
                   dateOfSignedConsent: { $ne: null },
                   nursingHome: nursingHome,
                   absent: false,
                   plusAmount: { $lt: 6 },
                   _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                   //onlyForInstitute: true, forInstitute: 0, finished: false
         
         
                 }).limit(amount);
               } */
    }

    if (filter.minNumberOfHouses && !filter.onlyWithConcent) {
      /*  if (!region) { */

      if (holiday == "23 февраля 2025") {
        seniorsData = await February23.find({
          //dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 1 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }

      if (holiday == "8 марта 2025") {
        seniorsData = await March8.find({
          //dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 1 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }

      if (holiday == "Пасха 2025") {
        seniorsData = await Easter.find({
          //dateOfSignedConsent: { $ne: null },
          nursingHome: nursingHome,
          absent: false,
          plusAmount: { $lt: 1 },
          _id: { $nin: prohibitedId }, // ИСПРАВИТЬ

          // forInstitute: 0,onlyForInstitute: true, finished: false,
        }).limit(amount);
      }
      /*       }
            if (region) {
              seniorsData = await NewYear.find({
                //dateOfSignedConsent: { $ne: null },
                nursingHome: nursingHome,
                absent: false,
                plusAmount: { $lt: 2 },
                _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                //onlyForInstitute: true, forInstitute: 0, finished: false
      
      
              }).limit(amount);
            } */
    }

    console.log("seniorsData");
    console.log(nursingHome);
    console.log(seniorsData.length);


    for (let senior of seniorsData) {
      /*       if (contact == "@tterros") {
              await NewYear.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1, forInstitute: 1, forNavigators: 1 } }, { upsert: false }); 
            } else*/

      if (holiday == "23 февраля 2025") {
        await February23.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        senior = await February23.findOne({ _id: senior._id });
      }
      if (holiday == "8 марта 2025") {
        await March8.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        senior = await March8.findOne({ _id: senior._id });
      }
      if (holiday == "Easter 2025") {
        await Easter.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        senior = await Easter.findOne({ _id: senior._id });
      }
      let newP = senior.plusAmount;
      let p = newP - 1;
      let c = senior.category;
      let h = (holiday == "Easter 2025") ? "easter" : "spring"
      await House.updateOne(
        {
          nursingHome: senior.nursingHome
        },
        {
          $inc: {
            ["statistic." + h + ".plus" + p]: -1,
            ["statistic." + h + ".plus" + newP]: 1,
            ["statistic." + h + "." + c + "Plus"]: 1,

          }
        }
      );
      /*       if (contact == "@tterros") {
              await House.updateOne(
                {
                  nursingHome: senior.nursingHome
                },
                {
                  $inc: {
                    ["statistic.newYear.forNavigators"]: 1          
                  }
                }
        
              );
            } */


    }
  }



  if (holiday == "Дни рождения мая 2025") {
    if (filter.onlyWithConcent) {
      seniorsData = await ListNext.find({
        nursingHome: nursingHome,
        absent: false,
        plusAmount: { $lt: 6 },
        _id: { $nin: prohibitedId },
        dateOfSignedConsent: { $ne: null }
      }).limit(amount);
    } else {
      seniorsData = await ListNext.find({
        nursingHome: nursingHome,
        absent: false,
        plusAmount: { $lt: 2 },
        _id: { $nin: prohibitedId }
      }).limit(amount);
    }

    console.log("seniorsData");
    console.log(nursingHome);
    console.log(seniorsData.length);


    for (let senior of seniorsData) {
      await ListNext.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
    }
  }


  if (holiday == "Дни рождения апреля 2025") {
    if (filter.onlyWithConcent) {
      seniorsData = await List.find({
        nursingHome: nursingHome,
        absent: false,
        plusAmount: { $lt: 6 },
        _id: { $nin: prohibitedId },
        dateOfSignedConsent: { $ne: null }
      }).limit(amount);
    } else {
      seniorsData = await List.find({
        //gender: "Female", 
        nursingHome: nursingHome,
        absent: false,
        plusAmount: { $lt: 4 },
        _id: { $nin: prohibitedId }
      }).limit(amount);
    }

    for (let senior of seniorsData) {
      await List.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
      console.log("BIRTHDAY INSTITUTES");
      console.log(senior._id);

    }
  }

  if (holiday == "Дни рождения марта 2025") {
    if (filter.onlyWithConcent) {
      seniorsData = await ListBefore.find({
        nursingHome: nursingHome,
        absent: false,
        plusAmount: { $lt: 6 },
        _id: { $nin: prohibitedId },
        dateOfSignedConsent: { $ne: null }
      }).limit(amount);
    } else {
      seniorsData = await ListBefore.find({
        nursingHome: nursingHome,
        absent: false,
        plusAmount: { $lt: 4 },
        _id: { $nin: prohibitedId }
      }).limit(amount);
    }

    for (let senior of seniorsData) {
      await ListBefore.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
    }

  }

  await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: seniorsData } }, { upsert: false });

  return seniorsData;
}



module.exports = router;

