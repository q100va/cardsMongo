/*
============================================
 Client schema 
;===========================================
*/

// Mongoose statements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const institute = require("../schemas/institute");
const senior = require("../schemas/senior");
// ClientSchema for database collection
let clientSchema = new Schema(
    {
        firstName: { type: String },
        patronymic: { type: String, default: null },
        lastName: { type: String, default: null },
        // gender: { type: String },
        email: { type: String, default: null },
        phoneNumber: { type: String, default: null },
        whatsApp: { type: String, default: null },
        telegram: { type: String, default: null },
        vKontakte: { type: String, default: null },
        instagram: { type: String, default: null },
        facebook: { type: String, default: null },
        otherContact: { type: String, default: null },
        country: { type: String, default: null },
        region: { type: String, default: null },
        city: { type: String, default: null },
        nameDayCelebration: { type: Boolean, default: false },
        comments: { type: String, default: null },
        institutes: [institute],
        publishers: [String],
        coordinators: [String],
        correspondents: [{
            nursingHome: String,
            fullName: String,
/*             {
                lastName: String,
                firstName: String,
                patronymic: String,
                yearBirthday: String,
            } */
        }],
        dateCreated: { type: Date, default: new Date() },
        creator: { type: String, default: "okskust" },
        isRestricted: { type: Boolean, default: false },
        causeOfRestriction: { type: String, default: null },
        preventiveAction: { type: String, default: null },
        isDisabled: { type: Boolean, default: false },
        whatChanged: [],
        searchString:  [String],


    },

    { collection: "clients" }
);

module.exports = mongoose.model("Client", clientSchema);
