const Timetable = require("../models/Timetable");

// Helper: Get current day name e.g. "Monday"
const getCurrentDayName = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
};

// Helper: Get current time as "HH:mm" (24h)
const getCurrentTime24h = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// Find the currently active timetable entry based on current day + time
const getCurrentLecture = async (user = null) => {
  const day = getCurrentDayName();
  const currentTime = getCurrentTime24h();

  if (day === "Sunday") {
    return { currentLecture: null, day, currentTime, dayLectures: [] };
  }

  const lectures = await Timetable.find({ day, isActive: true }).sort({ startTime: 1 });

  let filteredLectures = lectures;
  if (user) {
    const ELECTIVE_CODES = ["202047801", "202047803", "202047808", "202046715"];

    filteredLectures = lectures.filter((lec) => {
      // 1. Division filter
      if (user.division && lec.division && lec.division !== user.division) {
        return false;
      }
      // 2. Batch filter (If lecture specifies a batch, it MUST match the student's batch)
      if (user.batch && lec.batch && lec.batch !== user.batch) {
        return false;
      }
      // 3. Elective subject filter
      const isElectiveLec = ELECTIVE_CODES.includes(lec.subjectCode);
      if (isElectiveLec && user.electiveSubjectCode) {
        const isMatch =
          lec.subjectCode === user.electiveSubjectCode ||
          (user.electiveSubjectName &&
            lec.subjectName &&
            lec.subjectName.toLowerCase().includes(user.electiveSubjectName.toLowerCase()));
        if (!isMatch) return false;
      }
      return true;
    });
  }

  let currentLecture = null;
  for (const lecture of filteredLectures) {
    if (currentTime >= lecture.startTime && currentTime < lecture.endTime) {
      currentLecture = lecture;
      break;
    }
  }

  // Fallback if no specific entry found
  if (!currentLecture && user) {
    for (const lecture of lectures) {
      if (currentTime >= lecture.startTime && currentTime < lecture.endTime) {
        const batchOk = !lecture.batch || !user.batch || lecture.batch === user.batch;
        if (batchOk) {
          currentLecture = lecture;
          break;
        }
      }
    }
  }

  return {
    currentLecture,
    day,
    currentTime,
    dayLectures: filteredLectures.length > 0 ? filteredLectures : lectures,
  };
};

// GET /api/timetable/current-lecture
const getCurrentLectureHandler = async (req, res) => {
  try {
    const { currentLecture, day, currentTime, dayLectures } = await getCurrentLecture();

    res.status(200).json({
      success: true,
      currentTime,
      day,
      currentLecture: currentLecture || null,
      hasActiveLecture: Boolean(currentLecture),
      dayLectures: dayLectures || [],
    });
  } catch (error) {
    console.error("getCurrentLecture error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get current lecture",
    });
  }
};

// GET /api/timetable (all entries, optionally filtered)
const getAllTimetableEntries = async (req, res) => {
  try {
    const { day, semester, division, batch } = req.query;
    const query = {};
    if (day) query.day = day;
    if (semester) query.semester = semester;
    if (division) query.division = division;
    if (batch) query.batch = batch;

    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const entries = await Timetable.find(query).sort({ startTime: 1 });

    // Sort by day order then startTime
    entries.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    console.error("getAllTimetableEntries error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch timetable",
    });
  }
};

// GET /api/timetable/:id
const getTimetableEntryById = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Timetable entry not found" });
    }
    res.status(200).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/timetable (Admin creates a lecture)
const createTimetableEntry = async (req, res) => {
  try {
    const {
      day,
      startTime,
      endTime,
      subjectCode,
      subjectName,
      facultyId,
      facultyName,
      room,
      semester,
      division,
      batch,
      lectureType,
      isActive,
    } = req.body;

    if (!day || !startTime || !endTime || !subjectCode || !subjectName) {
      return res.status(400).json({
        success: false,
        message: "Please provide day, startTime, endTime, subjectCode, and subjectName",
      });
    }

    const entry = new Timetable({
      day,
      startTime,
      endTime,
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
      facultyId: facultyId || null,
      facultyName: facultyName ? facultyName.trim() : "",
      room: room ? room.trim() : "",
      semester: semester ? semester.trim() : "",
      division: division ? division.trim() : "",
      batch: batch ? batch.trim() : "",
      lectureType: lectureType || "Lecture",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await entry.save();

    res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      entry,
    });
  } catch (error) {
    console.error("createTimetableEntry error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create timetable entry",
    });
  }
};

// PUT /api/timetable/:id (Admin updates)
const updateTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Timetable entry not found" });
    }

    const fields = [
      "day", "startTime", "endTime", "subjectCode", "subjectName",
      "facultyId", "facultyName", "room", "semester", "division",
      "batch", "lectureType", "isActive",
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        entry[field] = typeof req.body[field] === "string"
          ? req.body[field].trim()
          : req.body[field];
      }
    }

    await entry.save();

    res.status(200).json({
      success: true,
      message: "Timetable entry updated successfully",
      entry,
    });
  } catch (error) {
    console.error("updateTimetableEntry error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update timetable entry",
    });
  }
};

// DELETE /api/timetable/:id
const deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Timetable entry not found" });
    }
    res.status(200).json({
      success: true,
      message: "Timetable entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/timetable/day/:day (get all lectures for a specific day)
const getLecturesByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const entries = await Timetable.find({ day, isActive: true }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      day,
      count: entries.length,
      entries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/timetable/faculty-names
// Returns sorted, deduplicated list of faculty names from all active timetable entries
const getFacultyNames = async (req, res) => {
  try {
    const entries = await Timetable.find(
      { isActive: true, facultyName: { $nin: ["", null] } },
      { facultyName: 1, _id: 0 }
    );

    const namesSet = new Set();
    for (const e of entries) {
      if (e.facultyName && e.facultyName.trim()) {
        namesSet.add(e.facultyName.trim());
      }
    }

    const names = Array.from(namesSet).sort((a, b) => a.localeCompare(b));
    res.status(200).json({ success: true, names });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCurrentLecture,
  getCurrentLectureHandler,
  getAllTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getLecturesByDay,
  getFacultyNames,
  getCurrentDayName,
  getCurrentTime24h,
};
