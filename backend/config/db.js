const mongoose = require("mongoose");
const dns = require("dns");

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    // Solve Node.js querySrv ECONNREFUSED DNS issues on Windows / local networks
    if (uri.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch (dnsErr) {
        console.warn("⚠️ Warning: Failed to set custom DNS servers, trying defaults.", dnsErr.message);
      }
    }

    const conn = await mongoose.connect(uri);

    console.log("");
    console.log("=================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📦 Host : ${conn.connection.host}`);
    console.log(`🗄️ Database : ${conn.connection.name}`);
    console.log("=================================");
    console.log("");

  } catch (error) {

    console.log("");
    console.log("=================================");
    console.log("❌ MongoDB Connection Failed");
    console.log("=================================");
    console.log("");

    console.error("Name:");
    console.error(error.name);

    console.error("\nMessage:");
    console.error(error.message);

    console.error("\nCause:");
    console.error(error.cause);

    console.error("\nCode:");
    console.error(error.code);

    console.error("\nFull Error:");
    console.error(error);

    console.error("\nStack:");
    console.error(error.stack);

    console.log("");
    console.log("=================================");

    process.exit(1);
  }
};

module.exports = connectDB;