const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const {
  addHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} = require("../controllers/holidayController");

/**
 * Holiday Routes
 */

// Public / Authenticated user view routes
router.get("/", getAllHolidays);
router.get("/:id", getHolidayById);

// Admin-only mutation routes
router.post("/", authMiddleware, adminOnly, addHoliday);
router.put("/:id", authMiddleware, adminOnly, updateHoliday);
router.delete("/:id", authMiddleware, adminOnly, deleteHoliday);

module.exports = router;