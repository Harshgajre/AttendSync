const Leave =
  require("../models/Leave");


// Create Leave Request
const createLeave =
  async (req, res) => {

    try {

      const leave =
        new Leave(req.body);

      await leave.save();

      res.status(201).json({

        success: true,

        message:
          "Leave Request Submitted",

        leave,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Get All Leave Requests
const getAllLeaves =
  async (req, res) => {

    try {

      const leaves =
        await Leave.find();

      res.status(200).json({

        success: true,

        count:
          leaves.length,

        leaves,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// Get Single Leave
const getLeaveById =
  async (req, res) => {

    try {

      const leave =
        await Leave.findById(
          req.params.id
        );

      if (!leave) {

        return res.status(404).json({

          success: false,

          message:
            "Leave Not Found",

        });

      }

      res.status(200).json({

        success: true,

        leave,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


const approveLeave =
  async (req, res) => {

    try {

      const leave =
        await Leave.findByIdAndUpdate(

          req.params.id,

          {
            status: "Approved",
            approvedBy: "Admin",
            approvedAt: new Date(),
          },

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Leave Approved Successfully",

        leave,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };


const rejectLeave =
  async (req, res) => {

    try {

      const leave =
        await Leave.findByIdAndUpdate(

          req.params.id,

          {
            status: "Rejected",
            approvedBy: "Admin",
            approvedAt: new Date(),
          },

          {
            new: true,
          }

        );

      res.status(200).json({

        success: true,

        message:
          "Leave Rejected Successfully",

        leave,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };

  const getPendingLeaves =
  async (req, res) => {

    try {

      const leaves =
        await Leave.find({
          status: "Pending",
        });

      res.status(200).json({

        success: true,

        count: leaves.length,

        leaves,

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };

// Delete Leave
const deleteLeave =
  async (req, res) => {

    try {

      await Leave.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({

        success: true,

        message:
          "Leave Deleted Successfully",

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

  createLeave,

  getAllLeaves,

  getLeaveById,

  getPendingLeaves,

  approveLeave,

  rejectLeave,

  deleteLeave,

};