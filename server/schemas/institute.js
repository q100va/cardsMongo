/*
============================================
; Schema line-items
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const instituteSchema = new Schema({

  name: { type: String },
  category: { type: String },
});

module.exports = instituteSchema;
