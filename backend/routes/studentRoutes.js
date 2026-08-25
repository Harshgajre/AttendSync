const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  registerStudent,
  loginStudent,
  getStudentProfile,
  getAllStudents,
  getStudentById,
  updateAttendance,
  updateSemester,
  deleteStudent,
} = require("../controllers/studentController");

// Public routes
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Protected routes (require JWT)
router.get("/me", authMiddleware, getStudentProfile);
router.get("/all", getAllStudents);
router.get("/:id", getStudentById);
router.put("/attendance/:id", authMiddleware, updateAttendance);
router.put("/semester/:id", authMiddleware, updateSemester);
router.delete("/:id", authMiddleware, deleteStudent);

module.exports = router;