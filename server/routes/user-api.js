/*
============================================
; APIs for the user APIs
;===========================================
*/

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const BaseResponse = require("../models/base-response");
const router = express.Router();
const saltRounds = 10;

//CreateUser API
router.post("/", async (req, res) => {
   try {
     let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
     standardRole = "standard";

     //user object
     let newUser = {
       userName: req.body.userName,
       password: hashedPassword,
       firstName: req.body.firstName,
       lastName: req.body.lastName,
       phoneNumber: req.body.phoneNumber,
       address: req.body.address,
       email: req.body.email,
       role: standardRole,       
     };
     console.log(req.body);

     User.create(newUser, function (err, user) {
       if (err) {
         console.log(err);
         const createUserMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
         res.status(500).send(createUserMongodbErrorResponse.toObject());
       } else {
         console.log(user);
         const createUserResponse = new BaseResponse(200, "Query Successful", user);
         res.json(createUserResponse.toObject());
       }
     });
   } catch (e) {
     console.log(e);
     const createUserCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
     res.status(500).send(createUserCatchErrorResponse.toObject());
   }
 }); 

/**
 * API to find user by username (OK)
 */

router.get("/:userName", async (req, res) => {
  try {
    User.findOne({ userName: req.params.userName }, function (err, user) {
      if (err) {
        console.log(err);
        const readUserMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
        if (!user) {
          const response = `Invalid username`;
          console.log(response);
          res.send(response);
        } else {
          const readUserResponse = new BaseResponse(200, "Query successful", user);
          console.log(user);
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
 * API to find all users (OK)
 */
router.get("/", async (req, res) => {
  try {
    User.find({})
      .where("isDisabled")
      .equals(false)
      .exec(function (err, users) {
        if (err) {
          console.log(err);
          const readUsersMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
          res.status(500).send(readUsersMongodbErrorResponse.toObject());
        } else {
          console.log(users);
          const readUsersResponse = new BaseResponse(200, "Query successful", users);
          res.json(readUsersResponse.toObject());
        }
      });
  } catch (e) {
    console.log(e);
    const readUserCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    res.status(500).send(readUserCatchErrorResponse.toObject());
  }
});

//update user API

router.put("/:id", async (req, res) => {
  try {

    console.log(req.body.password);
    let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
    User.findOne({ _id: req.params.id }, function (err, user) {
      if (err) {
        console.log(err);
        const updateUserMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(updateUserMongodbErrorResponse.toObject());
      } else {
        console.log(user);

        user.set({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          address: req.body.address,
          email: req.body.email,
          role: req.body.role,
          password: hashedPassword,
        });
        

        user.save(function (err, savedUser) {
          if (err) {
            console.log(err);
            const saveUserMongodbErrorResponse = new BaseResponse(200, "Query successful", savedUser);
            res.json(saveUserMongodbErrorResponse.toObject());
          } else {
            console.log(user);
            const createUserResponse = new BaseResponse(200, "Query successful", user);
            res.json(createUserResponse.toObject());
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    const updateUserCatchErrorResponse = new BaseResponse(500, "Internal server error", e);
    res.status(500).send(updateUserCatchErrorResponse.toObject());
  }
});

// Delete User API - In progress-
router.delete("/:id", async (req, res) => {
  try {
    User.findOne({ _id: req.params.id }, function (err, user) {
      // If statement for Mongo error
      if (err) {
        console.log(err);
        const deleteUserMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        return res.status(500).send(deleteUserMongodbErrorResponse.toObject());
      }

      // If statement for user not found in DB
      if (!user) {
        console.log("User not found");
        const notFoundResponse = new BaseResponse(404, "User not found");
        return res.status(404).send(notFoundResponse.toObject());
      }

      // console.log to see if code breaks
      console.log(user);

      user.set({
        isDisabled: true,
      });

      user.save(function (err, savedUser) {
        // If statement to handle a Mongo error
        if (err) {
          console.log(err);
          const savedUserMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
          return res.status(500).send(savedUserMongodbErrorResponse.toObject());
        }

        console.log(savedUser);
        // This will return the deleted userID
        const deleteUserResponse = new BaseResponse(200, "Query successful", savedUser);
        res.json(deleteUserResponse.toObject());
      });
    });
  } catch (e) {
    console.log(e);
    const deleteUserCatchErrorResponse = new BaseResponse(500, "Internal server error", e.message);
    return res.status(500).send(deleteUserCatchErrorResponse.toObject());
  }
});

/**
 * API to find user by ID (OK)
 */

router.get("/user/:id", async (req, res) => {
  try {
    User.findOne({ _id: req.params.id }, function (err, user) {
      console.log(req.params.id);
      if (err) {
        console.log(err);
        const readUserMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(readUserMongodbErrorResponse.toObject());
      } else {
        if (!user) {
          const response = `Invalid user ID`;
          console.log(response);
          res.send(response);
        } else {
          const readUserResponse = new BaseResponse(200, "Query successful", user);
          console.log(user);
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
 * API to find user's role by user ID (OK)
 */

router.get("/:userName/role", async (req, res) => {
  try {
    User.findOne({ userName: req.params.userName }, function (err, user) {
      console.log(req.params.userName);
      if (err) {
        console.log(err);
        const findUserRoleMongodbErrorResponse = new BaseResponse(500, "Internal server error", err);
        res.status(500).send(findUserRoleMongodbErrorResponse.toObject());
      } else {
        if (!user) {
          const response = `Invalid username`;
          console.log(response);
          res.send(response);
        } else {
          const findUserRoleResponse = new BaseResponse(200, "Query successful", user.role);
          console.log(user.role);
          res.json(findUserRoleResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const findUserRoleCatchErrorResponse = new BaseResponse(500, "Internal server error", err);
    res.status(500).send(findUserRoleCatchErrorResponse.toObject());
  }
});



module.exports = router;
