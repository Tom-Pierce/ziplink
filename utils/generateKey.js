const ShortUrl = require("../models/shortUrl");

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

module.exports = generateKey;
