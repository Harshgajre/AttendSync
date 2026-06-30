const Employee =
  require("../models/Employee");


// Register Employee
const registerEmployee =
  async (req, res) => {

    try {

      const employee =
        new Employee(req.body);

      await employee.save();

      res.status(201).json({

        success: true,

        message:
          "Employee Registered Successfully",

        employee,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Login Employee
const loginEmployee =
  async (req, res) => {

    try {

      const {

        name,
        company,
        password,

      } = req.body;

      let employee = await Employee.findOne({
        name,
        company,
        password,
      });

      if (!employee) {
        employee = new Employee({
          name,
          company,
          password,
          lastLogin: new Date(),
          loginCount: 1,
        });

        await employee.save();

        return res.status(201).json({
          success: true,
          message: "Employee created and logged in",
          employee,
        });
      }

      employee = await Employee.findByIdAndUpdate(
        employee._id,
        {
          lastLogin: new Date(),
          $inc: { loginCount: 1 },
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        success: true,
        message: "Login Successful",
        employee,
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


// Get Single Employee
const getEmployeeById =
  async (req, res) => {

    try {

      const employee =
        await Employee.findById(
          req.params.id
        );

      if (!employee) {

        return res.status(404).json({

          success: false,

          message:
            "Employee Not Found",

        });

      }

      res.status(200).json({

        success: true,

        employee,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Update Attendance
const updateAttendance =
  async (req, res) => {

    try {

      const employee =
        await Employee.findByIdAndUpdate(

          req.params.id,

          {
            attendance:
              req.body.attendance,
          },

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Attendance Updated",

        employee,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Update PF / CL
const updatePFCL =
  async (req, res) => {

    try {

      const employee =
        await Employee.findByIdAndUpdate(

          req.params.id,

          {

            totalPF:
              req.body.totalPF,

            usedPF:
              req.body.usedPF,

            totalCL:
              req.body.totalCL,

            usedCL:
              req.body.usedCL,

          },

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "PF / CL Updated",

        employee,

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


// Export
module.exports = {

  registerEmployee,

  loginEmployee,

  getAllEmployees,

  getEmployeeById,

  updateAttendance,

  updatePFCL,

  deleteEmployee,

};