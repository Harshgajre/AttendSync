const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const {
  saveSemester,
  getSemester,
  updateSemester,
  deleteSemester,
} = require("../controllers/semesterController");

// Public / Authenticated user view routes
router.get("/current", getSemester);

// Admin-only mutation routes
router.post("/save", authMiddleware, adminOnly, saveSemester);
router.put("/:id", authMiddleware, adminOnly, updateSemester);
router.delete("/:id", authMiddleware, adminOnly, deleteSemester);

module.exports = router;