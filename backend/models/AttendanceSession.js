const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
  {
    timetableEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    day: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    facultyName: {
      type: String,
      default: "",
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      default: "",
    },
    semester: {
      type: String,
      default: "",
    },
    division: {
      type: String,
      default: "",
    },
    batch: {
      type: String,
      default: "",
    },
    // Who started the session
    startedById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "startedByModel",
      required: true,
    },
    startedByModel: {
      type: String,
      required: true,
      enum: ["Employee", "Admin"],
    },
    startedByName: {
      type: String,
      required: true,
    },
    startedByRole: {
      type: String,
      required: true,
      enum: ["faculty", "hod", "admin"],
    },
    actualSessionStartTime: {
      type: String, // "HH:mm AM/PM" when faculty actually started it
      required: true,
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "COMPLETED", "CLOSED"],
    },
    presentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate sessions for the same timetable entry on the same date
attendanceSessionSchema.index({ timetableEntryId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
