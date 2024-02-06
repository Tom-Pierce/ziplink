const express = require("express");
const authRouter = express.Router();
const passport = require("passport");
const isLoggedIn = require("../utils/isLoggedIn");
const authController = require("../controllers/authController");

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL + "?successfulLogin=true",
    failureRedirect: process.env.CLIENT_URL + "?successfulLogin=false",
  })
);

authRouter.get("/userInfo", isLoggedIn, authController.user_info);

authRouter.get("/logout", authController.logout);

module.exports = authRouter;
