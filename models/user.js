const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  pfp: { type: String, required: false },
});

module.exports = mongoose.model("user", UserSchema);
