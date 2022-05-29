/*
============================================
 User schema 
;===========================================
*/

// Mongoose statements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// UserSchema for database collection
var userSchema = new Schema(
  {
    userName: { type: String, required: true, unique: true, dropDups: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true  },
    lastName: { type: String, required: true  },
    phoneNumber: { type: String },
    address: { type: String },
    email: { type: String },
    isDisabled: { type: Boolean, default: false },
    role: { type: String },
    date_created: { type: Date, default: new Date() }
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
