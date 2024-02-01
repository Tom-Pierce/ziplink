const { body, validationResult } = require("express-validator");
const ShortUrl = require("../models/shortUrl");
const User = require("../models/user");
const generateKey = require("../utils/generateKey");
const validateCustomKey = require("../utils/validateCustomKey");
const shortUrl = require("../models/shortUrl");

exports.url_get = async (req, res, next) => {
  try {
    const shortUrl = await ShortUrl.findOneAndUpdate(
      { key: req.params.key },
      { $inc: { visits: 1 }, $set: { lastVisit: Date.now() } }
    ).exec();

    if (shortUrl === null) return res.sendStatus(404);
    return res.status(200).json({ url: shortUrl.url });
  } catch (error) {
    return next(error);
  }
};

exports.clicks_get = async (req, res, next) => {
  try {
    const shortUrl = await ShortUrl.findOne({ key: req.params.key }).exec();

    if (shortUrl === null) return res.sendStatus(404);
    return res.status(200).json({ clicks: shortUrl.visits });
  } catch (error) {
    return next(error);
  }
};

exports.url_post = [
  body("url")
    .trim()
    .isURL()
    .withMessage("Please provide a valid URL to shorten"),

  body("customKey").trim().optional().escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      let key;
      if (req.body.customKey) {
        const validation = await validateCustomKey(req.body.customKey);
        if (validation === null) key = req.body.customKey;
        else
          return res
            .status(409)
            .json({ msg: "Custom URL already in use by another user" });
      } else {
        key = await generateKey(8);
      }
      const shortUrl = new ShortUrl({
        key: key,
        url: req.body.url,
      });
      shortUrl.save();

      // if user is logged in add ziplink to their user
      if (req.user) {
        await User.findOneAndUpdate(
          { _id: req.user._id },
          { $push: { zipLinks: shortUrl._id } }
        );
      }

      return res.status(201).json({ key: key });
    } catch (error) {
      return next(error);
    }
  },
];

exports.zipLinks_get = async (req, res, next) => {
  if (req.user) {
    try {
      const user = await User.findById(req.user._id, "zipLinks")
        .populate("zipLinks")
        .exec();
      res.json({ zipLinks: user.zipLinks });
    } catch (error) {
      res.sendStatus(500);
      console.error("Error fetching data: ", error);
    }
  } else {
    res.sendStatus(401);
  }
};
