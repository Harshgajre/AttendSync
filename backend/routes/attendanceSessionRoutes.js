const express = require("express");
const router = express.Router();
const {
  startAttendanceSession,
  getCurrentSession,
  closeSession,
  getAllSessions,
  markStudentAttendanceByFace,
  getStudentTodayTimetableAttendance,
  getStudentTimetableHistory,
  getFacultyCurrentLectureInfo,
} = require("../controllers/attendanceSessionController");

// Faculty/HOD face scan to start session
router.post("/start", startAttendanceSession);

// Student face scan to mark attendance
router.post("/student-face-scan", markStudentAttendanceByFace);

// Get current active session (for student dashboard)
router.get("/current", getCurrentSession);

// Get today's timetable attendance for a student
router.get("/student-today/:studentId", getStudentTodayTimetableAttendance);

// Get complete timetable attendance history for a student
router.get("/student-history/:studentId", getStudentTimetableHistory);

// Get faculty's current lecture info + session status
router.get("/faculty-today/:employeeId", getFacultyCurrentLectureInfo);

// Admin: Get all sessions
router.get("/", getAllSessions);

// Close a session
router.put("/:id/close", closeSession);

module.exports = router;
