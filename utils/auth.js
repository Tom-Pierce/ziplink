const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const findOrCreateUser = require("../utils/findOrCreateUser");
const User = require("../models/user");

// google oauth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      prompt: "select_account",
      scope: ["profile"],
      state: true,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const user = await findOrCreateUser({
          email: profile._json.email,
          pfp: profile._json.picture,
          accountType: "google",
        });
        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

// local auth strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ email: username });

        if (!user) {
          return done(null, false, {
            message: "No account found with that email address",
          });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Email or password incorrect" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (userId, done) => {
  const user = await User.findOne({ _id: userId }).exec();
  done(null, user);
});
