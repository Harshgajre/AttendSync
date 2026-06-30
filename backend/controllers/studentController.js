const mongoose =
  require("mongoose");

const Student =
  require("../models/Student");


// Register Student
const registerStudent =
  async (req, res) => {

    try {

      const student =
        new Student(req.body);

      await student.save();

      res.status(201).json({

        success: true,

        message:
          "Student Registered Successfully",

        student,

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Login Student
const loginStudent =
  async (req, res) => {

    try {

      const {

        name,
        college,
        password,

      } = req.body;

      console.log('Student login request:', { name, college });
      console.log('MONGO_URI:', process.env.MONGO_URI);
      console.log('mongoose connection readyState:', mongoose.connection.readyState);
      if (mongoose.connection && mongoose.connection.db) {
        console.log('mongoose connection db name:', mongoose.connection.db.databaseName);
      }
      if (Student.db && Student.db.databaseName) {
        console.log('Student model db name:', Student.db.databaseName);
      }

      let student = await Student.findOne({
        name,
        college,
        password,
      });

      if (!student) {
        student = new Student({
          name,
          college,
          password,
          semester: "1",
          lastLogin: new Date(),
          loginCount: 1,
        });

        console.log('Saving new student document using DB:', Student.db ? Student.db.databaseName : 'unknown');
        await student.save();

        return res.status(201).json({
          success: true,
          message: "Student created and logged in",
          student,
        });
      }

      student = await Student.findByIdAndUpdate(
        student._id,
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
        student,
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


// Get Single Student
const getStudentById =
  async (req, res) => {

    try {

      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            "Student Not Found",

        });

      }

      res.status(200).json({

        success: true,

        student,

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

      const student =
        await Student.findByIdAndUpdate(

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

        student,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Update Semester
const updateSemester =
  async (req, res) => {

    try {

      const student =
        await Student.findByIdAndUpdate(

          req.params.id,

          {
            semester:
              req.body.semester,
          },

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Semester Updated",

        student,

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


// Export
module.exports = {

  registerStudent,

  loginStudent,

  getAllStudents,

  getStudentById,

  updateAttendance,

  updateSemester,

  deleteStudent,

};