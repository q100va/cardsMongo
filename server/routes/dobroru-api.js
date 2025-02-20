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
const February23 = require("../models/february-23");
const March8 = require("../models/march-8");
const May9 = require("../models/may-9");
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

        console.log("newOrder.holiday");
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
            "date2": 31,
            "isActive": true,
            "key": 0,
            "maxPlus": 2, //PLUSES1
            "secondTime": false,
            "scoredPluses": 2
        }
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
            if (!newOrder.filter.maxOneHouse && (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || (newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]))) proportion.oneHouse = undefined;
            //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
            console.log("newOrder.filter.regions");
            console.log(newOrder.filter.regions);

            console.log("proportion.oneHouse");
            console.log(proportion.oneHouse);

            if (!newOrder.filter.onlyWithPicture && (newOrder.filter.regions.length == 0 || !newOrder.filter.regions[0]) && !newOrder.filter.nursingHome && newOrder.amount < 21) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);

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

        if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture || (newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]) || newOrder.amount > 20) {
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
      
            if ((newOrder.filter.onlyWithPicture || newOrder.filter.nursingHome || newOrder.filter.regions.length > 0) && newOrder.filter.addressFilter == 'any') {
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
        if (newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]) {
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
    // console.log("proportion");
    // console.log(proportion);

    //console.log("newOrder.filter.maxOneHouse");
    //console.log(newOrder.filter.maxOneHouse);

    if (seniorsData.celebratorsAmount < newOrder.amount) {

        await deleteErrorPlus(order_id, newOrder.holiday);
        return {
            result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
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

/* async function fillOrderSpecialDate(proportion, period, order_id, filter, date1, date2, prohibitedId, restrictedHouses, orderFilter, holiday) {
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
} */


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
            /* 
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
                        } */

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

                if (data.filter.nursingHome || data.filter.region) {
                    data.proportion.oneHouse = null;
                    data.proportion.oneRegion = null;
                }

                if (data.proportion.oneHouse) {
                    if (data.houses[result["nursingHome"]] >= data.proportion["oneHouse"]) {
                        data.restrictedHouses.push(result["nursingHome"]);
                    }
                }
                if (data.celebratorsAmount == 15 || data.celebratorsAmount == 30) {
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
        data.maxPlus,
        data.filter */


    let usingHousesSmaller = [
        "АЛЕКСАНДРОВКА",
        "АЛНАШИ",
        "АНЦИФЕРОВО",
        "АРМАВИР",
        "АРХАНГЕЛЬСК_ДАЧНАЯ",
        "БАЗГИЕВО",
        "БЕЛЫШЕВО",
        "БЛАГОВЕЩЕНКА",
        "БОГОЛЮБОВО",
        "БОЛШЕВО",
        "БОЛЬШАЯ_ГЛУШИЦА",
        "БЫТОШЬ",
        "ВЕРБИЛКИ",
        "ВОЗНЕСЕНСКОЕ",
        "ГЛОДНЕВО",
        "ДВИНСКОЙ",
        "ДЕВЛЕЗЕРКИНО",
        "ДМИТРИЕВКА",
        "ДУБНА",
        "ДУБОВЫЙ_УМЕТ",
        "ЕЛЕНСКИЙ",
        "ЕЛИЗАВЕТОВКА",
        "ЖИТИЩИ",
        "ЗАОЗЕРЬЕ",
        "ИЛЬИНСКОЕ",
        "КАБАНОВКА",
        "КАБАНОВО",
        "КАМЕНОЛОМНИ",
        "КАНДАБУЛАК",
        "КОЗЛОВО",
        "КРАСНОБОРСК",
        "КРЕСТЬЯНКА",
        "КУГЕЙСКИЙ",
        "КЫТМАНОВО",
        "ЛЕУЗА",
        "ЛИПИТИНО",
        "МАГАДАН_АРМАНСКАЯ",
        "МАЙСКОЕ",
        "МАКСИМОВКА",
        "МАЛАЯ_РОЩА",
        "МАРЕВО",
        "МАСЛЯТКА",
        "МЕДЫНЬ",
        "МЕЗЕНЬ",
        "МЕЧЕТИНСКАЯ",
        "МИХАЙЛОВКА",
        "МОЛОДОЙ_ТУД",
        "МОЛЬГИНО",
        "МОСАЛЬСК",
        "МЫЗА",
        "НАВОЛОКИ",
        "НИКИТИНКА",
        "НОВАЯ_ЦЕЛИНА",
        "НОВОСЕЛЬЕ",
        "НОВЫЙ_ЕГОРЛЫК",
        "НОГУШИ",
        "ОКУЛОВКА",
        "ОТРАДНЫЙ",
        "ПАНКРУШИХА",
        "ПАРФИНО",
        "ПЕСЬ",
        "ПЕТРОВКА",
        "ПИХТОВКА",
        "ПОБЕДИМ",
        "ПОДБОРОВКА",
        "ПРЯМУХИНО",
        "ПУХЛЯКОВСКИЙ",
        "РОМАНОВКА",
        "РОСЛАВЛЬ",
        // "САВИНСКИЙ",
        "СЕВЕРООНЕЖСК",
        "СЕЛЫ",
        "СЕЛЬЦО",
        "СНЕЖНАЯ_ДОЛИНА",
        "СТАРАЯ_ТОРОПА",
        "СТАРОДУБ",
        "СТАРОЕ_ШАЙГОВО",
        "СТЕПУРИНО",
        "СТОЛЫПИНО",
        "СТУДЕНЕЦ",
        "СУЗУН",
        "СЯВА",
        "ТАРХАНСКАЯ_ПОТЬМА",
        "ТОМАРИ",
        "УЛЬЯНКОВО",
        "УСТЬ-МОСИХА",
        "ХАТУНЬ",
        "ЦЕЛИННОЕ",
        "ЧАПАЕВСК",
        "ЯГОТИНО",
        "ЯСНАЯ_ПОЛЯНА",
        "ЯСНОГОРСК",
        "ГРЯЗОВЕЦ",
        "СНЕЖНЫЙ",
        "КЛЕМЕНТЬЕВО",
        "ОВЧАГИНО",
        "ЯСНАЯ_ПОЛЯНА",
        "РАХМАНОВО",
        "ЭЛИСТА",
        "ДАЛМАТОВО",
        "УЛЬЯНОВСК",
        "ПУЧЕЖ",
        "ИНОЗЕМЦЕВО",
        "ЛЕВОКУМСКОЕ",
        "САРАНСК",
        "АТАМАНОВКА",
        "УЛАН-УДЭ",
        "МУРМАНСК_СТАРОСТИНА",
        "ВЯЗНИКИ",
        "КОСТРОМА_МАЛЫШКОВСКАЯ",
        "СОСНОВКА",
        "ПЕНЗА",
        "ТАВРИЧЕСКОЕ",
        "ТАГАНРОГ",
        "БИЙСК",
        "БЛАГОВЕЩЕНСК_ЧАЙКОВСКОГО",
        "ПОБЕДА",
        "ИНСАР"


    ];

    let usingHousesLarger = [
        "АВДОТЬИНКА",
        "АРХАРА",
        "БЕРДСК",
        "БЛАГОВЕЩЕНСК_ЗЕЙСКАЯ",
        "БЛАГОВЕЩЕНСК_ТЕАТРАЛЬНАЯ",
        "БОГРАД",
        "БОЛЬШАЯ_ОРЛОВКА",
        "БОЛЬШОЕ_КАРПОВО",
        "БУРЕГИ",
        "ВАЛДАЙ",
        "ВАХТАН",
        "ВЕРХНЕУРАЛЬСК",
        "ВЕРХНИЙ_УСЛОН",
        "ВЛАДИКАВКАЗ",
        "ВОЗНЕСЕНЬЕ",
        "ВОЛГОДОНСК",
        "ВОНЫШЕВО",
        "ВЫШНИЙ_ВОЛОЧЕК",
        "ВЯЗЬМА",
        "ГАВРИЛОВ-ЯМ",
        "ДОЛБОТОВО",
        "ДОНЕЦК",
        "ДРУЖБА",
        "ДУБНА_ТУЛЬСКАЯ",
        "ЕВПАТОРИЯ",
        "ЖЕЛЕЗНОГОРСК",
        "ЗАОВРАЖЬЕ",
        "ЗОЛОТАРЕВКА",
        "ЙОШКАР-ОЛА",
        "ИРКУТСК_ЯРОСЛАВСКОГО",
        "КАНДАЛАКША",
        "КАРГОПОЛЬ",
        "КАРДЫМОВО",
        "КАШИРСКОЕ",
        "КИРЖАЧ",
        "КОВЫЛКИНО",
        "КОРЯЖМА",
        "КРАСНОЯРСК",
        "КУГЕСИ",
        "КУДЕЕВСКИЙ",
        "ЛАШМА",
        "МАРКОВА",
        "МАЧЕХА",
        "МЕТЕЛИ",
        "МИХАЙЛОВ",
        "НЕБОЛЧИ",
        "НОВОСИБИРСК_ЖУКОВСКОГО",
        "НОВОСЛОБОДСК",
        "НОВОТУЛКА",
        "НОГИНСК",
        "НЯНДОМА",
        "ОКТЯБРЬСКИЙ",
        "ПАПУЛИНО",
        "ПЕРВОМАЙСКИЙ",
        "ПЕРЕЛОЖНИКОВО",
        "ПЛЕСЕЦК",
        "ПРЕОБРАЖЕНСКИЙ",
        "РАДЮКИНО",
        "РАЙЧИХИНСК",
        "РЖЕВ",
        "РОСТОВ-НА-ДОНУ",
        "РЯЗАНЬ",
        "САДОВЫЙ",
        "СЕВЕРОДВИНСК",
        "СЕМИКАРАКОРСК",
        "СКОПИН",
        "СЛОБОДА-БЕШКИЛЬ",
        "СОЛИКАМСК_ДУБРАВА",
        "СОЛИКАМСК_СЕЛА",
        "СПАССК-ДАЛЬНИЙ",
        "СТАРАЯ_КУПАВНА",
        "СУХОВЕРХОВО",
        "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ",
        "ТАЛИЦА_УРГА",
        "ТАМБОВСКИЙ_ЛЕСХОЗ",
        "ТВЕРЬ_КОНЕВА",
        "ТИМАШЕВСК",
        "ТОЛЬЯТТИ",
        "ТУТАЕВ",
        "УВАРОВО",
        "УГЛИЧ",
        "УСТЬ-ОРДЫНСКИЙ",
        "ХАРЬКОВКА",
        "ХУТОР_ЛЕНИНА",
        "ЧЕРНЫШЕВКА",
        "ЧИСТОПОЛЬ",
        "ЧИТА_ТРУДА",
        "ШАХУНЬЯ",
        "ШЕБЕКИНО",
        "ШИПУНОВО",
        "ЭЛЕКТРОГОРСК",
        "ЯРЦЕВО",
        "БИЙСК",
        "ЖУКОВКА",

    ];

    /*  let usingHouses = [
         "ТУТАЕВ", "ТАЛИЦА_КРАСНОАРМЕЙСКАЯ",
         "РЖЕВ", "ПЕРВОМАЙСКИЙ",
         "ВЯЗЬМА", "ВЫШНИЙ_ВОЛОЧЕК",
         "МАГАДАН_АРМАНСКАЯ", "ОКТЯБРЬСКИЙ",
         "РОСТОВ-НА-ДОНУ", "НОВОСИБИРСК_ЖУКОВСКОГО",
         "ДУБНА_ТУЛЬСКАЯ", "ТАМБОВСКИЙ_ЛЕСХОЗ",
         "СКОПИН", "МАРКОВА", "НОГИНСК",
         "ВЕРХНЕУРАЛЬСК", "РАЙЧИХИНСК", "ТАЛИЦА_УРГА",
         "КРАСНОЯРСК", "УГЛИЧ", "ТОЛЬЯТТИ",
         "ЖЕЛЕЗНОГОРСК", "ГАВРИЛОВ-ЯМ", "ЙОШКАР-ОЛА",
         "АВДОТЬИНКА", "ИРКУТСК_ЯРОСЛАВСКОГО", "ЯРЦЕВО",
         "РАДЮКИНО", "САДОВЫЙ", "МАЧЕХА", "ТВЕРЬ_КОНЕВА",
         "СОЛИКАМСК_ДУБРАВА", "СОЛИКАМСК_СЕЛА", "СЕВЕРОДВИНСК",
         "ЦЕЛИННОЕ", "КРЕСТЬЯНКА", "ДРУЖБА", "УСТЬ-МОСИХА",
         "АРХАРА", "ЗАОЗЕРЬЕ", "МЫЗА", "НЯНДОМА", "КАРГОПОЛЬ",
         "НОГУШИ", "МЕТЕЛИ", "ЛЕУЗА", "БАЗГИЕВО", "КУДЕЕВСКИЙ",
         "ДОЛБОТОВО", "ГЛОДНЕВО", "ГОРНЯЦКИЙ", "ДОНЕЦК", "МЕЧЕТИНСКАЯ", "БОЛЬШАЯ_ОРЛОВКА", "НОВЫЙ_ЕГОРЛЫК",
         "МАКСИМОВКА", "МАЙСКОЕ", "КАНДАБУЛАК", "ПЕТРОВКА", "ДЕВЛЕЗЕРКИНО", "НИКИТИНКА", "ЧАПАЕВСК", "ЖИГУЛЕВСК",
         "САРАТОВ_КЛОЧКОВА", "ЛАШМА", "УВАРОВО",
         "ТИМАШЕВСК", "ЧИСТОПОЛЬ", "ЧИТА_ТРУДА",
 
     ]; */ //
    let result = await searchSeniorHelper(
        kind,
        data,
        holiday,
        usingHousesSmaller
    );

    if (!result) {
        result = await searchSeniorHelper(
            kind,
            data,
            holiday,
            usingHousesLarger
        );
    }
    return result;

}

async function searchSeniorHelper(
    kind,
    data,
    holiday,
    usingHouses
) {


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

        //nursingHome: { $nin: data.restrictedHouses },  //PLUSES1

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
        patronymic: { $ne: "" },
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

        if (holiday == "Дни рождения мая 2025") {
            celebrator = await ListNext.findOne(filter);
        }
        if (holiday == "Дни рождения апреля 2025") {
            celebrator = await List.findOne(filter);
        }
        if (holiday == "Дни рождения марта 2025") {
            celebrator = await ListBefore.findOne(filter);
        }

        console.log("celebrator List");
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
        console.log("req.body.restrictedHouses");
        console.log(req.body.restrictedHouses);

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
        /*     if (newOrder.amount > 50) {
              let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount;
              if (!newOrder.filter.maxNoAddress) {
                oldWomenAmount = Math.round(newOrder.amount * 0.2);
                oldMenAmount = Math.round(newOrder.amount * 0.3);
                specialWomenAmount = Math.round(newOrder.amount * 0.1);
                specialMenAmount = Math.round(newOrder.amount * 0.1);
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
         */
        let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount, oneHouse;
        /*     if (!newOrder.filter.maxNoAddress) { */
        oldWomenAmount = Math.round(newOrder.amount * 0.2) ? Math.round(newOrder.amount * 0.2) : 1;
        oldMenAmount = Math.round(newOrder.amount * 0.2);
        yangWomenAmount = Math.round(newOrder.amount * 0.1);
        yangMenAmount = Math.round(newOrder.amount * 0.1);
        specialWomenAmount = Math.round(newOrder.amount * 0.1);
        specialMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - yangMenAmount - yangWomenAmount - specialWomenAmount;
        oneHouse = Math.round(newOrder.amount * 0.2) ? Math.round(newOrder.amount * 0.2) : 1;
        oneHouse = oneHouse < 5 ? oneHouse : 5;
        //oneHouse = Math.ceil(newOrder.amount/4);

        /*         } else {
                  specialWomenAmount = Math.ceil(newOrder.filter.maxNoAddress * 0.2)
                  specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
                  oldWomenAmount = Math.ceil((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
                  oldMenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.3);
                  yangWomenAmount = Math.round((newOrder.amount - newOrder.filter.maxNoAddress) * 0.1);
                  yangMenAmount = newOrder.amount - oldWomenAmount - oldMenAmount - specialWomenAmount - yangWomenAmount - specialMenAmount;
                } */
        proportion = {
            "amount": newOrder.amount,
            "oldWomen": oldWomenAmount,
            "oldMen": oldMenAmount,
            "specialWomen": specialWomenAmount,
            "specialMen": specialMenAmount,
            "yangWomen": yangWomenAmount,
            "yangMen": yangMenAmount,
            "oneHouse": oneHouse,
            "oneRegion": Math.ceil(newOrder.amount * 0.33)
        }
        /*  } */

        if (!proportion) {
            return {
                result: `Обратитесь к администратору. Заявка не сформирована. Для количества ${newOrder.amount} не найдена пропорция`,
                success: false
            };
        } else {
            console.log("newOrder.filter");
            console.log(newOrder.filter);

            console.log("proportion.oneHouse");
            console.log(proportion.oneHouse);

            if (((newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]) || newOrder.amount > 20)) { // !newOrder.filter.maxOneHouse && newOrder.filter.nursingHome || || newOrder.filter.onlyWithPicture
                // proportion.oneHouse = undefined;
                proportion.oneRegion = undefined;
            }

            if (newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]) { //newOrder.filter.nursingHome ||  newOrder.filter.onlyWithPicture ||

                if (newOrder.amount > 40)
                    proportion.oneHouse = 10;
                if (newOrder.amount <= 40)
                    proportion.oneHouse = 8;
                if (newOrder.amount <= 30)
                    proportion.oneHouse = 6;
                if (newOrder.amount <= 20)
                    proportion.oneHouse = 5;
                if (newOrder.amount <= 15)
                    proportion.oneHouse = 4;
                if (newOrder.amount <= 5)
                    proportion.oneHouse = 3;

                console.log("proportion.oneHouse newOrder.filter.regions.length > 0");
                console.log(proportion.oneHouse);
                console.log(newOrder.filter.regions);

                //proportion.oneHouse = undefined;

                let seniorsOneRegion = [];
                let seniorsOneRegionFemale = [];

                if (newOrder.filter.genderFilter == 'any') {
                    seniorsOneRegion = await NewYear.aggregate([
                        {
                            $match: {
                                region: { $in: newOrder.filter.regions },
                                absent: false,
                                plusAmount: { $lt: 2 },
                                onlyForInstitute: false,
                                isReleased: false,
                                noAddress: false,
                                //  secondTime: data.maxPlus > 1 ? true : false,
                            }
                        },

                        { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                    ]);

                    seniorsOneRegionFemale = await NewYear.aggregate([
                        {
                            $match: {
                                region: { $in: newOrder.filter.regions },
                                absent: false,
                                plusAmount: { $lt: 2 },
                                onlyForInstitute: false,
                                isReleased: false,
                                noAddress: false,
                                gender: "Female"
                            }
                        },

                        { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                    ]);


                }

                if (newOrder.filter.genderFilter == 'Female') {
                    seniorsOneRegion = await NewYear.aggregate([
                        {
                            $match: {
                                region: { $in: newOrder.filter.regions },
                                absent: false,
                                plusAmount: { $lt: 2 },
                                onlyForInstitute: false,
                                isReleased: false,
                                noAddress: false,
                                gender: "Female"
                            }
                        },

                        { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                    ]);

                }
                if (newOrder.filter.genderFilter == 'Male') {
                    seniorsOneRegion = await NewYear.aggregate([
                        {
                            $match: {
                                region: { $in: newOrder.filter.regions },
                                absent: false,
                                plusAmount: { $lt: 2 },
                                onlyForInstitute: false,
                                isReleased: false,
                                noAddress: false,
                                gender: "Male"
                            }
                        },

                        { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                    ]);
                }






                /*                   let seniorsOneRegionMale =  await NewYear.aggregate(
                                    {
                                        $match : { region: newOrder.filter.regions, gender: "Male" }
                                      },
                                      [
                                    { $group : { _id : "$nursingHome", count: { $sum: 1 } } }
                                  ]); */


                console.log("seniorsOneRegion");
                console.log(seniorsOneRegion);
                console.log("seniorsOneRegionFemale");
                console.log(seniorsOneRegionFemale);

                let foundAmount = 0;
                if (seniorsOneRegion.length > 0) {

                    for (let item of seniorsOneRegion) {
                        foundAmount += item.count;
                    }
                    console.log("foundAmount");
                    console.log(foundAmount);
                }

                console.log("foundAmount");
                console.log(foundAmount);

                if (foundAmount < newOrder.amount) {
                    if (newOrder.filter.spareRegions) {
                        let result = await spareRegions(newOrder.filter.regions[0], newOrder.amount, proportion.oneHouse, newOrder.filter.genderFilter);
                        console.log("result");
                        console.log(result);
                        if (result.proportionOneHouse == 0) {
                            return {
                                result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                                success: false

                            }
                        } else {
                            proportion.oneHouse = result.proportionOneHouse;
                            newOrder.filter.regions = result.regions;
                        }

                    } else {
                        return {
                            result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + foundAmount,
                            success: false

                        }
                    }
                } else if (newOrder.filter.genderFilter == 'any' && seniorsOneRegionFemale.findIndex(item => item.count > 0) == -1 && newOrder.filter.spareRegions) {
                    let result = await spareRegions(newOrder.filter.regions[0], newOrder.amount, proportion.oneHouse, newOrder.filter.genderFilter);
                    if (result.proportionOneHouse == 0) {
                        return {
                            result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                            success: false

                        }
                    } else {
                        proportion.oneHouse = result.proportionOneHouse;
                        newOrder.filter.regions = result.regions;
                    }
                } else {
                    console.log("proportion.oneHouse_1");
                    console.log(proportion.oneHouse);

                    let controlAmount = newOrder.amount;

                    for (let homeAmount of seniorsOneRegion) {
                        controlAmount = homeAmount.count > proportion.oneHouse ? controlAmount - proportion.oneHouse : controlAmount - homeAmount.count;
                        if (controlAmount <= 0) break;
                    }

                    if (controlAmount > 0) {
                        if (!newOrder.filter.spareRegions) {

                            if (seniorsOneRegion.length < Math.ceil(newOrder.amount / proportion.oneHouse)) {
                                proportion.oneHouse = Math.ceil(newOrder.amount / seniorsOneRegion.length);
                            }

                            console.log("proportion.oneHouse_2");
                            console.log(proportion.oneHouse);

                            controlAmount = newOrder.amount;
                            for (let homeAmount of seniorsOneRegion) {
                                controlAmount = homeAmount.count > proportion.oneHouse ? controlAmount - proportion.oneHouse : controlAmount - homeAmount.count;
                                if (controlAmount <= 0) break;
                            }
                            if (controlAmount > 0) {
                                proportion.oneHouse = proportion.oneHouse + controlAmount;
                            }

                        } else {
                            let result = await spareRegions(newOrder.filter.regions[0], newOrder.amount, proportion.oneHouse, newOrder.filter.genderFilter);
                            if (result.proportionOneHouse == 0) {
                                return {
                                    result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                                    success: false

                                }
                            } else {
                                proportion.oneHouse = result.proportionOneHouse;
                                newOrder.filter.regions = result.regions;
                            }

                        }
                    }
                }
            }

            async function spareRegions(region, amount, proportionOneHouse, genderFilter) {

                let spareRegions = await Region.findOne({ name: region });
                console.log("spareRegions");
                console.log(spareRegions);

                let regions = [region, ...spareRegions.spareRegions];

                let seniorsOneRegion = [];

                if (genderFilter == 'any') {
                    seniorsOneRegion = await NewYear.aggregate([
                        {
                            $match: {
                                region: { $in: newOrder.filter.regions },
                                absent: false,
                                plusAmount: { $lt: 2 },
                                onlyForInstitute: false,
                                isReleased: false,
                                noAddress: false,
                                //  secondTime: data.maxPlus > 1 ? true : false,
                            }
                        },

                        { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                    ]);
                }

                if (genderFilter == 'Female') {
                    seniorsOneRegion = await NewYear.aggregate([
                        {
                            $match: {
                                region: { $in: newOrder.filter.regions },
                                absent: false,
                                plusAmount: { $lt: 2 },
                                onlyForInstitute: false,
                                isReleased: false,
                                noAddress: false,
                                gender: "Female"
                            }
                        },

                        { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                    ]);

                }
                if (genderFilter == 'Male') {
                    seniorsOneRegion = await NewYear.aggregate([
                        {
                            $match: {
                                region: { $in: newOrder.filter.regions },
                                absent: false,
                                plusAmount: { $lt: 2 },
                                onlyForInstitute: false,
                                isReleased: false,
                                noAddress: false,
                                gender: "Male"
                            }
                        },

                        { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                    ]);
                }

                let foundAmount = 0;
                foundAmount = seniorsOneRegion.forEach(item => {
                    foundAmount += item.count;
                });

                if (foundAmount < amount) {
                    proportionOneHouse = 0;
                } else {
                    if (seniorsOneRegion.length < Math.ceil(amount / proportionOneHouse)) {
                        proportionOneHouse = Math.ceil(amount / seniorsOneRegion.length);
                    }
                    let controlAmount = amount;
                    for (let homeAmount of seniorsOneRegion) {
                        controlAmount = homeAmount.count > proportionOneHouse ? controlAmount - proportionOneHouse : controlAmount - homeAmount.count;
                        if (controlAmount <= 0) break;
                    }

                    if (controlAmount > 0) {
                        proportionOneHouse = proportionOneHouse + controlAmount;
                    }

                }

                return {
                    proportionOneHouse: proportionOneHouse,
                    regions: regions
                };
            }




            //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
            console.log("newOrder.filter.regions");
            console.log(newOrder.filter.regions);

            console.log("proportion.oneHouse");
            console.log(proportion.oneHouse);

            console.log("proportionSEE");
            console.log(proportion);

            //  if (!newOrder.filter.onlyWithPicture && newOrder.filter.regions.length == 0 && !newOrder.filter.nursingHome && newOrder.amount < 21) proportion.oneRegion = Math.ceil(newOrder.amount * 0.33);

        }

    }


    if (newOrder.filter.genderFilter == 'proportion') {

        let oldWomenAmount, oldMenAmount, specialWomenAmount, specialMenAmount, yangWomenAmount, yangMenAmount, oneHouse;
        /*       if (!newOrder.filter.maxNoAddress) { */
        oldWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.5);
        oldMenAmount = Math.round(newOrder.filter.maleAmount * 0.5);
        specialWomenAmount = Math.round(newOrder.filter.femaleAmount * 0.2);
        specialMenAmount = Math.round(newOrder.filter.maleAmount * 0.2);
        yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
        yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;
        oneHouse = Math.round(newOrder.amount * 0.2) ? Math.round(newOrder.amount * 0.2) : 1;
        oneHouse = oneHouse < 4 ? oneHouse : 3;

        /*   
              } else {
          
                specialWomenAmount = Math.ceil(newOrder.filter.femaleAmount / newOrder.amount * newOrder.filter.maxNoAddress);
                specialMenAmount = newOrder.filter.maxNoAddress - specialWomenAmount;
                oldWomenAmount = Math.round((newOrder.filter.femaleAmount - specialWomenAmount) * 0.5);
                oldMenAmount = Math.round((newOrder.filter.maleAmount - specialMenAmount) * 0.5);
                yangWomenAmount = newOrder.filter.femaleAmount - oldWomenAmount - specialWomenAmount;
                yangMenAmount = newOrder.filter.maleAmount - oldMenAmount - specialMenAmount;
              } */
        proportion = {
            "amount": newOrder.amount,
            "oldWomen": oldWomenAmount,
            "oldMen": oldMenAmount,
            "specialWomen": specialWomenAmount,
            "specialMen": specialMenAmount,
            "yangWomen": yangWomenAmount,
            "yangMen": yangMenAmount,
            "oneHouse": oneHouse,
            "oneRegion": Math.ceil(newOrder.amount * 0.33)
        }

        console.log("newOrder.filter");
        console.log(newOrder.filter);

        if ((newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]) || newOrder.amount > 20) { //newOrder.filter.nursingHome ||  newOrder.filter.onlyWithPicture ||
            proportion.oneRegion = undefined;
            //  proportion.oneHouse = undefined;

        }

        if (newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]) { //newOrder.filter.nursingHome ||  newOrder.filter.onlyWithPicture ||

            if (newOrder.amount > 40)
                proportion.oneHouse = 10;
            if (newOrder.amount <= 40)
                proportion.oneHouse = 8;
            if (newOrder.amount <= 30)
                proportion.oneHouse = 6;
            if (newOrder.amount <= 20)
                proportion.oneHouse = 5;
            if (newOrder.amount <= 15)
                proportion.oneHouse = 4;
            if (newOrder.amount <= 5)
                proportion.oneHouse = 3;

            console.log("proportion.oneHouse newOrder.filter.regions.length > 0");
            console.log(proportion.oneHouse);
            console.log(newOrder.filter.regions);

            //proportion.oneHouse = undefined;

            let seniorsOneRegion = await NewYear.aggregate([
                {
                    $match: {
                        region: { $in: newOrder.filter.regions },
                        absent: false,
                        plusAmount: { $lt: 2 },
                        onlyForInstitute: false,
                        isReleased: false,
                        noAddress: false,
                        //  secondTime: data.maxPlus > 1 ? true : false,
                    }
                },

                { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
            ]);

            let seniorsOneRegionFemale = await NewYear.aggregate([
                {
                    $match: {
                        region: { $in: newOrder.filter.regions },
                        absent: false,
                        plusAmount: { $lt: 2 },
                        onlyForInstitute: false,
                        isReleased: false,
                        noAddress: false,
                        gender: "Female"
                    }
                },

                { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
            ]);

            let seniorsOneRegionMale = await NewYear.aggregate(
                [{
                    $match: {
                        region: { $in: newOrder.filter.regions },
                        absent: false,
                        plusAmount: { $lt: 2 },
                        onlyForInstitute: false,
                        isReleased: false,
                        noAddress: false,
                        gender: "Male"
                    }
                },

                { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                ]);


            console.log("seniorsOneRegion");
            console.log(seniorsOneRegion);
            console.log("seniorsOneRegionFemale");
            console.log(seniorsOneRegionFemale);

            let foundAmount = 0;
            if (seniorsOneRegion.length > 0) {

                for (let item of seniorsOneRegion) {
                    foundAmount += item.count;
                }
                console.log("foundAmount");
                console.log(foundAmount);
            }
            let foundFemale = 0;
            if (seniorsOneRegionFemale.length > 0) {
                for (let item of seniorsOneRegionFemale) {
                    foundFemale += item.count;
                }
            }

            console.log("foundFemale");
            console.log(foundFemale);

            let foundMale = 0;
            if (seniorsOneRegionMale.length > 0) {
                for (let item of seniorsOneRegionMale) {
                    foundMale += item.count;
                }
            }



            if (foundAmount < newOrder.amount) {
                if (newOrder.filter.spareRegions) {
                    let result = await spareRegionsGender(newOrder.filter.regions[0], newOrder.amount, newOrder.filter.femaleAmount, newOrder.filter.maleAmount, proportion.oneHouse);
                    console.log("result");
                    console.log(result);
                    if (result.proportionOneHouse == 0) {
                        return {
                            result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                            success: false

                        }
                    } else {
                        proportion.oneHouse = result.proportionOneHouse;
                        newOrder.filter.regions = result.regions;
                    }

                } else {
                    return {
                        result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                        success: false

                    }
                }
            } else if (foundFemale < newOrder.filter.femaleAmount || foundMale < newOrder.filter.maleAmount) {
                if (!newOrder.filter.spareRegions) {
                    return {
                        result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                        success: false

                    }
                } else {
                    let result = await spareRegionsGender(newOrder.filter.regions[0], newOrder.amount, newOrder.filter.femaleAmount, newOrder.filter.maleAmount, proportion.oneHouse);
                    if (result.proportionOneHouse == 0) {
                        return {
                            result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                            success: false

                        }
                    } else {
                        proportion.oneHouse = result.proportionOneHouse;
                        newOrder.filter.regions = result.regions;
                    }
                }

            } else {
                let controlAmount = newOrder.amount;
                let controlAmountFemale = newOrder.filter.femaleAmount;
                let controlAmountMale = newOrder.filter.maleAmount;
                let proportionOneHouseFemale = Math.round(newOrder.filter.femaleAmount / newOrder.amount * proportion.oneHouse);
                let proportionOneHouseMale = proportion.oneHouse - proportionOneHouseFemale;


                for (let homeAmount of seniorsOneRegionFemale) {
                    controlAmountFemale = homeAmount.count > proportionOneHouseFemale ? controlAmountFemale - proportionOneHouseFemale : controlAmountFemale - homeAmount.count;
                    if (controlAmountFemale <= 0) break;
                }
                for (let homeAmount of seniorsOneRegionMale) {
                    controlAmountMale = homeAmount.count > proportionOneHouseMale ? controlAmountMale - proportionOneHouseMale : controlAmountMale - homeAmount.count;
                    if (controlAmountMale <= 0) break;
                }

                console.log("controlAmountFemale");
                console.log(controlAmountFemale);
                console.log("controlAmountMale");
                console.log(controlAmountMale);

                console.log("proportion.oneHouse_0");
                console.log(proportion.oneHouse);

                if (controlAmountFemale > 0 || controlAmountMale > 0) {
                    if (!newOrder.filter.spareRegions) {
                        if (seniorsOneRegion.length < Math.ceil(newOrder.amount / proportion.oneHouse)) {
                            proportion.oneHouse = Math.ceil(newOrder.amount / seniorsOneRegion.length);
                        }
                        let proportionOneHouseFemale = Math.round(newOrder.filter.femaleAmount / newOrder.amount * proportion.oneHouse);
                        let proportionOneHouseMale = proportion.oneHouse - proportionOneHouseFemale;

                        controlAmount = newOrder.amount;
                        controlAmountFemale = newOrder.filter.femaleAmount;
                        controlAmountMale = newOrder.filter.maleAmount;

                        console.log("proportion.oneHouse_1");
                        console.log(proportion.oneHouse);
                        console.log("proportionOneHouseFemale");
                        console.log(proportionOneHouseFemale);
                        console.log("proportionOneHouseMale");
                        console.log(proportionOneHouseMale);

                        for (let homeAmount of seniorsOneRegionFemale) {
                            controlAmountFemale = homeAmount.count > proportionOneHouseFemale ? controlAmountFemale - proportionOneHouseFemale : controlAmountFemale - homeAmount.count;
                            if (controlAmountFemale <= 0) break;
                        }
                        for (let homeAmount of seniorsOneRegionMale) {
                            controlAmountMale = homeAmount.count > proportionOneHouseMale ? controlAmountMale - proportionOneHouseMale : controlAmountMale - homeAmount.count;
                            if (controlAmountMale <= 0) break;
                        }

                        console.log("controlAmountFemale");
                        console.log(controlAmountFemale);
                        console.log("controlAmountMale");
                        console.log(controlAmountMale);

                        proportion.oneHouse = proportion.oneHouse + (controlAmountFemale > 0 ? controlAmountFemale : 0) + (controlAmountMale > 0 ? controlAmountMale : 0);

                        console.log("proportion.oneHouse_2");
                        console.log(proportion.oneHouse);


                    } else {
                        let result = await spareRegionsGender(newOrder.filter.regions[0], newOrder.amount, newOrder.filter.femaleAmount, newOrder.filter.maleAmount, proportion.oneHouse);
                        if (result.proportionOneHouse == 0) {
                            return {
                                result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
                                success: false

                            }
                        } else {
                            proportion.oneHouse = result.proportionOneHouse;
                            newOrder.filter.regions = result.regions;
                        }

                    }
                }
            }
        }

        async function spareRegionsGender(region, amount, femaleAmount, maleAmount, proportionOneHouse) {

            let spareRegions = await Region.findOne({ name: region });
            console.log("spareRegions");
            console.log(spareRegions);

            let regions = [region, ...spareRegions.spareRegions];

            let seniorsOneRegion = await NewYear.aggregate([
                {
                    $match: {
                        region: { $in: regions },
                        absent: false,
                        plusAmount: { $lt: 2 },
                        onlyForInstitute: false,
                        isReleased: false,
                        noAddress: false,
                    }
                },

                { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
            ]);

            console.log("seniorsOneRegion");
            console.log(seniorsOneRegion);

            let seniorsOneRegionFemale = await NewYear.aggregate([
                {
                    $match: {
                        region: { $in: regions },
                        absent: false,
                        plusAmount: { $lt: 2 },
                        onlyForInstitute: false,
                        isReleased: false,
                        noAddress: false,
                        gender: "Female"
                    }
                },

                { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
            ]);

            let seniorsOneRegionMale = await NewYear.aggregate(
                [{
                    $match: {
                        region: { $in: regions },
                        absent: false,
                        plusAmount: { $lt: 2 },
                        onlyForInstitute: false,
                        isReleased: false,
                        noAddress: false,
                        gender: "Male"
                    }
                },

                { $group: { _id: "$nursingHome", count: { $sum: 1 } } }
                ]);

            let foundAmount = 0;
            if (seniorsOneRegion.length > 0) {
                for (let item of seniorsOneRegion) {
                    foundAmount += item.count;
                }
            }

            let foundFemale = 0;
            if (seniorsOneRegionFemale.length > 0) {
                for (let item of seniorsOneRegionFemale) {
                    foundFemale += item.count;
                }
            }

            let foundMale = 0;
            if (seniorsOneRegionMale.length > 0) {
                for (let item of seniorsOneRegionMale) {
                    foundMale += item.count;
                }
            }


            if (foundAmount < amount || foundFemale < femaleAmount || foundMale < maleAmount) {
                proportionOneHouse = 0;
            } else {

                if (seniorsOneRegion.length < Math.ceil(amount / proportionOneHouse)) {
                    proportionOneHouse = Math.ceil(amount / seniorsOneRegion.length);
                }


                let controlAmountFemale = femaleAmount;
                let controlAmountMale = maleAmount;
                let proportionOneHouseFemale = Math.round(femaleAmount / newOrder.amount * proportionOneHouse);
                let proportionOneHouseMale = proportionOneHouse - proportionOneHouseFemale;
                console.log("proportionOneHouseFemale");
                console.log(proportionOneHouseFemale);
                console.log("proportionOneHouseMale");
                console.log(proportionOneHouseMale);


                for (let homeAmount of seniorsOneRegionFemale) {
                    console.log("homeAmount.count");
                    console.log(homeAmount.count);
                    controlAmountFemale = homeAmount.count > proportionOneHouseFemale ? controlAmountFemale - proportionOneHouseFemale : controlAmountFemale - homeAmount.count;
                    console.log("controlAmountFemale");
                    console.log(controlAmountFemale);
                    if (controlAmountFemale <= 0) break;
                }
                for (let homeAmount of seniorsOneRegionMale) {
                    console.log("homeAmount.count");
                    console.log(homeAmount.count);
                    controlAmountMale = homeAmount.count > proportionOneHouseMale ? controlAmountMale - proportionOneHouseMale : controlAmountMale - homeAmount.count;
                    console.log("controlAmountMale");
                    console.log(controlAmountMale);
                    if (controlAmountMale <= 0) break;
                }

                console.log("controlAmountFemale");
                console.log(controlAmountFemale);
                console.log("controlAmountMale");
                console.log(controlAmountMale);
                console.log("proportion.oneHouse_3");
                console.log(proportionOneHouse);



                if (controlAmountFemale > 0 || controlAmountMale > 0) {
                    proportionOneHouse = proportionOneHouse + (controlAmountFemale > 0 ? controlAmountFemale : 0) + (controlAmountMale > 0 ? controlAmountMale : 0);
                }

                console.log("proportion.oneHouse_4");
                console.log(proportionOneHouse);

            }

            return {
                proportionOneHouse: proportionOneHouse,
                regions: regions
            };
        }




        //if (newOrder.filter.nursingHome || newOrder.filter.onlyWithPicture ) proportion.oneHouse = undefined;
        console.log("newOrder.filter.regions");
        console.log(newOrder.filter.regions);

        console.log("proportion.oneHouse");
        console.log(proportion.oneHouse);

        console.log("proportionSEE");
        console.log(proportion);
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
    // console.log("emptyOrder.dateOfOrder");
    //console.log(emptyOrder.dateOfOrder);

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


        //  console.log("proportion");
        //  console.log(proportion);

        if (newOrder.filter.onlyWithPicture) filter.linkPhoto = { $ne: null };
        if (newOrder.filter.onlyAnniversaries) filter.specialComment = /Юбилей/;
        if (newOrder.filter.onlyAnniversariesAndOldest) filter.$or = [{ specialComment: /Юбилей/ }, { oldest: true }];

        console.log("newOrder.filter.regions.length");
        console.log(newOrder.filter.regions.length);
        if (newOrder.filter.regions.length > 0 && newOrder.filter.regions[0]) filter.region = { $in: newOrder.filter.regions };
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
        seniorsData = await fillOrderNewYear(proportion, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter);

    }

    if (seniorsData.celebratorsAmount < newOrder.amount) {

        await deleteErrorPlusNewYear(order_id);
        /*         if (filter.region) {
                    proportion.oneHouse = proportion.oneHouse * 2;
                    seniorsData = await fillOrderNewYear(proportion, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter);
                    if (seniorsData.celebratorsAmount < newOrder.amount) {
                        await deleteErrorPlusNewYear(order_id);
                        proportion.oneHouse = proportion.oneHouse * 2;
                        seniorsData = await fillOrderNewYear(proportion, order_id, filter, prohibitedId, restrictedHouses, newOrder.filter);
                        if (seniorsData.celebratorsAmount < newOrder.amount) {
                            await deleteErrorPlusNewYear(order_id);
                            return {
                                result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,
                                success: false
        
                            }
                        }
                    }
                }
         */
        return {
            result: `Обратитесь к администратору. Заявка не сформирована. Недостаточно адресов для вашего запроса.`,// Требуемых адресов только ` + seniorsData.celebratorsAmount,
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
    restrictedHouses.push("ПОРЕЧЬЕ-РЫБНОЕ");
    restrictedHouses.push("ЖУКОВКА");
    restrictedHouses.push("СОСНОВКА");
    restrictedHouses.push("БИЙСК");
    restrictedHouses.push("ВОРОНЕЖ_ДНЕПРОВСКИЙ");
    restrictedHouses.push("КАШИРСКОЕ");
    restrictedHouses.push("ПЕРВОМАЙСКИЙ_СОТРУДНИКИ");
    restrictedHouses.push("САВИНСКИЙ");

    /*  restrictedHouses.push("СЕВЕРОДВИНСК");
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


            /*
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


//set restrictions for searching 789

async function collectSeniorsNewYear(data, orderFilter) {

    let searchOrders = {};
    //console.log("data.category");
    //console.log(data.category);
    //   console.log("data.proportion.oneHouseSEE");
    //  console.log(data.proportion.oneHouse);

    if (orderFilter.genderFilter != 'proportion') {

        /*       if (data.filter.addressFilter != 'onlySpecial') {
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
          
                  if (data.filter.addressFilter == 'forKids') { */
        searchOrders = {
            oldWomen: ["oldWomen", "yangWomen", "oldMen", "yangMen"],
            oldMen: ["oldMen", "yangMen", "oldWomen", "yangWomen"],
            yangWomen: ["yangWomen", "oldWomen", "oldMen", "yangMen"],
            yangMen: ["yangMen", "yangWomen", "oldMen", "oldWomen"]
        }
        /*          }
           
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
        
                  specialWomen: ["specialWomen", "specialMen"],
                  specialMen: ["specialMen", "specialWomen"],
                };
              } */
    }

    if (orderFilter.genderFilter == 'proportion') {
        /*       if (orderFilter.addressFilter != 'onlySpecial') {
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
                  if (data.filter.addressFilter == 'forKids') { */
        searchOrders = {
            oldWomen: ["oldWomen", "yangWomen"],
            oldMen: ["oldMen", "yangMen"],
            yangWomen: ["yangWomen", "oldWomen"],
            yangMen: ["yangMen", "oldMen"]
        }
        /*           }
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
        
                  specialWomen: ["specialWomen"],
                  specialMen: ["specialMen"],
                };
              } */
    }

    //console.log("searchOrders");
    //console.log(searchOrders);


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
                //console.log("data.proportion.oneHouse");
                //console.log(data.proportion.oneHouse);
                if (data.proportion.oneHouse) data.houses[result["nursingHome"]] = (!data.houses[result["nursingHome"]]) ? 1 : data.houses[result["nursingHome"]] + 1;
                if (data.proportion.oneRegion) data.regions[result["region"]] = (!data.regions[result["region"]]) ? 1 : data.regions[result["region"]] + 1;
                // console.log("data.regions");
                //  console.log(data.regions);

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
        onlyForInstitute: false,
        noAddress: false,
        isReleased: false,

    };

    // console.log("data.restrictedHousesSEE");
    //console.log(data.restrictedHouses);

    if (data.proportion.oneRegion) standardFilter.region = { $nin: data.restrictedRegions };
    if (kind == 'oldest') { standardFilter.oldest = true; } else { standardFilter.category = kind; }
    /*   if ( (!data.filter.nursingHome)) {//(data.proportion.amount > 12 || data.proportion.amount < 5) &&
        //standardFilter.isReleased = false;
      }  */
    /*   if ((data.proportion.amount > 12 || data.proportion.amount < 5) && (!data.filter.nursingHome)) {
        standardFilter.isReleased = false;
      } */
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
        //filter.firstName = "Нэлли";
        //filter.comment1 = "(2 корп. 5 этаж)"; //CANCEL
        // filter.comment1 = {$ne: "(отд. 4)"}; //CANCEL
        // filter.comment2 = /труда/; //CANCEL
        //filter.comment1 = /верующ/; //CANCEL
        // filter.nursingHome = { $in: ["ВЕРХНЕУРАЛЬСК", "ВАЛДАЙ", "ЯГОТИНО", "БЕРДСК", "САВИНСКИЙ", "ДУБНА_ТУЛЬСКАЯ", "ДУБНА", "КАНДАЛАКША", "САДОВЫЙ", "ЯГОТМОЛОДОЙ_ТУДИНО", "КРАСНОЯРСК", "СОЛИКАМСК_ДУБРАВА", "ЧЕРНЫШЕВКА",] }
        //filter.region = {$in: ["АРХАНГЕЛЬСКАЯ", "МОСКОВСКАЯ", "МОРДОВИЯ", ]};
        //
        // console.log("filter");
        // console.log(filter);
        celebrator = await NewYear.findOne(filter);
        //  console.log("celebrator NewYear");
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

////////////////////////////////////////////////////BIRTHDAY INSTITUTES

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

    if (!filter.region && filter.addressFilter == 'any') {
        activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, isReleased: false, });
    }
    if (filter.region && !filter.spareRegions && filter.addressFilter == 'any') {
        filter.region = [filter.region];
        activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, isReleased: false, region: { $in: filter.region } });

    }
    if (filter.region && filter.spareRegions && filter.addressFilter == 'any') {
        let spareRegions = await Region.findOne({ name: filter.region });
        console.log("spareRegions");
        console.log(spareRegions);
        filter.region = [filter.region, ...spareRegions.spareRegions];
        activeHouse = await House.find({ isReleased: false, isActive: true, nursingHome: { $nin: restrictedHouses }, isReleased: false, region: { $in: filter.region } });

    }

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
          'ПРУДНОЕ',        
          
          
          
  
      
          
  
  
        ]
      } });*/
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
            count = await List.find({
                nursingHome: house.nursingHome,
                //gender: "Female",
                absent: false, plusAmount: { $lt: 4 }, _id: { $nin: prohibitedId }
            }).countDocuments();
        }

        if (holiday == "Дни рождения мая 2025") {
            count = await ListNext.find({
                nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 }, _id: { $nin: prohibitedId }
            }).countDocuments();
        }


        if (holiday == "Дни рождения марта 2025") {
            count = await ListBefore.find({
                nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 4 }, _id: { $nin: prohibitedId }
            }).countDocuments();
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

        if (holiday == "Новый год 2025" && !filter.region) { //&& filter.addressFilter == "noSpecial"
            count = await NewYear.find({
                nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 }, _id: { $nin: prohibitedId }, secondTime: true//forInstitute: 0, finished: falseonlyForInstitute: true, 
                // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
            }).countDocuments();
        }

        if (holiday == "Новый год 2025" && filter.region) {// && filter.addressFilter == "noSpecial"
            count = await NewYear.find({
                nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 }, _id: { $nin: prohibitedId }, secondTime: true//forInstitute: 0, finished: falseonlyForInstitute: true
                // nursingHome: house.nursingHome, absent: false, plusAmount: { $lt: 2 } // ИСПРАВИТЬ 
            }).countDocuments();
        }


        console.log("house.nursingHome");
        console.log(house.nursingHome);

        console.log("count");
        console.log(count);

        if (count == amount) {
            seniorsData = await collectSeniorsForInstitution(order_id, holiday, amount, house.nursingHome, prohibitedId, region);
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
        seniorsData = await collectSeniorsForInstitution(order_id, holiday, amount, biggerHouse, prohibitedId, region);
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
                let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[index].amount, smallerHouses[index].nursingHome, prohibitedId, region);
                seniorsData = [...seniorsData, ...seniors];
                currentAmount -= smallerHouses[index].amount;
                return seniorsData;
            } else {
                if (currentAmount - smallerHouses[i].amount <= 0) {
                    let seniors = await collectSeniorsForInstitution(order_id, holiday, currentAmount, smallerHouses[i].nursingHome, prohibitedId, region);
                    seniorsData = [...seniorsData, ...seniors];
                    currentAmount -= currentAmount;
                    return seniorsData;
                } else {
                    if (currentAmount - smallerHouses[i].amount >= 3) { // ИСПРАВИТЬ на 3
                        let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[i].amount, smallerHouses[i].nursingHome, prohibitedId, region);
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
                let seniors1 = await collectSeniorsForInstitution(order_id, holiday, amount1, smallerHouses[index1].nursingHome, prohibitedId, region);
                seniorsData = [...seniorsData, ...seniors1];
                let seniors2 = await collectSeniorsForInstitution(order_id, holiday, amount2, smallerHouses[index2].nursingHome, prohibitedId, region);
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
                let seniors1 = await collectSeniorsForInstitution(order_id, holiday, amount1, smallerHouses[index1].nursingHome, prohibitedId, region);
                seniorsData = [...seniorsData, ...seniors1];

                let seniors2 = await collectSeniorsForInstitution(order_id, holiday, amount2, smallerHouses[index2].nursingHome, prohibitedId, region);
                seniorsData = [...seniorsData, ...seniors2];

                let seniors3 = await collectSeniorsForInstitution(order_id, holiday, amount3, smallerHouses[index3].nursingHome, prohibitedId, region);
                seniorsData = [...seniorsData, ...seniors3];

                return seniorsData;
            }
            amount1--;
            amount2++;
        }

        for (let i = 0; i < smallerHouses.length; i++) {
            let index = smallerHouses.findIndex((item, idx) => item.amount == currentAmount && idx >= i);

            if (index != -1 && index >= i) {
                let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[index].amount, smallerHouses[index].nursingHome, prohibitedId, region);
                seniorsData = [...seniorsData, ...seniors];
                currentAmount -= smallerHouses[index].amount;
                return seniorsData;
            } else {
                if (currentAmount - smallerHouses[i].amount <= 0) {
                    let seniors = await collectSeniorsForInstitution(order_id, holiday, currentAmount, smallerHouses[i].nursingHome, prohibitedId, region);
                    seniorsData = [...seniorsData, ...seniors];
                    currentAmount -= currentAmount;
                    return seniorsData;
                } else {
                    if (currentAmount - smallerHouses[i].amount >= 3) {
                        let seniors = await collectSeniorsForInstitution(order_id, holiday, smallerHouses[i].amount, smallerHouses[i].nursingHome, prohibitedId, region);
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


async function collectSeniorsForInstitution(order_id, holiday, amount, nursingHome, prohibitedId, region) {

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

    if (holiday == "Новый год 2025") {
        if (!region) {
            seniorsData = await NewYear.find({
                //forInstitute: 0,
                nursingHome: nursingHome,
                absent: false,
                plusAmount: { $lt: 2 },
                _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                //finished: false,   
                //onlyForInstitute: true,
                secondTime: true
            }).limit(amount);
        }
        if (region) {
            seniorsData = await NewYear.find({
                nursingHome: nursingHome,
                absent: false,
                plusAmount: { $lt: 2 },
                _id: { $nin: prohibitedId }, // ИСПРАВИТЬ
                //onlyForInstitute: true, 
                // forInstitute: 0,
                //finished: false,
                secondTime: true
            }).limit(amount);
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


    if (holiday == "Дни рождения мая 2025") {

        seniorsData = await ListNext.find({
            nursingHome: nursingHome,
            absent: false,
            plusAmount: { $lt: 2 },
            _id: { $nin: prohibitedId }
        }).limit(amount);

        console.log("seniorsData");
        console.log(nursingHome);
        console.log(seniorsData.length);


        for (let senior of seniorsData) {
            await ListNext.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        }
    }


    if (holiday == "Дни рождения апреля 2025") {

        seniorsData = await List.find({
            //gender: "Female", 
            nursingHome: nursingHome,
            absent: false,
            plusAmount: { $lt: 4 },
            _id: { $nin: prohibitedId }
        }).limit(amount);

        for (let senior of seniorsData) {
            await List.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
            console.log("BIRTHDAY INSTITUTES");
            console.log(senior._id);

        }
    }

    if (holiday == "Дни рождения марта 2025") {

        seniorsData = await ListBefore.find({
            nursingHome: nursingHome,
            absent: false,
            plusAmount: { $lt: 4 },
            _id: { $nin: prohibitedId }
        }).limit(amount);

        for (let senior of seniorsData) {
            await ListBefore.updateOne({ _id: senior._id }, { $inc: { plusAmount: 1 } }, { upsert: false });
        }

    }

    await Order.updateOne({ _id: order_id }, { $push: { temporaryLineItems: seniorsData } }, { upsert: false });

    return seniorsData;
}

//////////////////////////////////////////////////



module.exports = router;