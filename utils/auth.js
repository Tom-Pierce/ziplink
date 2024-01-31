const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreateUser = require("../utils/findOrCreateUser");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
      prompt: "select_account consent",
      scope: ["profile"],
      state: true,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const user = await findOrCreateUser({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
        });
        return cb(null, profile);
      } catch (error) {
        return cb(error, profile);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
