const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

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


app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

// Home Route
app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message:
      "AttendSync Backend Running 🚀",

  });

});

// Health Check
app.get(
  "/api/health",
  (req, res) => {

    res.status(200).json({

      success: true,

      server: "Running",

      timestamp:
        new Date(),

    });

  }
);


const studentRoutes =
  require("./routes/studentRoutes");

const employeeRoutes =
  require("./routes/employeeRoutes");

const holidayRoutes =
  require("./routes/holidayRoutes");

const semesterRoutes =
  require("./routes/semesterRoutes");

const leaveRoutes =
  require("./routes/leaveRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

app.use(
  "/api/students",
  studentRoutes
);

app.use(
  "/api/employees",
  employeeRoutes
);

app.use(
  "/api/holidays",
  holidayRoutes
);

app.use(
  "/api/semester",
  semesterRoutes
);

app.use(
  "/api/leaves",
  leaveRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message:
      "Route Not Found",

  });

});

// Server
const PORT = process.env.PORT || 5000;
const seedAdmin = require("./utils/seedAdmin");

const startServer = async () => {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log("");
    console.log(
      "================================="
    );
    console.log(
      `🚀 attendSync Server Running`
    );
    console.log(
      `📡 Port : ${PORT}`
    );
    console.log(
      `🌍 URL  : http://localhost:${PORT}`
    );
    console.log(
      "================================="
    );
    console.log("");
  });
};

startServer();
