const ShortUrl = require("../models/shortUrl");

const validateCustomKey = async (customKey) => {
  const res = await ShortUrl.findOne({ key: customKey }).exec();
  if (res === null) return null;
  return customKey;
};

module.exports = validateCustomKey;
