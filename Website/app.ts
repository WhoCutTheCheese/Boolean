import * as dotenv from "dotenv";

import * as http from "http";
import * as socket from "socket.io";
import * as settings from './config.json'
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import mongoStore from "connect-mongo";
import path from "path";
import sharedSession from "express-socket.io-session";
import bodyParser from "body-parser";
import logger from "morgan";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer();

// --> App <-- \\

// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");
app.use("/public", express.static(__dirname + "/public"));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.get("/", (req, res) => {
    console.log("/")
    res.send("Hello World");
});

// --> Server Functions <-- \\

server.on("listening", () => {
    console.log(`Listing on port ${port}`)
})

server.on("connection", (stream) => {
    console.log("got user")
})

// --> HTTP <-- \\

server.listen(port);
