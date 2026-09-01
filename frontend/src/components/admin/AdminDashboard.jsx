import { useState, useEffect } from "react";
import AttendanceReports from "./AttendanceReports";
import HolidayControl from "./HolidayControl";
import SemesterControl from "./SemesterControl";
import SystemSettings from "./SystemSettings";
import LeaveApprovalControl from "./LeaveApprovalControl";
import ManageStudents from "./ManageStudents";
import ManageEmployees from "./ManageEmployees";
import ManageSlots from "./ManageSlots";
import ManageTimetable from "./ManageTimetable";
import { getApiUrl } from "../../config/api";

export default function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalFaceRegistered, setTotalFaceRegistered] = useState(0);
  const [todayAttendanceCount, setTodayAttendanceCount] = useState(0);
  const [currentSlotInfo, setCurrentSlotInfo] = useState(null);
  const [currentSlotAttendance, setCurrentSlotAttendance] = useState(0);

  useEffect(() => {
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
          setTotalEmployees(data.totalEmployees || 0);
          setTotalUsers(data.totalUsers || 0);
        }

        // Attendance stats
        const statsRes = await fetch(getApiUrl("/api/attendance/stats"));
        const statsData = await statsRes.json();
        if (statsData.success) {
          setTotalFaceRegistered(statsData.totalFaceRegistered || 0);
          setTodayAttendanceCount(statsData.todayAttendanceCount || 0);
          setCurrentSlotInfo(statsData.currentSlot);
          setCurrentSlotAttendance(statsData.currentSlotAttendanceCount || 0);
        }
      } catch (error) {
        console.error("Dashboard Data Error:", error);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 6000);
    return () => clearInterval(interval);
  }, [onLogout]);

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
              { id: "employees", label: "Manage Employees" },
              { id: "reports", label: "Attendance Reports" },
              { id: "holiday", label: "Holiday Control" },
              { id: "semester", label: "Semester Control" },
              { id: "leave-approval", label: "Leave Approval" },
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
              A
            </div>

            <div>
              <h2 className="text-base font-bold">Admin Panel</h2>
              <p className="text-xs text-gray-400">Super Administrator</p>
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
          {activeSection === "employees" && <ManageEmployees />}
          {activeSection === "reports" && <AttendanceReports />}
          {activeSection === "holiday" && <HolidayControl />}
          {activeSection === "semester" && <SemesterControl />}
          {activeSection === "leave-approval" && <LeaveApprovalControl />}
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

              <div className="bg-slate-900/80 border border-green-500/10 rounded-3xl p-6">
                <p className="text-gray-400 mb-2 text-sm font-semibold">Total Employees</p>
                <h2 className="text-5xl font-black text-green-400">{totalEmployees}</h2>
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
