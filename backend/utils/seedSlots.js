const AttendanceSlot = require("../models/AttendanceSlot");

const defaultSlots = [
  {
    slotName: "Slot 1 (Morning)",
    startTime: "09:00",
    endTime: "11:00",
    order: 1,
    isActive: true,
    description: "Morning Academic / Work Session",
  },
  {
    slotName: "Slot 2 (Mid-Day)",
    startTime: "11:00",
    endTime: "13:00",
    order: 2,
    isActive: true,
    description: "Pre-lunch Academic / Work Session",
  },
  {
    slotName: "Slot 3 (Afternoon)",
    startTime: "14:00",
    endTime: "16:00",
    order: 3,
    isActive: true,
    description: "Afternoon Academic / Work Session",
  },
  {
    slotName: "Slot 4 (Evening)",
    startTime: "16:00",
    endTime: "18:00",
    order: 4,
    isActive: true,
    description: "Late Afternoon / Evening Session",
  },
  {
    slotName: "Slot 5 (Extended)",
    startTime: "18:00",
    endTime: "23:59",
    order: 5,
    isActive: true,
    description: "Extended / Night Working Session",
  },
];

const seedSlots = async () => {
  try {
    const count = await AttendanceSlot.countDocuments();
    if (count === 0) {
      await AttendanceSlot.insertMany(defaultSlots);
      console.log("✅ Attendance Slots successfully seeded into database.");
    }
  } catch (error) {
    console.error("❌ Error seeding attendance slots:", error.message);
  }
};

module.exports = seedSlots;
