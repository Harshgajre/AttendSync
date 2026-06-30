const express =
  require("express");

const router =
  express.Router();

const {

  createLeave,

  getAllLeaves,

  getLeaveById,

  getPendingLeaves,

  approveLeave,

  rejectLeave,

  deleteLeave,

} = require(
  "../controllers/leaveController"
);

// Employee Submit Leave
router.post(
  "/create",
  createLeave
);

// Admin View All Leaves
router.get(
  "/all",
  getAllLeaves
);

// Admin View Pending Leaves
router.get(
  "/pending",
  getPendingLeaves
);

// Get Single Leave
router.get(
  "/:id",
  getLeaveById
);

// Approve Leave
router.put(
  "/approve/:id",
  approveLeave
);

// Reject Leave
router.put(
  "/reject/:id",
  rejectLeave
);

// Delete Leave
router.delete(
  "/:id",
  deleteLeave
);

module.exports =
  router;