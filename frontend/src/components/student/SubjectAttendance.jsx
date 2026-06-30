import { useState } from "react";

export default function FillAttendance({
  subjects,
}) {

  // Subject
  const [selectedSubject, setSelectedSubject] =
    useState("");

  // Current Date
  const currentDate = new Date();

  // Month & Year
  const [month, setMonth] = useState(
    currentDate.getMonth()
  );

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  // Selected Date
  const [selectedDate, setSelectedDate] =
    useState(null);

  // Attendance Data
  const [attendanceData, setAttendanceData] =
    useState({});

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

    if (
      !selectedSubject ||
      !selectedDate
    ) {
      alert("Select Subject & Date");
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
      alert("Select Subject & Date");
      return;
    }

    setAttendanceData({
      ...attendanceData,
      [`${selectedSubject}-${year}-${month}-${selectedDate}`]:
        "Absent",
    });
  };

  return (
    <div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-black mb-8">

        Fill
        <span className="text-cyan-400">
          {" "}Attendance
        </span>

      </h1>

      {/* Main Card */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-cyan-500/10">

        {/* Subject */}
        <div className="mb-8">

          <label className="block text-lg font-bold mb-3">
            Choose Subject
          </label>

          <select
            value={selectedSubject}
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

            {subjects.map((subject, index) => (

              <option
                key={index}
                value={subject}
              >

                {subject}

              </option>
            ))}

          </select>

        </div>

        {/* Month & Year */}
        <div className="flex flex-wrap gap-4 mb-8">

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

            {[2024, 2025, 2026, 2027, 2028].map(
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

        {/* Current Month */}
        <h2 className="text-3xl font-black text-cyan-400 mb-6">

          {months[month]} {year}

        </h2>

        {/* Day Names */}
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
                `${selectedSubject}-${year}-${month}-${day}`;

              const status =
                attendanceData[key];

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
        <div className="flex gap-5 mt-10">

          {/* Present */}
          <button
            onClick={handlePresent}
            className="flex-1 bg-green-500 hover:bg-green-600 py-4 rounded-2xl text-lg font-bold transition-all"
          >
            Present
          </button>

          {/* Absent */}
          <button
            onClick={handleAbsent}
            className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-2xl text-lg font-bold transition-all"
          >
            Absent
          </button>

        </div>

      </div>

    </div>
  );
}