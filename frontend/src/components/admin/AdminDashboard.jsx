import { useState, useEffect } from "react";
import AttendanceReports from "./AttendanceReports";
import SemesterControl from "./SemesterControl";
import SystemSettings from "./SystemSettings";
import ManageStudents from "./ManageStudents";
import ManageSlots from "./ManageSlots";
import ManageTimetable from "./ManageTimetable";
import { getApiUrl } from "../../config/api";

export default function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalFaceRegistered, setTotalFaceRegistered] = useState(0);
  const [todayAttendanceCount, setTodayAttendanceCount] = useState(0);
  const [currentSlotInfo, setCurrentSlotInfo] = useState(null);
  const [currentSlotAttendance, setCurrentSlotAttendance] = useState(0);

  // Attendance session state
  const [activeSession, setActiveSession] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);
  const [sessionActionMsg, setSessionActionMsg] = useState("");

  // Logged-in user info
  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "{}");
    } catch {
      return {};
    }
  })();

  const loadDashboardData = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(getApiUrl("/api/admin/dashboard"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        if (onLogout) onLogout();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setTotalStudents(data.totalStudents || 0);
      }

      // Attendance stats
      const statsRes = await fetch(getApiUrl("/api/attendance/stats"));
      const statsData = await statsRes.json();
      if (statsData.success) {
        setTotalUsers(statsData.totalStudents || 0);
        setTotalFaceRegistered(statsData.totalFaceRegistered || 0);
        setTodayAttendanceCount(statsData.todayAttendanceCount || 0);
        setCurrentSlotInfo(statsData.currentSlot);
        setCurrentSlotAttendance(statsData.currentSlotAttendanceCount || 0);
      }

      // Current session status
      const sessionRes = await fetch(getApiUrl("/api/attendance-sessions/current"));
      const sessionData = await sessionRes.json();
      if (sessionData.success) {
        setActiveSession(sessionData.activeSession);
        setCurrentLecture(sessionData.currentLecture);
      }
    } catch (error) {
      console.error("Dashboard Data Error:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 6000);
    return () => clearInterval(interval);
  }, [onLogout]);

  // Start attendance session (no face scan — uses JWT)
  const handleStartAttendance = async () => {
    setSessionActionLoading(true);
    setSessionActionMsg("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(getApiUrl("/api/attendance-sessions/start-by-login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSessionActionMsg(data.message || "Attendance session started.");
        await loadDashboardData();
      } else {
        setSessionActionMsg(data.message || "Failed to start attendance session.");
      }
    } catch (err) {
      setSessionActionMsg("Server error. Could not start attendance session.");
    } finally {
      setSessionActionLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setSessionActionMsg(""), 5000);
    }
  };

  // Stop attendance session
  const handleStopAttendance = async () => {
    setSessionActionLoading(true);
    setSessionActionMsg("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(getApiUrl("/api/attendance-sessions/stop-current"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSessionActionMsg(data.message || "Attendance session stopped.");
        await loadDashboardData();
      } else {
        setSessionActionMsg(data.message || "Failed to stop attendance session.");
      }
    } catch (err) {
      setSessionActionMsg("Server error. Could not stop attendance session.");
    } finally {
      setSessionActionLoading(false);
      setTimeout(() => setSessionActionMsg(""), 5000);
    }
  };

  const sessionIsActive = activeSession && activeSession.status === "ACTIVE";
  const sessionPresentCount = activeSession?.presentCount ?? 0;

  // Display name: faculty name or "Admin"
  const displayName = loggedInUser?.name || "Admin";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayRole =
    loggedInUser?.role === "faculty_admin"
      ? (loggedInUser?.employeeRole === "hod" ? "HOD" : "Faculty")
      : "Super Administrator";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-5 bg-slate-900 border-b border-cyan-500/10">
        <h1 className="text-2xl font-black">
          Attend <span className="text-cyan-400">Sync</span>
        </h1>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-cyan-500 px-4 py-2 rounded-xl text-xl font-black text-slate-950"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-40 top-0 left-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/10 p-6 flex flex-col justify-between transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <h1 className="text-4xl font-black mb-8">
            Attend <span className="text-cyan-400">Sync</span>
          </h1>

          <div className="space-y-2.5">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "timetable", label: "Timetable / Lectures 📅" },
              { id: "slots", label: "Attendance Slots 🕒" },
              { id: "students", label: "Manage Students" },
              { id: "reports", label: "Attendance Reports" },
              { id: "semester", label: "Semester Control" },
              { id: "settings", label: "System Settings" },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setSidebarOpen(false);
                }}
                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-left text-sm transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-slate-800/50 hover:bg-slate-700 text-gray-300"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-slate-800/80 border border-white/10 p-5 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
              {displayInitial}
            </div>

            <div>
              <h2 className="text-base font-bold truncate max-w-[120px]" title={displayName}>
                {displayName}
              </h2>
              <p className="text-xs text-gray-400">{displayRole}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 active:scale-[0.98] py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
          >
            Logout →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden p-5 sm:p-8 lg:p-10 pt-28 lg:pt-10 overflow-y-auto">
        <div className="mb-10">
          {activeSection === "timetable" && <ManageTimetable />}
          {activeSection === "slots" && <ManageSlots />}
          {activeSection === "students" && <ManageStudents />}
          {activeSection === "reports" && <AttendanceReports />}
          {activeSection === "semester" && <SemesterControl />}
          {activeSection === "settings" && <SystemSettings />}
        </div>

        {activeSection === "dashboard" && (
          <div>
            <h1 className="text-4xl font-black mb-8">
              System <span className="text-cyan-400">Overview</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900/80 border border-cyan-500/10 rounded-3xl p-6">
                <p className="text-gray-400 mb-2 text-sm font-semibold">Total Students</p>
                <h2 className="text-5xl font-black text-cyan-400">{totalStudents}</h2>
              </div>

              <div className="bg-slate-900/80 border border-emerald-500/10 rounded-3xl p-6">
                <p className="text-gray-400 mb-2 text-sm font-semibold">Face Registered Users</p>
                <h2 className="text-5xl font-black text-emerald-400">
                  {totalFaceRegistered} <span className="text-sm font-normal text-gray-400">/ {totalUsers}</span>
                </h2>
              </div>

              <div className="bg-slate-900/80 border border-yellow-500/10 rounded-3xl p-6">
                <p className="text-gray-400 mb-2 text-sm font-semibold">Today's Total Attendance</p>
                <h2 className="text-5xl font-black text-yellow-400">{todayAttendanceCount}</h2>
              </div>
            </div>

            {/* ── Attendance Control Panel ── */}
            <div className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 mb-8">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                Attendance Control
              </span>
              <h3 className="text-2xl font-black text-white mt-1 mb-5">
                Start / Stop Student Attendance
              </h3>

              {/* Current Lecture Info */}
              {currentLecture ? (
                <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 mb-5 text-sm">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <p className="font-bold text-white text-base">
                        {currentLecture.subjectName}
                        {currentLecture.subjectCode && (
                          <span className="text-gray-400 font-normal ml-2">({currentLecture.subjectCode})</span>
                        )}
                      </p>
                      <p className="text-gray-400 mt-0.5">
                        ⏰ {currentLecture.startTime} – {currentLecture.endTime}
                        {currentLecture.facultyName && (
                          <span className="ml-3">👤 {currentLecture.facultyName}</span>
                        )}
                        {currentLecture.room && (
                          <span className="ml-3">📍 {currentLecture.room}</span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        sessionIsActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {sessionIsActive ? "● Attendance Active" : "○ Not Started"}
                    </span>
                  </div>
                  {sessionIsActive && (
                    <p className="text-emerald-400 font-semibold text-xs mt-2">
                      {sessionPresentCount} student(s) marked present so far
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 mb-5 text-sm text-gray-400 text-center">
                  No lecture is currently scheduled in the timetable.
                </div>
              )}

              {/* Action Message */}
              {sessionActionMsg && (
                <div
                  className={`mb-4 p-3.5 rounded-2xl text-sm font-semibold text-center border ${
                    sessionActionMsg.toLowerCase().includes("fail") ||
                    sessionActionMsg.toLowerCase().includes("error") ||
                    sessionActionMsg.toLowerCase().includes("no active")
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  {sessionActionMsg}
                </div>
              )}

              {/* Start / Stop Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!sessionIsActive ? (
                  <button
                    onClick={handleStartAttendance}
                    disabled={sessionActionLoading || !currentLecture}
                    className="flex-1 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xl shadow-emerald-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {sessionActionLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Starting...
                      </>
                    ) : (
                      <>▶ Start Attendance</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleStopAttendance}
                    disabled={sessionActionLoading}
                    className="flex-1 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xl shadow-red-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {sessionActionLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Stopping...
                      </>
                    ) : (
                      <>■ Stop Attendance</>
                    )}
                  </button>
                )}
              </div>

              {!currentLecture && (
                <p className="text-gray-500 text-xs mt-3 text-center">
                  Buttons are enabled only when a lecture is scheduled in the timetable right now.
                </p>
              )}
            </div>

            {/* Live Active Slot Widget */}
            <div className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                    Live Attendance Slot Engine
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {currentSlotInfo ? currentSlotInfo.slotName : "No Active Slot Configured"}
                  </h3>
                  {currentSlotInfo && (
                    <p className="text-sm text-gray-400 mt-1">
                      Time: {currentSlotInfo.startTime} – {currentSlotInfo.endTime}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800 px-6 py-4 rounded-2xl border border-white/10 text-center">
                  <p className="text-xs text-gray-400 font-semibold">Current Slot Attendance</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">{currentSlotAttendance}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
