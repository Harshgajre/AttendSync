const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@attendsync.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminUsername = "admin";

    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const newAdmin = new Admin({
        name: "System Administrator",
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
      });

      await newAdmin.save();
      console.log(`✅ Default Admin Seeded: ${adminEmail} (username: ${adminUsername})`);
    } else {
      // Ensure role is set to 'admin'
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
      }
    }
  } catch (error) {
    console.error("Error seeding default admin:", error.message);
  }
};

module.exports = seedAdmin;
