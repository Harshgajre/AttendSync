import { useState, useEffect } from "react";
import EmployeeHome from "./EmployeeHome";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeePFCL from "./EmployeePFCL";
import LeaveApproval from "./LeaveApproval";
import EmployeeProfile from "./EmployeeProfile";
import EmployeeReports from "./EmployeeReports";
import EmployeeHolidayList from "./EmployeeHolidayList";
import FaceAttendanceModal from "../common/FaceAttendanceModal";
import FacultyStartAttendanceModal from "../common/FacultyStartAttendanceModal";
import { getApiUrl } from "../../config/api";

export default function EmployeeDashboard({
  onLogout,
  userName,
  role,
}) {
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showFacultyStartModal, setShowFacultyStartModal] = useState(false);

  // User details from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("employeeUser") || "{}");
    } catch {
      return {};
    }
  })();

  // Timetable & Live Lecture Session State
  const [lectureInfo, setLectureInfo] = useState({
    currentLecture: null,
    activeSession: null,
    sessionStarted: false,
    day: "",
    currentTime: "",
    isAssignedToCurrentLecture: false,
    employeeRole: "faculty",
    isHOD: false,
  });

  const [dayLectures, setDayLectures] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingLecture, setLoadingLecture] = useState(false);
  const [closingSession, setClosingSession] = useState(false);

  // Fetch current lecture + active session for faculty
  const fetchLectureAndSession = async () => {
    if (!currentUser._id) return;
    try {
      setLoadingLecture(true);

      // 1. Current lecture info for faculty
      const facultyRes = await fetch(
        getApiUrl(`/api/attendance-sessions/faculty-today/${currentUser._id}`)
      );
      const facultyData = await facultyRes.json();
      if (facultyData.success) {
        setLectureInfo({
          currentLecture: facultyData.currentLecture,
          activeSession: facultyData.activeSession,
          sessionStarted: facultyData.sessionStarted,
          day: facultyData.day,
          currentTime: facultyData.currentTime,
          isAssignedToCurrentLecture: facultyData.isAssignedToCurrentLecture,
          employeeRole: facultyData.employeeRole,
          isHOD: facultyData.isHOD,
        });
      }

      // 2. Full timetable for today
      const ttRes = await fetch(getApiUrl("/api/timetable/current-lecture"));
      const ttData = await ttRes.json();
      if (ttData.success) {
        setDayLectures(ttData.dayLectures || []);
      }

      // 3. Attendance history
      const historyRes = await fetch(
        getApiUrl(`/api/attendance/history/${currentUser._id}`)
      );
      const historyData = await historyRes.json();
      if (historyData.success) {
        setAttendanceHistory(historyData.records || []);
      }
    } catch (err) {
      console.error("Failed to load faculty lecture info:", err);
    } finally {
      setLoadingLecture(false);
    }
  };

  useEffect(() => {
    fetchLectureAndSession();
    const interval = setInterval(fetchLectureAndSession, 6000);
    return () => clearInterval(interval);
  }, [currentUser._id]);

  // Handle closing an active session
  const handleCloseSession = async () => {
    if (!lectureInfo.activeSession?._id) return;
    if (!window.confirm("Are you sure you want to close this attendance session? Students will no longer be able to mark attendance.")) return;

    try {
      setClosingSession(true);
      const res = await fetch(
        getApiUrl(`/api/attendance-sessions/${lectureInfo.activeSession._id}/close`),
        { method: "PUT" }
      );
      const data = await res.json();
      if (data.success) {
        alert("Attendance session closed successfully.");
        fetchLectureAndSession();
      }
    } catch (err) {
      console.error("Close session error:", err);
    } finally {
      setClosingSession(false);
    }
  };

  // Attendance & PF/CL states
  const [totalPF, setTotalPF] = useState(12);
  const [usedPF, setUsedPF] = useState(0);
  const [totalCL, setTotalCL] = useState(12);
  const [usedCL, setUsedCL] = useState(0);

  useEffect(() => {
    const savedData = localStorage.getItem("employeePFCL");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTotalPF(Number(parsed.totalPF) || 12);
      setUsedPF(Number(parsed.usedPF) || 0);
      setTotalCL(Number(parsed.totalCL) || 12);
      setUsedCL(Number(parsed.usedCL) || 0);
    }
  }, []);

  const curLecture = lectureInfo.currentLecture;
  const isSessionActive = lectureInfo.sessionStarted;
  const isAuthorizedToStart =
    lectureInfo.isHOD ||
    lectureInfo.isAssignedToCurrentLecture ||
    (curLecture && !curLecture.facultyId);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white">
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between p-5 bg-slate-900 border-b border-green-500/10">
        <h1 className="text-2xl font-black">
          Attend <span className="text-green-400">Sync</span>
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-green-500 px-4 py-2 rounded-xl text-xl font-black text-slate-950"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-50 top-0 left-0 h-full lg:h-auto w-72 bg-slate-900/95 border-r border-green-500/10 p-4 sm:p-6 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo */}
          <h1 className="text-3xl sm:text-4xl font-black mb-8 lg:mb-12">
            Attend <span className="text-green-400">Sync</span>
          </h1>

          {/* Buttons */}
          <div className="space-y-3">
            {[
              { id: "home", label: "Dashboard & Live Session" },
              { id: "timetable", label: "Today's Timetable Schedule" },
              { id: "attendance", label: "Fill Manual Attendance" },
              { id: "pfcl", label: "PF / CL Limits" },
              { id: "holiday", label: "Holiday List" },
              { id: "leave", label: "Leave Approval" },
              { id: "reports", label: "Reports / Graphs" },
              { id: "profile", label: "Profile" },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setSidebarOpen(false);
                }}
                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-left transition-all ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                    : "bg-slate-800/60 hover:bg-slate-800 text-gray-300"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="mt-8 bg-slate-800/80 border border-green-500/10 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-3">
            {currentUser.faceImage ? (
              <img
                src={currentUser.faceImage}
                alt="Profile"
                className="w-12 h-12 rounded-xl object-cover border border-green-400"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center font-black text-xl">
                {userName ? userName[0] : "F"}
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="text-lg font-black truncate">{userName}</h2>
              <p className="text-xs text-green-400 uppercase font-bold">
                {currentUser.role === "hod" ? "HOD (Authorized)" : "Faculty Member"}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 active:scale-95 py-3 rounded-xl text-sm font-bold transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden p-5 sm:p-8 lg:p-10 overflow-y-auto">
        {/* HOME SECTION */}
        {activeSection === "home" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <div>
                <p className="text-green-400 text-base font-semibold">
                  {lectureInfo.day ? `${lectureInfo.day} • ${lectureInfo.currentTime}` : "Live Timetable System"}
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                  Welcome, <span className="text-green-400">{userName}</span>
                </h1>
              </div>

              {currentUser.role === "hod" && (
                <span className="px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-black uppercase tracking-wider">
                  Head of Department (HOD)
                </span>
              )}
            </div>

            {/* LIVE LECTURE ATTENDANCE SESSION HERO CARD */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-green-500/30 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl shadow-green-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-400/20 text-green-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Real-Time Timetable Engine
                  </div>

                  {curLecture ? (
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {curLecture.subjectName}{" "}
                        <span className="text-green-400 text-xl font-mono font-bold">
                          ({curLecture.subjectCode})
                        </span>
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-300 mt-2">
                        <span className="font-semibold text-white">⏰ Time: {curLecture.startTime} – {curLecture.endTime}</span>
                        {curLecture.room && <span>📍 {curLecture.room}</span>}
                        {curLecture.facultyName && <span>👤 Assigned: {curLecture.facultyName}</span>}
                        {curLecture.semester && <span>🎓 Sem {curLecture.semester} (Div {curLecture.division || "A"})</span>}
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-xs text-gray-400 font-bold uppercase">Session Status:</span>
                        {isSessionActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold rounded-full text-xs animate-pulse">
                            ● Active (Attendance Open)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/20 border border-amber-500 text-amber-300 font-bold rounded-full text-xs">
                            Session Not Started Yet
                          </span>
                        )}

                        {isSessionActive && (
                          <span className="text-xs text-gray-300 font-semibold ml-2">
                            Students Present: <strong className="text-emerald-400 text-sm">{lectureInfo.activeSession?.presentCount || 0}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        No Lecture Currently Scheduled
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Currently outside lecture hours, during break, or no classes are configured for this time in the timetable.
                      </p>
                    </div>
                  )}
                </div>

                {/* Faculty Start / Close Attendance Buttons */}
                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                  {curLecture && (
                    <>
                      {!isSessionActive ? (
                        <button
                          onClick={() => setShowFacultyStartModal(true)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-8 py-4 rounded-2xl text-base font-black shadow-xl shadow-green-500/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                          <span>📸 Start Attendance (Faculty Face Scan)</span>
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => setShowFacultyStartModal(true)}
                            className="bg-slate-800 hover:bg-slate-700 px-5 py-3.5 rounded-2xl text-xs font-bold text-green-300 border border-green-500/30 transition"
                          >
                            Re-verify / Session Info
                          </button>
                          <button
                            onClick={handleCloseSession}
                            disabled={closingSession}
                            className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-6 py-3.5 rounded-2xl text-sm font-bold border border-red-500/40 transition"
                          >
                            {closingSession ? "Closing..." : "Close Attendance Session"}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Fallback Employee Personal Sign-in Button */}
                  <button
                    onClick={() => setShowFaceModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 px-5 py-3.5 rounded-2xl text-xs font-bold text-gray-300 hover:text-white transition"
                  >
                    Employee Check-In
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Today's Total Scheduled Lectures</p>
                <h3 className="text-4xl font-black text-green-400">
                  {dayLectures.length}
                </h3>
              </div>

              <div className="bg-slate-900 border border-emerald-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Faculty Biometric Status</p>
                <h3 className="text-2xl font-black text-emerald-400">
                  {currentUser.faceRegistered ? "Enrolled ✓" : "Pending"}
                </h3>
              </div>

              <div className="bg-slate-900 border border-teal-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Total Verified Check-Ins</p>
                <h3 className="text-4xl font-black text-teal-400">
                  {attendanceHistory.length}
                </h3>
              </div>
            </div>

            {/* Leave / PF Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-green-500/10">
                <h3 className="text-xl font-bold mb-2">PF Leave Balance</h3>
                <p className="text-3xl font-black text-green-400">
                  {totalPF - usedPF} <span className="text-base font-medium text-gray-400">/ {totalPF} available</span>
                </p>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-emerald-500/10">
                <h3 className="text-xl font-bold mb-2">Casual Leave (CL) Balance</h3>
                <p className="text-3xl font-black text-emerald-400">
                  {totalCL - usedCL} <span className="text-base font-medium text-gray-400">/ {totalCL} available</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TIMETABLE SCHEDULE SECTION */}
        {activeSection === "timetable" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                  Today's <span className="text-green-400">Lecture Schedule</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-1">
                  Full timetable schedule for {lectureInfo.day || "Today"} with lecture-wise details
                </p>
              </div>

              {curLecture && !isSessionActive && (
                <button
                  onClick={() => setShowFacultyStartModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-green-500/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Start Current Lecture Session</span>
                </button>
              )}
            </div>

            {/* Today's Lectures Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {dayLectures.map((lec, index) => {
                const isCurrent =
                  curLecture && String(curLecture._id) === String(lec._id);

                return (
                  <div
                    key={lec._id || index}
                    className={`bg-slate-900 rounded-3xl p-6 border transition-all duration-300 ${
                      isCurrent
                        ? "border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.15)] ring-1 ring-green-400/50"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase font-mono font-bold text-gray-400">
                        {lec.startTime} – {lec.endTime}
                      </span>
                      {isCurrent && (
                        <span className="bg-green-500/20 text-green-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-green-400/30">
                          Active Now
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{lec.subjectName}</h3>
                    <p className="text-xs text-green-400 font-mono mb-3">{lec.subjectCode}</p>

                    <div className="text-xs text-gray-400 space-y-1 pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span>Faculty:</span>
                        <span className="font-semibold text-gray-300">{lec.facultyName || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Room:</span>
                        <span className="font-semibold text-gray-300">{lec.room || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Class:</span>
                        <span className="font-semibold text-gray-300">
                          Sem {lec.semester || 6} • Div {lec.division || "A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* OTHER SECTIONS */}
        {activeSection === "attendance" && <EmployeeAttendance />}
        {activeSection === "pfcl" && <EmployeePFCL />}
        {activeSection === "holiday" && <EmployeeHolidayList />}
        {activeSection === "leave" && <LeaveApproval />}
        {activeSection === "reports" && <EmployeeReports />}
        {activeSection === "profile" && <EmployeeProfile />}
      </div>

      {/* Faculty Start Attendance Modal */}
      <FacultyStartAttendanceModal
        isOpen={showFacultyStartModal}
        currentLecture={curLecture}
        onClose={() => {
          setShowFacultyStartModal(false);
          fetchLectureAndSession();
        }}
        onSessionStarted={(session) => {
          fetchLectureAndSession();
        }}
      />

      {/* Generic Face Attendance Modal (Fallback) */}
      <FaceAttendanceModal
        isOpen={showFaceModal}
        onClose={() => {
          setShowFaceModal(false);
          fetchLectureAndSession();
        }}
        onAttendanceSuccess={() => {
          fetchLectureAndSession();
        }}
      />
    </div>
  );
}