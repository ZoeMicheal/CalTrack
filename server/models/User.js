const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },

    displayName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    hiddenNutrients: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
