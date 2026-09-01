const express = require("express");
const router = express.Router();
const {
  getCurrentLectureHandler,
  getAllTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getLecturesByDay,
} = require("../controllers/timetableController");

// Public: Get current lecture based on day + time
router.get("/current-lecture", getCurrentLectureHandler);

// Public: Get all entries (with optional filters)
router.get("/", getAllTimetableEntries);

// Public: Get lectures for a specific day
router.get("/day/:day", getLecturesByDay);

// Public: Get single entry
router.get("/:id", getTimetableEntryById);

// Admin-managed routes
router.post("/", createTimetableEntry);
router.put("/:id", updateTimetableEntry);
router.delete("/:id", deleteTimetableEntry);

module.exports = router;
