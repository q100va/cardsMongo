/*
============================================
; APIs for the dobroru
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
const order = require("../models/order");
const checkAuth = require("../middleware/check-auth");
const Easter = require("../models/easter");
const Client = require("../models/client");


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

        // console.log("order.dateOfOrder");
        // console.log(req.body.dateOfOrder);
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

                if (holiday == "Дни рождения июля 2024") {
                    await ListNext.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
                }
                if (holiday == "Дни рождения июня 2024") {
                    await List.updateMany({ _id: { $in: seniors_ids } }, { $inc: { plusAmount: - 1 } }, { upsert: false });
                }
                if (holiday == "Дни рождения мая 2024") {
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
    if (newOrder.holiday == "Дни рождения июня 2024") {
        period = {
            "date1": 1,
            "date2": 5,
            "isActive": true,
            "key": 5,
            "maxPlus": 5, //PLUSES
            "secondTime": false,
            "scoredPluses": 2
        }
    }

/* 
    if (newOrder.holiday == "Дни рождения мая 2024") {
        period = {
            "date1": 26,
            "date2": 31,
            "isActive": true,
            "key": 5,
            "maxPlus": 4,
            "secondTime": true,
            "scoredPluses": 2
        }
    }
    if (newOrder.holiday == "Дни рождения июля 2024") {
        period = {
            "date1": 1,
            "date2": 5,
            "isActive": true,
            "key": 0,
            "maxPlus": 5,  //PLUSES
            "secondTime": false,
            "scoredPluses": 2
        }

        console.log('period');
        console.log(period);
    } */

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

            seniorsData = await fillOrderSpecialDate(proportion, period, order_id, filter, newOrder.filter.date1, newOrder.filter.date2, prohibitedId, restrictedHouses, newOrder.filter, newOrder.holiday);
        } else {
            seniorsData = await fillOrder(proportion, period, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter, newOrder.holiday);
        }
    }
    console.log("proportion");
    console.log(proportion);

    console.log("newOrder.filter.maxOneHouse");
    console.log(newOrder.filter.maxOneHouse);

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

    // checkActiveList(period, month, isOutDate, seniorsData.date1, seniorsData.date2);
    // CANCEL 
    return {
        result: resultLineItems,
        success: true,
        order_id: order_id,
        contact: newOrder.email ? newOrder.email : newOrder.contact,
        clientFirstName: newOrder.clientFirstName
    }
}

// create a list of seniors for the order with special dates

async function fillOrderSpecialDate(proportion, period, order_id, filter, date1, date2, prohibitedId, restrictedHouses, orderFilter, holiday) {
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

    //console.log("filter");
    //console.log(filter);
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
            data = await collectSeniors(data, orderFilter, holiday);
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

async function fillOrder(proportion, period, order_id, filter, prohibitedId, restrictedHouses, orderFilter, holiday) {
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

            data = await collectSeniors(data, orderFilter, holiday);

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
                data = await collectSeniors(data, orderFilter, holiday);
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

async function collectSeniors(data, orderFilter, holiday) {
    if (holiday == "Дни рождения июня 2024") {
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
                kind,
                data,
                holiday

            );
            if (result) {
                //console.log(result);
                await Order.updateOne({ _id: data.order_id }, { $push: { temporaryLineItems: result } }, { upsert: false });
                if (holiday == "Дни рождения июля 2024") {
                    await ListNext.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
                }
                if (holiday == "Дни рождения июня 2024") {
                    await List.updateOne({ _id: result.celebrator_id }, { $inc: { plusAmount: 1 } }, { upsert: false });
                }
                if (holiday == "Дни рождения мая 2024") {
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
                    if (data.houses[result["nursingHome"]] >= data.proportion["oneHouse"]) {
                        data.restrictedHouses.push(result["nursingHome"]);
                    }
                }
                if (data.celebratorsAmount == 15 || data.celebratorsAmount == 30 ) { 
                    data.restrictedHouses = []; 
                    console.log(data.celebratorsAmount);

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
        БАЗГИЕВОdata.maxPlus,
        data.filter */

    let usingHouses = [  
        //"БЕРДСК", "ТОМАРИ", "БОГРАД",   
        "РЖЕВ", "ПЕРВОМАЙСКИЙ", 
        "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК", 
        "МАГАДАН_АРМАНСКАЯ", "ОКТЯБРЬСКИЙ", 
        "РОСТОВ-НА-ДОНУ", "НОВОСИБИРСК_ЖУКОВСКОГО", 
        "ДУБНА_ТУЛЬСКАЯ", "БИЙСК", "ТАМБОВСКИЙ_ЛЕСХОЗ", 
        "СКОПИН", "МАРКОВА", "НОГИНСК", 
        "ВЕРХНЕУРАЛЬСК", "РАЙЧИХИНСК", "ТАЛИЦА_УРГА", 
        "КРАСНОЯРСК", "УГЛИЧ", "ТОЛЬЯТТИ", 
        "ЖЕЛЕЗНОГОРСК", "ГАВРИЛОВ-ЯМ", "ЙОШКАР-ОЛА", 
        "АВДОТЬИНКА", "ИРКУТСК_ЯРОСЛАВСКОГО", "ЯРЦЕВО", 
        "РАДЮКИНО", "САДОВЫЙ", "МАЧЕХА", "ТВЕРЬ_КОНЕВА", 
        "СОЛИКАМСК_ДУБРАВА", "СОЛИКАМСК_СЕЛА", "СЕВЕРОДВИНСК",
        "ЦЕЛИННОЕ", "КРЕСТЬЯНКА", "ДРУЖБА", "УСТЬ-МОСИХА",
        "АРХАРА", "ЗАОЗЕРЬЕ", "МЫЗА", "НЯНДОМА","КАРГОПОЛЬ",
        "НОГУШИ", "МЕТЕЛИ", "ЛЕУЗА", "БАЗГИЕВО", "КУДЕЕВСКИЙ",
        "ДОЛБОТОВО", "ГЛОДНЕВО", "ГОРНЯЦКИЙ", "ДОНЕЦК", "МЕЧЕТИНСКАЯ", "БОЛЬШАЯ_ОРЛОВКА", "НОВЫЙ_ЕГОРЛЫК",
        "МАКСИМОВКА", "МАЙСКОЕ", "КАНДАБУЛАК", "ПЕТРОВКА", "ДЕВЛЕЗЕРКИНО", "НИКИТИНКА", "ЧАПАЕВСК", "ЖИГУЛЕВСК",
         "САРАТОВ_КЛОЧКОВА", "ЛАШМА", "УВАРОВО", 

    ];

    console.log('data.restrictedHouses');
    console.log(data.restrictedHouses);

    console.log('data.proportion');
    console.log(data.proportion);
   
        if (data.restrictedHouses.length > 0) {
            for (let house of data.restrictedHouses) {
                let index = usingHouses.findIndex(item => item == house);
                if (index != -1) {
                    usingHouses.splice(index, 1);
                }
            }
        }
    let standardFilter = {
        nursingHome: { $in: usingHouses },

        //nursingHome: { $nin: data.restrictedHouses },  //PLUSES

        //nursingHome: { $in: ["ТАМБОВСКИЙ_ЛЕСХОЗ", "МОСКВА_РОТЕРТА", "ШЕБЕКИНО", "РАДЮКИНО", "САДОВЫЙ", "МАЧЕХА", "ТВЕРЬ_КОНЕВА", "ЯРЦЕВО", "СОЛИКАМСК_ДУБРАВА", "СОЛИКАМСК_СЕЛА", "СЕВЕРОДВИНСК", "КРИПЕЦКОЕ", "ЧЕРМЕНИНО", "ГАВРИЛОВ-ЯМ", "ЙОШКАР-ОЛА", "КРАСНОВИШЕРСК", "ЗЕРНОГРАД_МИРА", "ЗЕРНОГРАД_САМОХВАЛОВА", "НОВОЧЕРКАССК", "БЕРЕЗОВСКИЙ", "АЛАКУРТТИ", "ТОВАРКОВСКИЙ_ДИПИ", "КОСТРОМА_КИНЕШЕМСКОЕ", "ТОЛЬЯТТИ", "СЫЗРАНЬ_КИРОВОГРАДСКАЯ", "УСОЛЬЕ", "ДМИТРОВСКИЙ_ПОГОСТ_ОКТЯБРЬСКАЯ", "СЫЗРАНЬ_ПОЖАРСКОГО", "АНДРЕЕВСКИЙ", "ВОЛГОГРАД_ВОСТОЧНАЯ", "ПРОШКОВО", "АВДОТЬИНКА", "ИРКУТСК_ЯРОСЛАВСКОГО", "ВОРОНЕЖ_ДНЕПРОВСКИЙ","ДИМИТРОВГРАД","БЕРДСК",] }, 
        // nursingHome: { $in: ["РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК", "МАГАДАН_АРМАНСКАЯ","ОКТЯБРЬСКИЙ",] }, 
        //nursingHome: { $in: ["РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК", "МАГАДАН_АРМАНСКАЯ","ОКТЯБРЬСКИЙ","РОСТОВ-НА-ДОНУ", "НОВОСИБИРСК_ЖУКОВСКОГО", "ДУБНА_ТУЛЬСКАЯ", "БИЙСК", "СОСНОВКА", "СКОПИН", "МАРКОВА", "НОГИНСК", "ВЕРХНЕУРАЛЬСК", "НОВОСИБИРСК_ЖУКОВСКОГО", "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ", "ТАЛИЦА_УРГА", "КРАСНОЯРСК",] }, 
        //nursingHome: { $in: [ "ШЕБЕКИНО", "РАДЮКИНО", "САДОВЫЙ", "МАЧЕХА", "ТВЕРЬ_КОНЕВА", "ЯРЦЕВО", "СОЛИКАМСК_ДУБРАВА", "СОЛИКАМСК_СЕЛА", "СЕВЕРОДВИНСК", "ГАВРИЛОВ-ЯМ", "ЙОШКАР-ОЛА", "ТОЛЬЯТТИ",  "АВДОТЬИНКА", "ИРКУТСК_ЯРОСЛАВСКОГО", ] }, 

        //nursingHome: { $in: ["МАРКОВА", "НОГИНСК", "ВЕРХНЕУРАЛЬСК", "НОВОСИБИРСК_ЖУКОВСКОГО", "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ", "ТАЛИЦА_УРГА", "КРАСНОЯРСК", "РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК",  "ДУБНА_ТУЛЬСКАЯ", "БИЙСК",] }, 

        //nursingHome: { $in: ["МАГАДАН_АРМАНСКАЯ","ОКТЯБРЬСКИЙ", "РОСТОВ-НА-ДОНУ", "НОВОСИБИРСК_ЖУКОВСКОГО", "БОГРАД", "ВЛАДИКАВКАЗ", "ДУБНА_ТУЛЬСКАЯ", "БИЙСК", "КАНДАЛАКША",  "РАЙЧИХИНСК",  "СОСНОВКА", "СКОПИН", "ЖЕЛЕЗНОГОРСК", "ТОЛЬЯТТИ", "МАРКОВА", "НОГИНСК", "ВЕРХНЕУРАЛЬСК", "НОВОСИБИРСК_ЖУКОВСКОГО", "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ", "ТАЛИЦА_УРГА", "КРАСНОЯРСК", "РЖЕВ", "ПЕРВОМАЙСКИЙ", "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК", ]}, //ДОБРО РУ    //uncertain: true, // DELETE
        //specialComment: {$ne: ""},
        _id: { $nin: data.restrictedPearson },
        //plusAmount: { $lt: maxPlus },
        dateBirthday: { $gte: data.date1, $lte: data.date2 },
        absent: { $ne: true },
        patronymic : {$ne: ""},
        //firstName: "Светлана"
    };
    standardFilter.isReleased = false;
    standardFilter.noAddress = false;

    //if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions };
    if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
    // console.log("DATA");
    //console.log(data);
/*     if ((data.proportion.amount > 12 || data.proportion.amount < 5) && (!data.filter.nursingHome)) {
        standardFilter.isReleased = false;
    } */

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
   console.log("FILTER");
    console.log(filter);

    let celebrator;
    //CHANGE!!!
    //let maxPlusAmount = 3;  
    //let maxPlusAmount = 3;  
    let maxPlusAmount = standardFilter.oldest ? 4 : data.maxPlus;
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


        //console.log("filter CHECK");
        //console.log(filter);

        if (holiday == "Дни рождения июля 2024") {
            celebrator = await ListNext.findOne(filter);
        }
        if (holiday == "Дни рождения июня 2024") {
            celebrator = await List.findOne(filter);
        }
        if (holiday == "Дни рождения мая 2024") {
            celebrator = await ListBefore.findOne(filter);
        }


        // console.log("celebrator List");
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





//////////////////////////////////////////////////



module.exports = router;