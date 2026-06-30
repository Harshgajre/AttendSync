import { useState } from "react";

export default function HolidayList() {

  // States
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidays, setHolidays] = useState([]);

  // Add Holiday
  const handleAddHoliday = () => {

    if (!holidayName || !holidayDate) {
      alert("Please fill all fields");
      return;
    }

    setHolidays([
      ...holidays,
      {
        name: holidayName,
        date: holidayDate,
      },
    ]);

    setHolidayName("");
    setHolidayDate("");
  };

  // Remove Holiday
  const handleRemoveHoliday = (holiday) => {

    setHolidays(
      holidays.filter(
        (item) => item !== holiday
      )
    );
  };

  return (
    <div>

      <h1 className="text-5xl font-black mb-10">
        Holiday List
      </h1>

      {/* Input Section */}
      <div className="bg-slate-900 p-8 rounded-3xl mb-10 space-y-6">

        {/* Holiday Name */}
        <input
          type="text"
          placeholder="Holiday Name"
          value={holidayName}
          onChange={(e) =>
            setHolidayName(e.target.value)
          }
          className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
        />

        {/* Date */}
        <input
          type="date"
          value={holidayDate}
          onChange={(e) =>
            setHolidayDate(e.target.value)
          }
          className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
        />

        {/* Save */}
        <button
          onClick={handleAddHoliday}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-5 rounded-2xl text-lg font-bold transition-all duration-300"
        >
          Save Holiday
        </button>

      </div>

      {/* Holiday Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {holidays.map((holiday, index) => (

          <div
            key={index}
            className="bg-slate-900 p-6 rounded-3xl flex items-center justify-between"
          >

            <div>

              <h2 className="text-2xl font-bold">
                {holiday.name}
              </h2>

              <p className="text-cyan-400 mt-2">
                {holiday.date}
              </p>

            </div>

            <button
              onClick={() =>
                handleRemoveHoliday(holiday)
              }
              className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl transition-all duration-300"
            >
              Remove
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}