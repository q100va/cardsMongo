/*
============================================
; Model for the application's user roles
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  text: { type: String, unique: true },
  isDisabled: { type: Boolean, default: false },
},
  { collection: "roles" }
);

module.exports = mongoose.model("Role", roleSchema);
