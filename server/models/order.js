/*
============================================
; Model for order
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const lineItemDocument = require("../schemas/line-item");

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
    isRestricted: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
    comment: { type: String },
    lineItems: [lineItemDocument],
    orderDate: { type: String, default: new Date().toLocaleDateString() },
  }
  // { collection: "orders" }
);

module.exports = mongoose.model("Order", orderSchema);
