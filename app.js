const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const router = require("./routes/router.js");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  const mongoDB =
    process.env.NODE_ENV === "test" ? undefined : process.env.MONGODB_URI;

  await mongoose.connect(mongoDB);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/api/", router);

module.exports = app;
