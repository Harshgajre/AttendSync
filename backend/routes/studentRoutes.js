const express =
  require("express");

const router =
  express.Router();

const {

  registerStudent,

  loginStudent,

  getAllStudents,

  getStudentById,

  updateAttendance,

  updateSemester,

  deleteStudent,

} = require(
  "../controllers/studentController"
);

router.post(
  "/register",
  registerStudent
);

router.post(
  "/login",
  loginStudent
);

router.get(
  "/all",
  getAllStudents
);

router.get(
  "/:id",
  getStudentById
);

router.put(
  "/attendance/:id",
  updateAttendance
);

router.put(
  "/semester/:id",
  updateSemester
);

router.delete(
  "/:id",
  deleteStudent
);

module.exports =
  router;