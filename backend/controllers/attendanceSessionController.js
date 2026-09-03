const mongoose = require("mongoose");
const AttendanceSession = require("../models/AttendanceSession");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Student = require("../models/Student");
const { getCurrentLecture, getCurrentDayName, getCurrentTime24h } = require("./timetableController");

// Calculate Euclidean Distance between two 128-d face descriptor vectors
const calculateEuclideanDistance = (embedding1, embedding2) => {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    return Infinity;
  }
  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

const getTodayDateStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getCurrentTimeFormatted = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
// Helper: Auto-close expired sessions where endTime <= currentTime
const autoCloseExpiredSessions = async () => {
  try {
    const currentTime = getCurrentTime24h();
    const todayDate = getTodayDateStr();
    await AttendanceSession.updateMany(
      {
        date: todayDate,
        endTime: { $lte: currentTime },
        status: "ACTIVE",
      },
      { status: "CLOSED" }
    );
  } catch (err) {
    console.error("Auto close expired sessions error:", err);
  }
};

// POST /api/attendance-sessions/start
// Faculty/HOD scans face → identify → check authorization → start session
const startAttendanceSession = async (req, res) => {
  try {
    await autoCloseExpiredSessions();

    const { faceEmbedding } = req.body;

    if (!faceEmbedding || !Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid face biometric data provided.",
      });
    }

    // 1. Find current lecture from timetable
    const { currentLecture, day, currentTime } = await getCurrentLecture();

    if (!currentLecture) {
      return res.status(400).json({
        success: false,
        faceMatched: false,
        message: "No lecture is currently scheduled. Please check the timetable.",
        currentTime,
        day,
      });
    }

    // 2. Identify the person from registered employees (faculty/HOD)
    const registeredEmployees = await Employee.find({ faceRegistered: true }).select("+faceEmbedding");

    let bestMatch = null;
    let lowestDistance = Infinity;
    const MATCH_THRESHOLD = 0.55;

    for (const employee of registeredEmployees) {
      if (employee.faceEmbedding && employee.faceEmbedding.length > 0) {
        const distance = calculateEuclideanDistance(faceEmbedding, employee.faceEmbedding);
        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = employee;
        }
      }
    }

    if (!bestMatch || lowestDistance > MATCH_THRESHOLD) {
      return res.status(404).json({
        success: false,
        faceMatched: false,
        message: "Face not recognized. Only registered faculty or HOD can start attendance.",
        distance: lowestDistance < 100 ? lowestDistance.toFixed(3) : null,
      });
    }

    const similarityScore = Math.max(0, Math.min(100, Math.round((1 - lowestDistance) * 100)));

    // 3. Check authorization: HOD is authorized for all lectures.
    const isHOD = bestMatch.role === "hod";

    const cleanName = (str) =>
      (str || "")
        .toLowerCase()
        .replace(/\b(dr|mr|ms|prof|mrs)\.?,?\b/gi, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

    const empClean = cleanName(bestMatch.name);
    const assignedClean = cleanName(currentLecture.facultyName);

    const nameMatches =
      assignedClean &&
      empClean &&
      (assignedClean === empClean ||
        assignedClean.includes(empClean) ||
        empClean.includes(assignedClean));

    const idMatches =
      currentLecture.facultyId &&
      String(currentLecture.facultyId) === String(bestMatch._id);

    const isUnassigned = !currentLecture.facultyId && !currentLecture.facultyName;

    const isAuthorized = isHOD || idMatches || nameMatches || isUnassigned;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        faceMatched: true,
        authorized: false,
        message: `You are not authorized to start attendance for this lecture. This lecture is assigned to ${currentLecture.facultyName || "another faculty member"}.`,
        identifiedAs: {
          id: bestMatch._id,
          name: bestMatch.name,
          role: bestMatch.role,
        },
        currentLecture: {
          id: currentLecture._id,
          subjectName: currentLecture.subjectName,
          subjectCode: currentLecture.subjectCode,
          assignedFaculty: currentLecture.facultyName,
          startTime: currentLecture.startTime,
          endTime: currentLecture.endTime,
        },
        similarityScore,
      });
    }

    // 4. Check if a session already exists for this timetable entry today
    const todayDate = getTodayDateStr();
    const existingSession = await AttendanceSession.findOne({
      timetableEntryId: currentLecture._id,
      date: todayDate,
    });

    if (existingSession) {
      // Session already started — return it with current count
      const presentCount = await Attendance.countDocuments({
        attendanceSessionId: existingSession._id,
      });

      return res.status(200).json({
        success: true,
        alreadyStarted: true,
        faceMatched: true,
        authorized: true,
        message: "Attendance session is already active for this lecture.",
        session: { ...existingSession.toObject(), presentCount },
        currentLecture,
        identifiedAs: {
          id: bestMatch._id,
          name: bestMatch.name,
          role: bestMatch.role,
        },
        similarityScore,
      });
    }

    // 5. Create new attendance session
    const now = getCurrentTimeFormatted();
    const newSession = new AttendanceSession({
      timetableEntryId: currentLecture._id,
      date: todayDate,
      day: getCurrentDayName(),
      subjectCode: currentLecture.subjectCode,
      subjectName: currentLecture.subjectName,
      facultyId: currentLecture.facultyId || null,
      facultyName: currentLecture.facultyName || "",
      startTime: currentLecture.startTime,
      endTime: currentLecture.endTime,
      room: currentLecture.room || "",
      semester: currentLecture.semester || "",
      division: currentLecture.division || "",
      batch: currentLecture.batch || "",
      startedById: bestMatch._id,
      startedByModel: "Employee",
      startedByName: bestMatch.name,
      startedByRole: bestMatch.role || "faculty",
      actualSessionStartTime: now,
      status: "ACTIVE",
      presentCount: 0,
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      alreadyStarted: false,
      faceMatched: true,
      authorized: true,
      message: `Attendance session started successfully for ${currentLecture.subjectName}.`,
      session: newSession,
      currentLecture,
      identifiedAs: {
        id: bestMatch._id,
        name: bestMatch.name,
        role: bestMatch.role,
      },
      similarityScore,
    });
  } catch (error) {
    console.error("startAttendanceSession error:", error);
    if (error.code === 11000) {
      // Race condition — session was created in parallel
      const todayDate = getTodayDateStr();
      const { currentLecture } = await getCurrentLecture();
      if (currentLecture) {
        const session = await AttendanceSession.findOne({
          timetableEntryId: currentLecture._id,
          date: todayDate,
        });
        if (session) {
          return res.status(200).json({
            success: true,
            alreadyStarted: true,
            message: "Attendance session is already active.",
            session,
          });
        }
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to start attendance session",
    });
  }
};

// GET /api/attendance-sessions/current
// Get the currently active session for the ongoing lecture
const getCurrentSession = async (req, res) => {
  try {
    await autoCloseExpiredSessions();
    const { currentLecture, day, currentTime } = await getCurrentLecture();

    if (!currentLecture) {
      return res.status(200).json({
        success: true,
        hasActiveLecture: false,
        activeSession: null,
        currentLecture: null,
        day,
        currentTime,
        message: "No lecture is currently scheduled.",
      });
    }

    const todayDate = getTodayDateStr();
    const session = await AttendanceSession.findOne({
      timetableEntryId: currentLecture._id,
      date: todayDate,
      status: "ACTIVE",
    });

    let presentCount = 0;
    if (session) {
      presentCount = await Attendance.countDocuments({ attendanceSessionId: session._id });
    }

    res.status(200).json({
      success: true,
      hasActiveLecture: true,
      activeSession: session
        ? { ...session.toObject(), presentCount }
        : null,
      sessionStarted: Boolean(session),
      currentLecture,
      day,
      currentTime,
    });
  } catch (error) {
    console.error("getCurrentSession error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get current session",
    });
  }
};

// PUT /api/attendance-sessions/:id/close
const closeSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    session.status = "CLOSED";
    await session.save();

    res.status(200).json({
      success: true,
      message: "Attendance session closed successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance-sessions (admin view - all sessions)
const getAllSessions = async (req, res) => {
  try {
    const { date, status, limit = 50 } = req.query;
    const query = {};
    if (date) query.date = date;
    if (status) query.status = status;

    const sessions = await AttendanceSession.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance-sessions/student-face-scan
// Student scans face → identify → check session → check eligibility → mark attendance
const markStudentAttendanceByFace = async (req, res) => {
  try {
    await autoCloseExpiredSessions();

    const { faceEmbedding } = req.body;

    if (!faceEmbedding || !Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid face biometric data provided.",
      });
    }

    // 1. Identify student from registered faces
    const registeredStudents = await Student.find({ faceRegistered: true }).select("+faceEmbedding");

    let bestMatch = null;
    let lowestDistance = Infinity;
    const MATCH_THRESHOLD = 0.55;

    for (const student of registeredStudents) {
      if (student.faceEmbedding && student.faceEmbedding.length > 0) {
        const distance = calculateEuclideanDistance(faceEmbedding, student.faceEmbedding);
        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = student;
        }
      }
    }

    if (!bestMatch || lowestDistance > MATCH_THRESHOLD) {
      return res.status(404).json({
        success: false,
        faceMatched: false,
        message: "Face not recognized. Please register your face first.",
        distance: lowestDistance < 100 ? lowestDistance.toFixed(3) : null,
      });
    }

    const similarityScore = Math.max(0, Math.min(100, Math.round((1 - lowestDistance) * 100)));

    // 2. Find current active session matching student's lecture
    const { currentLecture, day, currentTime } = await getCurrentLecture(bestMatch);

    if (!currentLecture) {
      return res.status(400).json({
        success: false,
        faceMatched: true,
        user: { id: bestMatch._id, name: bestMatch.name },
        message: "No lecture is currently scheduled for your division/batch at this time.",
        currentTime,
        day,
      });
    }

    const todayDate = getTodayDateStr();
    const activeSession = await AttendanceSession.findOne({
      timetableEntryId: currentLecture._id,
      date: todayDate,
      status: "ACTIVE",
    });

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        faceMatched: true,
        user: { id: bestMatch._id, name: bestMatch.name },
        message: `No active attendance session for ${currentLecture.subjectName}. Please wait for faculty to start the session.`,
        currentLecture: {
          subjectName: currentLecture.subjectName,
          startTime: currentLecture.startTime,
          endTime: currentLecture.endTime,
        },
      });
    }

    // 3. Check eligibility (semester match; division/batch match if set in timetable)
    const sessionSemester = activeSession.semester;
    const sessionDivision = activeSession.division;
    const sessionBatch = activeSession.batch;

    if (sessionSemester && bestMatch.semester && sessionSemester !== bestMatch.semester) {
      return res.status(403).json({
        success: false,
        faceMatched: true,
        eligible: false,
        message: `You are not eligible for this lecture. This lecture is for Semester ${sessionSemester}, but you are in Semester ${bestMatch.semester}.`,
        user: { id: bestMatch._id, name: bestMatch.name },
        similarityScore,
      });
    }

    if (sessionDivision && bestMatch.division && sessionDivision !== bestMatch.division) {
      return res.status(403).json({
        success: false,
        faceMatched: true,
        eligible: false,
        message: `You are not eligible for this lecture. This lecture is for Division ${sessionDivision}, but you are in Division ${bestMatch.division}.`,
        user: { id: bestMatch._id, name: bestMatch.name },
        similarityScore,
      });
    }

    if (sessionBatch && bestMatch.batch && sessionBatch !== bestMatch.batch) {
      return res.status(403).json({
        success: false,
        faceMatched: true,
        eligible: false,
        message: `You are not eligible for this lecture. This lecture is for Batch ${sessionBatch}, but you are in Batch ${bestMatch.batch}.`,
        user: { id: bestMatch._id, name: bestMatch.name },
        similarityScore,
      });
    }

    // 4. Check for duplicate attendance
    const existing = await Attendance.findOne({
      userId: bestMatch._id,
      date: todayDate,
      timetableEntryId: currentLecture._id,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        faceMatched: true,
        eligible: true,
        message: `Attendance already marked for ${activeSession.subjectName}.`,
        user: {
          id: bestMatch._id,
          name: bestMatch.name,
          role: "Student",
          collegeOrCompany: bestMatch.college,
          faceImage: bestMatch.faceImage || "",
        },
        lecture: {
          subjectName: activeSession.subjectName,
          subjectCode: activeSession.subjectCode,
          startTime: activeSession.startTime,
          endTime: activeSession.endTime,
          faculty: activeSession.facultyName,
        },
        attendance: existing,
        similarityScore,
      });
    }

    // 5. Mark attendance
    const checkInTime = getCurrentTimeFormatted();
    const newAttendance = new Attendance({
      userId: bestMatch._id,
      userModel: "Student",
      userName: bestMatch.name,
      userRole: "Student",
      collegeOrCompany: bestMatch.college || "",
      date: todayDate,
      attendanceSessionId: activeSession._id,
      timetableEntryId: currentLecture._id,
      subjectCode: activeSession.subjectCode,
      subjectName: activeSession.subjectName,
      facultyName: activeSession.facultyName,
      lectureStartTime: activeSession.startTime,
      lectureEndTime: activeSession.endTime,
      room: activeSession.room || "",
      semester: bestMatch.semester || "",
      division: bestMatch.division || "",
      batch: bestMatch.batch || "",
      checkInTime,
      timestamp: new Date(),
      verificationMethod: "FACE",
      status: "Present",
      similarityScore,
      attendanceMode: "TIMETABLE",
    });

    await newAttendance.save();

    // Update student attendance count and session present count
    await Student.findByIdAndUpdate(bestMatch._id, { $inc: { attendance: 1 } });
    await AttendanceSession.findByIdAndUpdate(activeSession._id, { $inc: { presentCount: 1 } });

    res.status(201).json({
      success: true,
      alreadyMarked: false,
      faceMatched: true,
      eligible: true,
      message: `Face Verified Successfully. Attendance Marked for ${activeSession.subjectName}.`,
      user: {
        id: bestMatch._id,
        name: bestMatch.name,
        role: "Student",
        collegeOrCompany: bestMatch.college || "",
        faceImage: bestMatch.faceImage || "",
      },
      lecture: {
        subjectName: activeSession.subjectName,
        subjectCode: activeSession.subjectCode,
        startTime: activeSession.startTime,
        endTime: activeSession.endTime,
        faculty: activeSession.facultyName,
        room: activeSession.room,
      },
      attendance: newAttendance,
      similarityScore,
    });
  } catch (error) {
    console.error("markStudentAttendanceByFace error:", error);
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        faceMatched: true,
        message: "Attendance already marked for this lecture.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
  }
};

// GET /api/attendance-sessions/student-today/:studentId
// Get today's timetable-based attendance status for a student
const getStudentTodayTimetableAttendance = async (req, res) => {
  try {
    await autoCloseExpiredSessions();

    const { studentId } = req.params;
    const todayDate = getTodayDateStr();

    const student = await Student.findById(studentId).select("semester division batch electiveSubjectCode electiveSubjectName");

    const { currentLecture, day, currentTime, dayLectures } = await getCurrentLecture(student);

    // Get active session for current lecture
    let activeSession = null;
    if (currentLecture) {
      activeSession = await AttendanceSession.findOne({
        timetableEntryId: currentLecture._id,
        date: todayDate,
        status: "ACTIVE",
      });
    }

    // Get all attendance records for today
    const todayRecords = await Attendance.find({
      userId: studentId,
      date: todayDate,
      attendanceMode: "TIMETABLE",
    });

    // Map each today's lecture with attendance status
    const lectureStatus = (dayLectures || []).map((lecture) => {
      const record = todayRecords.find(
        (r) => r.timetableEntryId && String(r.timetableEntryId) === String(lecture._id)
      );
      const isCurrentActive =
        currentLecture && String(currentLecture._id) === String(lecture._id);
      const hasSession = isCurrentActive && Boolean(activeSession);

      return {
        lectureId: lecture._id,
        subjectName: lecture.subjectName,
        subjectCode: lecture.subjectCode,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        facultyName: lecture.facultyName,
        room: lecture.room,
        semester: lecture.semester,
        division: lecture.division,
        batch: lecture.batch,
        lectureType: lecture.lectureType,
        isCurrentActive,
        hasActiveSession: hasSession,
        isAttended: Boolean(record),
        checkInTime: record ? record.checkInTime : null,
        status: record ? "Present" : isCurrentActive ? (hasSession ? "Not Marked" : "Waiting for Faculty") : "Pending",
      };
    });

    const attendedCount = todayRecords.length;
    const totalLectures = (dayLectures || []).length;

    const isCurrentLectureAttended = currentLecture
      ? Boolean(todayRecords.find((r) => r.timetableEntryId && String(r.timetableEntryId) === String(currentLecture._id)))
      : false;

    res.status(200).json({
      success: true,
      todayDate,
      day,
      currentTime,
      currentLecture: currentLecture || null,
      activeSession: activeSession ? { ...activeSession.toObject() } : null,
      sessionStarted: Boolean(activeSession),
      isCurrentLectureAttended,
      totalLecturesToday: totalLectures,
      attendedLecturesCount: attendedCount,
      lectureStatus,
      records: todayRecords,
    });
  } catch (error) {
    console.error("getStudentTodayTimetableAttendance error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch today's attendance",
    });
  }
};

// GET /api/attendance-sessions/student-history/:studentId
const getStudentTimetableHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({
      userId: studentId,
      attendanceMode: "TIMETABLE",
    }).sort({ date: -1, lectureStartTime: 1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance-sessions/faculty-today/:employeeId
// Get session info for the current lecture for a faculty member
const getFacultyCurrentLectureInfo = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { currentLecture, day, currentTime } = await getCurrentLecture();
    const todayDate = getTodayDateStr();

    let activeSession = null;
    let isAssignedToCurrentLecture = false;

    if (currentLecture) {
      isAssignedToCurrentLecture =
        currentLecture.facultyId &&
        String(currentLecture.facultyId) === String(employeeId);

      activeSession = await AttendanceSession.findOne({
        timetableEntryId: currentLecture._id,
        date: todayDate,
      });
    }

    let presentCount = 0;
    if (activeSession) {
      presentCount = await Attendance.countDocuments({ attendanceSessionId: activeSession._id });
    }

    // Get employee role
    const employee = await Employee.findById(employeeId).select("role name");

    res.status(200).json({
      success: true,
      day,
      currentTime,
      currentLecture: currentLecture || null,
      activeSession: activeSession ? { ...activeSession.toObject(), presentCount } : null,
      sessionStarted: Boolean(activeSession),
      isAssignedToCurrentLecture,
      employeeRole: employee ? employee.role : "faculty",
      isHOD: employee ? employee.role === "hod" : false,
    });
  } catch (error) {
    console.error("getFacultyCurrentLectureInfo error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance-sessions/start-by-login
// Faculty/HOD logged in via admin dashboard starts the current lecture's session
// Does NOT require face scan — uses JWT identity (req.user)
const startSessionByLogin = async (req, res) => {
  try {
    await autoCloseExpiredSessions();

    // req.user is set by authMiddleware (faculty_admin or admin token)
    const { id: startedById, name: startedByName, employeeRole } = req.user;

    if (!startedById) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Find current lecture from timetable
    const { currentLecture, day, currentTime } = await getCurrentLecture();

    if (!currentLecture) {
      return res.status(400).json({
        success: false,
        message: "No lecture is currently scheduled. Please check the timetable.",
        currentTime,
        day,
      });
    }

    const todayDate = getTodayDateStr();
    const existingSession = await AttendanceSession.findOne({
      timetableEntryId: currentLecture._id,
      date: todayDate,
    });

    if (existingSession) {
      if (existingSession.status === "ACTIVE") {
        const presentCount = await Attendance.countDocuments({
          attendanceSessionId: existingSession._id,
        });
        return res.status(200).json({
          success: true,
          alreadyStarted: true,
          message: "Attendance session is already active for this lecture.",
          session: { ...existingSession.toObject(), presentCount },
          currentLecture,
        });
      }
      // Session exists but is CLOSED/COMPLETED — reactivate it
      existingSession.status = "ACTIVE";
      existingSession.startedById = startedById;
      existingSession.startedByModel = "Employee";
      existingSession.startedByName = startedByName || "Faculty";
      existingSession.startedByRole = employeeRole || "faculty";
      existingSession.actualSessionStartTime = getCurrentTimeFormatted();
      await existingSession.save();

      return res.status(200).json({
        success: true,
        alreadyStarted: false,
        message: `Attendance session restarted for ${currentLecture.subjectName}.`,
        session: existingSession,
        currentLecture,
      });
    }

    // Create new attendance session
    const now = getCurrentTimeFormatted();
    const newSession = new AttendanceSession({
      timetableEntryId: currentLecture._id,
      date: todayDate,
      day: getCurrentDayName(),
      subjectCode: currentLecture.subjectCode,
      subjectName: currentLecture.subjectName,
      facultyId: currentLecture.facultyId || null,
      facultyName: currentLecture.facultyName || "",
      startTime: currentLecture.startTime,
      endTime: currentLecture.endTime,
      room: currentLecture.room || "",
      semester: currentLecture.semester || "",
      division: currentLecture.division || "",
      batch: currentLecture.batch || "",
      startedById: startedById,
      startedByModel: "Employee",
      startedByName: startedByName || "Faculty",
      startedByRole: employeeRole || "faculty",
      actualSessionStartTime: now,
      status: "ACTIVE",
      presentCount: 0,
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      alreadyStarted: false,
      message: `Attendance session started for ${currentLecture.subjectName}.`,
      session: newSession,
      currentLecture,
    });
  } catch (error) {
    console.error("startSessionByLogin error:", error);
    if (error.code === 11000) {
      const todayDate = getTodayDateStr();
      const { currentLecture } = await getCurrentLecture();
      if (currentLecture) {
        const session = await AttendanceSession.findOne({
          timetableEntryId: currentLecture._id,
          date: todayDate,
        });
        if (session) {
          return res.status(200).json({
            success: true,
            alreadyStarted: true,
            message: "Attendance session is already active.",
            session,
          });
        }
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to start attendance session",
    });
  }
};

// PUT /api/attendance-sessions/stop-current
// Faculty/HOD logged in via admin dashboard stops the current active session immediately
const stopCurrentSession = async (req, res) => {
  try {
    await autoCloseExpiredSessions();

    const { currentLecture } = await getCurrentLecture();
    const todayDate = getTodayDateStr();

    let activeSession = null;

    if (currentLecture) {
      activeSession = await AttendanceSession.findOne({
        timetableEntryId: currentLecture._id,
        date: todayDate,
        status: "ACTIVE",
      });
    }

    // Fallback: find any active session for today
    if (!activeSession) {
      activeSession = await AttendanceSession.findOne({
        date: todayDate,
        status: "ACTIVE",
      });
    }

    if (!activeSession) {
      return res.status(404).json({
        success: false,
        message: "No active attendance session found to stop.",
      });
    }

    activeSession.status = "CLOSED";
    await activeSession.save();

    const presentCount = await Attendance.countDocuments({
      attendanceSessionId: activeSession._id,
    });

    res.status(200).json({
      success: true,
      message: `Attendance session stopped. ${presentCount} student(s) marked present.`,
      session: { ...activeSession.toObject(), presentCount },
    });
  } catch (error) {
    console.error("stopCurrentSession error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to stop attendance session",
    });
  }
};

module.exports = {
  startAttendanceSession,
  getCurrentSession,
  closeSession,
  getAllSessions,
  markStudentAttendanceByFace,
  getStudentTodayTimetableAttendance,
  getStudentTimetableHistory,
  getFacultyCurrentLectureInfo,
  startSessionByLogin,
  stopCurrentSession,
};
