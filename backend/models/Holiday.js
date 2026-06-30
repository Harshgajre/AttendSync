const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    holidayName: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
    },

    holidayDate: {
      type: Date,
      default: null,
    },

    holidayFor: {
      type: String,
      enum: ["student", "employee", "both"],
      default: "both",
    },

    repeatType: {
      type: String,
      enum: ["once", "weekly", "yearly"],
      default: "once",
    },

    weeklyDay: {
      type: String,
      enum: [
        "",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Holiday", holidaySchema);