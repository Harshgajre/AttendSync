const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "faculty",
      enum: ["faculty", "hod"],
    },
    department: {
      type: String,
      default: "",
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
    totalPF: {
      type: Number,
      default: 12,
    },
    usedPF: {
      type: Number,
      default: 0,
    },
    totalCL: {
      type: Number,
      default: 12,
    },
    usedCL: {
      type: Number,
      default: 0,
    },
    // Face Recognition Biometric Data
    faceEmbedding: {
      type: [Number], // 128-dimensional float array
      default: [],
      select: false, // Don't return by default for performance/security
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

module.exports = mongoose.model("Employee", employeeSchema);