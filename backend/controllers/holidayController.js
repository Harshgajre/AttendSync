const Holiday =
  require("../models/Holiday");


// Add Holiday
const addHoliday =
  async (req, res) => {

    try {

      const holiday =
        new Holiday(req.body);

      await holiday.save();

      res.status(201).json({

        success: true,

        message:
          "Holiday Added Successfully",

        holiday,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Get All Holidays
const getAllHolidays =
  async (req, res) => {

    try {

      const holidays =
        await Holiday.find()
          .sort({
            holidayDate: 1,
          });

      res.status(200).json({

        success: true,

        count:
          holidays.length,

        holidays,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Get Single Holiday
const getHolidayById =
  async (req, res) => {

    try {

      const holiday =
        await Holiday.findById(
          req.params.id
        );

      if (!holiday) {

        return res.status(404).json({

          success: false,

          message:
            "Holiday Not Found",

        });

      }

      res.status(200).json({

        success: true,

        holiday,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Update Holiday
const updateHoliday =
  async (req, res) => {

    try {

      const holiday =
        await Holiday.findByIdAndUpdate(

          req.params.id,

          req.body,

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Holiday Updated Successfully",

        holiday,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Delete Holiday
const deleteHoliday =
  async (req, res) => {

    try {

      await Holiday.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "Holiday Deleted Successfully",

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

  addHoliday,

  getAllHolidays,

  getHolidayById,

  updateHoliday,

  deleteHoliday,

};