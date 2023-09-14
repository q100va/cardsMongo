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

        client.set({
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
router.delete("/:id", async (req, res) => {
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

      client.set({
        isDisabled: true,
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



///find orders to create clients

router.get("/create-clients/all", async (req, res) => {
  try {
    console.log("start /create-clients");
    let clients = await Order.find({
      dateOfOrder: { $gt: new Date('2022-06-30'), $lte: new Date('2022-07-31') }, isDisabled: false
    }, {
      userName: 1, source: 1,
      clientFirstName: 1, clientPatronymic: 1, clientLastName: 1,
      email: 1, contactType: 1, contact: 1, institute: 1, dateOfOrder: 1

    });

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
    let newClient;
    if (alreadyChecked.length == 0) {
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
        dateCreated: client.dateOfOrder
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
    if (oldClient.firstName != client.clientFirstName) {
      controversialData.clientFirstName.push(oldClient.firstName, client.clientFirstName);
    }
    if (oldClient.patronymic != client.clientPatronymic) {
      controversialData.clientPatronymic.push(oldClient.patronymic, client.clientPatronymic);
    }
    if (oldClient.lastName != client.clientLastName) {
      controversialData.clientLastName.push(oldClient.lastName, client.clientLastName);
    }
    if (oldClient.email != client.email) {
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
              deletedClients: req.params.id
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
 * API to find client by ID (OK)
 */

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

module.exports = router;
