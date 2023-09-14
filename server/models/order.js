/*
============================================
; Model for order
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const lineItem = require("../schemas/line-item");
const celebrator = require("../schemas/celebrator");

const orderSchema = new Schema(
  {
    userName: { type: String },
    holiday: { type: String },
    source: { type: String },
    clientFirstName: { type: String },
    clientPatronymic: { type: String },
    clientLastName: { type: String },
    email: { type: String },
    contactType: { type: String },
    contact: { type: String },
    institute: { type: String },
    amount: { type: Number },
    comment: { type: String },
    lineItems: [lineItem],
    temporaryLineItems: [celebrator],
    orderDate: { type: String, default: new Date().toLocaleDateString() },
    dateOfOrder: { type: Date, default: new Date() },
    filter: {
      addressFilter: { type: String },
      genderFilter: { type: String },
      femaleAmount: { type: Number },
      maleAmount: { type: Number },
      region: { type: String },
      nursingHome: { type: String },
      maxOneHouse: { type: Number },
      maxNoAddress: { type: Number },
      year1: { type: Number },
      year2: { type: Number },
      date1: { type: Number },
      date2: { type: Number },
      onlyWithPicture: { type: Boolean, default: false },
      onlyAnniversaries: { type: Boolean, default: false },
      onlyAnniversariesAndOldest: { type: Boolean, default: false },
    },
    isCompleted: { type: Boolean, default: false },
    absents: [celebrator],
    deleted: [lineItem],

    isAccepted: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    isReturned: { type: Boolean, default: false },
    isOverdue: { type: Boolean, default: false },

    clientId: { type: String }
  },
  { collection: "orders" }
);

module.exports = mongoose.model("Order", orderSchema);
