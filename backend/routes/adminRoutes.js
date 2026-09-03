const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly, facultyAdminOrAdmin } = require("../middleware/authMiddleware");

const {
  loginAdmin,
  loginFacultyAsAdmin,
  getAdminProfile,
  getDashboardData,
  getAllStudents,
  deleteStudent,
} = require("../controllers/adminController");

// Public Admin Routes
router.post("/login", loginAdmin);
router.post("/faculty-login", loginFacultyAsAdmin);

// Protected Admin Routes
router.get("/me", authMiddleware, adminOnly, getAdminProfile);
// Dashboard, student list, and student deletion accessible by both admin and faculty_admin
router.get("/dashboard", authMiddleware, facultyAdminOrAdmin, getDashboardData);
router.get("/students", authMiddleware, facultyAdminOrAdmin, getAllStudents);
router.delete("/student/:id", authMiddleware, facultyAdminOrAdmin, deleteStudent);

module.exports = router;
