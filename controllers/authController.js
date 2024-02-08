const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect(process.env.CLIENT_URL);
};

exports.user_info = (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

exports.local_signup = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    // Checks if email is taken
    .custom(async (value) => {
      const user = await User.findOne({ email: value }).exec();
      if (user) throw new Error("Email is already in use");
      return true;
    })
    .escape(),

  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    // Checks if password fits the minimum requirements
    .custom((value) => {
      const hasUppercase = /[A-Z]/.test(value);
      if (!hasUppercase) {
        throw new Error("Password must contain an uppercase letter");
      }
      return true;
    })
    .custom((value) => {
      const hasNumber = /\d/.test(value);

      if (!hasNumber) {
        throw new Error("Password must contain a number");
      }

      return true;
    })
    // Checks if passwords match
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords don't match");
      } else {
        return true;
      }
    })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.errors.map((error) => {
        return error.msg;
      });

      return res.status(400).send(errArr);
    }

    // Hash password and create user
    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return err;
        }

        const user = new User({
          email: req.body.email,
          password: hashedPassword,
          accountType: "local",
        });

        await user.save();
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(201).json({ message: "user created" });
        });
      });
    } catch (error) {
      return next(error);
    }
  },
];

exports.local_login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send(info);
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).json();
    });
  })(req, res, next);
};

exports.is_authenticated = (req, res, next) => {
  if (req.isAuthenticated()) res.json({ authenticated: true });
  else res.json({ authenticated: false });
};
