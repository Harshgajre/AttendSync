const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      trim: true,
    },
    startTime: {
      type: String, // "HH:mm" 24-hour format e.g. "10:55"
      required: true,
      trim: true,
    },
    endTime: {
      type: String, // "HH:mm" 24-hour format e.g. "11:45"
      required: true,
      trim: true,
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
    room: {
      type: String,
      default: "",
      trim: true,
    },
    semester: {
      type: String,
      default: "",
      trim: true,
    },
    division: {
      type: String,
      default: "",
      trim: true,
    },
    batch: {
      type: String,
      default: "",
      trim: true,
    },
    lectureType: {
      type: String,
      default: "Lecture",
      enum: ["Lecture", "Practical", "Tutorial"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by day + time
timetableSchema.index({ day: 1, startTime: 1 });

module.exports = mongoose.model("Timetable", timetableSchema);
