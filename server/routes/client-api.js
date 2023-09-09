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
      //nameDayCelebration: req.body.nameDayCelebration,
      comments: req.body.comments,       
      correspondents: req.body.correspondents,
      coordinators: [],
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
            gender: req.body.gender,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            whatsApp: req.body.whatsApp,
            telegram: req.body.telegram,
            vKontakte: req.body.vKontakte,
            instagram: req.body.instagram,
            facebook: req.body.facebook,
            country: req.body.country,
            region: req.body.region,
            city: req.body.city,
            nameDay: req.body.nameDay,
            comments: req.body.comments,
            institute: req.body.institute,
            correspondent: req.body.correspondent,
            coordinator: req.body.coordinator,
            date_created: req.body.date_created,
            isRestricted: req.body.isRestricted,
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

// Delete Client API - In progress-
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
