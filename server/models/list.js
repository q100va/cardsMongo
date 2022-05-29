/*
============================================
; Model for celebrators' list 
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const lineItemDocument = require("../schemas/line-item");
const celebrator = require ("../schemas/celebrator");

const listSchema = new Schema(
  {
    key: { type: Number },
    period: { type: String },
    active: { type: Boolean },
    celebrators: [celebrator],
 
  },
  { collection: "lists" }
);

module.exports = mongoose.model("List", listSchema);