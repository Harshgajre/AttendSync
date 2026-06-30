const mongoose =
  require("mongoose");

const employeeSchema =
  new mongoose.Schema(

    {

      name: {

        type: String,

        required: true,

      },

      company: {

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

      totalPF: {

        type: Number,

        default: 0,

      },

      usedPF: {

        type: Number,

        default: 0,

      },

      totalCL: {

        type: Number,

        default: 0,

      },

      usedCL: {

        type: Number,

        default: 0,

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
    "Employee",
    employeeSchema
  );