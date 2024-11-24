/*
============================================
; Model for the application's region
;===========================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const regionSchema = new Schema({
    name: { type: String },
    spareRegions: [String],

},
    { collection: "regions" }
);


module.exports = mongoose.model("Region", regionSchema);
