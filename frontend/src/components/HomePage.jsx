import { useState } from "react";

import StudentLogin from "./student/StudentLogin";
import EmployeeLogin from "./employee/EmployeeLogin";
import AdminLogin from "./admin/AdminLogin";

export default function HomePage() {
  const [role, setRole] = useState("");

  // Student Login
  if (role === "student") {
    return <StudentLogin />;
  }

  // Employee Login
  if (role === "employee") {
    return <EmployeeLogin />;
  }

  // Hidden Admin Login
  if (role === "admin") {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-6 overflow-hidden relative">

      {/* Glow Effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Main Content */}
      <div className="text-center max-w-5xl relative z-10">

        {/* Badge */}
        <p className="inline-block bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-6 py-3 rounded-full text-sm mb-8 shadow-lg">
          Modern Attendance Management System
        </p>

        {/* Heading */}
        <h1
          onDoubleClick={() => setRole("admin")}
          className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-8 cursor-pointer select-none"
        >

          Attend
          <span className="text-cyan-400">
            Sync
          </span>

        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-4">
          Smart Attendance for Modern Institutions
        </p>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-cyan-300 mb-14 tracking-wide">
          Your Attendance, Our Responsibility
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-5 justify-center items-center">

          {/* Student */}
          <button
            onClick={() => setRole("student")}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 px-10 sm:px-14 py-5 rounded-3xl text-lg sm:text-xl font-bold shadow-2xl shadow-cyan-500/30 hover:scale-105 transition-all duration-300"
          >
            Student
          </button>

          {/* Employee */}
          <button
            onClick={() => setRole("employee")}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 px-10 sm:px-14 py-5 rounded-3xl text-lg sm:text-xl font-bold shadow-2xl shadow-green-500/30 hover:scale-105 transition-all duration-300"
          >
            Employee
          </button>

        </div>

        {/* Hidden Hint */}
        <p className="mt-16 text-xs text-slate-600">
          AttendSync © 2026
        </p>

      </div>
    </div>
  );
}