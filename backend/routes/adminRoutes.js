const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const {
  loginAdmin,
  getAdminProfile,
  getDashboardData,
  getAllStudents,
  deleteStudent,
} = require("../controllers/adminController");

// Public Admin Route
router.post("/login", loginAdmin);

// Protected Admin Routes (JWT required + role === 'admin')
router.get("/me", authMiddleware, adminOnly, getAdminProfile);
router.get("/dashboard", authMiddleware, adminOnly, getDashboardData);
router.get("/students", authMiddleware, adminOnly, getAllStudents);
router.delete("/student/:id", authMiddleware, adminOnly, deleteStudent);

module.exports = router;
