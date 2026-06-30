
import { useState, useEffect } from "react";
import AttendanceReports from "./AttendanceReports";
import HolidayControl from "./HolidayControl";
import SemesterControl from "./SemesterControl";
import SystemSettings from "./SystemSettings";
import LeaveApprovalControl from "./LeaveApprovalControl";
import ManageStudents from "./ManageStudents";
import ManageEmployees from "./ManageEmployees";


export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

useEffect(() => {
  const loadDashboardData = async () => {
    try {
      const studentResponse = await fetch(
        "http://localhost:5000/api/admin/students"
      );

      const studentData = await studentResponse.json();

      const students =
        studentData.success && Array.isArray(studentData.students)
          ? studentData.students
          : [];

      const employeeResponse = await fetch(
        "http://localhost:5000/api/employees/all"
      );

      const employeeData =
        await employeeResponse.json();

      const employees =
        employeeData.success &&
        Array.isArray(employeeData.employees)
          ? employeeData.employees
          : [];
          console.log("Student Data:", studentData);
console.log("Employee Data:", employeeData);
console.log("Students Count:", students.length);
console.log("Employees Count:", employees.length);

      setTotalStudents(students.length);
      setTotalEmployees(employees.length);
      setTotalUsers(students.length + employees.length);
    } catch (error) {
      console.error(
        "Dashboard Data Error:",
        error
      );
    }
  };

  loadDashboardData();

  const interval = setInterval(
    loadDashboardData,
    3000
  );

  return () =>
    clearInterval(interval);
}, []);

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
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <h1 className="text-4xl font-black mb-12">
            Attend <span className="text-cyan-400">Sync</span>
          </h1>

          <div className="space-y-4">
            {[
              { id: "dashboard", label: "Dashboard" },
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
                className={`w-full py-4 px-6 rounded-2xl font-bold text-left transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                    : "bg-slate-800/50 hover:bg-slate-700 text-gray-300"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 bg-slate-800/80 border border-white/10 p-5 rounded-3xl">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xl font-bold text-slate-950">
              A
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Admin Panel
              </h2>

              <p className="text-sm text-gray-400">
                Super Administrator
              </p>
            </div>
          </div>

          <button className="w-full bg-red-500 hover:bg-red-600 py-3 rounded-2xl font-semibold">
            Logout →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden p-5 sm:p-8 lg:p-10 pt-28 lg:pt-10 overflow-y-auto">

        <div className="mb-10">
          {activeSection === "students" && <ManageStudents />}
          {activeSection === "employees" && <ManageEmployees />}
          {activeSection === "reports" && <AttendanceReports />}
          {activeSection === "holiday" && <HolidayControl />}
          {activeSection === "semester" && <SemesterControl />}
          {activeSection === "leave-approval" && <LeaveApprovalControl />}
          {activeSection === "settings" && <SystemSettings />}
        </div>

        {activeSection === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <div className="bg-slate-900/80 border border-cyan-500/10 rounded-3xl p-6">
              <p className="text-gray-400 mb-3">
                Total Students
              </p>

              <h2 className="text-5xl font-black text-cyan-400">
                {totalStudents}
              </h2>
            </div>

            <div className="bg-slate-900/80 border border-green-500/10 rounded-3xl p-6">
              <p className="text-gray-400 mb-3">
                Total Employees
              </p>

              <h2 className="text-5xl font-black text-green-400">
                {totalEmployees}
              </h2>
            </div>

            <div className="bg-slate-900/80 border border-yellow-500/10 rounded-3xl p-6">
              <p className="text-gray-400 mb-3">
                Total Users
              </p>

              <h2 className="text-5xl font-black text-yellow-400">
                {totalUsers}
              </h2>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/10 rounded-3xl p-6">
              <p className="text-gray-400 mb-3">
                System Status
              </p>

              <h2 className="text-3xl font-black text-green-400">
                Active
              </h2>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
