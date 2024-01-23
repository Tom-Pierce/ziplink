const { body, validationResult } = require("express-validator");
const ShortUrl = require("../models/shortUrl");

exports.url_get = async (req, res, next) => {
  try {
    const shortUrl = await ShortUrl.findOneAndUpdate(
      { key: req.params.key },
      { $inc: { visits: 1 } }
    ).exec();

    return res.status(200).json({ url: shortUrl.url });
  } catch (error) {
    return next(error);
  }
};

exports.url_post = [
  body("url")
    .trim()
    .isURL()
    .withMessage("Please provide a valid URL to shorten"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const key = await generateKey(8);
      console.log(req.body.url);
      console.log(key);
      const shortUrl = new ShortUrl({
        key: key,
        url: req.body.url,
      });
      shortUrl.save();
      return res.status(201).json({ key: key });
    } catch (error) {
      return next(error);
    }
  },
];

const generateKey = async (length) => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let key = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    key += characters.charAt(randomIndex);
  }
  const duplicate = await ShortUrl.findOne({ key: key }).exec();
  if (duplicate) {
    return generateKey(length);
  } else {
    return key;
  }
};
