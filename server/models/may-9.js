/*
============================================
; Model for celebrators' list 
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const lineItemDocument = require("../schemas/line-item");
//const celebrator = require ("../schemas/celebrator");

const listSchema = new Schema(
  {

    nursingHome: { type: String },
    region: { type: String },
    lastName: { type: String },
    firstName: { type: String },
    patronymic: { type: String },
    dateBirthday: { type: Number },
    monthBirthday: { type: Number },
    yearBirthday: { type: Number },
    comment1: { type: String },
    veteran: { type: String },
    child: { type: String },
    linkPhoto: { type: String },
    plusAmount: { type: Number },
    noAddress: { type: Boolean },
    isReleased: { type: Boolean },
    fullDayBirthday: { type: String },
    gender: { type: String },
    celebrator_id: { type: String },
    fullData: { type: String },
    holyday: { type: String }, 
    absent: { type: Boolean, default: false },   
    secondTime: {type: Boolean, default: false},
    thirdTime: {type: Boolean, default: false},
    seniorId: { type: String },

  },
  { collection: "may_9_2024" }
);

module.exports = mongoose.model("May9", listSchema);