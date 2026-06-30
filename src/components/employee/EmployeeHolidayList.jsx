import { useState } from "react";

export default function EmployeeHolidayList({
  holidays,
  setHolidays,
}) {

  // Inputs
  const [holidayName, setHolidayName] =
    useState("");

  const [holidayDate, setHolidayDate] =
    useState("");

  // Add Holiday
  const handleAddHoliday = () => {

    if (
      !holidayName ||
      !holidayDate
    ) {
      return;
    }

    const newHoliday = {
      name: holidayName,
      date: holidayDate,
    };

    setHolidays([
      ...holidays,
      newHoliday,
    ]);

    // Clear Inputs
    setHolidayName("");
    setHolidayDate("");
  };

  // Remove Holiday
  const handleRemoveHoliday = (
    index
  ) => {

    const updated =
      holidays.filter(
        (_, i) => i !== index
      );

    setHolidays(updated);
  };

  return (
    <div className="text-white">

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-black mb-10">

        Holiday
        <span className="text-green-400">
          {" "}List
        </span>

      </h1>

      {/* Add Holiday */}
      <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-6 sm:p-8 mb-10">

        <h2 className="text-3xl font-black mb-8">

          Add Holiday

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Holiday Name */}
          <input
            type="text"
            value={holidayName}
            onChange={(e) =>
              setHolidayName(
                e.target.value
              )
            }
            placeholder="Holiday Name"
            className="bg-slate-800 p-5 rounded-2xl outline-none"
          />

          {/* Holiday Date */}
          <input
            type="date"
            value={holidayDate}
            onChange={(e) =>
              setHolidayDate(
                e.target.value
              )
            }
            className="bg-slate-800 p-5 rounded-2xl outline-none"
          />

        </div>

        {/* Save Button */}
        <button
          onClick={handleAddHoliday}
          className="mt-8 w-full bg-green-500 hover:bg-green-600 py-5 rounded-2xl text-lg font-bold transition-all"
        >

          Save Holiday

        </button>

      </div>

      {/* Holiday List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {holidays.length === 0 && (

          <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-8">

            <h2 className="text-2xl font-black text-gray-400">

              No Holidays Added

            </h2>

          </div>

        )}

        {holidays.map(
          (holiday, index) => (

            <div
              key={index}
              className="bg-sky-500/20 border border-sky-400 rounded-3xl p-6"
            >

              {/* Name */}
              <h2 className="text-3xl font-black text-sky-300 mb-4">

                {holiday.name}

              </h2>

              {/* Date */}
              <p className="text-xl font-bold text-white mb-6">

                {holiday.date}

              </p>

              {/* Remove */}
              <button
                onClick={() =>
                  handleRemoveHoliday(
                    index
                  )
                }
                className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-2xl font-bold transition-all"
              >

                Remove

              </button>

            </div>
          )
        )}

      </div>

    </div>
  );
}