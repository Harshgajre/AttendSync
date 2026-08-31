const express = require("express");
const router = express.Router();
const {
  markAttendanceByFaceScan,
  getUserTodayAttendance,
  getUserAttendanceHistory,
  getAllAttendanceRecords,
  getAttendanceStats,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

// Public Face Scan attendance route (biometric identification happens on server)
router.post("/face-scan", markAttendanceByFaceScan);

// User-specific attendance queries
router.get("/today/:userId", getUserTodayAttendance);
router.get("/history/:userId", getUserAttendanceHistory);

// Admin queries and analytics
router.get("/all", getAllAttendanceRecords);
router.get("/stats", getAttendanceStats);

module.exports = router;
