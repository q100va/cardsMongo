/*
============================================
; Title: WEB450 Bob's Computer Repair Shop Sprint1
; Author: Professor Krasso
; Date: April 24, 2022
; Modified By: House Gryffindor
; Description: Bob's Computer Repair Shop App app.js file
;===========================================
*/

/**
 * Require statements
 */
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");

const UserApi = require("./routes/user-api");
const ClientApi = require("./routes/client-api");
const HousesApi = require("./routes/houses-api");
const SessionApi = require("./routes/session-api");
const SeniorsApi = require("./routes/seniors-api");
const RolesApi = require("./routes/role-api");
const OrdersApi = require("./routes/orders-api");
const ListsApi = require("./routes/lists-api");
const dotenv = require('dotenv');
dotenv.config();

/**
 * App configurations
 */
let app = express();
express.json({limit: '5mb'})
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../dist/bcrs")));
app.use("/", express.static(path.join(__dirname, "../dist/bcrs")));

/**
 * Variables
 */
const port = process.env.PORT || 3000; // server port

// TODO: This line will need to be replaced with your actual database connection string

const conn = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cardsmongo.1f6wa.mongodb.net/CardsMongo?retryWrites=true&w=majority`;

/**
 * Database connection
 */
mongoose
  .connect(conn, {
    promiseLibrary: require("bluebird"),
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.debug(`Connection to the database instance was successful`);
  })
  .catch((err) => {
    console.log(`MongoDB Error: ${err.message}`);
  }); // end mongoose connection

/**
 * API(s) go here...
 */
app.use("/api/houses", HousesApi);
app.use("/api/session", SessionApi);
app.use("/api/users", UserApi);
app.use("/api/clients", ClientApi);
app.use("/api/seniors", SeniorsApi);
app.use("/api/roles", RolesApi);
app.use("/api/orders", OrdersApi);
app.use("/api/lists", ListsApi);

/**
 * Create and start server
 */
http.createServer(app).listen(port, function () {
  console.log(`Application started and listening on port: ${port}`);
}); // end http create server function
