const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const AttendanceSlot = require("../models/AttendanceSlot");
const Timetable = require("../models/Timetable");
const AttendanceSession = require("../models/AttendanceSession");
const Student = require("../models/Student");
const Employee = require("../models/Employee");
const { getCurrentLecture } = require("./timetableController");

// Calculate Euclidean Distance between two 128-dimensional vectors
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

// Format Date as "YYYY-MM-DD"
const getTodayDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format Time as "hh:mm AM/PM"
const getCurrentTimeFormatted = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Get current active slot based on server time
const getActiveSlotForCurrentTime = async () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${hours}:${minutes}`;

  const slots = await AttendanceSlot.find({ isActive: true }).sort({ startTime: 1, order: 1 });

  for (const slot of slots) {
    if (currentTimeStr >= slot.startTime && currentTimeStr < slot.endTime) {
      return { activeSlot: slot, currentTimeStr, allSlots: slots };
    }
  }

  // If outside all slot boundaries, fallback to the nearest/first active slot to allow testing anytime
  if (slots.length > 0) {
    return { activeSlot: slots[0], currentTimeStr, allSlots: slots, isFallback: true };
  }

  return { activeSlot: null, currentTimeStr, allSlots: [] };
};

// POST /api/attendance/face-scan
// Scan face and automatically identify user + active slot + mark attendance with duplicate prevention
const markAttendanceByFaceScan = async (req, res) => {
  try {
    const { faceEmbedding } = req.body;

    if (!faceEmbedding || !Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid face biometric data provided. Please position your face clearly in the camera.",
      });
    }

    // Load all registered students and employees with their face embeddings
    const registeredStudents = await Student.find({ faceRegistered: true }).select("+faceEmbedding");
    const registeredEmployees = await Employee.find({ faceRegistered: true }).select("+faceEmbedding");

    let bestMatch = null;
    let lowestDistance = Infinity;
    const MATCH_THRESHOLD = 0.55; // Standard threshold for 128-d face descriptors

    // Check students
    for (const student of registeredStudents) {
      if (student.faceEmbedding && student.faceEmbedding.length > 0) {
        const distance = calculateEuclideanDistance(faceEmbedding, student.faceEmbedding);
        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = {
            user: student,
            userType: "Student",
            userRole: "Student",
            collegeOrCompany: student.college,
          };
        }
      }
    }

    // Check employees
    for (const employee of registeredEmployees) {
      if (employee.faceEmbedding && employee.faceEmbedding.length > 0) {
        const distance = calculateEuclideanDistance(faceEmbedding, employee.faceEmbedding);
        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = {
            user: employee,
            userType: "Employee",
            userRole: "Employee",
            collegeOrCompany: employee.company,
          };
        }
      }
    }

    // Check if confidence passes threshold
    if (!bestMatch || lowestDistance > MATCH_THRESHOLD) {
      return res.status(404).json({
        success: false,
        faceMatched: false,
        message: "Face not recognized. Please try again or register your face first.",
        distance: lowestDistance < 100 ? lowestDistance.toFixed(3) : null,
      });
    }

    const matchedUser = bestMatch.user;
    const similarityPercentage = Math.max(0, Math.min(100, Math.round((1 - lowestDistance) * 100)));
    const todayDate = getTodayDateStr();
    const formattedCheckIn = getCurrentTimeFormatted();

    // ─── CHECK TIMETABLE SESSION (Priority for lectures) ───
    const { currentLecture } = await getCurrentLecture();
    if (currentLecture) {
      const activeSession = await AttendanceSession.findOne({
        timetableEntryId: currentLecture._id,
        date: todayDate,
        status: "ACTIVE",
      });

      if (bestMatch.userType === "Student") {
        if (!activeSession) {
          return res.status(400).json({
            success: false,
            faceMatched: true,
            user: {
              id: matchedUser._id,
              name: matchedUser.name,
              role: "Student",
              collegeOrCompany: matchedUser.college,
            },
            message: `Lecture '${currentLecture.subjectName}' is ongoing, but the faculty has not started the attendance session yet.`,
            currentLecture: {
              subjectName: currentLecture.subjectName,
              subjectCode: currentLecture.subjectCode,
              startTime: currentLecture.startTime,
              endTime: currentLecture.endTime,
              faculty: currentLecture.facultyName,
            },
          });
        }

        // Check eligibility
        if (activeSession.semester && matchedUser.semester && activeSession.semester !== matchedUser.semester) {
          return res.status(403).json({
            success: false,
            faceMatched: true,
            eligible: false,
            message: `You are not eligible for this lecture (Semester ${activeSession.semester}). You are in Semester ${matchedUser.semester}.`,
            user: { id: matchedUser._id, name: matchedUser.name },
            similarityScore: similarityPercentage,
          });
        }

        // Duplicate Check for student + date + timetableEntryId
        const existingTimetableAttendance = await Attendance.findOne({
          userId: matchedUser._id,
          date: todayDate,
          timetableEntryId: currentLecture._id,
        });

        if (existingTimetableAttendance) {
          return res.status(200).json({
            success: true,
            alreadyMarked: true,
            faceMatched: true,
            message: `Attendance already marked for ${activeSession.subjectName}`,
            user: {
              id: matchedUser._id,
              name: matchedUser.name,
              role: "Student",
              collegeOrCompany: matchedUser.college,
              faceImage: matchedUser.faceImage || "",
            },
            lecture: {
              subjectName: activeSession.subjectName,
              subjectCode: activeSession.subjectCode,
              startTime: activeSession.startTime,
              endTime: activeSession.endTime,
              faculty: activeSession.facultyName,
            },
            attendance: existingTimetableAttendance,
            similarityScore: similarityPercentage,
          });
        }

        // Create new Timetable Attendance record
        const newTimetableAttendance = new Attendance({
          userId: matchedUser._id,
          userModel: "Student",
          userName: matchedUser.name,
          userRole: "Student",
          collegeOrCompany: matchedUser.college || "",
          date: todayDate,
          attendanceSessionId: activeSession._id,
          timetableEntryId: currentLecture._id,
          subjectCode: activeSession.subjectCode,
          subjectName: activeSession.subjectName,
          facultyName: activeSession.facultyName,
          lectureStartTime: activeSession.startTime,
          lectureEndTime: activeSession.endTime,
          room: activeSession.room || "",
          semester: matchedUser.semester || "",
          division: matchedUser.division || "",
          batch: matchedUser.batch || "",
          checkInTime: formattedCheckIn,
          timestamp: new Date(),
          verificationMethod: "FACE",
          status: "Present",
          similarityScore: similarityPercentage,
          attendanceMode: "TIMETABLE",
        });

        await newTimetableAttendance.save();
        await Student.findByIdAndUpdate(matchedUser._id, { $inc: { attendance: 1 } });
        await AttendanceSession.findByIdAndUpdate(activeSession._id, { $inc: { presentCount: 1 } });

        return res.status(201).json({
          success: true,
          alreadyMarked: false,
          faceMatched: true,
          message: `Face Verified Successfully! Attendance marked for ${activeSession.subjectName}.`,
          user: {
            id: matchedUser._id,
            name: matchedUser.name,
            role: "Student",
            collegeOrCompany: matchedUser.college || "",
            faceImage: matchedUser.faceImage || "",
          },
          lecture: {
            subjectName: activeSession.subjectName,
            subjectCode: activeSession.subjectCode,
            startTime: activeSession.startTime,
            endTime: activeSession.endTime,
            faculty: activeSession.facultyName,
            room: activeSession.room,
          },
          attendance: newTimetableAttendance,
          similarityScore: similarityPercentage,
        });
      }
    }

    // ─── FALLBACK: LEGACY SLOT-BASED ATTENDANCE ───
    const { activeSlot, currentTimeStr, isFallback } = await getActiveSlotForCurrentTime();

    if (!activeSlot) {
      return res.status(400).json({
        success: false,
        faceMatched: true,
        user: {
          id: matchedUser._id,
          name: matchedUser.name,
          role: bestMatch.userRole,
          collegeOrCompany: bestMatch.collegeOrCompany,
          faceImage: matchedUser.faceImage || "",
        },
        message: "No active lecture session or attendance slot configured currently.",
      });
    }

    // Check if attendance is already marked for this user + date + slotId
    const existingAttendance = await Attendance.findOne({
      userId: matchedUser._id,
      date: todayDate,
      slotId: activeSlot._id,
    });

    if (existingAttendance) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        faceMatched: true,
        message: `Attendance already marked for ${activeSlot.slotName}`,
        user: {
          id: matchedUser._id,
          name: matchedUser.name,
          role: bestMatch.userRole,
          collegeOrCompany: bestMatch.collegeOrCompany,
          faceImage: matchedUser.faceImage || "",
        },
        slot: {
          id: activeSlot._id,
          name: activeSlot.slotName,
          startTime: activeSlot.startTime,
          endTime: activeSlot.endTime,
        },
        attendance: existingAttendance,
        similarityScore: similarityPercentage,
      });
    }

    // Create new Attendance Record
    const newAttendance = new Attendance({
      userId: matchedUser._id,
      userModel: bestMatch.userType,
      userName: matchedUser.name,
      userRole: bestMatch.userRole,
      collegeOrCompany: bestMatch.collegeOrCompany,
      date: todayDate,
      slotId: activeSlot._id,
      slotName: activeSlot.slotName,
      checkInTime: formattedCheckIn,
      timestamp: new Date(),
      verificationMethod: "FACE",
      status: "Present",
      similarityScore: similarityPercentage,
      attendanceMode: "LEGACY_SLOT",
    });

    await newAttendance.save();

    // Increment user attendance count
    if (bestMatch.userType === "Student") {
      await Student.findByIdAndUpdate(matchedUser._id, { $inc: { attendance: 1 } });
    } else {
      await Employee.findByIdAndUpdate(matchedUser._id, { $inc: { attendance: 1 } });
    }

    res.status(201).json({
      success: true,
      alreadyMarked: false,
      faceMatched: true,
      message: `Face verified successfully! Attendance marked for ${activeSlot.slotName}.`,
      user: {
        id: matchedUser._id,
        name: matchedUser.name,
        role: bestMatch.userRole,
        collegeOrCompany: bestMatch.collegeOrCompany,
        faceImage: matchedUser.faceImage || "",
      },
      slot: {
        id: activeSlot._id,
        name: activeSlot.slotName,
        startTime: activeSlot.startTime,
        endTime: activeSlot.endTime,
      },
      attendance: newAttendance,
      similarityScore: similarityPercentage,
    });
  } catch (error) {
    console.error("markAttendanceByFaceScan error:", error);
    // If MongoDB compound key duplicate error hits concurrently
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        faceMatched: true,
        message: "Attendance already marked for this slot.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process face attendance",
    });
  }
};

// GET /api/attendance/today/:userId
// Fetch user's slot status for today
const getUserTodayAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const todayDate = getTodayDateStr();

    const { activeSlot, currentTimeStr, allSlots } = await getActiveSlotForCurrentTime();

    const todayRecords = await Attendance.find({
      userId,
      date: todayDate,
    });

    // Map slot records to each active slot
    const slotStatusList = allSlots.map((slot) => {
      const record = todayRecords.find((r) => String(r.slotId) === String(slot._id));
      const isCurrentActive = activeSlot && String(activeSlot._id) === String(slot._id);
      return {
        slotId: slot._id,
        slotName: slot.slotName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isCurrentActive,
        isAttended: Boolean(record),
        checkInTime: record ? record.checkInTime : null,
        status: record ? record.status : isCurrentActive ? "Not Marked" : "Pending",
      };
    });

    const isCurrentSlotAttended = activeSlot
      ? Boolean(todayRecords.find((r) => String(r.slotId) === String(activeSlot._id)))
      : false;

    res.status(200).json({
      success: true,
      todayDate,
      currentTime: currentTimeStr,
      activeSlot,
      isCurrentSlotAttended,
      totalSlotsToday: allSlots.length,
      attendedSlotsCount: todayRecords.length,
      slotStatusList,
      records: todayRecords,
    });
  } catch (error) {
    console.error("getUserTodayAttendance error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch today's attendance",
    });
  }
};

// GET /api/attendance/history/:userId
// Get complete attendance log history for a specific user
const getUserAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Attendance.find({ userId }).sort({ date: -1, timestamp: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("getUserAttendanceHistory error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance history",
    });
  }
};

// GET /api/attendance/all (Admin records with filters)
const getAllAttendanceRecords = async (req, res) => {
  try {
    const { date, slotId, userRole, search, limit = 100 } = req.query;

    let query = {};
    if (date) {
      query.date = date;
    }
    if (slotId) {
      query.slotId = slotId;
    }
    if (userRole) {
      query.userRole = new RegExp(`^${userRole}$`, "i");
    }
    if (search) {
      query.$or = [
        { userName: new RegExp(search, "i") },
        { collegeOrCompany: new RegExp(search, "i") },
        { slotName: new RegExp(search, "i") },
      ];
    }

    if (req.user && req.user.role === "faculty_admin" && req.user.name) {
      query.facultyName = new RegExp(`^${req.user.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    const records = await Attendance.find(query)
      .sort({ date: -1, timestamp: -1 })
      .limit(Number(limit));

    const totalCount = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      totalCount,
      records,
    });
  } catch (error) {
    console.error("getAllAttendanceRecords error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance records",
    });
  }
};

// GET /api/attendance/stats (Admin analytics)
const getAttendanceStats = async (req, res) => {
  try {
    const todayDate = getTodayDateStr();

    const totalStudents = await Student.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const faceRegisteredStudents = await Student.countDocuments({ faceRegistered: true });
    const faceRegisteredEmployees = await Employee.countDocuments({ faceRegistered: true });

    const totalFaceRegistered = faceRegisteredStudents + faceRegisteredEmployees;
    const totalUsers = totalStudents + totalEmployees;

    let statsQuery = { date: todayDate };
    let slotStatsQuery = { date: todayDate };
    
    if (req.user && req.user.role === "faculty_admin" && req.user.name) {
      const facultyNameRegex = new RegExp(`^${req.user.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      statsQuery.facultyName = facultyNameRegex;
      slotStatsQuery.facultyName = facultyNameRegex;
    }

    const todayAttendanceCount = await Attendance.countDocuments(statsQuery);

    const { activeSlot, allSlots } = await getActiveSlotForCurrentTime();

    let currentSlotAttendanceCount = 0;
    if (activeSlot) {
      currentSlotAttendanceCount = await Attendance.countDocuments({
        ...slotStatsQuery,
        slotId: activeSlot._id,
      });
    }

    // Slot-wise breakdown for today
    const slotBreakdown = [];
    for (const slot of allSlots) {
      const count = await Attendance.countDocuments({
        ...slotStatsQuery,
        slotId: slot._id,
      });
      slotBreakdown.push({
        slotId: slot._id,
        slotName: slot.slotName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        count,
        isActive: slot.isActive,
      });
    }

    res.status(200).json({
      success: true,
      todayDate,
      totalUsers,
      totalStudents,
      totalEmployees,
      totalFaceRegistered,
      faceRegisteredStudents,
      faceRegisteredEmployees,
      todayAttendanceCount,
      currentSlot: activeSlot,
      currentSlotAttendanceCount,
      slotBreakdown,
    });
  } catch (error) {
    console.error("getAttendanceStats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance stats",
    });
  }
};

module.exports = {
  markAttendanceByFaceScan,
  getUserTodayAttendance,
  getUserAttendanceHistory,
  getAllAttendanceRecords,
  getAttendanceStats,
};
