import { useState, useEffect } from "react";
import EmployeeHome from "./EmployeeHome";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeePFCL from "./EmployeePFCL";
import LeaveApproval from "./LeaveApproval";
import EmployeeProfile from "./EmployeeProfile";
import EmployeeReports from "./EmployeeReports";
import EmployeeHolidayList from "./EmployeeHolidayList";

export default function EmployeeDashboard({

  onLogout,
  userName,
  role,
}) {

  const [activeSection, setActiveSection] =
    useState("home");

  // Mobile Sidebar
const [sidebarOpen, setSidebarOpen] =
  useState(false);

  // Attendance
  const currentDate = new Date();

  const [month, setMonth] = useState(
    currentDate.getMonth()
  );

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [attendanceData, setAttendanceData] =
    useState({});

  // PF / CL
  const [totalPF, setTotalPF] =
    useState(0);

  const [usedPF, setUsedPF] =
    useState(0);

  const [totalCL, setTotalCL] =
    useState(0);

  const [usedCL, setUsedCL] =
    useState(0);

  // Holidays
  const [holidays, setHolidays] =
    useState([]);

  // Load PF / CL Data
  useEffect(() => {

    const savedData =
      localStorage.getItem(
        "employeePFCL"
      );

    if (savedData) {

      const parsed =
        JSON.parse(savedData);

      setTotalPF(
        Number(parsed.totalPF) || 0
      );

      setUsedPF(
        Number(parsed.usedPF) || 0
      );

      setTotalCL(
        Number(parsed.totalCL) || 0
      );

      setUsedCL(
        Number(parsed.usedCL) || 0
      );

    }

  }, []);

  // Month Names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Day Names
  const days = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  // Total Days
  const totalDays = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // First Day
  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  // Empty Boxes
  const blanks = Array(firstDay).fill(null);

  // Present
  const handlePresent = () => {

    if (!selectedDate) return;

    setAttendanceData({
      ...attendanceData,
      [`${year}-${month}-${selectedDate}`]:
        "Present",
    });
  };

  // Absent
  const handleAbsent = () => {

    if (!selectedDate) return;

    setAttendanceData({
      ...attendanceData,
      [`${year}-${month}-${selectedDate}`]:
        "Absent",
    });
  };

  // Counts
  const presentCount =
    Object.values(attendanceData).filter(
      (v) => v === "Present"
    ).length;

  const absentCount =
    Object.values(attendanceData).filter(
      (v) => v === "Absent"
    ).length;

  const total =
    presentCount + absentCount;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (presentCount / total) * 100
        );

  return (

    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white">
      {/* Mobile Topbar */}
<div className="lg:hidden flex items-center justify-between p-5 bg-slate-900 border-b border-green-500/10">

  <h1 className="text-2xl font-black">

    Attend
    <span className="text-green-400">
      Sync
    </span>

  </h1>

  <button
    onClick={() =>
      setSidebarOpen(
        !sidebarOpen
      )
    }
    className="bg-green-500 px-4 py-2 rounded-xl text-xl font-black"
  >

    ☰

  </button>

</div>
      {/* Sidebar */}
<div
  className={`fixed lg:relative z-50 top-0 left-0 h-full lg:h-auto w-72 bg-slate-900/95 border-r border-green-500/10 p-4 sm:p-6 transition-all duration-300 ${
    sidebarOpen
      ? "translate-x-0"
      : "-translate-x-full lg:translate-x-0"
  }`}
>
        {/* Logo */}
        <h1 className="text-3xl sm:text-4xl font-black mb-8 lg:mb-12">

          Attend
          <span className="text-green-400">
            Sync
          </span>

        </h1>

        {/* Buttons */}
        <div className="grid gap-4">

          <button
            onClick={() => {

  setActiveSection("home");

  setSidebarOpen(false);

}}
            className={`py-4 rounded-2xl font-bold transition-all ${
              activeSection === "home"
                ? "bg-green-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Home
          </button>

          <button
           onClick={() => {

  setActiveSection("attendance");

  setSidebarOpen(false);

}}
            className={`py-4 rounded-2xl font-bold transition-all ${
              activeSection === "attendance"
                ? "bg-green-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Fill Attendance
          </button>

          <button
            onClick={() => {

  setActiveSection("pfcl");

  setSidebarOpen(false);

}}
            className={`py-4 rounded-2xl font-bold transition-all ${
              activeSection === "pfcl"
                ? "bg-green-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            PF / CL Limits
          </button>

          <button
            onClick={() => {

  setActiveSection("holiday");

  setSidebarOpen(false);

}}
            className={`py-4 rounded-2xl font-bold transition-all ${
              activeSection === "holiday"
                ? "bg-green-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Holiday List
          </button>

          <button
            onClick={() => {
              setActiveSection("leave");
              setSidebarOpen(false);
            }}
            className={`py-4 rounded-2xl font-bold transition-all ${
              activeSection === "leave"
                ? "bg-green-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Leave Approval
          </button>

          <button
            onClick={() => {

  setActiveSection("reports");

  setSidebarOpen(false);

}}
            className={`py-4 rounded-2xl font-bold transition-all ${
              activeSection === "reports"
                ? "bg-green-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Reports / Graphs
          </button>

          <button
            onClick={() => {

  setActiveSection("profile");

  setSidebarOpen(false);

}}
            className={`py-4 rounded-2xl font-bold transition-all ${
              activeSection === "profile"
                ? "bg-green-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Profile
          </button>

        </div>

        {/* Bottom */}
        <div className="mt-10">

          <div className="bg-slate-800 p-5 rounded-3xl border border-green-500/10">

            <h2 className="text-2xl font-black">
              {userName}
            </h2>

            <p className="text-green-400 mb-5">
              {role}
            </p>

            <button
              onClick={onLogout}
              className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-2xl font-bold transition-all"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      {/* Main */}
      <div className="flex-1 overflow-x-hidden p-5 sm:p-8 lg:p-10 overflow-y-auto">

        {/* HOME */}
        {activeSection === "home" && (

          <div>

            <h1 className="text-5xl font-black mb-6">

              Hello
              <span className="text-green-400">
                {" "} {userName}
              </span>

            </h1>

            <p className="text-gray-400 text-lg mb-10">
              Welcome to AttendSync Employee Dashboard 
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">

              <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10">

                <h2 className="text-2xl font-black mb-3">
                  Present
                </h2>

                <p className="text-5xl text-green-400 font-black">
                  {presentCount}
                </p>

              </div>

              <div className="bg-slate-900 p-8 rounded-3xl border border-red-500/10">

                <h2 className="text-2xl font-black mb-3">
                  Absent
                </h2>

                <p className="text-5xl text-red-400 font-black">
                  {absentCount}
                </p>

              </div>

              <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10">

                <h2 className="text-2xl font-black mb-3">
                  Attendance %
                </h2>

                <p className="text-5xl text-green-400 font-black">
                  {percentage}%
                </p>

              </div>

              <div className="bg-slate-900 p-8 rounded-3xl border border-cyan-500/10">

                <h2 className="text-2xl font-black mb-3">
                  PF Left
                </h2>

                <p className="text-5xl text-cyan-400 font-black">
                  {totalPF - usedPF}
                </p>

              </div>

              <div className="bg-slate-900 p-8 rounded-3xl border border-yellow-500/10">

                <h2 className="text-2xl font-black mb-3">
                  CL Left
                </h2>

                <p className="text-5xl text-yellow-400 font-black">
                  {totalCL - usedCL}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* ATTENDANCE */}
        {activeSection === "attendance" && (

          <EmployeeAttendance
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            attendanceData={attendanceData}
            setAttendanceData={setAttendanceData}
            handlePresent={handlePresent}
            handleAbsent={handleAbsent}
            totalDays={totalDays}
            blanks={blanks}
            months={months}
            days={days}
            holidays={holidays}
          />

        )}

        {/* PF CL */}
        {activeSection === "pfcl" && (

          <EmployeePFCL
            userName={userName}
          />
        )}

        {/* HOLIDAY */}
        {activeSection === "holiday" && (

          <EmployeeHolidayList
            holidays={holidays}
            setHolidays={setHolidays}
          />

        )}

        {/* LEAVE */}
        {activeSection === "leave" && (

          <LeaveApproval />

        )}

        {/* REPORTS */}
        {activeSection === "reports" && (

          <EmployeeReports
            user={{
              name: userName,
              employeeId: "EMP1024",
              department: "IT Department",
              role: role,
              joiningDate: "10 June 2026",
              attendancePercentage:
                percentage,
              presentDays:
                presentCount,
              absentDays:
                absentCount,
              totalCL:
                Number(totalCL),
              usedCL:
                Number(usedCL),
              totalPF:
                Number(totalPF),
              usedPF:
                Number(usedPF),
            }}
          />

        )}

        {/* PROFILE */}
        {activeSection === "profile" && (

          <EmployeeProfile
            userName={userName}
            role={role}
            percentage={percentage}
          />

        )}

      </div>

    </div>
  );
}