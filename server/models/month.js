/*
============================================
; Model for the application's month
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const monthSchema = new Schema({
    number: { type: Number },
    text: { type: String },
    isActive: { type: Boolean, default: false },
    year: { type: Number }
},
    { collection: "months" }
);


module.exports = mongoose.model("Month", monthSchema);
