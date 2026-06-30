const Student =
  require("../models/Student");

const Employee =
  require("../models/Employee");


// Get Dashboard Data
const getDashboardData =
  async (req, res) => {

    try {

      const totalStudents =
        await Student.countDocuments();

      const totalEmployees =
        await Employee.countDocuments();

      const totalUsers =
        totalStudents +
        totalEmployees;

      res.status(200).json({

        success: true,

        totalStudents,

        totalEmployees,

        totalUsers,

        systemStatus:
          "Active",

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Get All Students
const getAllStudents =
  async (req, res) => {

    try {

      const students =
        await Student.find();

      res.status(200).json({

        success: true,

        count:
          students.length,

        students,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Get All Employees
const getAllEmployees =
  async (req, res) => {

    try {

      const employees =
        await Employee.find();

      res.status(200).json({

        success: true,

        count:
          employees.length,

        employees,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Delete Student
const deleteStudent =
  async (req, res) => {

    try {

      await Student.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "Student Deleted Successfully",

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Delete Employee
const deleteEmployee =
  async (req, res) => {

    try {

      await Employee.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "Employee Deleted Successfully",

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Exports
module.exports = {

  getDashboardData,

  getAllStudents,

  getAllEmployees,

  deleteStudent,

  deleteEmployee,

};