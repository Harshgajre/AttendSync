const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const seedSlots = require("./utils/seedSlots");
const seedTimetable = require("./utils/seedTimetable");

// Config
dotenv.config();

// App
const app = express();

// Middlewares
const allowedOrigins = [
  "https://attend-sync-iota.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Support JSON payloads including face embeddings and base64 face thumbnails
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AttendSync Face Recognition Backend Running 🚀",
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "Running",
    timestamp: new Date(),
  });
});

// Route Imports
const studentRoutes = require("./routes/studentRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const semesterRoutes = require("./routes/semesterRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const adminRoutes = require("./routes/adminRoutes");
const slotRoutes = require("./routes/slotRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const attendanceSessionRoutes = require("./routes/attendanceSessionRoutes");

// Route Registrations
app.use("/api/students", studentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/semester", semesterRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance-sessions", attendanceSessionRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Server Initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  await seedSlots();
  await seedTimetable();

  app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log(`🚀 AttendSync Face Recognition Server Running`);
    console.log(`📡 Port : ${PORT}`);
    console.log(`🌍 URL  : http://localhost:${PORT}`);
    console.log("=================================");
    console.log("");
  });
};

startServer();
