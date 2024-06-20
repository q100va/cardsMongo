/*
============================================
; Model for celebrators' list 
;===========================================
*/

const { any } = require("bluebird");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const lineItemDocument = require("../schemas/line-item");
//const celebrator = require ("../schemas/celebrator");

const familyDaySchema = new Schema(
    {
        region: { type: String },
        nursingHome: { type: String },
        husbandLastName: { type: String },
        husbandFirstName: { type: String },
        husbandPatronymic: { type: String },
        husbandYearBirthday: { type: String},
        wifeLastName: { type: String },
        wifeFirstName: { type: String },
        wifePatronymic: { type: String },
        wifeYearBirthday: { type: String },
        comment1: { type: String },
        plusAmount: { type: Number },
        noAddress: { type: Boolean },
        isReleased: { type: Boolean },
        fullData: { type: String },
        holiday: { type: String },
        absent: { type: Boolean, default: false },

    },
    { collection: "familyDay_2024" }
);

module.exports = mongoose.model("FamilyDay", familyDaySchema);