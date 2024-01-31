const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  googleId: { type: String, required: true },
  zipLinks: [{ type: Schema.Types.ObjectId, ref: "shortUrl" }],
  email: { type: String, required: true },
  pfp: { type: String, required: false },
});

module.exports = mongoose.model("user", UserSchema);
