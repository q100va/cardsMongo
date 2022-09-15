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
const Period = require("../models/period");
const Month = require("../models/month");
const House = require("../models/house");
const Region = require("../models/region");
const NameDay = require("../models/name-day");
const TeacherDay = require("../models/teacher-day");
//const { getLocaleDayPeriods } = require("@angular/common");

/**
 * API to find lists (OK)
 */

//Create period

router.post("/create/period/", async (req, res) => {
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

router.get("/", async (req, res) => {
  try {
    Order.find({ isDisabled: false }, function (err, orders) {
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

router.get("/:id", async (req, res) => {
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
 * API to find orders by userName (OK)
 */

router.get("/find/:userName", async (req, res) => {
  try {
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
        const readUserResponse = new BaseResponse(
          200,
          "Query successful",
          orders
        );
        //console.log(orders);
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
 * API to find not confirmed orders by userName (OK)
 */

router.get("/findNotConfirmed/:userName", async (req, res) => {
  try {
    /*     let orders = await Order.find({ userName: req.params.userName, isAccepted: false, isDisabled: false });
        console.log("req.params.userName");
        console.log(req.params.userName); */
    Order.find({ userName: req.params.userName, isAccepted: false, isDisabled: false }, function (err, orders) {
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
        // console.log("findNotConfirmed");
        //console.log(orders);
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
 * API to find not confirmed orders (OK)
 */

 router.get("/all/findAllOrdersNotAccepted/", async (req, res) => {
  try {
    /*     let orders = await Order.find({ userName: req.params.userName, isAccepted: false, isDisabled: false });
        console.log("req.params.userName");
        console.log(req.params.userName); */
    Order.find({ isAccepted: false, isDisabled: false }, function (err, orders) {
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
        // console.log("findNotConfirmed");
        //console.log(orders);
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
router.patch("/confirm/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.updateOne({ _id: req.params.id }, { $set: { isAccepted: true } }, { upsert: false });
    console.log(updatedOrder);

    console.log(req.body.isShowAll);

    let updatedOrders;
    if (req.body.isShowAll) {
      updatedOrders = await Order.find({ userName: req.body.userName, isDisabled: false });
    } else {
      updatedOrders = await Order.find({ isAccepted: false, userName: req.body.userName, isDisabled: false });
    }

    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", updatedOrders);
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



/**
 * API to delete order
 */
router.patch("/delete/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.updateOne({ _id: req.params.id }, { $set: { isDisabled: true } }, { upsert: false });
    console.log(updatedOrder);
    const deletedOrder = await Order.findOne({ _id: req.params.id });
    await deletePluses(deletedOrder);
    console.log(req.body.isShowAll);
    let updatedOrders;
    if (req.body.isShowAll) {
      updatedOrders = await Order.find({ userName: req.body.userName, isDisabled: false });
    } else {
      updatedOrders = await Order.find({ isAccepted: false, userName: req.body.userName, isDisabled: false });
    }

    const confirmOrderResponse = new BaseResponse("200", "Order confirmed", updatedOrders);
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

async function deletePluses(deletedOrder) {
  if (deletedOrder.holiday == "Дни рождения октября 2022") {


    //удалить плюсы, если они в текущем месяце. откорректировать scoredPluses в периоде, если надо, и активный период.
    const month = await Month.findOne({ isActive: true });
    const today = new Date();
    const inTwoWeeks = new Date();
    let period, activePeriod, celebrator;

    for (let lineItem of deletedOrder.lineItems) {
      for (let person of lineItem.celebrators) {
        if (person.monthBirthday == month.number) {
          await List.updateOne({ _id: person.celebrator_id }, { $inc: { plusAmount: -1 } }, { upsert: false });
          celebrator = await List.findOne({ _id: person.celebrator_id });
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
        }
      }
    }
  } else {
    if (deletedOrder.holiday == "Именины октября 2022")
{    for (let lineItem of deletedOrder.lineItems) {
      for (let person of lineItem.celebrators) {
        await NameDay.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
      }
    }} else {
      if (deletedOrder.holiday == "День учителя и дошкольного работника 2022")
  {    for (let lineItem of deletedOrder.lineItems) {
        for (let person of lineItem.celebrators) {
          await TeacherDay.updateOne({ _id: person._id }, { $inc: { plusAmount: -1 } }, { upsert: false });
        }
      }}
    }
  }
}



/**
 * API to delete
 */
/* router.delete("/:id", async (req, res) => {
  try {
    Order.findOne({ _id: req.params.id }, function (err, order) {
      if (err) {
        console.log(err);
        const deleteHouseMongoErrorResponse = new BaseResponse(
          "500",
          "MongoDB Server Error",
          err
        );
        res.status(500).send(deleteHouseMongoErrorResponse.toObject());
      } else {
        console.log(order);

        order.set({
          isDisabled: true,
        });
        order.save(function (err, savedHouse) {
          if (err) {
            console.log(err);
            const savedHouseMongodbErrorResponse = BaseResponse(
              "500",
              "MongoDB server error",
              err
            );
            res.status(500).send(savedHouseMongodbErrorResponse.toObject());
          } else {
            console.log(savedHouse);
            const deleteHouseResponse = new BaseResponse(
              "200",
              "Order deleted",
              savedHouse
            );
            res.json(deleteHouseResponse.toObject());
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    const deleteHouseCatchErrorResponse = new BaseResponse(
      "500",
      "MongoDB server error",
      err
    );
    res.status(500).send(deleteHouseCatchErrorResponse.toObject());
  }
});
 */
/**
 * API to find regions (OK)
 */

router.get("/get/regions/", async (req, res) => {
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


/////////////////////////////////////////////////

//create name day order

router.post("/name-day", async (req, res) => {
  let finalResult;
  try {
    console.log("req.body.temporaryLineItems");
    console.log(req.body.temporaryLineItems);
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
      temporaryLineItems: req.body.temporaryLineItems,
      lineItems: [],
      isCompleted: false,
    };
    console.log("newOrder.temporaryLineItems");
    console.log(newOrder.temporaryLineItems);
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
    await NameDay.updateOne({ _id: element._id }, { $inc: { plusAmount: 1 } });
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

router.post("/teacher-day", async (req, res) => {
  let finalResult;
  try {
    console.log("req.body.temporaryLineItems");
    console.log(req.body.temporaryLineItems);
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
      temporaryLineItems: req.body.temporaryLineItems,
      lineItems: [],
      isCompleted: false,
    };
    console.log("newOrder.temporaryLineItems");
    console.log(newOrder.temporaryLineItems);
    finalResult = await createOrderForTeacherDay(newOrder);
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
    order_id: newOrder._id

  }
}
////////////////////////////////////////////////////

router.post("/:amount", async (req, res) => {
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

    finalResult = await createOrder(newOrder);
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

async function deleteErrorPlus(order_id, ...userName) {
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
        await List.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
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
async function createOrder(newOrder) {
  let month = await Month.findOne({ isActive: true });
  let period = await Period.findOne({ isActive: true });
  if (!period)
    return {
      result: "Обратитесь к администратору. Заявка не сформирована. Не найден активный период.",
      success: false
    };

  let periodResult = await checkActivePeriod(period, month);
  if (!periodResult) return {
    result: "Обратитесь к администратору. Заявка не сформирована. Не найден активный период.",
    success: false
  };
  if (typeof periodResult == "string") period = await Period.findOne({ isActive: true });

  let proportion = {};

  if (newOrder.amount > 50) {
    let oldWomenAmount = Math.round(newOrder.amount * 0.3);
    let oldMenAmount = Math.round(newOrder.amount * 0.2);
    let specialAmount = Math.round(newOrder.amount * 0.2);
    let yangAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialAmount;

    proportion = {
      "amount": newOrder.amount,
      "oldWomen": oldWomenAmount,
      "oldMen": oldMenAmount,
      "special": specialAmount,
      "yang": yangAmount,
      "oneHouse": Math.round(newOrder.amount * 0.3)
    }
    if (newOrder.filter.nursingHome ) proportion.oneHouse = undefined;
  } else {
    proportion = await Proportion.findOne({ amount: newOrder.amount });
    if (!proportion) {
      return {
        result: `Обратитесь к администратору. Заявка не сформирована. Для количества ${newOrder.amount} не найдена пропорция`,
        success: false
      };
    } else {
      if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || newOrder.filter.region) proportion.oneHouse = undefined;
      //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
      console.log("newOrder.filter.region");
      console.log(newOrder.filter.region);

      console.log("proportion.oneHouse");
      console.log(proportion.oneHouse);



      if (!newOrder.filter.onlyWithPicture && !newOrder.filter.region && !newOrder.filter.nursingHome && newOrder.amount < 21) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);

    }
  }

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
  let isOutDate = false;

  if (newOrder.filter) {
    if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: "" };
    if ((newOrder.filter.onlyWithPicture || newOrder.filter.oneHouse || newOrder.filter.oneRegion) && newOrder.filter.addressFilter == 'any') {
      proportion.allCategory = proportion.yang + proportion.oldWomen + proportion.oldMen + proportion.special;
      proportion.oldWomen = 0;
      proportion.oldMen = 0;
      proportion.yang = 0;
      proportion.special = 0;
    }
    if (newOrder.filter.addressFilter == 'forKids') {
      proportion.oldWomen = proportion.oldWomen + proportion.special;
      proportion.special = 0;
      // console.log("proportion");
      //console.log(proportion);
      if (!newOrder.filter.year1 && !newOrder.filter.year2) {
        newOrder.filter.year2 = 1972;
      }
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
      if (!newOrder.filter.year2) filter.yearBirthday = { $lte: 2022, $gte: newOrder.filter.year1 };
      if (newOrder.filter.year1 > 1957 && newOrder.filter.addressFilter != 'onlySpecial') {
        proportion.yang = proportion.yang + proportion.oldWomen + proportion.oldMen;
        proportion.oldWomen = 0;
        proportion.oldMen = 0;
      }
      if (newOrder.filter.year1 && newOrder.filter.year2) filter.yearBirthday = { $lte: newOrder.filter.year2, $gte: newOrder.filter.year1 };
    }
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

      seniorsData = await fillOrderSpecialDate(proportion, period, order_id, filter, newOrder.filter.date1, newOrder.filter.date2);
    } else {
      seniorsData = await fillOrder(proportion, period, order_id, filter);
    }
  }

  if (seniorsData.celebratorsAmount < newOrder.amount) {

    await deleteErrorPlus(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
      success: false

    }
  }

  const nursingHomes = await House.find({});
  let resultLineItems = await generateLineItems(nursingHomes, order_id);
  console.log("resultLineItems");
  console.log(resultLineItems);
  console.log(typeof resultLineItems);

  if (typeof resultLineItems == "string") {

    console.log("resultLineItems222");
    await deleteErrorPlus(order_id);
    return {
      result: `Обратитесь к администратору. Заявка не сформирована. Не найден адрес для ${resultLineItems}.`,
      success: false
    };
  }

  checkActiveList(period, month, isOutDate, seniorsData.date1, seniorsData.date2);

  return {
    result: resultLineItems,
    success: true,
    order_id: order_id
  }
}

// create a list of seniors for the order with special dates

async function fillOrderSpecialDate(proportion, period, order_id, filter, date1, date2) {
  const categories = ["oldWomen", "oldMen", "yang", "special", "specialOnly", "allCategory"];
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
  if (proportion.amount < 31 && !filter.nursingHome && !filter.region && !filter.linkPhoto) {
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
    restrictedHouses: [],
    restrictedPearson: [],
    celebratorsAmount: 0,
    date1: day1,
    date2: day2,
    maxPlus: 5,
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
      data = await collectSeniors(data);
      if (data.counter < proportion[category]) {
        return data;
      }
    }
  }

  //console.log(data.restrictedHouses);
  //console.log(data.restrictedPearson);
  return data;
}


// create a list of seniors for the order

async function fillOrder(proportion, period, order_id, filter) {
  const categories = ["oldWomen", "oldMen", "yang", "special", "specialOnly", "allCategory"];

  let data = {
    houses: {},
    restrictedHouses: [],
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

      data.date1 = period.date1;
      data.date2 = period.date2;
      data.maxPlus = period.maxPlus;

      data = await collectSeniors(data);

      if (data.counter < proportion[category]) {
        //if (orderFilter.date2 > orderFilter.date1 + 5) { }
        if (period.key == 5) {
          data.maxPlus = period.maxPlus + 1;
          data.date1 = period.date1;
          data.date2 = period.date2;
        } else {
          if (proportion.amount < 31) {
            data.maxPlus = period.maxPlus;
            data.date1 = period.date2 + 1;
            data.date2 = period.date2 + 1;
          } else {
            data.maxPlus = period.key == 4 ? period.maxPlus + 1 : period.maxPlus;
            data.date1 = period.date1 + 5;
            data.date2 = period.date2 + 5;
          }
        }
        data = await collectSeniors(data);
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

async function collectSeniors(data) {

  const searchOrders = {
    oldWomen: ["oldWomen", "oldMen", "oldest"],
    oldMen: ["oldMen", "oldWomen", "yang", "oldest"],
    yang: ["yang", "oldMen", "oldWomen", "oldest"],
    special: ["special", "yang", "oldWomen", "oldMen",  "oldest"],
    specialOnly: ["special"],
    allCategory: ["oldMen", "oldWomen", "yang", "oldest", "special"]
  };
  //console.log("data.category");
  //console.log(data.category);

  for (let kind of searchOrders[data.category]) {
    let barrier = data.proportion[data.category] - data.counter;

    outer1: for (let i = 0; i < barrier; i++) {
      let result = await searchSenior(
        kind,
        data

      );
      if (result) {
        //console.log(result);
        await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
        await List.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
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
async function searchSenior(
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

    _id: { $nin: data.restrictedPearson },
    //plusAmount: { $lt: maxPlus },
    dateBirthday: { $gte: data.date1, $lte: data.date2 },
    absent: { $ne: true }
  };
  if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions };
  if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
 if (data.proportion.amount > 12 || data.proportion.amount < 5 || data.filter.address == "onlySpecial") {
    {
       standardFilter.isReleased = false ;
    } 
  }

  //console.log("maxPlus");
  //console.log(maxPlus);

  let filter = Object.assign(standardFilter, data.filter);
  //console.log("filter");


  let celebrator;
  //CHANGE!!!
  //let maxPlusAmount = 2;  
  //let maxPlusAmount = 3;  
  let maxPlusAmount = standardFilter.oldest ? 4 : data.maxPlus;  
  //console.log("maxPlusAmount");
  //console.log(maxPlusAmount);

  for (let plusAmount = 1; plusAmount <= maxPlusAmount; plusAmount++) {
    filter.plusAmount = { $lt: plusAmount };
    console.log("filter");
    console.log(filter);
    celebrator = await List.findOne(filter);
    console.log("celebrator");
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
async function generateLineItems(nursingHomes, order_id) {
  //console.log(nursingHomes);

  let lineItems = [];
  let order = await Order.findOne({ _id: order_id })
  order.temporaryLineItems.sort(
    (prev, next) =>
      prev.dateBirthday - next.dateBirthday
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

//check if active period is close TODO!!!!!

async function checkActiveList(period, month, isOutDate, minDate, maxDate) {
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
    console.log("seniorToGreet2");
    console.log(seniorToGreet);
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


//////////////////////////////////////////////////


/**
 * API to delete
 */
router.delete("/", async (req, res) => {
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

router.get("/absents/all", async (req, res) => {
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



module.exports = router;

