const express = require("express");
const cookieParser = require("cookie-parser");
const router = require("./routes/router.js");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
require("./utils/auth.js");

const mongoose = require("mongoose");
const passport = require("passport");
const authRouter = require("./routes/authRouter.js");

main().catch((err) => console.log(err));

async function main() {
  const mongoDB =
    process.env.NODE_ENV === "test" ? undefined : process.env.MONGODB_URI;

  await mongoose.connect(mongoDB);
}

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/api/auth/", authRouter);
app.use("/api/", router);
module.exports = app;
