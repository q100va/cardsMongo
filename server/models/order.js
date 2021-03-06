/*
============================================
; Model for order
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const lineItemDocument = require("../schemas/line-item");
const celebrator = require("../schemas/celebrator");

const orderSchema = new Schema(
  {
    userName: { type: String },
    holiday: { type: String },
    clientFirstName: { type: String },
    clientPatronymic: { type: String },
    clientLastName: { type: String },
    email: { type: String },
    contactType: { type: String },
    contact: { type: String },
    institute: { type: String },
    amount: { type: Number },
    isAccepted: { type: Boolean, default: false },
    comment: { type: String },
    lineItems: [lineItemDocument],
    temporaryLineItems: [celebrator],
    orderDate: { type: String, default: new Date().toLocaleDateString() },
    filter: {
      addressFilter: { type: String },
      genderFilter: { type: String },
      region: { type: String },
      nursingHome: { type: String },
      year1: { type: Number },
      year2:  { type: Number },
      date1:  { type: Number },
      date2:  { type: Number },
      onlyWithPicture: { type: Boolean, default: false },
    },
    isCompleted: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    absents: [celebrator]
  },
   { collection: "orders" }
);

module.exports = mongoose.model("Order", orderSchema);
