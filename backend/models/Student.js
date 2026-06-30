const mongoose =
  require("mongoose");

const studentSchema =
  new mongoose.Schema(

    {

      name: {

        type: String,

        required: true,

      },

      college: {

        type: String,

        required: true,

      },

      password: {

        type: String,

        required: true,

      },

      attendance: {

        type: Number,

        default: 0,

      },

      semester: {

        type: String,

        required: true,

      },

      lastLogin: {

        type: Date,

      },

      loginCount: {

        type: Number,

        default: 0,

      },

    },

    {

      timestamps: true,

    }

  );

module.exports =
  mongoose.model(
    "Student",
    studentSchema
  );