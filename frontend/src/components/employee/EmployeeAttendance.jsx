import { useState } from "react";

export default function EmployeeAttendance() {

  // Current Date
  const currentDate = new Date();

  // Month
  const [month, setMonth] = useState(
    currentDate.getMonth()
  );

  // Year
  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  // Selected Date
  const [selectedDate, setSelectedDate] =
    useState(null);

  // Attendance Data
  const [attendanceData, setAttendanceData] =
    useState({});

  // Holidays
  const [holidays, setHolidays] =
    useState([
      {
        name: "Diwali",
        date: "2026-11-12",
      },
      {
        name: "Independence Day",
        date: "2026-08-15",
      },
    ]);

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

  // Blank Days
  const blanks = Array(firstDay).fill(null);

  // Present
  const handlePresent = () => {

    if (!selectedDate) {

      alert("Select Date");
      return;

    }

    setAttendanceData({
      ...attendanceData,
      [`${year}-${month}-${selectedDate}`]:
        "Present",
    });
  };

  // Absent
  const handleAbsent = () => {

    if (!selectedDate) {

      alert("Select Date");
      return;

    }

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
    <div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-black mb-8">

        Fill
        <span className="text-green-400">
          {" "}Attendance
        </span>

      </h1>

      {/* Card */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-green-500/10">

        {/* Top */}
        <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between mb-8">

          {/* Selectors */}
          <div className="flex flex-wrap gap-4">

            {/* Month */}
            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  Number(e.target.value)
                )
              }
              className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
            >

              {months.map((m, index) => (

                <option
                  key={index}
                  value={index}
                >

                  {m}

                </option>

              ))}

            </select>

            {/* Year */}
            <select
              value={year}
              onChange={(e) =>
                setYear(
                  Number(e.target.value)
                )
              }
              className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
            >

              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(
                (y) => (

                  <option
                    key={y}
                    value={y}
                  >

                    {y}

                  </option>

                )
              )}

            </select>

          </div>

          {/* Current */}
          <h2 className="text-3xl font-black text-green-400">

            {months[month]} {year}

          </h2>

        </div>

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

          {/* Blank Spaces */}
          {blanks.map((_, index) => (

            <div
              key={index}
              className="h-10 sm:h-12"
            ></div>

          ))}

          {/* Dates */}
          {[...Array(totalDays)].map(
            (_, index) => {

              const day = index + 1;

              const key =
                `${year}-${month}-${day}`;

              const status =
                attendanceData[key];

              // Holiday Check
              const formattedDate =
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              const isHoliday =
                holidays.some(
                  (holiday) =>
                    holiday.date ===
                    formattedDate
                );

              return (

                <div
                  key={day}
                  onClick={() =>
                    setSelectedDate(day)
                  }
                  className={`h-10 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 border ${
                    selectedDate === day
                      ? "border-white scale-105"
                      : "border-white/10"
                  } ${
                    status === "Present"
                      ? "bg-green-500 text-white"
                      : status === "Absent"
                      ? "bg-red-500 text-white"
                      : isHoliday
                      ? "bg-sky-500 text-white"
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
            onClick={handlePresent}
            className="flex-1 bg-green-500 hover:bg-green-600 py-4 rounded-2xl text-lg font-bold transition-all duration-300"
          >

            Present

          </button>

          {/* Absent */}
          <button
            onClick={handleAbsent}
            className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-2xl text-lg font-bold transition-all duration-300"
          >

            Absent

          </button>

        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">

          {/* Present */}
          <div className="bg-green-500/20 border border-green-500 p-6 rounded-3xl">

            <h2 className="text-2xl font-black mb-3">
              Present
            </h2>

            <p className="text-5xl font-black text-green-400">
              {presentCount}
            </p>

          </div>

          {/* Absent */}
          <div className="bg-red-500/20 border border-red-500 p-6 rounded-3xl">

            <h2 className="text-2xl font-black mb-3">
              Absent
            </h2>

            <p className="text-5xl font-black text-red-400">
              {absentCount}
            </p>

          </div>

          {/* Percentage */}
          <div className="bg-slate-800 border border-white/10 p-6 rounded-3xl">

            <h2 className="text-2xl font-black mb-3">
              Attendance %
            </h2>

            <p className="text-5xl font-black text-green-400">
              {percentage}%
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}