const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Employee = require("../models/Employee");

const generateAdminToken = (admin) => {
  const secret = process.env.JWT_SECRET || "attendsync_super_secret_jwt_key_2026_secure";
  return jwt.sign(
    {
      id: admin._id,
      role: "admin",
      name: admin.name,
      email: admin.email,
    },
    secret,
    { expiresIn: "7d" }
  );
};

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (email || username || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide admin username/email and password",
      });
    }

    // Find admin by email or username
    const admin = await Admin.findOne({
      $or: [
        { email: new RegExp(`^${identifier}$`, "i") },
        { username: new RegExp(`^${identifier}$`, "i") },
      ],
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Admin Credentials",
      });
    }

    let isMatch = false;
    if (admin.password) {
      isMatch = await bcrypt.compare(password, admin.password);

      // Fallback for legacy plain text passwords if any
      if (!isMatch && admin.password === password) {
        isMatch = true;
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
        await admin.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Admin Credentials",
      });
    }

    const token = generateAdminToken(admin);

    res.status(200).json({
      success: true,
      message: "Admin Login Successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("loginAdmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Admin login failed",
    });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role || "admin",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Dashboard Data
const getDashboardData = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const totalUsers = totalStudents + totalEmployees;

    res.status(200).json({
      success: true,
      totalStudents,
      totalEmployees,
      totalUsers,
      systemStatus: "Active",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Students (Admin view)
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

// Get All Employees (Admin view)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
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

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Employee Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Exports
module.exports = {
  loginAdmin,
  getAdminProfile,
  getDashboardData,
  getAllStudents,
  getAllEmployees,
  deleteStudent,
  deleteEmployee,
};