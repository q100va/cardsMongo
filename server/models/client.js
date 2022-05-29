/*
============================================
 Client schema 
;===========================================
*/

// Mongoose statements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ClientSchema for database collection
var clientSchema = new Schema(
    {
        firstName: { type: String, required: true },
        patronymic: { type: String },
        lastName: { type: String },
        gender: { type: String },
        email: { type: String },
        phoneNumber: { type: String },
        whatsApp: { type: String },
        telegram: { type: String },
        vKontakte: { type: String },
        instagram: { type: String },
        facebook: { type: String },
        country: { type: String },
        region: { type: String },
        city: { type: String },
        nameDay: { type: String, default: false },
        comments: { type: String },
        institute: { type: String },
        correspondent: { type: String },
        coordinator: { type: String },
        date_created: { type: Date, default: new Date() },
        isRestricted: { type: Boolean, default: false },
        isDisabled: { type: Boolean, default: false }

    },

    { collection: "clients" }
);

module.exports = mongoose.model("Client", clientSchema);
