const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Config
dotenv.config();

// App
const app = express();

// Middlewares
app.use(cors());

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
const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

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