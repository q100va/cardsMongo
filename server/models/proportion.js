/*
============================================
; Model for the proportion
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proportionSchema = new Schema({
    amount: { type: Number },
    oldWomen: { type: Number, unique: true },
    oldMen: { type: Number },
    special: { type: Number },
    yang: { type: Number },
    oneHouse: { type: Number },
},  { collection: "proportions" })

module.exports = mongoose.model("Proportion", proportionSchema);
