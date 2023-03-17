const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const FollowSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  followed: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Follow", FollowSchema);
