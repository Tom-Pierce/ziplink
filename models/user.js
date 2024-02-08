const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String },
  pfp: { type: String },
  accountType: { type: String, required: true },
});

module.exports = mongoose.model("user", UserSchema);
