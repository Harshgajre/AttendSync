import { useState, useEffect } from "react";
import AttendanceOverview from "./AttendanceOverview";
import HolidayList from "./HolidayList";
import SemesterDates from "./SemesterDates";
import FaceAttendanceModal from "../common/FaceAttendanceModal";
import { getApiUrl } from "../../config/api";

export default function StudentDashboard({
  onLogout,
  userName,
  role,
}) {
  // Active Section
  const [activeSection, setActiveSection] = useState("home");
  // Mobile Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Face Attendance Modal
  const [showFaceModal, setShowFaceModal] = useState(false);

  // User details from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("studentUser") || "{}");
    } catch {
      return {};
    }
  })();

  // Live Slot-Wise Attendance Data
  const [slotData, setSlotData] = useState({
    activeSlot: null,
    isCurrentSlotAttended: false,
    totalSlotsToday: 0,
    attendedSlotsCount: 0,
    slotStatusList: [],
    records: [],
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch today's slot attendance
  const fetchSlotAttendance = async () => {
    if (!currentUser._id) return;
    try {
      setLoadingSlots(true);
      const res = await fetch(getApiUrl(`/api/attendance/today/${currentUser._id}`));
      const data = await res.json();
      if (data.success) {
        setSlotData({
          activeSlot: data.activeSlot,
          isCurrentSlotAttended: data.isCurrentSlotAttended,
          totalSlotsToday: data.totalSlotsToday,
          attendedSlotsCount: data.attendedSlotsCount,
          slotStatusList: data.slotStatusList || [],
          records: data.records || [],
        });
      }

      // Also fetch complete attendance history
      const historyRes = await fetch(getApiUrl(`/api/attendance/history/${currentUser._id}`));
      const historyData = await historyRes.json();
      if (historyData.success) {
        setAttendanceHistory(historyData.records || []);
      }
    } catch (err) {
      console.error("Failed to load slot attendance:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlotAttendance();
    const interval = setInterval(fetchSlotAttendance, 10000);
    return () => clearInterval(interval);
  }, [currentUser._id]);

  // Subjects
  const [subjectName, setSubjectName] = useState("");
  const [subjects, setSubjects] = useState([]);

  // Attendance
  const currentDate = new Date();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});

  // Semester Data
  const [semesterData, setSemesterData] = useState({
    start: "",
    end: "",
  });

  // Load Semester Data
  useEffect(() => {
    const savedSemester = localStorage.getItem(`semesterDates-${userName}`);
    if (savedSemester) {
      setSemesterData(JSON.parse(savedSemester));
    }
  }, [userName]);

  // Months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Days
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Total Days
  const totalDays = new Date(year, month + 1, 0).getDate();
  // First Day
  const firstDay = new Date(year, month, 1).getDay();
  // Blank Spaces
  const blanks = Array(firstDay).fill(null);

  // Add Subject
  const handleAddSubject = () => {
    if (!subjectName.trim()) return;
    const alreadyExists = subjects.find(
      (sub) => sub.toLowerCase() === subjectName.toLowerCase()
    );
    if (alreadyExists) {
      alert("Subject already exists");
      return;
    }
    setSubjects([...subjects, subjectName]);
    setSubjectName("");
  };

  // Remove Subject
  const handleRemoveSubject = (subject) => {
    setSubjects(subjects.filter((sub) => sub !== subject));
  };

  // Present
  const handlePresent = () => {
    if (!selectedSubject || !selectedDate) {
      alert("Select Subject & Date");
      return;
    }
    setAttendanceData({
      ...attendanceData,
      [`${selectedSubject}-${year}-${month}-${selectedDate}`]: "Present",
    });
  };

  // Absent
  const handleAbsent = () => {
    if (!selectedSubject || !selectedDate) {
      alert("Select Subject & Date");
      return;
    }
    setAttendanceData({
      ...attendanceData,
      [`${selectedSubject}-${year}-${month}-${selectedDate}`]: "Absent",
    });
  };

  // Save Attendance
  const handleSaveAttendance = () => {
    if (!selectedSubject || !selectedDate) {
      alert("Select Subject & Date");
      return;
    }
    alert("Attendance Saved Successfully 🚀");
  };

  // Overview Records
  const attendanceRecords = Object.entries(attendanceData).map(([key, value]) => {
    const parts = key.split("-");
    return {
      subject: parts[0],
      date: `${parts[3]}/${Number(parts[2]) + 1}/${parts[1]}`,
      status: value,
    };
  });

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
              { id: "home", label: "Home" },
              { id: "slots", label: "Slot-Wise Attendance" },
              { id: "subjects", label: "Add / Remove Subject" },
              { id: "fill", label: "Fill Subject Attendance" },
              { id: "overview", label: "Overview of Attendance" },
              { id: "holidays", label: "Holiday List" },
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
            <p className="text-cyan-400 text-base sm:text-lg mb-2">Welcome Back 👋</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight">
              Hello, <span className="text-cyan-400">{userName}</span>
            </h1>

            {/* LIVE ACTIVE SLOT HERO WIDGET */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl shadow-cyan-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Slot Engine
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Current Slot:{" "}
                    <span className="text-cyan-400">
                      {slotData.activeSlot
                        ? slotData.activeSlot.slotName
                        : "No Active Slot Configured"}
                    </span>
                  </h2>

                  {slotData.activeSlot && (
                    <p className="text-gray-400 text-sm mt-1">
                      Time Window: {slotData.activeSlot.startTime} – {slotData.activeSlot.endTime}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm text-gray-300">Attendance Status:</span>
                    {slotData.isCurrentSlotAttended ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold rounded-full text-xs">
                        ✓ Present (Marked)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500 text-amber-300 font-bold rounded-full text-xs">
                        ● Not Marked
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Face Scan CTA Button */}
                <div className="w-full lg:w-auto">
                  <button
                    onClick={() => setShowFaceModal(true)}
                    className="w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-8 py-4 rounded-2xl text-base font-black shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">📸</span>
                    <span>Scan Face to Mark Attendance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-slate-900 border border-cyan-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Slots Attended Today</p>
                <h3 className="text-4xl font-black text-cyan-400">
                  {slotData.attendedSlotsCount} / {slotData.totalSlotsToday}
                </h3>
              </div>

              <div className="bg-slate-900 border border-emerald-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Biometric Status</p>
                <h3 className="text-2xl font-black text-emerald-400">
                  {currentUser.faceRegistered ? "Enrolled ✓" : "Pending"}
                </h3>
              </div>

              <div className="bg-slate-900 border border-purple-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Total Lifetime Checks</p>
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

        {/* SLOT-WISE ATTENDANCE SECTION */}
        {activeSection === "slots" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                  Slot-Wise <span className="text-cyan-400">Attendance</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-1">
                  Today's schedule & your verified attendance history
                </p>
              </div>

              <button
                onClick={() => setShowFaceModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>📸</span>
                <span>Scan Face Now</span>
              </button>
            </div>

            {/* Today's Slots Cards Grid */}
            <h2 className="text-xl font-black mb-4 text-gray-200">Today's Attendance Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {slotData.slotStatusList.map((slot, index) => (
                <div
                  key={slot.slotId || index}
                  className={`bg-slate-900 rounded-3xl p-6 border transition-all duration-300 ${
                    slot.isCurrentActive
                      ? "border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold text-gray-400">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    {slot.isCurrentActive && (
                      <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-cyan-400/30">
                        Active Now
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">{slot.slotName}</h3>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs text-gray-400">Status</span>
                    {slot.isAttended ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        ✓ Present ({slot.checkInTime})
                      </span>
                    ) : slot.isCurrentActive ? (
                      <span className="text-xs font-bold text-amber-400">● Not Marked Yet</span>
                    ) : (
                      <span className="text-xs text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Log History Table */}
            <h2 className="text-xl font-black mb-4 text-gray-200">Recent Face Attendance Records</h2>
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-white/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/80 text-gray-300 text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Slot</th>
                    <th className="p-4">Check-In Time</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {attendanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No face attendance records found yet. Scan your face to create your first record!
                      </td>
                    </tr>
                  ) : (
                    attendanceHistory.slice(0, 10).map((record, index) => (
                      <tr
                        key={record._id || index}
                        className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                      >
                        <td className="p-4 pl-6 font-semibold">{record.date}</td>
                        <td className="p-4 font-bold text-cyan-300">{record.slotName}</td>
                        <td className="p-4 text-gray-300">{record.checkInTime}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 rounded-full text-xs font-bold">
                            {record.verificationMethod || "FACE"}
                          </span>
                        </td>
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
        )}

        {/* SUBJECTS SECTION */}
        {activeSection === "subjects" && (
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-10">Subject Manager</h1>
            <div className="flex flex-col sm:flex-row gap-5 mb-10">
              <input
                type="text"
                placeholder="Enter Subject"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="flex-1 bg-slate-900 border border-white/10 p-5 rounded-2xl outline-none"
              />
              <button
                onClick={handleAddSubject}
                className="bg-cyan-500 hover:bg-cyan-600 px-10 py-5 rounded-2xl font-bold transition-all duration-300"
              >
                Save
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="bg-slate-900 p-6 rounded-3xl flex flex-col sm:flex-row gap-5 sm:gap-0 items-start sm:items-center justify-between"
                >
                  <h2 className="text-xl sm:text-2xl font-bold">{subject}</h2>
                  <button
                    onClick={() => handleRemoveSubject(subject)}
                    className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl transition-all duration-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILL ATTENDANCE SECTION */}
        {activeSection === "fill" && (
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-10">
              Fill <span className="text-cyan-400">Attendance</span>
            </h1>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-cyan-500/10">
              <div className="mb-8">
                <label className="block text-lg font-bold mb-3">Choose Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-800 px-5 py-4 rounded-2xl outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
                >
                  {months.map((m, index) => (
                    <option key={index} value={index}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <h2 className="text-3xl font-black text-cyan-400 mb-6">
                {months[month]} {year}
              </h2>

              <div className="grid grid-cols-7 gap-2 mb-3">
                {days.map((day) => (
                  <div key={day} className="text-center text-sm font-bold text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {blanks.map((_, index) => (
                  <div key={index} className="h-10 sm:h-12"></div>
                ))}

                {[...Array(totalDays)].map((_, index) => {
                  const day = index + 1;
                  const key = `${selectedSubject}-${year}-${month}-${day}`;
                  const status = attendanceData[key];

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`h-10 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 border ${
                        selectedDate === day ? "border-white scale-105" : "border-white/10"
                      } ${
                        status === "Present"
                          ? "bg-green-500 text-white"
                          : status === "Absent"
                          ? "bg-red-500 text-white"
                          : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-5 mt-10">
                <button
                  onClick={handlePresent}
                  className="flex-1 bg-green-500 hover:bg-green-600 py-4 rounded-2xl text-lg font-bold transition-all"
                >
                  Present
                </button>
                <button
                  onClick={handleAbsent}
                  className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-2xl text-lg font-bold transition-all"
                >
                  Absent
                </button>
              </div>

              <button
                onClick={handleSaveAttendance}
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 py-5 rounded-2xl text-lg font-bold transition-all duration-300"
              >
                Save Attendance
              </button>
            </div>
          </div>
        )}

        {/* OVERVIEW SECTION */}
        {activeSection === "overview" && (
          <AttendanceOverview attendanceRecords={attendanceRecords} />
        )}

        {/* HOLIDAYS SECTION */}
        {activeSection === "holidays" && <HolidayList />}

        {/* SEMESTER SECTION */}
        {activeSection === "semester" && (
          <SemesterDates setSemesterData={setSemesterData} userName={userName} />
        )}
      </div>

      {/* Face Attendance Modal */}
      <FaceAttendanceModal
        isOpen={showFaceModal}
        onClose={() => {
          setShowFaceModal(false);
          fetchSlotAttendance();
        }}
        onAttendanceSuccess={() => {
          fetchSlotAttendance();
        }}
      />
    </div>
  );
}