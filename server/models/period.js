/*
============================================
; Model for the application's period
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const periodSchema = new Schema({
    key: { type: Number},
  date1: { type: Number},
  date2: { type: Number },
  isActive: { type: Boolean, default: false },
  maxPlus: { type: Number },
  secondTime: { type: Boolean, default: false },
  scoredPluses: {type: Number, default: 2}
},
{ collection: "periods" }
);


module.exports = mongoose.model("Period", periodSchema);
