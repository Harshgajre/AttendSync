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

    // --- TIMETABLE-BASED FIELDS (new) ---
    attendanceSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      default: null,
    },
    timetableEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      default: null,
    },
    subjectCode: {
      type: String,
      default: "",
      trim: true,
    },
    subjectName: {
      type: String,
      default: "",
      trim: true,
    },
    facultyName: {
      type: String,
      default: "",
      trim: true,
    },
    lectureStartTime: {
      type: String,
      default: "",
    },
    lectureEndTime: {
      type: String,
      default: "",
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

    // --- LEGACY SLOT FIELDS (kept for backward compatibility) ---
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSlot",
      default: null,
    },
    slotName: {
      type: String,
      default: "",
    },

    // --- COMMON FIELDS ---
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
    // Track attendance mode
    attendanceMode: {
      type: String,
      default: "TIMETABLE", // "TIMETABLE" or "LEGACY_SLOT"
      enum: ["TIMETABLE", "LEGACY_SLOT"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index for TIMETABLE mode: Prevents duplicate attendance for same student + date + timetable lecture
// Uses a partial filter expression so it only applies when timetableEntryId is set
attendanceSchema.index(
  { userId: 1, date: 1, timetableEntryId: 1 },
  {
    unique: true,
    partialFilterExpression: { timetableEntryId: { $ne: null } },
  }
);

// Legacy slot unique index (kept for backward compatibility)
attendanceSchema.index(
  { userId: 1, date: 1, slotId: 1 },
  {
    unique: true,
    partialFilterExpression: { slotId: { $ne: null }, attendanceMode: "LEGACY_SLOT" },
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
