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

  // Faculty Today's Lectures & Attendance Session State
  const [todayLectures, setTodayLectures] = useState([]);
  const [todayInfo, setTodayInfo] = useState({ day: "", currentTime: "", todayDate: "" });
  const [loadingLectures, setLoadingLectures] = useState(true);
  const [sessionActionLoadingId, setSessionActionLoadingId] = useState(null);
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

      // Fetch logged-in faculty's today lectures from timetable
      const lecturesRes = await fetch(getApiUrl("/api/attendance-sessions/faculty-today-lectures"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const lecturesData = await lecturesRes.json();
      if (lecturesData.success) {
        setTodayLectures(lecturesData.lectures || []);
        setTodayInfo({
          day: lecturesData.day,
          currentTime: lecturesData.currentTime,
          todayDate: lecturesData.todayDate,
        });
      }
    } catch (error) {
      console.error("Dashboard Data Error:", error);
    } finally {
      setLoadingLectures(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 6000);
    return () => clearInterval(interval);
  }, [onLogout]);

  // Start attendance for a specific lecture (enforces lecture time bounds)
  const handleStartAttendance = async (lectureId) => {
    setSessionActionLoadingId(lectureId);
    setSessionActionMsg("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(getApiUrl("/api/attendance-sessions/start-by-login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timetableEntryId: lectureId }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionActionMsg(data.message || "Attendance session started. Students can scan face now.");
        await loadDashboardData();
      } else {
        setSessionActionMsg(data.message || "Failed to start attendance session.");
      }
    } catch (err) {
      setSessionActionMsg("Server error. Could not start attendance session.");
    } finally {
      setSessionActionLoadingId(null);
      setTimeout(() => setSessionActionMsg(""), 6000);
    }
  };

  // Stop attendance for a specific lecture
  const handleStopAttendance = async (lectureId, sessionId) => {
    setSessionActionLoadingId(lectureId);
    setSessionActionMsg("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(getApiUrl("/api/attendance-sessions/stop-current"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timetableEntryId: lectureId, sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionActionMsg(data.message || "Attendance session stopped. Further face scans blocked.");
        await loadDashboardData();
      } else {
        setSessionActionMsg(data.message || "Failed to stop attendance session.");
      }
    } catch (err) {
      setSessionActionMsg("Server error. Could not stop attendance session.");
    } finally {
      setSessionActionLoadingId(null);
      setTimeout(() => setSessionActionMsg(""), 6000);
    }
  };

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
        className={`fixed lg:relative z-40 top-0 left-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/10 p-6 flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div>
          <h1 className="text-4xl font-black mb-8">
            Attend <span className="text-cyan-400">Sync</span>
          </h1>

          <div className="space-y-2.5">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "timetable", label: "Timetable / Lectures " },
              { id: "slots", label: "Attendance Slots " },
              { id: "students", label: "Registered Students " },
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
                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-left text-sm transition-all duration-300 ${activeSection === section.id
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

            {/* ── Faculty Today Lectures & Attendance Control Panel ── */}
            <div className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                    Attendance Control
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    My Today's Lectures — {todayInfo.day || "Today"}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-cyan-300 font-semibold">
                    ⏰ Time: <span className="font-bold text-white">{todayInfo.currentTime || "--:--"}</span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-gray-300">
                    👤 Faculty: <span className="font-bold text-white">{displayName}</span>
                  </span>
                </div>
              </div>

              {/* Action Message Banner */}
              {sessionActionMsg && (
                <div
                  className={`mb-6 p-4 rounded-2xl text-sm font-semibold text-center border ${sessionActionMsg.toLowerCase().includes("fail") ||
                    sessionActionMsg.toLowerCase().includes("error") ||
                    sessionActionMsg.toLowerCase().includes("cannot") ||
                    sessionActionMsg.toLowerCase().includes("not allowed") ||
                    sessionActionMsg.toLowerCase().includes("only allowed")
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}
                >
                  {sessionActionMsg}
                </div>
              )}

              {/* Lectures List */}
              {loadingLectures && todayLectures.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
                  Loading today's lectures...
                </div>
              ) : todayLectures.length === 0 ? (
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-700/50 flex items-center justify-center text-2xl mb-3">
                    📅
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">No Lectures Scheduled Today</h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    You have no lectures scheduled in the timetable for {todayInfo.day || "today"}. Only your own timetable lectures appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayLectures.map((lec) => {
                    const isLoading = sessionActionLoadingId === lec._id;
                    const isActive = lec.hasActiveSession;
                    const isCurrent = lec.isCurrentTime;
                    const isUpcoming = lec.isUpcoming;
                    const isPast = lec.isPast;

                    return (
                      <div
                        key={lec._id}
                        className={`border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${isActive
                          ? "bg-emerald-950/25 border-emerald-500/40 shadow-lg shadow-emerald-950/30"
                          : isCurrent
                            ? "bg-slate-800/90 border-cyan-500/40"
                            : "bg-slate-800/40 border-white/5 opacity-80 hover:opacity-100"
                          }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          {/* Lecture Details */}
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xl font-black text-white">
                                {lec.subjectName}
                              </h4>
                              {lec.subjectCode && (
                                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-700 font-mono text-cyan-300 font-bold">
                                  {lec.subjectCode}
                                </span>
                              )}
                              {lec.lectureType && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase">
                                  {lec.lectureType}
                                </span>
                              )}

                              {/* Live Status Badge */}
                              {isActive ? (
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black uppercase flex items-center gap-1.5 animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  Attendance Active
                                </span>
                              ) : isCurrent ? (
                                <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                                  ● Lecture In Progress
                                </span>
                              ) : isUpcoming ? (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                                  🕒 Upcoming
                                </span>
                              ) : (
                                <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-gray-400 font-medium">
                                  Completed
                                </span>
                              )}
                            </div>

                            {/* Meta Row */}
                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-300">
                              <span className="font-semibold text-cyan-400">
                                ⏰ {lec.startTime} – {lec.endTime}
                              </span>
                              {lec.room && (
                                <span>📍 Room: <strong className="text-white">{lec.room}</strong></span>
                              )}
                              {lec.semester && (
                                <span>🎓 Sem: <strong className="text-white">{lec.semester}</strong></span>
                              )}
                              {lec.division && (
                                <span>Div: <strong className="text-white">{lec.division}</strong></span>
                              )}
                              {lec.batch && (
                                <span>Batch: <strong className="text-white">{lec.batch}</strong></span>
                              )}
                            </div>

                            {/* Subtext info */}
                            {isActive ? (
                              <p className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                                ✓ {lec.presentCount} student(s) marked present • Face attendance enabled
                              </p>
                            ) : lec.sessionStatus === "CLOSED" ? (
                              <p className="text-gray-400 text-xs">
                                Session ended • Total {lec.presentCount} student(s) marked present
                              </p>
                            ) : isCurrent ? (
                              <p className="text-cyan-300 text-xs">
                                Lecture is currently ongoing. Click below to open face attendance for students.
                              </p>
                            ) : isUpcoming ? (
                              <p className="text-gray-400 text-xs">
                                Attendance can only be started when lecture begins at {lec.startTime}.
                              </p>
                            ) : (
                              <p className="text-gray-500 text-xs">
                                Lecture ended at {lec.endTime}. Attendance cannot be started.
                              </p>
                            )}
                          </div>

                          {/* Control Action Buttons */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleStopAttendance(lec._id, lec.sessionId)}
                                disabled={isLoading}
                                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 active:scale-[0.98] transition text-white shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                              >
                                {isLoading ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Stopping...
                                  </>
                                ) : (
                                  <>■ Stop Attendance</>
                                )}
                              </button>
                            ) : isCurrent ? (
                              <button
                                type="button"
                                onClick={() => handleStartAttendance(lec._id)}
                                disabled={isLoading}
                                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                              >
                                {isLoading ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Starting...
                                  </>
                                ) : (
                                  <>▶ Start Attendance</>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={true}
                                title={`Start Attendance allowed only during scheduled lecture time (${lec.startTime} – ${lec.endTime})`}
                                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 border border-white/10 text-gray-500 opacity-40 cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                ▶ Start Attendance
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
