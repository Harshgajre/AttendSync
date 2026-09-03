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

// Protected Admin Routes (JWT required + role === 'admin')
router.get("/me", authMiddleware, adminOnly, getAdminProfile);
// Dashboard accessible by both admin and faculty_admin
router.get("/dashboard", authMiddleware, facultyAdminOrAdmin, getDashboardData);
router.get("/students", authMiddleware, adminOnly, getAllStudents);
router.delete("/student/:id", authMiddleware, adminOnly, deleteStudent);

module.exports = router;
