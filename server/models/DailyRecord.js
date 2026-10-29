const mongoose = require("mongoose");

const dailyRecordSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    isComplete: {
      type: Boolean,
      default: false,
    },

    goalAchieved: {
      type: Boolean,
      default: false,
    },

    stickerColor: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

dailyRecordSchema.index(
  { clerkUserId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("DailyRecord", dailyRecordSchema);
