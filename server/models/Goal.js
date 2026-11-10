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
      // Zoe is adding user's preferred tracking metric, weight management goal, and optional target weight
      primaryMetric: {
          type: String,
          enum: ["calories", "protein", "carbs", "fat"],
          default: "calories",
      },
      weightGoal: {
          type: String,
          enum: ["lose", "maintain", "gain"],
          default: "maintain",
      },
      targetWeight: {
          type: Number,
          min: 0,
          default: null,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
