const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const {
  createLeave,
  getAllLeaves,
  getLeaveById,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  deleteLeave,
} = require("../controllers/leaveController");

// Employee Submit Leave (Protected - any logged in user/employee)
router.post("/create", authMiddleware, createLeave);

// Admin View & Manage Leaves (Admin Only)
router.get("/all", authMiddleware, adminOnly, getAllLeaves);
router.get("/pending", authMiddleware, adminOnly, getPendingLeaves);
router.get("/:id", authMiddleware, getLeaveById);
router.put("/approve/:id", authMiddleware, adminOnly, approveLeave);
router.put("/reject/:id", authMiddleware, adminOnly, rejectLeave);
router.delete("/:id", authMiddleware, adminOnly, deleteLeave);

module.exports = router;