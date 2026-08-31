const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    attendance: {
      type: Number,
      default: 0,
    },
    semester: {
      type: String,
      required: true,
      default: "1",
    },
    // Face Recognition Biometric Data
    faceEmbedding: {
      type: [Number], // 128-dimensional float array
      default: [],
      select: false, // Don't return by default for performance/security, explicitly select when needed
    },
    faceRegistered: {
      type: Boolean,
      default: false,
    },
    faceImage: {
      type: String, // base64 face snapshot for confirmation/avatar
      default: "",
    },
    faceRegisteredAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);