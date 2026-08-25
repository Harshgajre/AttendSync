const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const generateToken = (employee) => {
  const secret = process.env.JWT_SECRET || "attendsync_super_secret_jwt_key_2026_secure";
  return jwt.sign(
    {
      id: employee._id,
      role: "employee",
      name: employee.name,
      company: employee.company,
    },
    secret,
    { expiresIn: "7d" }
  );
};

const sanitizeEmployee = (employee) => {
  return {
    _id: employee._id,
    name: employee.name,
    company: employee.company,
    attendance: employee.attendance,
    totalPF: employee.totalPF,
    usedPF: employee.usedPF,
    totalCL: employee.totalCL,
    usedCL: employee.usedCL,
    lastLogin: employee.lastLogin,
    loginCount: employee.loginCount,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
};

// Register Employee
const registerEmployee = async (req, res) => {
  try {
    const { name, company, password } = req.body;

    if (!name || !company || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, company/office name, and password",
      });
    }

    const trimmedName = name.trim();
    const trimmedCompany = company.trim();

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      name: new RegExp(`^${trimmedName}$`, "i"),
      company: new RegExp(`^${trimmedCompany}$`, "i"),
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "An employee with this name and company already exists. Please log in.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = new Employee({
      name: trimmedName,
      company: trimmedCompany,
      password: hashedPassword,
      attendance: 0,
      totalPF: 12,
      usedPF: 0,
      totalCL: 12,
      usedCL: 0,
      lastLogin: new Date(),
      loginCount: 1,
    });

    await employee.save();

    const token = generateToken(employee);

    res.status(201).json({
      success: true,
      message: "Employee Registered Successfully",
      token,
      employee: sanitizeEmployee(employee),
    });
  } catch (error) {
    console.error("registerEmployee error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// Login Employee
const loginEmployee = async (req, res) => {
  try {
    const { name, company, password } = req.body;

    if (!name || !company || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide employee name, company/office name, and password",
      });
    }

    const trimmedName = name.trim();
    const trimmedCompany = company.trim();

    // Find employee
    let employee = await Employee.findOne({
      name: new RegExp(`^${trimmedName}$`, "i"),
      company: new RegExp(`^${trimmedCompany}$`, "i"),
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Employee not found. Please register first.",
      });
    }

    // Verify password
    let isMatch = false;
    if (employee.password) {
      isMatch = await bcrypt.compare(password, employee.password);

      // Fallback for legacy plain text passwords if any
      if (!isMatch && employee.password === password) {
        isMatch = true;
        // Upgrade to hashed password
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(password, salt);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      });
    }

    employee.lastLogin = new Date();
    employee.loginCount = (employee.loginCount || 0) + 1;
    await employee.save();

    const token = generateToken(employee);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      employee: sanitizeEmployee(employee),
    });
  } catch (error) {
    console.error("loginEmployee error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// Get Current Authenticated Employee (from JWT)
const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Employees
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

// Get Single Employee
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
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
    const employee = await Employee.findByIdAndUpdate(
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
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update PF / CL
const updatePFCL = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        totalPF: req.body.totalPF,
        usedPF: req.body.usedPF,
        totalCL: req.body.totalCL,
        usedCL: req.body.usedCL,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "PF / CL Updated",
      employee,
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

// Export
module.exports = {
  registerEmployee,
  loginEmployee,
  getEmployeeProfile,
  getAllEmployees,
  getEmployeeById,
  updateAttendance,
  updatePFCL,
  deleteEmployee,
};