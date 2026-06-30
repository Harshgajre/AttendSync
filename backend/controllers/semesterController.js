const Semester =
  require("../models/Semester");


// Create / Save Semester
const saveSemester =
  async (req, res) => {

    try {

      const {

        startDate,
        endDate,

      } = req.body;

      const semester =
        new Semester({

          startDate,

          endDate,

        });

      await semester.save();

      res.status(201).json({

        success: true,

        message:
          "Semester Saved Successfully",

        semester,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Get Latest Semester
const getSemester =
  async (req, res) => {

    try {

      const semester =
        await Semester
          .findOne()
          .sort({
            createdAt: -1,
          });

      res.status(200).json({

        success: true,

        semester,

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

      const semester =
        await Semester.findByIdAndUpdate(

          req.params.id,

          req.body,

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Semester Updated Successfully",

        semester,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Delete Semester
const deleteSemester =
  async (req, res) => {

    try {

      await Semester.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "Semester Deleted Successfully",

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

  saveSemester,

  getSemester,

  updateSemester,

  deleteSemester,

};