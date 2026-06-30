const mongoose =
  require("mongoose");

const semesterSchema =
  new mongoose.Schema(

    {

      startDate: {

        type: String,

        required: true,

      },

      endDate: {

        type: String,

        required: true,

      },

    },

    {

      timestamps: true,

    }

  );

module.exports =
  mongoose.model(
    "Semester",
    semesterSchema
  );