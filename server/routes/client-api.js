/*
============================================
; APIs for the client APIs
;===========================================
*/

const express = require("express");
const bcrypt = require("bcryptjs");
const Client = require("../models/client");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const saltRounds = 10;
const Order = require("../models/order");


///check doubles

router.post("/check-double", async (req, res) => {
  try {
    console.log("/check-double");
    const newClient = req.body.newClient;
    const clientId = req.body.id;


    const phoneRe = /^((\+7)+([0-9]){10})$/;

    let regExpEM = newClient.email ? new RegExp('^' + newClient.email.toString() + '$', 'i') : null;
    let regExpPN = newClient.phoneNumber ? newClient.phoneNumber : null;
    let regExpWA = newClient.whatsApp ? newClient.whatsApp : null;
    let regExpTG = null;
    if (newClient.telegram) regExpTG = phoneRe.test(newClient.telegram) ? newClient.telegram : new RegExp('^' + newClient.telegram.toString() + '$', 'i');
    console.log("regExpTG");
    console.log(regExpTG);
    let regExpVK = newClient.vKontakte ? new RegExp('^' + newClient.vKontakte.toString() + '$', 'i') : null;
    let regExpIG = newClient.instagram ? new RegExp('^' + newClient.instagram.toString() + '$', 'i') : null;
    let regExpFB = newClient.facebook ? new RegExp('^' + newClient.facebook.toString() + '$', 'i') : null;
    let regExpOC = null;
    //if (newClient.otherContact) regExpOC = phoneRe.test(newClient.otherContact) ? newClient.otherContact : new RegExp('^' + newClient.otherContact.toString() + '$', 'i');

    if (newClient.otherContact) regExpOC = newClient.otherContact.toLowerCase();



    let query = [];
    if (newClient.email) {
      query.push({ email: regExpEM });
    }


    if (newClient.phoneNumber && newClient.whatsApp && newClient.telegram) {
      query.push(
        { phoneNumber: regExpPN },
        { whatsApp: regExpWA },
        { telegram: regExpTG }
      );
    }
    if (newClient.phoneNumber && !newClient.whatsApp && !newClient.telegram) {
      query.push(
        { phoneNumber: regExpPN },
        { whatsApp: regExpPN },
        { telegram: regExpPN }
      );
    }
    if (!newClient.phoneNumber && newClient.whatsApp && !newClient.telegram) {
      query.push(
        { phoneNumber: regExpWA },
        { whatsApp: regExpWA },
        { telegram: regExpWA }
      );
    }
    if (
      !newClient.phoneNumber &&
      !newClient.whatsApp &&
      phoneRe.test(newClient.telegram)
    ) {
      query.push(
        { phoneNumber: regExpTG },
        { whatsApp: regExpTG },
        { telegram: regExpTG }
      );
    }
    if (
      !newClient.phoneNumber &&
      newClient.whatsApp &&
      phoneRe.test(newClient.telegram)
    ) {
      query.push(
        { phoneNumber: regExpTG },
        { telegram: regExpTG }
      );
    }
    if (
      newClient.phoneNumber &&
      !newClient.whatsApp &&
      phoneRe.test(newClient.telegram)
    ) {
      query.push(
        { whatsApp: regExpTG },
        { telegram: regExpTG }
      );
    }
    if (!newClient.phoneNumber && newClient.whatsApp && !newClient.telegram) {
      query.push(
        { phoneNumber: regExpWA },
        { whatsApp: regExpWA },
        { telegram: regExpWA }
      );
    }
    if (newClient.phoneNumber && newClient.whatsApp && !newClient.telegram) {
      query.push(
        { whatsApp: regExpWA },
        { telegram: regExpWA }
      );
    }
    if (!newClient.phoneNumber && newClient.whatsApp && newClient.telegram) {
      query.push(
        { phoneNumber: regExpWA },
        { whatsApp: regExpWA }
      );
    }

    if (newClient.telegram && !phoneRe.test(newClient.telegram)) {
      query.push({ telegram: regExpTG });
    }

    if (newClient.vKontakte) {
      query.push({ vKontakte: regExpVK });
    }
    if (newClient.instagram) {
      query.push({ instagram: regExpIG });
    }
    if (newClient.facebook) {
      query.push({ facebook: regExpFB });
    }
    if (newClient.otherContact) {
      query.push({ otherContact: regExpOC });
    }
    console.log("query");
    console.log(query);
    /*     
        console.log("queryToFind");
        console.log(queryToFind); */
    let doubles;
    if (clientId) {
      doubles = await Client.find({ _id: { $ne: clientId }, isDisabled: false, $or: query });
    } else {
      doubles = await Client.find({ isDisabled: false, $or: query });
    }

    console.log("doubles");
    console.log(doubles);
    const findAllListsResponse = new BaseResponse("200", "Query successful", doubles);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

//CreateClient API
router.post("/", async (req, res) => {
  try {


    //client object
    let newClient = {
      firstName: req.body.firstName,
      patronymic: req.body.patronymic,
      lastName: req.body.lastName,
      institutes: req.body.institutes,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      whatsApp: req.body.whatsApp,
      telegram: req.body.telegram,
      vKontakte: req.body.vKontakte,
      instagram: req.body.instagram,
      facebook: req.body.facebook,
      otherContact: req.body.otherContact,
      country: req.body.country,
      region: req.body.region,
      city: req.body.city,
      nameDayCelebration: req.body.nameDayCelebration,
      comments: req.body.comments,
      correspondents: req.body.correspondents,
      coordinators: req.body.coordinators,
      publishers: req.body.publishers,
      isRestricted: req.body.isRestricted,
      causeOfRestriction: req.body.causeOfRestriction,
      preventiveAction: req.body.preventiveAction,
    };

    let searchString = [];
    for (let key in newClient) {
      if (
        key == "firstName" ||
        key == "patronymic" ||
        key == "lastName" ||
        key == "email" ||
        key == "phoneNumber" ||
        key == "whatsApp" ||
        key == "telegram" ||
        key == "vKontakte" ||
        key == "instagram" ||
        key == "facebook" ||
        key == "otherContact" ||
        key == "country" ||
        key == "city" ||
        key == "region"
      ) {
        if (newClient[key]) { searchString.push(newClient[key]); }
      }
      if (key == "institutes") {
        for (let institute of newClient.institutes) {
          searchString.push(institute.name);
        }
      }
    }

    newClient.searchString = searchString;

    console.log(req.body);

    Client.create(newClient, function (err, client) {
      if (err) {
        console.log(err);
        const createClientMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(createClientMongodbErrorResponse.toObject());
      } else {
        console.log(client);
        const createClientResponse = new BaseResponse(200, "Query Successful", client);
        res.json(createClientResponse.toObject());
      }
    });
  } catch (e) {
    console.log(e);
    const createClientCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(createClientCatchErrorResponse.toObject());
  }
});

/**
 * API to find client by clientname (OK)
 */

router.get("/client/:clientName", async (req, res) => {
  try {
    Client.findOne({ clientName: req.params.clientName }, function (err, client) {
      if (err) {
        console.log(err);
        const readClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readClientMongodbErrorResponse.toObject());
      } else {
        if (!client) {
          const response = `Invalid clientname`;
          console.log(response);
          res.send(response);
        } else {
          const readClientResponse = new BaseResponse(200, "Query successful", client);
          console.log(client);
          res.json(readClientResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readClientCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readClientCatchErrorResponse.toObject());
  }
});

/**
 * API to find all clients (OK)
 */
router.get("/", async (req, res) => {
  try {
    Client.find({})
      .where("isDisabled")
      .equals(false)
      .exec(function (err, clients) {
        if (err) {
          console.log(err);
          const readClientsMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
          res.status(500).send(readClientsMongodbErrorResponse.toObject());
        } else {
          console.log(clients);
          const readClientsResponse = new BaseResponse(200, "Query successful", clients);
          res.json(readClientsResponse.toObject());
        }
      });
  } catch (e) {
    console.log(e);
    const readClientCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(readClientCatchErrorResponse.toObject());
  }
});

//update client API

router.put("/:id", async (req, res) => {
  try {
    Client.findOne({ _id: req.params.id }, function (err, client) {
      if (err) {
        console.log(err);
        const updateClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(updateClientMongodbErrorResponse.toObject());
      } else {
        console.log(client);
        let searchString = [];
        if (req.body.firstName) searchString.push(req.body.firstName);
        if (req.body.patronymic) searchString.push(req.body.patronymic);
        if (req.body.lastName) searchString.push(req.body.lastName);
        if (req.body.email) searchString.push(req.body.email);
        if (req.body.phoneNumber) searchString.push(req.body.phoneNumber);
        if (req.body.whatsApp) searchString.push(req.body.whatsApp);
        if (req.body.telegram) searchString.push(req.body.telegram);
        if (req.body.vKontakte) searchString.push(req.body.vKontakte);
        if (req.body.instagram) searchString.push(req.body.instagram);
        if (req.body.facebook) searchString.push(req.body.facebook);
        if (req.body.otherContact) searchString.push(req.body.otherContact);
        if (req.body.country) searchString.push(req.body.country);
        if (req.body.region) searchString.push(req.body.region);
        if (req.body.city) searchString.push(req.body.city);

        for (let institute of req.body.institutes) {
          searchString.push(institute.name);
        }

        client.set({

          firstName: req.body.firstName,
          patronymic: req.body.patronymic,
          lastName: req.body.lastName,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          whatsApp: req.body.whatsApp,
          telegram: req.body.telegram,
          vKontakte: req.body.vKontakte,
          instagram: req.body.instagram,
          facebook: req.body.facebook,
          otherContact: req.body.otherContact,
          country: req.body.country,
          region: req.body.region,
          city: req.body.city,
          // nameDayCelebration: req.body.nameDayCelebration,
          comments: req.body.comments,
          institutes: req.body.institutes,
          correspondents: req.body.correspondents,
          coordinators: req.body.coordinators,
          publishers: req.body.publishers,
          isRestricted: req.body.isRestricted,
          causeOfRestriction: req.body.causeOfRestriction,
          preventiveAction: req.body.preventiveAction,
          whatChanged: req.body.whatChanged,
          searchString: searchString
        });

        client.save(function (err, savedClient) {
          if (err) {
            console.log(err);
            const saveClientMongodbErrorResponse = new BaseResponse(200, "Query successful", savedClient);
            res.json(saveClientMongodbErrorResponse.toObject());
          } else {
            console.log(client);
            const createClientResponse = new BaseResponse(200, "Query successful", client);
            res.json(createClientResponse.toObject());
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    const updateClientCatchErrorResponse = BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(updateClientCatchErrorResponse.toObject());
  }
});

// Delete Client API 
router.patch("/delete/:id", async (req, res) => {
  try {
    let message = null;
    let orders = await Order.find({ clientId: req.params.id, isDisabled: false });
    if (orders.length > 0) {
      message = "Карточка поздравляющего не может быть удалена, так как на него оформлены заявки.";
    } else {
      let whatChangedNow = {
        userName: req.body.userName,
        date: new Date(),
        changed: [{
          isDisabledOld: false,
          isDisabledNew: true,
        }],
      }
      await Client.updateOne({ _id: req.params.id }, { $set: { isDisabled: true }, $push: { whatChanged: whatChangedNow } });


    }
    //console.log(req.body.isShowSubs);
    let updatedClients;
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let length;
    if (!req.body.isShowSubs) {
      length = await Client.countDocuments({ coordinators: req.body.userName, isDisabled: false });
      updatedClients = await Client.find(
        { coordinators: req.body.userName, isDisabled: false }
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ firstName: 1, lastName: 1, _id: 1 });
    } else {
      length = await Client.countDocuments({ coordinators: req.body.userName, isDisabled: false, publishers: req.body.userName });
      updatedClients = await Client.find(
        { coordinators: req.body.userName, isDisabled: false, publishers: req.body.userName }
      ).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ firstName: 1, lastName: 1, _id: 1 });
    }
    //let correctedOrders = correctDate(updatedClients);
    let result = {
      message: message,
      clients: updatedClients,
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

/**
 * API to find all clients by userName 
 */

router.get("/find/:userName", async (req, res) => {
  try {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
     const length = await Client.countDocuments({ coordinators:  req.params.userName, isDisabled: false }); 

    //const length = await Client.countDocuments({ isDisabled: false, institutes: { $ne: [] }, coordinators: "okskust" });
   Client.find({ coordinators: req.params.userName, isDisabled: false }, function (err, clients) { 

    //Client.find({ isDisabled: false, institutes: { $ne: [] }, coordinators: { $all: ["okskust"] } }, function (err, clients) {    //CANCEL!!!!
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
          clients: clients,
          length: length
        };
        const readUserResponse = new BaseResponse(
          200,
          "Query successful",
          result
        );
        //console.log(clients);
        res.json(readUserResponse.toObject());
      }
    }).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ firstName: 1, lastName: 1, _id: 1 });
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

//API to find subscribers by userName

router.get("/findSubscribers/:userName", async (req, res) => {
  try {
    console.log('req.query');
    console.log(req.query)
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    const length = await Client.countDocuments(
      { isDisabled: false, publishers: req.params.userName }
    )

    Client.find({ isDisabled: false, publishers: req.params.userName }, function (err, clients) {
      if (err) {
        console.log(err);

        const readUserMongodbErrorResponse = new BaseResponse(
          500,
          "Internal server error",
          err
        );
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {

        let result = {
          clients: clients,
          length: length
        };
        console.log('pageSize');
        console.log(pageSize)
        console.log('result');
        console.log(result.length);
        console.log("result.clients");
        console.log(result.clients);

        const readUserResponse = new BaseResponse(
          200,
          "Query successful",
          result
        );
        // console.log("findNotConfirmed");
        //console.log(orders);
        res.json(readUserResponse.toObject());
      }
    }).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ firstName: 1, lastName: 1, _id: 1 });;
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
 * API to find clients by search string 
 */

router.get("/search/:userName", async (req, res) => {
  try {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let valueToSearch = req.query.valueToSearch;
    console.log("req.query.valueToSearch");
    console.log(req.query.valueToSearch);
    console.log("valueToSearch");
    console.log(valueToSearch);

    //let searchParams = valueToSearch.split(" ");
    let searchParams = [valueToSearch];
    console.log("searchParams");
    console.log(searchParams);

    for (let i = 0; i < searchParams.length; i++) {
      //  par = "/" + par + "/i";
      const phoneRe = /^((\+7)+([0-9]){10})$/;

      searchParams[i] = phoneRe.test(searchParams[i]) ? searchParams[i] : new RegExp(searchParams[i].toString(), 'i');
      console.log(phoneRe.test(searchParams[i]));
    }

    console.log("searchParams");
    console.log(searchParams);
    const length = await Client.countDocuments({ coordinators: req.params.userName, isDisabled: false, searchString: { $all: searchParams } });
    Client.find({ coordinators: req.params.userName, isDisabled: false, searchString: { $all: searchParams } }, function (err, clients) {
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
        let resume = length ? true : false;

        let result = {
          found: resume,
          clients: clients,
          length: length
        };
        const readUserResponse = new BaseResponse(
          200,
          "Query successful",
          result
        );
        //console.log(clients);
        res.json(readUserResponse.toObject());
      }
    }).skip(pageSize * (currentPage - 1)).limit(pageSize).sort({ firstName: 1, lastName: 1, _id: 1 });
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
 * API to find all clients by userName 
 */

router.post("/add-institute/:id", async (req, res) => {
  console.log('router.post("/add-institute1"');
  try {

    console.log('router.post("/add-institute2"');
    //console.log();
    const id = req.params.id;
    const name = req.body.name;
    const category = req.body.category;
    const userName = req.body.userName;

    let clientOld = await Client.findOne({ _id: id });



    await Client.updateOne({ _id: id }, {
      $push: { institutes: { name: name, category: category }, searchString: name, }

    });
    let clientNew = await Client.findOne({ _id: id });

    await Client.updateOne({ _id: id }, {
      $push: {
        whatChanged: {
          userName: userName, date: new Date(), changed: [{
            institutesOld: clientOld.institutes,
            institutesNew: clientNew.institutes,
          }],
        }
      }
    });

    const readUserResponse = new BaseResponse(
      200,
      "Query successful",
      clientNew.institutes
    );
    res.json(readUserResponse.toObject());



  } catch (e) {
    console.log('router.post("/add-instituteERROR"');
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(
      500,
      "Internal server error",
      err
    );
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});


/* router.delete("/:id", async (req, res) => {
  try {
    Client.findOne({ _id: req.params.id }, function (err, client) {
      // If statement for Mongo error
      if (err) {
        console.log(err);
        const deleteClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        return res.status(500).send(deleteClientMongodbErrorResponse.toObject());
      }

      // If statement for client not found in DB
      if (!client) {
        console.log("Client not found");
        const notFoundResponse = new BaseResponse(404, "Client not found");
        return res.status(404).send(notFoundResponse.toObject());
      }

      // console.log to see if code breaks
      console.log(client);
      client.whatChanged.push({
        userName: userName,
        date: new Date(),
        changed: [{
          isDisabledOld: false,
          isDisabledNew: true,
        }],
      })
      client.set({
        isDisabled: true,
        whatChanged: client.whatChanged
      });

      client.save(function (err, savedClient) {
        // If statement to handle a Mongo error
        if (err) {
          console.log(err);
          const savedClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
          return res.status(500).send(savedClientMongodbErrorResponse.toObject());
        }

        console.log(savedClient);
        // This will return the deleted clientID
        const deleteClientResponse = new BaseResponse(200, "Query successful", savedClient);
        res.json(deleteClientResponse.toObject());
      });
    });
  } catch (e) {
    console.log(e);
    const deleteClientCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    return res.status(500).send(deleteClientCatchErrorResponse.toObject());
  }
});
 */
///find contacts
router.get("/find-contacts/:contactType", async (req, res) => {
  try {
    console.log("/find-contacts/:contactType/:contact");
    let contacts = await Client.find({ isDisabled: false, [req.params.contactType]: { $ne: null } }, { [req.params.contactType]: 1, _id: 1 });
    console.log("contacts");
    console.log(contacts);

    const findAllListsResponse = new BaseResponse("200", "Query successful", { contacts: contacts });
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});


/* router.get("/find-contacts/:contactType/:contact", async (req, res) => {
  try {
    console.log("/find/:contactType/:contact");
   let contacts = await Client.aggregate([
    {
      $search: {
        index: "email",
        autocomplete: {
          query: req.params.contact,
          path: req.params.contactType,
        }
      }
    }
  ]);
    console.log("contacts");
    console.log(contacts);

    const findAllListsResponse = new BaseResponse("200", "Query successful", contacts);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
}); */



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///find orders to create clients

router.get("/create-clients/all", async (req, res) => {
  try {
    console.log("start /create-clients");
    let clients = await Order.find(
      {
        email: "anele_09@mail.ru"
      },
      {
        userName: 1, source: 1,
        clientFirstName: 1, clientPatronymic: 1, clientLastName: 1,
        email: 1, contactType: 1, contact: 1, institute: 1, dateOfOrder: 1

      });

    //   dateOfOrder: { $gt: new Date('2023-05-31'), $lte: new Date('2023-09-30')
    //clientId: { $exists: false}, isDisabled: true, dateOfOrder: { $lte: new Date('2023-01-25T05:00:00.110+00:00')}
    console.log(clients.length);

    const findAllListsResponse = new BaseResponse("200", "Query successful", clients);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

///create clients

router.post("/create-clients/:index", async (req, res) => {
  try {

    console.log("start /create-clients/check");

    let client = req.body.client;
    let result = {};
    let controversialData = {
      clientFirstName: [],
      clientPatronymic: [],
      clientLastName: [],
      email: [],
      telegram: [],
      phoneNumber: [],
      whatsApp: [],
      vKontakte: [],
      instagram: [],
      facebook: [],
    }
    let differences = [];
    let alreadyChecked = [];
    let institutes = client.institute ? [{
      name: client.institute,
      category: "образовательное учреждение"
    }] : [];

    let publishers = client.source == 'subscription' ? [client.userName] : [];
    let coordinators = [client.userName];


    let e = client.email ? new RegExp('^' + client.email.toString() + '$', 'i') : null;

    let regExp;
    if (client.contactType == "telegram" || client.contactType == "phoneNumber" || client.contactType == "whatsApp") {

      if (client.contact.toString()[0] == '+') {
        //clientContact = client.contact.toString().slice(1, client.contact.toString().length);
        regExp = client.contact;
      } else {

        regExp = new RegExp('^' + client.contact.toString() + '$', 'i');
      }

    }
    let t = client.contactType == "telegram" ? regExp : null;
    let p = client.contactType == "phoneNumber" ? regExp : null;
    let w = client.contactType == "whatsApp" ? regExp : null;
    let v = client.contactType == "vKontakte" ? new RegExp('^' + client.contact.toString() + '$', 'i') : null;
    let i = client.contactType == "instagram" ? new RegExp('^' + client.contact.toString() + '$', 'i') : null;
    let f = client.contactType == "facebook" ? new RegExp('^' + client.contact.toString() + '$', 'i') : null;

    if (e) {
      let oldClient = await Client.findOne({ email: e });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferences(oldClient, client));
        console.log("institutes");
        console.log(institutes);
        console.log("oldClient.institutes");
        console.log(oldClient.institutes);
        if (oldClient.institutes.length != 0) {
          institutes = institutes.concat(oldClient.institutes);
          console.log("institutes");
          console.log(institutes);
        }
        if (
          (oldClient.publishers.length != 0) && (!oldClient.publishers.includes(publishers[0]))
        ) {
          publishers = publishers.concat(oldClient.publishers);
        }
        if (
          (oldClient.coordinators.length != 0) && (!oldClient.coordinators.includes(coordinators[0]))
        ) {
          coordinators = coordinators.concat(oldClient.coordinators);
        }
      }
    }
    if (t) {
      let oldClient = await Client.findOne({ telegram: t, _id: { $nin: alreadyChecked } });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferences(oldClient, client));
        if (oldClient.institutes.length != 0) { institutes.concat(oldClient.institutes); }
        if (
          (oldClient.publishers.length != 0) && (!oldClient.publishers.includes(publishers[0]))
        ) {
          publishers = publishers.concat(oldClient.publishers);
        }
        if (
          (oldClient.coordinators.length != 0) && (!oldClient.coordinators.includes(coordinators[0]))
        ) {
          coordinators = coordinators.concat(oldClient.coordinators);
        }
      }
    }
    if (p) {
      let oldClient = await Client.findOne({ phoneNumber: p, _id: { $nin: alreadyChecked } });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferences(oldClient, client));
        if (oldClient.institutes.length != 0) { institutes.concat(oldClient.institutes); }
        if (
          (oldClient.publishers.length != 0) && (!oldClient.publishers.includes(publishers[0]))
        ) {
          publishers = publishers.concat(oldClient.publishers);
        }
        if (
          (oldClient.coordinators.length != 0) && (!oldClient.coordinators.includes(coordinators[0]))
        ) {
          coordinators = coordinators.concat(oldClient.coordinators);
        }
      }
    }
    if (w) {
      let oldClient = await Client.findOne({ whatsApp: w, _id: { $nin: alreadyChecked } });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferences(oldClient, client));
        if (oldClient.institutes.length != 0) { institutes.concat(oldClient.institutes); }
        if (
          (oldClient.publishers.length != 0) && (!oldClient.publishers.includes(publishers[0]))
        ) {
          publishers = publishers.concat(oldClient.publishers);
        }
        if (
          (oldClient.coordinators.length != 0) && (!oldClient.coordinators.includes(coordinators[0]))
        ) {
          coordinators = coordinators.concat(oldClient.coordinators);
        }
      }
    }
    if (v) {
      let oldClient = await Client.findOne({ vKontakte: v, _id: { $nin: alreadyChecked } });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferences(oldClient, client));
        if (oldClient.institutes.length != 0) { institutes.concat(oldClient.institutes); }
        if (
          (oldClient.publishers.length != 0) && (!oldClient.publishers.includes(publishers[0]))
        ) {
          publishers = publishers.concat(oldClient.publishers);
        }
        if (
          (oldClient.coordinators.length != 0) && (!oldClient.coordinators.includes(coordinators[0]))
        ) {
          coordinators = coordinators.concat(oldClient.coordinators);
        }
      }
    }
    if (i) {
      let oldClient = await Client.findOne({ instagram: i, _id: { $nin: alreadyChecked } });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferences(oldClient, client));
        if (oldClient.institutes.length != 0) { institutes.concat(oldClient.institutes); }
        if (
          (oldClient.publishers.length != 0) && (!oldClient.publishers.includes(publishers[0]))
        ) {
          publishers = publishers.concat(oldClient.publishers);
        }
        if (
          (oldClient.coordinators.length != 0) && (!oldClient.coordinators.includes(coordinators[0]))
        ) {
          coordinators = coordinators.concat(oldClient.coordinators);
        }
      }
    }
    if (f) {
      let oldClient = await Client.findOne({ facebook: f, _id: { $nin: alreadyChecked } });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferences(oldClient, client));
        if (oldClient.institutes.length != 0) { institutes.concat(oldClient.institutes); }
        if (
          (oldClient.publishers.length != 0) && (!oldClient.publishers.includes(publishers[0]))
        ) {
          publishers = publishers.concat(oldClient.publishers);
        }
        if (
          (oldClient.coordinators.length != 0) && (!oldClient.coordinators.includes(coordinators[0]))
        ) {
          coordinators = coordinators.concat(oldClient.coordinators);
        }
      }
    }

    if (alreadyChecked.length == 0) {

      let searchString = [];
      for (let key in client) {
        if (
          key == "clientFirstName" ||
          key == "clientPatronymic" ||
          key == "clientLastName" ||
          key == "email" ||
          key == "contact"
        ) {
          if (client[key]) { searchString.push(client[key]); }
        }
        if (key == "institutes") {
          for (let institute of client.institutes) {
            searchString.push(institute.name);
          }
        }
      }

      let newClient;
      newClient = await Client.create({
        firstName: client.clientFirstName,
        patronymic: client.clientPatronymic,
        lastName: client.clientLastName,
        email: client.email,
        telegram: client.contactType == "telegram" ? client.contact : null,
        phoneNumber: client.contactType == "phoneNumber" ? client.contact : null,
        whatsApp: client.contactType == "whatsApp" ? client.contact : null,
        vKontakte: client.contactType == "vKontakte" ? client.contact : null,
        instagram: client.contactType == "instagram" ? client.contact : null,
        facebook: client.contactType == "facebook" ? client.contact : null,
        institutes: institutes, //client.institute ? [{ name: client.institute, category: "образовательное учреждение" }] : [],
        publishers: publishers, //client.source == 'subscription' ? [client.userName] : [],
        coordinators: [client.userName],
        dateCreated: client.dateOfOrder,
        searchString: searchString,
        whatChanged: [],
      });
      //  let newClient = await Client.findOne({ _id: insertResult.insertedId });
      // console.log("insertResult");
      // console.log(insertResult);
      console.log("newClient");
      console.log(newClient);

      await Order.updateOne({ _id: client._id }, { $set: { clientId: newClient._id } });

      result = {
        resume: true,
        client: newClient
      }
    } else {
      await Client.updateOne({ _id: alreadyChecked[0] }, { $set: { institutes: institutes, publishers: publishers, coordinators: coordinators } });

      console.log('differences');
      console.log(differences);

      for (let item of differences) {
        if (item.clientFirstName) { controversialData.clientFirstName = controversialData.clientFirstName.concat(item.clientFirstName); }
        if (item.clientPatronymic) { controversialData.clientPatronymic = controversialData.clientPatronymic.concat(item.clientPatronymic); }
        if (item.clientLastName) { controversialData.clientLastName = controversialData.clientLastName.concat(item.clientLastName); }
        if (item.email) { controversialData.email = controversialData.email.concat(item.email); }
        if (item.telegram) { controversialData.telegram = controversialData.telegram.concat(item.telegram); }
        if (item.phoneNumber) { controversialData.phoneNumber = controversialData.phoneNumber.concat(item.phoneNumber); }
        if (item.whatsApp) { controversialData.whatsApp = controversialData.whatsApp.concat(item.whatsApp); }
        if (item.vKontakte) { controversialData.vKontakte = controversialData.vKontakte.concat(item.vKontakte); }
        if (item.instagram) { controversialData.instagram = controversialData.instagram.concat(item.instagram); }
        if (item.facebook) { controversialData.facebook = controversialData.facebook.concat(item.facebook); }
      }

      await Order.updateOne({ _id: client._id }, { $set: { clientId: alreadyChecked[0] } });


      let firstClient = await Client.findOne({ _id: alreadyChecked[0] });
      result = {
        resume: false,
        controversialData: controversialData,
        idOfSimilarClients: alreadyChecked,
        client: firstClient
      }
    }

    const findAllListsResponse = new BaseResponse("200", "Query successful", result);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

function checkDifferences(oldClient, client) {
  let controversialData = {
    clientFirstName: [],
    clientPatronymic: [],
    clientLastName: [],
    email: [],
    telegram: [],
    phoneNumber: [],
    whatsApp: [],
    vKontakte: [],
    instagram: [],
    facebook: [],
  }

  console.log("oldClient");
  console.log(oldClient);
  console.log('client');
  console.log(client);
  {
    if (oldClient.firstName != client.clientFirstName && client.clientFirstName) {
      controversialData.clientFirstName.push(oldClient.firstName, client.clientFirstName);
    }
    if (oldClient.patronymic != client.clientPatronymic && client.clientPatronymic) {
      controversialData.clientPatronymic.push(oldClient.patronymic, client.clientPatronymic);
    }
    if (oldClient.lastName != client.clientLastName && client.clientLastName) {
      controversialData.clientLastName.push(oldClient.lastName, client.clientLastName);
    }
    if (oldClient.email?.toLowerCase() != client.email?.toLowerCase() && client.email) {
      controversialData.email.push(oldClient.email, client.email);
    }
    if (client.contactType == 'telegram' && oldClient.telegram != client.contact) {
      controversialData.telegram.push(oldClient.telegram, client.telegram);
    }
    if (client.contactType == 'phoneNumber' && oldClient.phoneNumber != client.contact) {
      controversialData.phoneNumber.push(oldClient.phoneNumber, client.contact);
    }
    if (client.contactType == 'whatsApp' && oldClient.whatsApp != client.contact) {
      controversialData.whatsApp.push(oldClient.whatsApp, client.contact);
    }
    if (client.contactType == 'facebook' && oldClient.facebook != client.contact) {
      controversialData.facebook.push(oldClient.facebook, client.contact);
    }
    if (client.contactType == 'instagram' && oldClient.instagram != client.contact) {
      controversialData.instagram.push(oldClient.instagram, client.contact);
    }
    if (client.contactType == 'vKontakte' && oldClient.vKontakte != client.contact) {
      controversialData.vKontakte.push(oldClient.vKontakte, client.contact);
    }
  }
  console.log('controversialData');
  console.log(controversialData);
  return controversialData;
}


//update and delete client API

router.post("/update-and-delete-clients/:id", async (req, res) => {
  try {
    console.log("start update-and-delete-clients");
    console.log(req.params);
    await Client.updateMany({ _id: { $in: req.body.ids } }, { $set: { isDisabled: true } });
    await Order.updateMany({ clientId: { $in: req.body.ids } }, { $set: { clientId: req.params.id } });

    Client.findOne({ _id: req.params.id }, function (err, client) {
      if (err) {
        console.log(err);
        const updateClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(updateClientMongodbErrorResponse.toObject());
      } else {
        //console.log(client);

        let searchString = [];
        if (req.body.client.firstName) searchString.push(req.body.client.firstName);
        if (req.body.client.patronymic) searchString.push(req.body.client.patronymic);
        if (req.body.client.lastName) searchString.push(req.body.client.lastName);
        if (req.body.client.email) searchString.push(req.body.client.email);
        if (req.body.client.phoneNumber) searchString.push(req.body.client.phoneNumber);
        if (req.body.client.whatsApp) searchString.push(req.body.client.whatsApp);
        if (req.body.client.telegram) searchString.push(req.body.client.telegram);
        if (req.body.client.vKontakte) searchString.push(req.body.client.vKontakte);
        if (req.body.client.instagram) searchString.push(req.body.client.instagram);
        if (req.body.client.facebook) searchString.push(req.body.client.facebook);
        if (req.body.client.otherContact) searchString.push(req.body.client.otherContact);
        if (req.body.client.country) searchString.push(req.body.client.country);
        if (req.body.client.region) searchString.push(req.body.client.region);
        if (req.body.client.city) searchString.push(req.body.client.city);

        for (let institute of req.body.client.institutes) {
          searchString.push(institute.name);
        }


        client.set({
          firstName: req.body.client.firstName,
          patronymic: req.body.client.patronymic,
          lastName: req.body.client.lastName,
          institutes: req.body.client.institutes,
          email: req.body.client.email,
          phoneNumber: req.body.client.phoneNumber,
          whatsApp: req.body.client.whatsApp,
          telegram: req.body.client.telegram,
          vKontakte: req.body.client.vKontakte,
          instagram: req.body.client.instagram,
          facebook: req.body.client.facebook,
          otherContact: req.body.client.otherContact,
          country: req.body.client.country,
          region: req.body.client.region,
          city: req.body.client.city,
          nameDayCelebration: req.body.client.nameDayCelebration,
          comments: req.body.client.comments,
          correspondents: req.body.client.correspondents,
          coordinators: req.body.client.coordinators,
          publishers: req.body.client.publishers,
          isRestricted: req.body.client.isRestricted,
          causeOfRestriction: req.body.client.causeOfRestriction,
          preventiveAction: req.body.client.preventiveAction,
          searchString: searchString
        });


        client.save(function (err, savedClient) {
          if (err) {
            console.log(err);

            const saveClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
            res.json(saveClientMongodbErrorResponse.toObject());
          } else {
            console.log(client);
            let result = {
              savedClient: savedClient,
              deletedClients: req.body.ids
            };
            const createClientResponse = new BaseResponse(200, "Query successful", result);
            res.json(createClientResponse.toObject());
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    const updateClientCatchErrorResponse = BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(updateClientCatchErrorResponse.toObject());
  }
});

/**
 * API to add-search-array
 */

router.get("/add-search-array", async (req, res) => {
  try {
    let clients = await Client.find({});
    for (let client of clients) {
      let searchString = [];
      for (let key in client) {
        if (
          key == "firstName" ||
          key == "patronymic" ||
          key == "lastName" ||
          key == "email" ||
          key == "phoneNumber" ||
          key == "whatsApp" ||
          key == "telegram" ||
          key == "vKontakte" ||
          key == "instagram" ||
          key == "facebook" ||
          key == "otherContact" ||
          key == "country" ||
          key == "city" ||
          key == "region"
        ) {
          if (client[key]) { searchString.push(client[key]); }
        }
        if (key == "institutes") {
          for (let institute of client.institutes) {
            searchString.push(institute.name);
          }
        }

      }
      await Client.updateOne({ _id: client._id }, { $set: { searchString: searchString } });
      console.log(client._id);
    }

    const findAllListsResponse = new BaseResponse("200", "Query successful", true);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const readClientCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readClientCatchErrorResponse.toObject());
  }
});

/**
 * API to restore coordinators
 */

router.get("/restore/coordinators", async (req, res) => {
  try {
    let clients = await Client.find({ isDisabled: false });
    for (let client of clients) {
      let coordinators = [];
      let orders = await Order.find({ clientId: client._id });
      for (let order of orders) {
        if (!coordinators.includes(order.userName)) {
          coordinators.push(order.userName);
        }
      }
      await Client.updateOne({ _id: client._id }, { $set: { coordinators: coordinators } });
      console.log(coordinators);
    }

    const findAllListsResponse = new BaseResponse("200", "Query successful", true);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const readClientCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readClientCatchErrorResponse.toObject());
  }
});

/**
 * API to correct contacts
 */

router.get("/contacts/correct", async (req, res) => {
  try {
    let clients = await Client.find(
      {
        otherContact: { $ne: null }
      }
    );
    //const instaRe = /^https:\/\/www.instagram.com\//;


    for (let client of clients) {
      let newFN, newLN, newP, newContact;

      newFN = client.firstName ? client.firstName.trim() : client.firstName;
      newLN = client.lastName ? client.lastName.trim() : client.lastName;
      newP = client.patronymic ? client.patronymic.trim() : client.patronymic;
      /*       if (client.vKontakte) {
              client.vKontakte = client.vKontakte.trim();
              if (contactRe.test(client.vKontakte)) {
                newContact = client.vKontakte;
              } else {
                newContact = client.vKontakte[0] == "@" ? "https://vk.com/" + client.vKontakte.substring(1) : "https://vk.com/" + client.vKontakte;
                console.log(newContact);
              }
            }  */

      /*       if (client.telegram) {
              client.telegram = client.telegram.trim();
              client.telegram = client.telegram.replace("https://web.tel.onl/", '');
      
              const contactRe = /^((\+7)+([0-9]){10})$/;
              if (contactRe.test(client.telegram)) {
                newContact = client.telegram;
              } else {
                const eightRe = /^((8)+([0-9]){10})$/;
                if (eightRe.test(client.telegram)) {
                  newContact = "+7" + client.telegram.substring(1);
                } else { */
      /*             let adjustedContact = '';
                  const numberRe = /^(([0-9]){1})$/;
                  for (let letter of client.telegram) {
                    if (numberRe.test(letter)) {
                      adjustedContact = adjustedContact + letter;
                    }
                  }
                  newContact = "+7" + adjustedContact.slice(-10); */

      /*            const nicknameRe = /^@/;
                 if (nicknameRe.test(client.telegram)) {
                   newContact = client.telegram;
                 } else {
                   const idRe = /^(\#+([0-9]){9,10})$/;
                   if (idRe.test(client.telegram)) {
                     newContact = client.telegram;
                   } else {
                    
                     newContact = client.telegram;
                     console.log(newContact);
                   }
                 }
               }
             }
           }*/

      await Client.updateOne(
        { _id: client._id },
        { $set: { firstName: newFN, lastName: newLN, patronymic: newP, } }
      );
      console.log(client._id);//telegram: newContact

    }

    const findAllListsResponse = new BaseResponse("200", "Query successful", true);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const readClientCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readClientCatchErrorResponse.toObject());
  }
});


router.get("/:id", async (req, res) => {
  try {
    Client.findOne({ _id: req.params.id }, function (err, client) {
      console.log(req.params.id);
      if (err) {
        console.log(err);
        const readClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readClientMongodbErrorResponse.toObject());
      } else {
        if (!client) {
          const response = `Invalid client ID`;
          console.log(response);
          res.send(response);
        } else {
          const readClientResponse = new BaseResponse(200, "Query successful", client);
          console.log(client);
          res.json(readClientResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const readClientCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(readClientCatchErrorResponse.toObject());
  }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///find and delete doubles

router.get("/collect-clients/all", async (req, res) => {
  try {
    console.log("start /collect-clients");
    let clients = await Client.find(
      {
        isDisabled: false
      });

    //   dateOfOrder: { $gt: new Date('2023-05-31'), $lte: new Date('2023-09-30')
    //clientId: { $exists: false}, isDisabled: true, dateOfOrder: { $lte: new Date('2023-01-25T05:00:00.110+00:00')}
    console.log(clients.length);

    const findAllListsResponse = new BaseResponse("200", "Query successful", clients);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

///check clients

router.post("/check-all-clients/:index", async (req, res) => {
  try {

    console.log("start check-all-clients");

    let client = req.body.client;
    let result = {};
    let controversialData = {
      clientFirstName: [],
      clientPatronymic: [],
      clientLastName: [],
      email: [],
      telegram: [],
      phoneNumber: [],
      whatsApp: [],
      vKontakte: [],
      instagram: [],
      facebook: [],
    }
    let differences = [];
    let alreadyChecked = [client._id];

    let e = client.email ? new RegExp('^' + client.email.toString() + '$', 'i') : null;

    let t = null;
    if (client.telegram) {
      if (client.telegram.toString()[0] == '+') {
        t = client.telegram;
      } else {
        t = new RegExp('^' + client.telegram.toString() + '$', 'i');
      }
    }



    let p = client.phoneNumber ? client.phoneNumber : null;
    let w = client.whatsApp ? client.whatsApp : null;
    let v = client.vKontakte ? new RegExp('^' + client.vKontakte.toString() + '$', 'i') : null;
    let i = client.instagram ? new RegExp('^' + client.instagram.toString() + '$', 'i') : null;
    let f = client.facebook ? new RegExp('^' + client.facebook.toString() + '$', 'i') : null;

    if (e) {
      let oldClient = await Client.findOne({ email: e, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferencesDouble(oldClient, client));
      }
    }
    if (t) {
      let oldClient = await Client.findOne({ telegram: t, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferencesDouble(oldClient, client));
      }
      if (t.toString()[0] == '+') {
        oldClient = await Client.findOne({ phoneNumber: t, _id: { $nin: alreadyChecked }, isDisabled: false });
        if (oldClient) {
          console.log(client._id + " " + oldClient._id + " " + t);
        }
        oldClient = await Client.findOne({ whatsApp: t, _id: { $nin: alreadyChecked }, isDisabled: false });
        if (oldClient) {
          console.log(client._id + " " + oldClient._id + " " + t);
        }
      }
    }
    if (p) {
      let oldClient = await Client.findOne({ phoneNumber: p, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferencesDouble(oldClient, client));
      }
      oldClient = await Client.findOne({ telegram: p, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        console.log(client._id + " " + oldClient._id + " " + p);
      }
      oldClient = await Client.findOne({ whatsApp: p, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        console.log(client._id + " " + oldClient._id + " " + p);
      }
    }

    if (w) {
      let oldClient = await Client.findOne({ whatsApp: w, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferencesDouble(oldClient, client));
      }
    }
    if (v) {
      let oldClient = await Client.findOne({ vKontakte: v, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferencesDouble(oldClient, client));
      }
    }
    if (i) {
      let oldClient = await Client.findOne({ instagram: i, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferencesDouble(oldClient, client));

      }
    }
    if (f) {
      let oldClient = await Client.findOne({ facebook: f, _id: { $nin: alreadyChecked }, isDisabled: false });
      if (oldClient) {
        alreadyChecked.push(oldClient._id);
        differences = differences.concat(checkDifferencesDouble(oldClient, client));
      }
    }

    if (client.firstName && client.patronymic && client.lastName) {
      let oldClient = await Client.findOne(
        {
          firstName: client.firstName,
          patronymic: client.patronymic,
          lastName: client.lastName,
          _id: { $nin: alreadyChecked }
        }
      );
      if (oldClient) {
        console.log(client._id + " " + oldClient._id + " sameName");
      }
    }

    if (client.firstName && !client.patronymic && client.lastName) {
      let oldClient = await Client.findOne(
        {
          firstName: client.firstName,  
          lastName: client.lastName,
          _id: { $nin: alreadyChecked }
        }
      );
      if (oldClient) {
        console.log(client._id + " " + oldClient._id + " sameName");
      }
    }






    if (alreadyChecked.length == 1) {

      result = {
        resume: true,
        client: client,
        idOfSimilarClients: null
      }
    } else {

      console.log('differences');
      console.log(differences);

      for (let item of differences) {
        if (item.clientFirstName) { controversialData.clientFirstName = controversialData.clientFirstName.concat(item.clientFirstName); }
        if (item.clientPatronymic) { controversialData.clientPatronymic = controversialData.clientPatronymic.concat(item.clientPatronymic); }
        if (item.clientLastName) { controversialData.clientLastName = controversialData.clientLastName.concat(item.clientLastName); }
        if (item.email) { controversialData.email = controversialData.email.concat(item.email); }
        if (item.telegram) { controversialData.telegram = controversialData.telegram.concat(item.telegram); }
        if (item.phoneNumber) { controversialData.phoneNumber = controversialData.phoneNumber.concat(item.phoneNumber); }
        if (item.whatsApp) { controversialData.whatsApp = controversialData.whatsApp.concat(item.whatsApp); }
        if (item.vKontakte) { controversialData.vKontakte = controversialData.vKontakte.concat(item.vKontakte); }
        if (item.instagram) { controversialData.instagram = controversialData.instagram.concat(item.instagram); }
        if (item.facebook) { controversialData.facebook = controversialData.facebook.concat(item.facebook); }
      }

      let isSame = true;
      for (let key in controversialData) {
        if (controversialData[key].length > 0) isSame = false;
      }

      if (!isSame) {
        result = {
          resume: false,
          controversialData: controversialData,
          idOfSimilarClients: alreadyChecked,
          client: client
        }
      } else {
        let mainId = alreadyChecked[0];
        alreadyChecked.splice(0, 1);

        console.log('deleted');
        console.log(alreadyChecked);

        await Client.updateMany({ _id: { $in: alreadyChecked } }, { $set: { isDisabled: true } });
        await Order.updateMany({ clientId: { $in: alreadyChecked } }, { $set: { clientId: mainId } });

        let disabledClients = await Client.find({ _id: { $in: alreadyChecked } });
        let mainClient = await Client.findOne({ _id: mainId });

        for (let client of disabledClients) {
          for (let c of client.coordinators) {
            if (!mainClient.coordinators.includes(c)) {
              mainClient.coordinators.push(c);
            }
          }
          for (let p of client.publishers) {
            if (!mainClient.publishers.includes(p)) {
              mainClient.publishers.push(p);
            }
          }
          for (let i of client.institutes) {
            mainClient.institutes.push(i);
          }
        }

        await Client.updateOne(
          { _id: mainId },
          {
            $set:
            {
              coordinators: mainClient.coordinators,
              publishers: mainClient.publishers,
              institutes: mainClient.institutes,
            }
          });
        let updatedClient = await Client.findOne({ _id: mainId });

        result = {
          resume: true,
          client: updatedClient,
          idOfSimilarClients: alreadyChecked
        }

      }


    }

    const findAllListsResponse = new BaseResponse("200", "Query successful", result);
    res.json(findAllListsResponse.toObject());

  } catch (e) {
    console.log(e);
    const findAllListsCatchErrorResponse = new BaseResponse("500", "Internal server error", e.message);
    res.status(500).send(findAllListsCatchErrorResponse.toObject());
  }
});

function checkDifferencesDouble(oldClient, client) {
  let controversialData = {
    clientFirstName: [],
    clientPatronymic: [],
    clientLastName: [],
    email: [],
    telegram: [],
    phoneNumber: [],
    whatsApp: [],
    vKontakte: [],
    instagram: [],
    facebook: [],
  }

  console.log("oldClient");
  console.log(oldClient);
  console.log('client');
  console.log(client);
  {
    if (oldClient.firstName != client.firstName) {
      controversialData.clientFirstName.push(oldClient.firstName, client.firstName);
    }
    if (oldClient.patronymic != client.patronymic) {
      controversialData.clientPatronymic.push(oldClient.patronymic, client.patronymic);
    }
    if (oldClient.lastName != client.lastName) {
      controversialData.clientLastName.push(oldClient.lastName, client.lastName);
    }
    if (oldClient.email != client.email) {
      controversialData.email.push(oldClient.email, client.email);
    }
    if (oldClient.telegram != client.telegram) {
      controversialData.telegram.push(oldClient.telegram, client.telegram);
    }
    if (oldClient.phoneNumber != client.phoneNumber) {
      controversialData.phoneNumber.push(oldClient.phoneNumber, client.phoneNumber);
    }
    if (oldClient.whatsApp != client.whatsApp) {
      controversialData.whatsApp.push(oldClient.whatsApp, client.whatsApp);
    }
    if (oldClient.facebook != client.facebook) {
      controversialData.facebook.push(oldClient.facebook, client.facebook);
    }
    if (oldClient.instagram != client.instagram) {
      controversialData.instagram.push(oldClient.instagram, client.instagram);
    }
    if (oldClient.vKontakte != client.vKontakte) {
      controversialData.vKontakte.push(oldClient.vKontakte, client.vKontakte);
    }
  }
  console.log('controversialData');
  console.log(controversialData);
  return controversialData;
}


//update and delete client API

/* router.post("/update-and-delete-clients/:id", async (req, res) => {
  try {
    console.log("start update-and-delete-clients");
    console.log(req.params);
    await Client.updateMany({ _id: { $in: req.body.ids } }, { $set: { isDisabled: true } });
    await Order.updateMany({ clientId: { $in: req.body.ids } }, { $set: { clientId: req.params.id } });

    Client.findOne({ _id: req.params.id }, function (err, client) {
      if (err) {
        console.log(err);
        const updateClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(updateClientMongodbErrorResponse.toObject());
      } else {
        //console.log(client);

        let searchString = [];
        if (req.body.client.firstName) searchString.push(req.body.client.firstName);
        if (req.body.client.patronymic) searchString.push(req.body.client.patronymic);
        if (req.body.client.lastName) searchString.push(req.body.client.lastName);
        if (req.body.client.email) searchString.push(req.body.client.email);
        if (req.body.client.phoneNumber) searchString.push(req.body.client.phoneNumber);
        if (req.body.client.whatsApp) searchString.push(req.body.client.whatsApp);
        if (req.body.client.telegram) searchString.push(req.body.client.telegram);
        if (req.body.client.vKontakte) searchString.push(req.body.client.vKontakte);
        if (req.body.client.instagram) searchString.push(req.body.client.instagram);
        if (req.body.client.facebook) searchString.push(req.body.client.facebook);
        if (req.body.client.otherContact) searchString.push(req.body.client.otherContact);
        if (req.body.client.country) searchString.push(req.body.client.country);
        if (req.body.client.region) searchString.push(req.body.client.region);
        if (req.body.client.city) searchString.push(req.body.client.city);

        for (let institute of req.body.client.institutes) {
          searchString.push(institute.name);
        }


        client.set({
          firstName: req.body.client.firstName,
          patronymic: req.body.client.patronymic,
          lastName: req.body.client.lastName,
          institutes: req.body.client.institutes,
          email: req.body.client.email,
          phoneNumber: req.body.client.phoneNumber,
          whatsApp: req.body.client.whatsApp,
          telegram: req.body.client.telegram,
          vKontakte: req.body.client.vKontakte,
          instagram: req.body.client.instagram,
          facebook: req.body.client.facebook,
          otherContact: req.body.client.otherContact,
          country: req.body.client.country,
          region: req.body.client.region,
          city: req.body.client.city,
          nameDayCelebration: req.body.client.nameDayCelebration,
          comments: req.body.client.comments,
          correspondents: req.body.client.correspondents,
          coordinators: req.body.client.coordinators,
          publishers: req.body.client.publishers,
          isRestricted: req.body.client.isRestricted,
          causeOfRestriction: req.body.client.causeOfRestriction,
          preventiveAction: req.body.client.preventiveAction,
          searchString: searchString
        });


        client.save(function (err, savedClient) {
          if (err) {
            console.log(err);

            const saveClientMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
            res.json(saveClientMongodbErrorResponse.toObject());
          } else {
            console.log(client);
            let result = {
              savedClient: savedClient,
              deletedClients: req.body.ids
            };
            const createClientResponse = new BaseResponse(200, "Query successful", result);
            res.json(createClientResponse.toObject());
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    const updateClientCatchErrorResponse = BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(updateClientCatchErrorResponse.toObject());
  }
}); */

module.exports = router;
