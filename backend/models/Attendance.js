const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Student", "Employee"],
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ["Student", "Employee"],
    },
    collegeOrCompany: {
      type: String,
      default: "",
    },
    date: {
      type: String, // format: "YYYY-MM-DD"
      required: true,
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSlot",
      required: true,
    },
    slotName: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: String, // e.g. "09:35 AM"
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    verificationMethod: {
      type: String,
      default: "FACE",
      enum: ["FACE", "MANUAL"],
    },
    status: {
      type: String,
      default: "Present",
      enum: ["Present", "Late", "Absent"],
    },
    similarityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Prevents duplicate attendance for the same user on the same date for the same slot
attendanceSchema.index({ userId: 1, date: 1, slotId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
