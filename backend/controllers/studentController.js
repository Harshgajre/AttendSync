const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const generateToken = (student) => {
  const secret = process.env.JWT_SECRET || "attendsync_super_secret_jwt_key_2026_secure";
  return jwt.sign(
    {
      id: student._id,
      role: "student",
      name: student.name,
      college: student.college,
    },
    secret,
    { expiresIn: "7d" }
  );
};

const sanitizeStudent = (student) => {
  return {
    _id: student._id,
    name: student.name,
    college: student.college,
    semester: student.semester,
    attendance: student.attendance,
    lastLogin: student.lastLogin,
    loginCount: student.loginCount,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
};

// Register Student
const registerStudent = async (req, res) => {
  try {
    const { name, college, password, semester } = req.body;

    if (!name || !college || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, college, and password",
      });
    }

    const trimmedName = name.trim();
    const trimmedCollege = college.trim();

    // Check if student already exists
    const existingStudent = await Student.findOne({
      name: new RegExp(`^${trimmedName}$`, "i"),
      college: new RegExp(`^${trimmedCollege}$`, "i"),
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "A student with this name and college already exists. Please log in.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = new Student({
      name: trimmedName,
      college: trimmedCollege,
      password: hashedPassword,
      semester: semester || "1",
      lastLogin: new Date(),
      loginCount: 1,
    });

    await student.save();

    const token = generateToken(student);

    res.status(201).json({
      success: true,
      message: "Student Registered Successfully",
      token,
      student: sanitizeStudent(student),
    });
  } catch (error) {
    console.error("registerStudent error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// Login Student
const loginStudent = async (req, res) => {
  try {
    const { name, college, password } = req.body;

    if (!name || !college || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide student name, college, and password",
      });
    }

    const trimmedName = name.trim();
    const trimmedCollege = college.trim();

    // Find student
    let student = await Student.findOne({
      name: new RegExp(`^${trimmedName}$`, "i"),
      college: new RegExp(`^${trimmedCollege}$`, "i"),
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Student not found. Please register first.",
      });
    }

    // Verify password
    let isMatch = false;
    if (student.password) {
      isMatch = await bcrypt.compare(password, student.password);

      // Fallback for legacy plain text passwords if any
      if (!isMatch && student.password === password) {
        isMatch = true;
        // Upgrade to hashed password
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(password, salt);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      });
    }

    student.lastLogin = new Date();
    student.loginCount = (student.loginCount || 0) + 1;
    await student.save();

    const token = generateToken(student);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      student: sanitizeStudent(student),
    });
  } catch (error) {
    console.error("loginStudent error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// Get Current Authenticated Student (from JWT)
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Student
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student Not Found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Attendance
const updateAttendance = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        attendance: req.body.attendance,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Attendance Updated",
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Semester
const updateSemester = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        semester: req.body.semester,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Semester Updated",
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Student
const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Student Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export
module.exports = {
  registerStudent,
  loginStudent,
  getStudentProfile,
  getAllStudents,
  getStudentById,
  updateAttendance,
  updateSemester,
  deleteStudent,
};