import { useState, useEffect } from "react";
import AttendanceOverview from "./AttendanceOverview";
import SemesterDates from "./SemesterDates";
import FaceAttendanceModal from "../common/FaceAttendanceModal";
import { getApiUrl } from "../../config/api";

export default function StudentDashboard({
  onLogout,
  userName,
  role,
}) {
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);

  // User details from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("studentUser") || "{}");
    } catch {
      return {};
    }
  })();

  // Live Timetable Attendance State
  const [timetableData, setTimetableData] = useState({
    currentLecture: null,
    activeSession: null,
    sessionStarted: false,
    isCurrentLectureAttended: false,
    totalLecturesToday: 0,
    attendedLecturesCount: 0,
    lectureStatus: [],
    day: "",
    currentTime: "",
    records: [],
  });

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // Fetch today's timetable-based attendance status
  const fetchTimetableAttendance = async () => {
    if (!currentUser._id) return;
    try {
      setLoadingTimetable(true);

      // 1. Today's timetable status
      const res = await fetch(
        getApiUrl(`/api/attendance-sessions/student-today/${currentUser._id}`)
      );
      const data = await res.json();
      if (data.success) {
        setTimetableData({
          currentLecture: data.currentLecture,
          activeSession: data.activeSession,
          sessionStarted: data.sessionStarted,
          isCurrentLectureAttended: data.isCurrentLectureAttended,
          totalLecturesToday: data.totalLecturesToday,
          attendedLecturesCount: data.attendedLecturesCount,
          lectureStatus: data.lectureStatus || [],
          day: data.day,
          currentTime: data.currentTime,
          records: data.records || [],
        });
      }

      // 2. Full attendance history
      const historyRes = await fetch(
        getApiUrl(`/api/attendance-sessions/student-history/${currentUser._id}`)
      );
      const historyData = await historyRes.json();
      if (historyData.success) {
        setAttendanceHistory(historyData.records || []);
      }
    } catch (err) {
      console.error("Failed to load student timetable attendance:", err);
    } finally {
      setLoadingTimetable(false);
    }
  };

  useEffect(() => {
    fetchTimetableAttendance();
    const interval = setInterval(fetchTimetableAttendance, 6000);
    return () => clearInterval(interval);
  }, [currentUser._id]);

  // Semester Dates
  const [semesterData, setSemesterData] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    const savedSemester = localStorage.getItem(`semesterDates-${userName}`);
    if (savedSemester) {
      setSemesterData(JSON.parse(savedSemester));
    }
  }, [userName]);

  const overviewAttendanceRecords = attendanceHistory.map((rec) => ({
    subject: rec.subjectName || rec.slotName || "General",
    status: rec.status || "Present",
  }));

  const curLecture = timetableData.currentLecture;
  const isSessionActive = timetableData.sessionStarted;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between p-5 bg-slate-900 border-b border-cyan-500/10">
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
        className={`fixed lg:relative z-50 top-0 left-0 h-full lg:h-auto w-72 bg-slate-900/95 border-r border-cyan-500/10 p-4 sm:p-6 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo */}
          <h1 className="text-3xl sm:text-4xl font-black mb-8 lg:mb-12 text-center lg:text-left">
            Attend <span className="text-cyan-400">Sync</span>
          </h1>

          {/* Nav Items */}
          <div className="space-y-3">
            {[
              { id: "home", label: "Dashboard & Live Lecture" },
              { id: "timetable", label: "Lecture-Wise Attendance" },
              { id: "overview", label: "Overview of Attendance" },
              { id: "semester", label: "Semester Dates" },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setSidebarOpen(false);
                }}
                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-left transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-slate-800/60 hover:bg-slate-800 text-gray-300"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="mt-8 bg-slate-800/80 border border-cyan-500/10 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-3">
            {currentUser.faceImage ? (
              <img
                src={currentUser.faceImage}
                alt="Profile"
                className="w-12 h-12 rounded-xl object-cover border border-cyan-400"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-black text-xl">
                {userName ? userName[0] : "S"}
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="text-lg font-black truncate">{userName}</h2>
              <p className="text-xs text-cyan-400">
                {currentUser.faceRegistered ? "Face Enrolled ✓" : "Student"}
                {currentUser.semester ? ` • Sem ${currentUser.semester}` : ""}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden p-5 sm:p-8 lg:p-10 overflow-y-auto">
        {/* HOME SECTION */}
        {activeSection === "home" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <div>
                <p className="text-cyan-400 text-base font-semibold">
                  {timetableData.day ? `${timetableData.day} • ${timetableData.currentTime}` : "Live Timetable System"}
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                  Hello, <span className="text-cyan-400">{userName}</span>
                </h1>
              </div>

              {currentUser.semester && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
                    Sem {currentUser.semester} • Div {currentUser.division || "7IT-1"}
                    {currentUser.batch ? ` • Batch ${currentUser.batch}` : ""}
                  </span>
                  {currentUser.electiveSubjectCode && (
                    <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
                      Elective: {currentUser.electiveSubjectCode}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* LIVE ACTIVE LECTURE HERO WIDGET */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl shadow-cyan-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Current Scheduled Lecture
                  </div>

                  {curLecture ? (
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {curLecture.subjectName}{" "}
                        <span className="text-cyan-400 text-xl font-mono font-bold">
                          ({curLecture.subjectCode})
                        </span>
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-300 mt-2">
                        <span className="font-semibold text-white">⏰ Time: {curLecture.startTime} – {curLecture.endTime}</span>
                        {curLecture.room && <span>📍 {curLecture.room}</span>}
                        {curLecture.facultyName && <span>👤 Faculty: {curLecture.facultyName}</span>}
                        {curLecture.lectureType && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                            {curLecture.lectureType}
                          </span>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="text-xs text-gray-400 font-bold uppercase">Session Status:</span>
                        {isSessionActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold rounded-full text-xs animate-pulse">
                            ● Session Active (Ready for scan)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500 text-amber-300 font-bold rounded-full text-xs">
                            Waiting for Faculty to start session
                          </span>
                        )}

                        <span className="text-xs text-gray-400 font-bold uppercase ml-2">My Attendance:</span>
                        {timetableData.isCurrentLectureAttended ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold rounded-full text-xs">
                            ✓ Present (Marked)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500 text-red-300 font-bold rounded-full text-xs">
                            Not Marked Yet
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
                        Currently outside lecture hours, during recess/lunch, or no lectures are scheduled at this time.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Face Scan CTA Button */}
                <div className="w-full lg:w-auto">
                  <button
                    onClick={() => setShowFaceModal(true)}
                    disabled={!isSessionActive}
                    className={`w-full lg:w-auto px-8 py-4 rounded-2xl text-base font-black shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                      isSessionActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 hover:scale-105 active:scale-95 cursor-pointer"
                        : "bg-slate-800 text-gray-400 border border-white/10 cursor-not-allowed opacity-75"
                    }`}
                  >
                    <span>
                      {isSessionActive
                        ? "📸 Scan Face to Mark Attendance"
                        : curLecture
                        ? "Waiting for Faculty to Start"
                        : "No Lecture Active"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-slate-900 border border-cyan-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Lectures Attended Today</p>
                <h3 className="text-4xl font-black text-cyan-400">
                  {timetableData.attendedLecturesCount} / {timetableData.totalLecturesToday}
                </h3>
              </div>

              <div className="bg-slate-900 border border-emerald-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Face Biometric Status</p>
                <h3 className="text-2xl font-black text-emerald-400">
                  {currentUser.faceRegistered ? "Enrolled ✓" : "Pending"}
                </h3>
              </div>

              <div className="bg-slate-900 border border-purple-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Total Verified Attendances</p>
                <h3 className="text-4xl font-black text-purple-400">
                  {attendanceHistory.length}
                </h3>
              </div>
            </div>

            {/* Semester Info Card */}
            <div className="bg-slate-900/80 border border-cyan-500/10 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-black mb-3">Academic Semester Schedule</h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Semester starts from{" "}
                <span className="text-cyan-400 font-bold">
                  {semesterData.start
                    ? new Date(semesterData.start).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not Set"}
                </span>{" "}
                and ends on{" "}
                <span className="text-cyan-400 font-bold">
                  {semesterData.end
                    ? new Date(semesterData.end).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not Set"}
                </span>
                .
              </p>
            </div>
          </div>
        )}

        {/* LECTURE-WISE TIMETABLE ATTENDANCE SECTION */}
        {activeSection === "timetable" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                  Lecture-Wise <span className="text-cyan-400">Attendance</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-1">
                  Today's class schedule ({timetableData.day || "Today"}) & your biometric attendance records
                </p>
              </div>

              {isSessionActive && (
                <button
                  onClick={() => setShowFaceModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Scan Face Now</span>
                </button>
              )}
            </div>

            {/* Today's Lectures Cards Grid */}
            <h2 className="text-xl font-black mb-4 text-gray-200">Today's Lecture Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {timetableData.lectureStatus.map((lec, index) => (
                <div
                  key={lec.lectureId || index}
                  className={`bg-slate-900 rounded-3xl p-6 border transition-all duration-300 ${
                    lec.isCurrentActive
                      ? "border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-mono font-bold text-gray-400">
                      {lec.startTime} – {lec.endTime}
                    </span>
                    {lec.isCurrentActive && (
                      <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-cyan-400/30">
                        Active Now
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{lec.subjectName}</h3>
                  <p className="text-xs text-cyan-400 font-mono mb-3">{lec.subjectCode}</p>

                  <div className="text-xs text-gray-400 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span>Faculty:</span>
                      <span className="text-gray-300 font-medium">{lec.facultyName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span className="text-gray-300 font-medium">{lec.room || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs text-gray-400 font-medium">Status</span>
                    {lec.isAttended ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        ✓ Present ({lec.checkInTime})
                      </span>
                    ) : lec.isCurrentActive ? (
                      lec.hasActiveSession ? (
                        <span className="text-xs font-bold text-amber-400">● Session Active (Not Marked)</span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Waiting for Faculty</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Log History Table */}
            <h2 className="text-xl font-black mb-4 text-gray-200">Recent Facial Verification Records</h2>
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/80 text-gray-300 text-xs uppercase tracking-wider">
                      <th className="p-4 pl-6">Date</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Faculty</th>
                      <th className="p-4">Time Window</th>
                      <th className="p-4">Check-In Time</th>
                      <th className="p-4 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {attendanceHistory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500">
                          No lecture attendance records found yet. Scan your face during an active class to record attendance!
                        </td>
                      </tr>
                    ) : (
                      attendanceHistory.slice(0, 15).map((record, index) => (
                        <tr
                          key={record._id || index}
                          className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                        >
                          <td className="p-4 pl-6 font-semibold text-gray-300">{record.date}</td>
                          <td className="p-4 font-bold text-cyan-300">
                            {record.subjectName || record.slotName}
                            {record.subjectCode && (
                              <span className="text-xs text-gray-400 block font-normal font-mono">
                                {record.subjectCode}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-gray-300">{record.facultyName || "—"}</td>
                          <td className="p-4 text-xs font-mono text-gray-400">
                            {record.lectureStartTime ? `${record.lectureStartTime} – ${record.lectureEndTime}` : "—"}
                          </td>
                          <td className="p-4 text-white font-medium">{record.checkInTime}</td>
                          <td className="p-4 pr-6">
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              ✓ {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW SECTION */}
        {activeSection === "overview" && (
          <AttendanceOverview attendanceRecords={overviewAttendanceRecords} />
        )}

        {/* SEMESTER SECTION */}
        {activeSection === "semester" && (
          <SemesterDates setSemesterData={setSemesterData} userName={userName} />
        )}
      </div>

      {/* Student Face Attendance Modal */}
      <FaceAttendanceModal
        isOpen={showFaceModal}
        onClose={() => {
          setShowFaceModal(false);
          fetchTimetableAttendance();
        }}
        onAttendanceSuccess={() => {
          fetchTimetableAttendance();
        }}
      />
    </div>
  );
}