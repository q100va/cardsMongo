/*
============================================
; Schema celebrator
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const celebratorSchema = new Schema({

  position: { type: Number },
  nursingHome: { type: String },
  lastName: { type: String },
  firstName: { type: String },
  patronymic: { type: String },
  dateBirthday: { type: Number },
  monthBirthday: { type: Number },
  yearBirthday: { type: Number },
  comment1: { type: String },
  specialComment: { type: String },
  linkPhoto: { type: String },
  nameDay: { type: String },
  dateNameDay: { type: Number },
  monthNameDay: { type: Number },
  plusAmount: { type: Number },
  oldest: { type: Boolean, default: false },
  category: { type: String },
  noAddress: { type: Boolean, default: false },
  fullDayBirthday: { type: String },
  gender: { type: String },
  celebrator_id: { type: String },

});

module.exports = celebratorSchema;