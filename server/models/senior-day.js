/*
============================================
; Model for celebrators' list 
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const lineItemDocument = require("../schemas/line-item");
//const celebrator = require ("../schemas/celebrator");

const seniorDaySchema = new Schema(
  {

    nursingHome: { type: String },
    region: { type: String },
    lastName: { type: String },
    firstName: { type: String },
    patronymic: { type: String },
/*     dateBirthday: { type: Number },
    monthBirthday: { type: Number }, */
    yearBirthday: { type: Number },
    comment1: { type: String },
    comment2: { type: String },
/*     teacher: { type: String },
    specialComment: { type: String }, */
    linkPhoto: { type: String },
    plusAmount: { type: Number },
    /* oldest: { type: Boolean, default: false },
    category: { type: String }, */
    noAddress: { type: Boolean },
    isReleased: { type: Boolean },
 /*    fullDayBirthday: { type: String }, */
    gender: { type: String },
    celebrator_id: { type: String },
    fullData: { type: String },
    holyday: { type: String },  
/*     dateHoliday: { type: Number },
    monthHoliday: { type: Number }, */
    absent:  { type: Boolean, default: false },

  },
  { collection: "senior_day_2024" }
);

module.exports = mongoose.model("SeniorDay", seniorDaySchema);