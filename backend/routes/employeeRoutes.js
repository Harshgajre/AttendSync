const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  registerEmployee,
  loginEmployee,
  enrollEmployeeFace,
  getEmployeeProfile,
  getAllEmployees,
  getEmployeeById,
  updateAttendance,
  updatePFCL,
  deleteEmployee,
} = require("../controllers/employeeController");

// Public routes
router.post("/register", registerEmployee);
router.post("/login", loginEmployee);

// Protected routes (require JWT)
router.get("/me", authMiddleware, getEmployeeProfile);
router.get("/all", getAllEmployees);
router.get("/:id", getEmployeeById);
router.post("/enroll-face/:id", authMiddleware, enrollEmployeeFace);
router.put("/attendance/:id", authMiddleware, updateAttendance);
router.put("/pfcl/:id", authMiddleware, updatePFCL);
router.delete("/:id", authMiddleware, deleteEmployee);

module.exports = router;