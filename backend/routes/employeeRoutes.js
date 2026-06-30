const express =
  require("express");

const router =
  express.Router();

const {

  registerEmployee,

  loginEmployee,

  getAllEmployees,

  getEmployeeById,

  updateAttendance,

  updatePFCL,

  deleteEmployee,

} = require(
  "../controllers/employeeController"
);

router.post(
  "/register",
  registerEmployee
);

router.post(
  "/login",
  loginEmployee
);

router.get(
  "/all",
  getAllEmployees
);

router.get(
  "/:id",
  getEmployeeById
);

router.put(
  "/attendance/:id",
  updateAttendance
);

router.put(
  "/pfcl/:id",
  updatePFCL
);

router.delete(
  "/:id",
  deleteEmployee
);

module.exports =
  router;