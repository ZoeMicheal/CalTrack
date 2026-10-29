const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },

    calorieMin: {
      type: Number,
      default: 0,
      min: 0,
    },

    calorieMax: {
      type: Number,
      default: 2000,
      min: 0,
    },

    proteinTarget: {
      type: Number,
      default: 0,
      min: 0,
    },

    carbsTarget: {
      type: Number,
      default: 0,
      min: 0,
    },

    fatTarget: {
      type: Number,
      default: 0,
      min: 0,
    },

    stickerColor: {
      type: String,
      default: "gold",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
