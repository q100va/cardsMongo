/*
============================================
 Client schema 
;===========================================
*/

// Mongoose statements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const institute = require ("../schemas/institute");
const senior = require ("../schemas/senior");
// ClientSchema for database collection
let clientSchema = new Schema(
    {
        firstName: { type: String, required: true },
        patronymic: { type: String },
        lastName: { type: String },
       // gender: { type: String },
        email: { type: String },
        phoneNumber: { type: String },
        whatsApp: { type: String },
        telegram: { type: String },
        vKontakte: { type: String },
        instagram: { type: String },
        facebook: { type: String },
        otherContact : { type: String },
        country: { type: String },
        region: { type: String },
        city: { type: String },
        nameDayCelebration: { type: String, default: false },
        comments: { type: String },
        institutes: [ institute ],
        publishers:   [ String ],      
        coordinators: [ String ],       
        correspondents: [ senior ],
        date_created: { type: Date, default: new Date() },
        isRestricted: { type: Boolean, default: false },
        causeOfRestriction : { type: String },
        preventiveAction : { type: String },
        isDisabled: { type: Boolean, default: false }

    },

    { collection: "clients" }
);

module.exports = mongoose.model("Client", clientSchema);
