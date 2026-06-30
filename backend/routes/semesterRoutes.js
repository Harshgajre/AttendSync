const express =
  require("express");

const router =
  express.Router();

const {

  saveSemester,

  getSemester,

  updateSemester,

  deleteSemester,

} = require(
  "../controllers/semesterController"
);

router.post(
  "/save",
  saveSemester
);

router.get(
  "/current",
  getSemester
);

router.put(
  "/:id",
  updateSemester
);

router.delete(
  "/:id",
  deleteSemester
);

module.exports =
  router;