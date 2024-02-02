const { body, validationResult } = require("express-validator");
const ShortUrl = require("../models/shortUrl");
const generateKey = require("../utils/generateKey");
const validateCustomKey = require("../utils/validateCustomKey");

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
      // if user is logged in, create shortUrl with their id
      let shortUrl;
      if (req.user) {
        shortUrl = new ShortUrl({
          key: key,
          url: req.body.url,
          user: req.user._id,
        });
      } else {
        shortUrl = new ShortUrl({
          key: key,
          url: req.body.url,
        });
      }
      shortUrl.save();

      return res.status(201).json({ key: key });
    } catch (error) {
      return next(error);
    }
  },
];

exports.zipLinks_get = async (req, res, next) => {
  if (req.user) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    try {
      const zipLinks = await ShortUrl.find({ user: req.user._id })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ visits: -1 })
        .exec();
      res.json({ zipLinks: zipLinks });
    } catch (error) {
      res.sendStatus(500);
      console.error("Error fetching data: ", error);
    }
  } else {
    res.sendStatus(401);
  }
};

exports.zipLink_delete = async (req, res, next) => {
  if (req.user) {
    try {
      const zipLink = await ShortUrl.findOne(
        { key: req.params.key },
        "user"
      ).exec();

      // ziplink not found
      if (!zipLink) {
        return res.status(404).send("Not Found");
      }

      if (zipLink.user.equals(req.user._id)) {
        await ShortUrl.findByIdAndDelete(zipLink._id).exec();
        // ziplink found and deleted
        return res.status(204).send();
      } else {
        // ziplink is not owned by user
        return res.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return res.status(500).send("Internal Server Error: " + error.message);
    }
  } else {
    return res.status(401).send("Unauthorized");
  }
};
