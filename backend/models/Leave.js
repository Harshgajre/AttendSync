const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
    },

    leaveType: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },

    approvedBy: {
      type: String,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);