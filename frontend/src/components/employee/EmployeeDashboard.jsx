import { useState, useEffect } from "react";
import EmployeeHome from "./EmployeeHome";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeePFCL from "./EmployeePFCL";
import LeaveApproval from "./LeaveApproval";
import EmployeeProfile from "./EmployeeProfile";
import EmployeeReports from "./EmployeeReports";
import EmployeeHolidayList from "./EmployeeHolidayList";
import FaceAttendanceModal from "../common/FaceAttendanceModal";
import { getApiUrl } from "../../config/api";

export default function EmployeeDashboard({
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
      return JSON.parse(localStorage.getItem("employeeUser") || "{}");
    } catch {
      return {};
    }
  })();

  // Live Slot Attendance State
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

      // History
      const historyRes = await fetch(getApiUrl(`/api/attendance/history/${currentUser._id}`));
      const historyData = await historyRes.json();
      if (historyData.success) {
        setAttendanceHistory(historyData.records || []);
      }
    } catch (err) {
      console.error("Failed to load employee slot attendance:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlotAttendance();
    const interval = setInterval(fetchSlotAttendance, 10000);
    return () => clearInterval(interval);
  }, [currentUser._id]);

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
              { id: "home", label: "Home" },
              { id: "slots", label: "Slot-Wise Attendance" },
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
                {userName ? userName[0] : "E"}
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="text-lg font-black truncate">{userName}</h2>
              <p className="text-xs text-green-400">
                {currentUser.faceRegistered ? "Face Enrolled ✓" : "Employee"}
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
            <p className="text-green-400 text-base sm:text-lg mb-2">Welcome Back</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight">
              Hello, <span className="text-green-400">{userName}</span>
            </h1>

            {/* LIVE ACTIVE SLOT HERO WIDGET */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-green-500/30 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl shadow-green-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-400/20 text-green-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Slot Engine
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Current Active Slot:{" "}
                    <span className="text-green-400">
                      {slotData.activeSlot
                        ? slotData.activeSlot.slotName
                        : "No Active Slot Configured"}
                    </span>
                  </h2>

                  {slotData.activeSlot && (
                    <p className="text-gray-400 text-sm mt-1">
                      Session Time: {slotData.activeSlot.startTime} – {slotData.activeSlot.endTime}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm text-gray-300">Attendance Status:</span>
                    {slotData.isCurrentSlotAttended ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold rounded-full text-xs">
                        Present (Marked)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500 text-amber-300 font-bold rounded-full text-xs">
                        Not Marked
                      </span>
                    )}
                  </div>
                </div>

                {/* Face Scan Button */}
                <div className="w-full lg:w-auto">
                  <button
                    onClick={() => setShowFaceModal(true)}
                    className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-8 py-4 rounded-2xl text-base font-black shadow-xl shadow-green-500/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <span>Scan Face to Mark Attendance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Slots Attended Today</p>
                <h3 className="text-4xl font-black text-green-400">
                  {slotData.attendedSlotsCount} / {slotData.totalSlotsToday}
                </h3>
              </div>

              <div className="bg-slate-900 border border-emerald-500/10 rounded-3xl p-6">
                <p className="text-gray-400 text-sm font-medium mb-1">Biometric Status</p>
                <h3 className="text-2xl font-black text-emerald-400">
                  {currentUser.faceRegistered ? "Enrolled" : "Pending"}
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

        {/* SLOT-WISE ATTENDANCE SECTION */}
        {activeSection === "slots" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                  Slot-Wise <span className="text-green-400">Attendance</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-1">
                  Today's schedule & your verified facial attendance records
                </p>
              </div>

              <button
                onClick={() => setShowFaceModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-green-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Scan Face Now</span>
              </button>
            </div>

            {/* Today's Slots Cards Grid */}
            <h2 className="text-xl font-black mb-4 text-gray-200">Today's Shift Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {slotData.slotStatusList.map((slot, index) => (
                <div
                  key={slot.slotId || index}
                  className={`bg-slate-900 rounded-3xl p-6 border transition-all duration-300 ${
                    slot.isCurrentActive
                      ? "border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-bold text-gray-400">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    {slot.isCurrentActive && (
                      <span className="bg-green-500/20 text-green-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-green-400/30">
                        Active Slot
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
            <h2 className="text-xl font-black mb-4 text-gray-200">Recent Facial Verification Records</h2>
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
                        <td className="p-4 font-bold text-green-400">{record.slotName}</td>
                        <td className="p-4 text-gray-300">{record.checkInTime}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-green-500/10 border border-green-400/20 text-green-300 rounded-full text-xs font-bold">
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

        {/* OTHER SECTIONS */}
        {activeSection === "attendance" && <EmployeeAttendance />}
        {activeSection === "pfcl" && <EmployeePFCL />}
        {activeSection === "holiday" && <EmployeeHolidayList />}
        {activeSection === "leave" && <LeaveApproval />}
        {activeSection === "reports" && <EmployeeReports />}
        {activeSection === "profile" && <EmployeeProfile />}
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