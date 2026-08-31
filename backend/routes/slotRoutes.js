const express = require("express");
const router = express.Router();
const {
  getAllSlots,
  getActiveSlot,
  createSlot,
  updateSlot,
  deleteSlot,
} = require("../controllers/slotController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes for slot info
router.get("/", getAllSlots);
router.get("/active", getActiveSlot);

// Admin-managed routes (can also be used with auth)
router.post("/", createSlot);
router.put("/:id", updateSlot);
router.delete("/:id", deleteSlot);

module.exports = router;
