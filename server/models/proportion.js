/*
============================================
; Model for the proportion
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proportionSchema = new Schema({
    amount: { type: Number },
    oldWomen: { type: Number},
    oldMen: { type: Number },
    yangWomen: { type: Number},
    yangMen: { type: Number },
    specialWomen: { type: Number },
    specialMen: { type: Number },    
    oneHouse: { type: Number },
    oneRegion: { type: Number },
},  { collection: "proportions" })

module.exports = mongoose.model("Proportion", proportionSchema);
