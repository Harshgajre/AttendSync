import { useState, useEffect } from "react";
import StudentLogin from "./student/StudentLogin";
import EmployeeLogin from "./employee/EmployeeLogin";
import FaceAttendanceModal from "./common/FaceAttendanceModal";
import { getApiUrl } from "../config/api";

export default function HomePage() {
  const [role, setRole] = useState("");
  const [showFaceScanModal, setShowFaceScanModal] = useState(false);
  const [activeSlotInfo, setActiveSlotInfo] = useState(null);

  // Fetch current active slot to show on the hero badge
  useEffect(() => {
    const fetchActiveSlot = async () => {
      try {
        const res = await fetch(getApiUrl("/api/slots/active"));
        const data = await res.json();
        if (data.success && data.currentSlot) {
          setActiveSlotInfo(data.currentSlot);
        }
      } catch (err) {
        // quiet fallback
      }
    };
    fetchActiveSlot();
  }, []);

  // Student Login
  if (role === "student") {
    return <StudentLogin />;
  }

  // Employee Login
  if (role === "employee") {
    return <EmployeeLogin />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-6 overflow-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Main Content */}
      <div className="text-center max-w-5xl relative z-10 py-12">
        {/* Active Slot Live Badge */}
        <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-6 py-3 rounded-full text-sm mb-8 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {activeSlotInfo
              ? `Current Active Slot: ${activeSlotInfo.slotName} (${activeSlotInfo.startTime} - ${activeSlotInfo.endTime})`
              : "Face Recognition Slot-Wise Attendance System"}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6">
          Attend
          <span className="text-cyan-400">Sync</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-2">
          Smart Face Recognition Attendance for Modern Institutions
        </p>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-cyan-300 mb-10 tracking-wide">
          Slot-Wise Verification • Biometric Accuracy • Zero Duplicate Scans
        </p>

        {/* Quick Face Scan CTA (Centerpiece) */}
        <div className="mb-10 max-w-md mx-auto">
          <button
            onClick={() => setShowFaceScanModal(true)}
            className="w-full group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 p-5 rounded-3xl text-lg sm:text-xl font-black shadow-2xl shadow-emerald-500/30 hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 border border-emerald-300/30"
          >
            <span className="text-3xl group-hover:rotate-12 transition-transform">📸</span>
            <span>Scan Face to Mark Attendance</span>
          </button>
          <p className="text-xs text-gray-400 mt-2">
            No password required • Instant slot verification
          </p>
        </div>

        {/* Portal Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center max-w-lg mx-auto">
          {/* Student */}
          <button
            onClick={() => setRole("student")}
            className="w-full sm:w-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 px-8 py-4 rounded-2xl text-base sm:text-lg font-bold shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all duration-300"
          >
            Student Portal
          </button>

          {/* Employee */}
          <button
            onClick={() => setRole("employee")}
            className="w-full sm:w-1/2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-8 py-4 rounded-2xl text-base sm:text-lg font-bold shadow-xl shadow-green-500/20 hover:scale-105 transition-all duration-300"
          >
            Employee Portal
          </button>
        </div>

        {/* Copyright */}
        <p className="mt-14 text-xs text-slate-600">
          AttendSync Biometric System © 2026
        </p>
      </div>

      {/* Face Attendance Modal */}
      <FaceAttendanceModal
        isOpen={showFaceScanModal}
        onClose={() => setShowFaceScanModal(false)}
      />
    </div>
  );
}