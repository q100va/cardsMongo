/*
============================================
; Schema line-items
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const celebrator = require ("../schemas/celebrator");
const lineItemSchema = new Schema({

  region: { type: String },
  nursingHome: { type: String },
  address: { type: String, required: true },
  infoComment: { type: String },
  adminComment: { type: String },
  noAddress: {type: Boolean, default: false},
  celebrators: [celebrator],
});

module.exports = lineItemSchema;
