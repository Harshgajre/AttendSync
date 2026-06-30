const express =
  require("express");

const router =
  express.Router();

const {

  getDashboardData,

  getAllStudents,

  getAllEmployees,

  deleteStudent,

  deleteEmployee,

} = require(
  "../controllers/adminController"
);

router.get(
  "/dashboard",
  getDashboardData
);

router.get(
  "/students",
  getAllStudents
);

router.get(
  "/employees",
  getAllEmployees
);

router.delete(
  "/student/:id",
  deleteStudent
);

router.delete(
  "/employee/:id",
  deleteEmployee
);

module.exports =
  router;