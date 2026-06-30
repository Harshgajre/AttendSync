import { useState, useEffect } from "react";
import AttendanceOverview from "./AttendanceOverview";
import HolidayList from "./HolidayList";
import SemesterDates from "./SemesterDates";

export default function StudentDashboard({
  onLogout,
  userName,
  role,
}) {

  // Active Section
  const [activeSection, setActiveSection] =
    useState("home");
  // Mobile Sidebar
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  // Subjects
  const [subjectName, setSubjectName] =
    useState("");

  const [subjects, setSubjects] =
    useState([]);

  // Attendance
  const currentDate = new Date();

  const [selectedSubject, setSelectedSubject] =
    useState("");

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
  
    // Semester Data
const [semesterData, setSemesterData] =
  useState({
    start: "",
    end: "",
  });

// Load Semester Data
useEffect(() => {

  const savedSemester =
    localStorage.getItem(
      `semesterDates-${userName}`
    );

  if (savedSemester) {

    setSemesterData(
      JSON.parse(savedSemester)
    );

  }

}, []);

  // Months
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

  // Days
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

  // Blank Spaces
  const blanks = Array(firstDay).fill(null);

  // Add Subject
  const handleAddSubject = () => {

    if (!subjectName.trim()) return;

    const alreadyExists = subjects.find(
      (sub) =>
        sub.toLowerCase() ===
        subjectName.toLowerCase()
    );

    if (alreadyExists) {
      alert("Subject already exists");
      return;
    }

    setSubjects([
      ...subjects,
      subjectName,
    ]);

    setSubjectName("");
  };

  // Remove Subject
  const handleRemoveSubject = (
    subject
  ) => {

    setSubjects(
      subjects.filter(
        (sub) => sub !== subject
      )
    );
  };

  // Present
  const handlePresent = () => {

    if (
      !selectedSubject ||
      !selectedDate
    ) {
      alert(
        "Select Subject & Date"
      );
      return;
    }

    setAttendanceData({
      ...attendanceData,
      [`${selectedSubject}-${year}-${month}-${selectedDate}`]:
        "Present",
    });
  };

  // Absent
  const handleAbsent = () => {

    if (
      !selectedSubject ||
      !selectedDate
    ) {
      alert(
        "Select Subject & Date"
      );
      return;
    }

    setAttendanceData({
      ...attendanceData,
      [`${selectedSubject}-${year}-${month}-${selectedDate}`]:
        "Absent",
    });
  };

  // Save Attendance
  const handleSaveAttendance = () => {

    if (
      !selectedSubject ||
      !selectedDate
    ) {
      alert(
        "Select Subject & Date"
      );
      return;
    }

    alert(
      "Attendance Saved Successfully 🚀"
    );
  };

  // Overview Records
  const attendanceRecords =
    Object.entries(
      attendanceData
    ).map(([key, value]) => {

      const parts = key.split("-");

      return {
        subject: parts[0],
        date: `${parts[3]}/${
          Number(parts[2]) + 1
        }/${parts[1]}`,
        status: value,
      };
    });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Mobile Topbar */}
<div className="lg:hidden flex items-center justify-between p-5 bg-slate-900 border-b border-cyan-500/10">

  <h1 className="text-2xl font-black">

    Attend
    <span className="text-cyan-400">
      Sync
    </span>

  </h1>

  <button
    onClick={() =>
      setSidebarOpen(
        !sidebarOpen
      )
    }
    className="bg-cyan-500 px-4 py-2 rounded-xl text-xl font-black"
  >

    ☰

  </button>

</div>
      {/* Sidebar */}
<div
  className={`fixed lg:relative z-50 top-0 left-0 h-full lg:h-auto w-72 bg-slate-900/95 border-r border-cyan-500/10 p-4 sm:p-6 transition-all duration-300 ${
    sidebarOpen
      ? "translate-x-0"
      : "-translate-x-full lg:translate-x-0"
  }`}
>
        {/* Logo */}
        <h1 className="text-3xl sm:text-4xl font-black mb-8 lg:mb-12 text-center lg:text-left">

          Attend
          <span className="text-cyan-400">
            Sync
          </span>

        </h1>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">

          {/* Home */}
          <button
            onClick={() => {

  setActiveSection("home");

  setSidebarOpen(false);

}}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeSection === "home"
                ? "bg-cyan-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Home
          </button>

          {/* Subjects */}
          <button
            onClick={() => {

  setActiveSection(
    "subjects"
  );

  setSidebarOpen(false);

}}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeSection ===
              "subjects"
                ? "bg-cyan-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Add / Remove Subject
          </button>

          {/* Attendance */}
          <button
            onClick={() => {

  setActiveSection("fill");

  setSidebarOpen(false);

}}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeSection === "fill"
                ? "bg-cyan-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Fill Attendance
          </button>

          {/* Overview */}
          <button
            onClick={() => {

  setActiveSection(
    "overview"
  );

  setSidebarOpen(false);

}}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeSection ===
              "overview"
                ? "bg-cyan-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Overview of Attendance
          </button>

          {/* Holiday */}
          <button
            onClick={() => {

  setActiveSection(
    "holidays"
  );

  setSidebarOpen(false);

}}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeSection ===
              "holidays"
                ? "bg-cyan-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Holiday List
          </button>

          {/* Semester */}
          <button
            onClick={() => {

  setActiveSection(
    "semester"
  );

  setSidebarOpen(false);

}}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeSection ===
              "semester"
                ? "bg-cyan-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Semester Dates
          </button>

        </div>

        {/* Bottom */}
        <div className="relative lg:absolute mt-10 lg:mt-0 bottom-6 left-6 right-6">

          <div className="bg-slate-800/80 border border-cyan-500/10 rounded-3xl p-5">

            <h2 className="text-xl sm:text-2xl font-black">
              {userName}
            </h2>

            <p className="text-cyan-400 mb-5 capitalize">
              {role}
            </p>

            <button
              onClick={onLogout}
              className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300"
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

            <p className="text-cyan-400 text-base sm:text-lg mb-4">
              Welcome Back 👋
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">

              Hello,
              <span className="text-cyan-400">
                {" "}
                {userName}
              </span>

            </h1>

            <div className="max-w-4xl">

  <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed">

Semester starts from

<span className="text-cyan-400 font-bold">
  {" "}
{semesterData.start
  ? new Date(
      semesterData.start
    ).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
  : "Not Set"}</span>

{" "}and ends on

<span className="text-cyan-400 font-bold">
  {" "}
{semesterData.end
  ? new Date(
      semesterData.end
    ).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
  : "Not Set"}</span>

.

  </p>

  <div className="mt-8 bg-slate-900/80 border border-cyan-500/10 rounded-3xl p-6 sm:p-8">

    <h2 className="text-2xl sm:text-3xl font-black mb-4">

            Your attendance between these semester dates is our responsibility.

    </h2>

  </div>

</div>
          </div>
        )}

        {/* SUBJECTS */}
        {activeSection ===
          "subjects" && (

          <div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-10">
              Subject Manager
            </h1>

            <div className="flex flex-col sm:flex-row gap-5 mb-10">

              <input
                type="text"
                placeholder="Enter Subject"
                value={subjectName}
                onChange={(e) =>
                  setSubjectName(
                    e.target.value
                  )
                }
                className="flex-1 bg-slate-900 border border-white/10 p-5 rounded-2xl outline-none"
              />

              <button
                onClick={
                  handleAddSubject
                }
                className="bg-cyan-500 hover:bg-cyan-600 px-10 py-5 rounded-2xl font-bold transition-all duration-300"
              >
                Save
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {subjects.map(
                (
                  subject,
                  index
                ) => (

                  <div
                    key={index}
                    className="bg-slate-900 p-6 rounded-3xl flex flex-col sm:flex-row gap-5 sm:gap-0 items-start sm:items-center justify-between"
                  >

                    <h2 className="text-xl sm:text-2xl font-bold">
                      {subject}
                    </h2>

                    <button
                      onClick={() =>
                        handleRemoveSubject(
                          subject
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl transition-all duration-300"
                    >
                      Remove
                    </button>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* FILL ATTENDANCE */}
        {activeSection === "fill" && (

          <div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-10">

              Fill
              <span className="text-cyan-400">
                {" "}Attendance
              </span>

            </h1>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-cyan-500/10">

              {/* Subject */}
              <div className="mb-8">

                <label className="block text-lg font-bold mb-3">

                  Choose Subject

                </label>

                <select
                  value={
                    selectedSubject
                  }
                  onChange={(e) =>
                    setSelectedSubject(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-800 px-5 py-4 rounded-2xl outline-none"
                >

                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map(
                    (
                      subject,
                      index
                    ) => (

                      <option
                        key={index}
                        value={
                          subject
                        }
                      >

                        {subject}

                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Month + Year */}
              <div className="flex flex-wrap gap-4 mb-8">

                {/* Month */}
                <select
                  value={month}
                  onChange={(e) =>
                    setMonth(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
                >

                  {months.map(
                    (
                      m,
                      index
                    ) => (

                      <option
                        key={index}
                        value={index}
                      >

                        {m}

                      </option>
                    )
                  )}

                </select>

                {/* Year */}
                <select
                  value={year}
                  onChange={(e) =>
                    setYear(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
                >

                  {[
                    2024,
                    2025,
                    2026,
                    2027,
                    2028,
                  ].map((y) => (

                    <option
                      key={y}
                      value={y}
                    >

                      {y}

                    </option>
                  ))}

                </select>

              </div>

              {/* Current */}
              <h2 className="text-3xl font-black text-cyan-400 mb-6">

                {months[month]}{" "}
                {year}

              </h2>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2 mb-3">

                {days.map((day) => (

                  <div
                    key={day}
                    className="text-center text-sm font-bold text-gray-400"
                  >

                    {day}

                  </div>
                ))}

              </div>

              {/* Calendar */}
              <div className="grid grid-cols-7 gap-2">

                {/* Empty */}
                {blanks.map(
                  (_, index) => (

                    <div
                      key={index}
                      className="h-10 sm:h-12"
                    ></div>
                  )
                )}

                {/* Dates */}
                {[
                  ...Array(
                    totalDays
                  ),
                ].map(
                  (_, index) => {

                    const day =
                      index + 1;

                    const key =
                      `${selectedSubject}-${year}-${month}-${day}`;

                    const status =
                      attendanceData[
                        key
                      ];

                    return (

                      <div
                        key={day}
                        onClick={() =>
                          setSelectedDate(
                            day
                          )
                        }
                        className={`h-10 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 border ${
                          selectedDate ===
                          day
                            ? "border-white scale-105"
                            : "border-white/10"
                        } ${
                          status ===
                          "Present"
                            ? "bg-green-500 text-white"
                            : status ===
                              "Absent"
                            ? "bg-red-500 text-white"
                            : "bg-slate-800 hover:bg-slate-700"
                        }`}
                      >

                        {day}

                      </div>
                    );
                  }
                )}

              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 mt-10">

                {/* Present */}
                <button
                  onClick={
                    handlePresent
                  }
                  className="flex-1 bg-green-500 hover:bg-green-600 py-4 rounded-2xl text-lg font-bold transition-all"
                >
                  Present
                </button>

                {/* Absent */}
                <button
                  onClick={
                    handleAbsent
                  }
                  className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-2xl text-lg font-bold transition-all"
                >
                  Absent
                </button>

              </div>

              {/* Save */}
              <button
                onClick={
                  handleSaveAttendance
                }
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 py-5 rounded-2xl text-lg font-bold transition-all duration-300"
              >
                Save Attendance
              </button>

            </div>

          </div>
        )}

        {/* OVERVIEW */}
        {activeSection ===
          "overview" && (

          <AttendanceOverview
            attendanceRecords={
              attendanceRecords
            }
          />

        )}

        {/* HOLIDAYS */}
        {activeSection ===
          "holidays" && (
          <HolidayList />
        )}

        {/* SEMESTER */}
        {activeSection ===
          "semester" && (
          <SemesterDates
  setSemesterData={
    setSemesterData
  }
  userName={userName}
/>
        )}

      </div>

    </div>
  );
}