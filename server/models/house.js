/*
============================================
; Model 
;===========================================
*/

// Mongoose require statements
const any = require("bluebird/js/release/any");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let housesSchema = new Schema(
  {
    nursingHome: { type: String, required: true, unique: true },
    region: { type: String, required: true },
    address: { type: String, required: true },
    infoComment: { type: String },
    adminComment: { type: String },
    noAddress: { type: Boolean, default: false },
    isReleased: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    dateLastUpdate: { type: Date },
    dateLastUpdateClone: { type: String },
    nameContact: { type: String },
    contact: { type: String },
    isDisabled: { type: Boolean, default: false },
    website: { type: String },
    datesOfUpdates: [Date],
    statistic: {
      newYear: {

        time: { type: Number },
        plus0: { type: Number },
        plus1: { type: Number },
        plus2: { type: Number },
        plus3: { type: Number },
        plus4: { type: Number },
        specialMen: { type: Number },
        specialWomen: { type: Number },
        oldMen: { type: Number },
        oldWomen: { type: Number },
        yangMen: { type: Number },
        yangWomen: { type: Number },
        amount: { type: Number },
        specialMenPlus: { type: Number },
        specialWomenPlus: { type: Number },
        oldMenPlus: { type: Number },
        oldWomenPlus: { type: Number },
        yangMenPlus: { type: Number },
        yangWomenPlus: { type: Number },

      }
    }
  },
  { collection: "houses" }
);

module.exports = mongoose.model("House", housesSchema);
