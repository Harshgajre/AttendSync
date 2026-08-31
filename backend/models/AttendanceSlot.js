const mongoose = require("mongoose");

const attendanceSlotSchema = new mongoose.Schema(
  {
    slotName: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String, // format: "HH:mm" (24-hour e.g. "09:00")
      required: true,
      trim: true,
    },
    endTime: {
      type: String, // format: "HH:mm" (24-hour e.g. "11:00")
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AttendanceSlot", attendanceSlotSchema);
