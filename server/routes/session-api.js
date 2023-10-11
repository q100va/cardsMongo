/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint2
; Author: Professor Krasso
; Date: April 28, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App session-api.js file
; API for user session sign-in
;===========================================
*/

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const BaseResponse = require("../models/base-response");

const router = express.Router();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");

// User sign-in
router.post("/signin",  async (req, res) => {
  try {
    User.findOne({ userName: req.body.userName }, function (err, user) {
      if (err) {
        console.log(err);
        const signinMongodbErrorResponse = new BaseResponse(500, "Internal Server Error", err);
        res.status(500).send(signinMongodbErrorResponse.toObject());
      } else {
        console.log(user);
        if (user) {
          let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

          if (passwordIsValid) {
            console.log("Login Successful");
            const token = jwt.sign({
              userName: user.userName,
              userId: user._id
            },
              'Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.',
              { expiresIn: "4h" }
            );
            //user["token"] = token;
            console.log(user);
            const signinResponse = new BaseResponse(200, "Login Successful", { user: user, token: token, expiresIn: 14400 });
            console.log(signinResponse.toObject());
            res.json(signinResponse.toObject());
          } else {
            console.log(`Invalid password for username: ${user.userName}`);
            const invalidPasswordResponse = new BaseResponse(
              401,
              "Неверное имя пользователя или пароль. Попробуйте снова.",
              null
            );
            console.log(invalidPasswordResponse.toObject());
            res.status(401).send(invalidPasswordResponse.toObject());
          }
        } else {
          console.log(`Username: ${req.body.userName} is invalid`);
          const invalidUserNameResponse = new BaseResponse(
            401,
            "Неверное имя пользователя или пароль. Попробуйте снова.",
            null
          );
          console.log(invalidUserNameResponse.toObject());
          res.status(401).send(invalidUserNameResponse.toObject());
        }
      }
    });
  } catch (e) {
    console.log(e);
    const signinCatchErrorResponse = new BaseResponse(500, "Internal Server Error", e.message);
    res.status(500).send(signinCatchErrorResponse.toObject());
  }
});



//Reset Password API

router.post("/users/:userName/reset-password", checkAuth, async (req, res) => {
  try {
    const password = req.body.password;

    User.findOne({ userName: req.params.userName }, function (err, user) {
      if (err) {
        console.log(err);
        const resetPasswordMongodbErrorResponse = new BaseResponse("500", "Internal server error", err);
        res.status(500).send(resetPasswordMongodbErrorResponse.toObject());
      } else {
        console.log(user);
        //Salt and hash the password
        let hashedPassword = bcrypt.hashSync(password, saltRounds);

        user.set({
          password: hashedPassword,
        });

        user.save(function (err, updatedUser) {
          if (err) {
            console.log(err);
            const updatedUserMongodbErrorResponse = new BaseResponse("500", "Internal server error", err);
            res.status(500).send(updatedUserMongodbErrorResponse.toObject());
          } else {
            console.log(updatedUser);
            const updatedPasswordResponse = new BaseResponse("200", "Query Successful", updatedUser);
            res.json(updatedPasswordResponse.toObject());
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    const resetPasswordCatchError = new BaseResponse("500", "Internal server error", e);
    res.status(500).send(resetPasswordCatchError.toObject());
  }
});



module.exports = router;
