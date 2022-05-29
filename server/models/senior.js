/*
============================================

; Model for the application's seniors
;===========================================
*/

// Mongoose require statements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let seniorSchema = new Schema(
  {
    region: { type: String, required: true },
    nursingHome: { type: String, required: true },
    lastName: { type: String },
    firstName: { type: String, required: true },
    patronymic: { type: String },
    isRestricted: { type: Boolean, default: false },
    dateBirthday: { type: Number},
    monthBirthday: { type: Number},
    yearBirthday: { type: Number},
    gender: { type: String, required: true },
    comment1: { type: String },
    comment2: { type: String },
    linkPhoto: { type: String },
    nameDay: { type: String },
    dateNameDay: { type: Number },
    monthNameDay: { type: Number },
    isDisabled: { type: Boolean, default: false },
    noAddress: { type: Boolean, default: false },
  },
  { collection: "seniors" }
);

module.exports = mongoose.model("Seniors", seniorSchema);
