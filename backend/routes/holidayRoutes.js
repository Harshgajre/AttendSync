const express = require("express");

const router = express.Router();

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

// Get all holidays
router.get("/", getAllHolidays);

// Get single holiday
router.get("/:id", getHolidayById);

// Add new holiday
router.post("/", addHoliday);

// Update holiday
router.put("/:id", updateHoliday);

// Delete holiday
router.delete("/:id", deleteHoliday);

module.exports = router;