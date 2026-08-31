const AttendanceSlot = require("../models/AttendanceSlot");

// Helper to determine if a time string "HH:mm" is between startTime and endTime
const isTimeInSlot = (currentTimeStr, startTimeStr, endTimeStr) => {
  return currentTimeStr >= startTimeStr && currentTimeStr < endTimeStr;
};

// Get current server time formatted as "HH:mm" and current slot
const getCurrentTimeSlot = async () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${hours}:${minutes}`;

  const slots = await AttendanceSlot.find({ isActive: true }).sort({ startTime: 1 });
  let activeSlot = null;

  for (const slot of slots) {
    if (isTimeInSlot(currentTimeStr, slot.startTime, slot.endTime)) {
      activeSlot = slot;
      break;
    }
  }

  // Fallback: If no slot strictly matches right now, return the current/nearest active slot or first slot for testing
  return {
    currentTime: currentTimeStr,
    currentSlot: activeSlot,
    allSlots: slots,
  };
};

// GET /api/slots
const getAllSlots = async (req, res) => {
  try {
    const slots = await AttendanceSlot.find().sort({ startTime: 1, order: 1 });
    const { currentTime, currentSlot } = await getCurrentTimeSlot();

    res.status(200).json({
      success: true,
      currentTime,
      currentSlot,
      count: slots.length,
      slots,
    });
  } catch (error) {
    console.error("getAllSlots error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch slots",
    });
  }
};

// GET /api/slots/active
const getActiveSlot = async (req, res) => {
  try {
    const { currentTime, currentSlot, allSlots } = await getCurrentTimeSlot();

    res.status(200).json({
      success: true,
      currentTime,
      currentSlot,
      allActiveSlots: allSlots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get active slot",
    });
  }
};

// POST /api/slots (Create slot)
const createSlot = async (req, res) => {
  try {
    const { slotName, startTime, endTime, order, description, isActive } = req.body;

    if (!slotName || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide slotName, startTime (HH:mm), and endTime (HH:mm)",
      });
    }

    const slot = new AttendanceSlot({
      slotName: slotName.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      order: order !== undefined ? Number(order) : 1,
      description: description ? description.trim() : "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await slot.save();

    res.status(201).json({
      success: true,
      message: "Attendance Slot created successfully",
      slot,
    });
  } catch (error) {
    console.error("createSlot error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create slot",
    });
  }
};

// PUT /api/slots/:id
const updateSlot = async (req, res) => {
  try {
    const { slotName, startTime, endTime, order, description, isActive } = req.body;

    const slot = await AttendanceSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Attendance Slot not found",
      });
    }

    if (slotName !== undefined) slot.slotName = slotName.trim();
    if (startTime !== undefined) slot.startTime = startTime.trim();
    if (endTime !== undefined) slot.endTime = endTime.trim();
    if (order !== undefined) slot.order = Number(order);
    if (description !== undefined) slot.description = description.trim();
    if (isActive !== undefined) slot.isActive = Boolean(isActive);

    await slot.save();

    res.status(200).json({
      success: true,
      message: "Attendance Slot updated successfully",
      slot,
    });
  } catch (error) {
    console.error("updateSlot error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update slot",
    });
  }
};

// DELETE /api/slots/:id
const deleteSlot = async (req, res) => {
  try {
    const slot = await AttendanceSlot.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Attendance Slot not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance Slot deleted successfully",
    });
  } catch (error) {
    console.error("deleteSlot error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete slot",
    });
  }
};

module.exports = {
  getCurrentTimeSlot,
  getAllSlots,
  getActiveSlot,
  createSlot,
  updateSlot,
  deleteSlot,
};
