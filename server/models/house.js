/*
============================================
; Model 
;===========================================
*/

// Mongoose require statements
const any = require("bluebird/js/release/any");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let housesSchema = new Schema(
  {
    nursingHome: { type: String, required: true, unique: true},
    region: { type: String, required: true},
    address: { type: String, required: true },
    infoComment: { type: String },
    adminComment: { type: String },
    isRestricted: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
    dateStart: {type: Date},
    dateStartClone: {type: String},
    nameContact: {type: String},
    contact: {type: String},
    isDisabled: { type: Boolean, default: false },
  },
  { collection: "houses" }
);

module.exports = mongoose.model("House", housesSchema);
