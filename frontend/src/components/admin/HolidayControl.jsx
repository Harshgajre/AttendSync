import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/holidays";

export default function HolidayControl() {
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayFor, setHolidayFor] = useState("both");
  const [repeatType, setRepeatType] = useState("once");
  const [weeklyDay, setWeeklyDay] = useState("");
  const [description, setDescription] = useState("");

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL);

      if (res.data.success) {
        setHolidays(res.data.holidays || []);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to load holidays.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setHolidayName("");
    setHolidayDate("");
    setHolidayFor("both");
    setRepeatType("once");
    setWeeklyDay("");
    setDescription("");
    setEditingId(null);
  };

  const validateForm = () => {
    if (!holidayName.trim()) {
      alert("Enter Holiday Name");
      return false;
    }

    if (repeatType !== "weekly" && !holidayDate) {
      alert("Select Holiday Date");
      return false;
    }

    if (repeatType === "weekly" && !weeklyDay) {
      alert("Select Weekly Day");
      return false;
    }

    return true;
  };

  const handleSaveHoliday = async () => {
    if (!validateForm()) return;

    const payload = {
      holidayName,
      holidayDate:
        repeatType === "weekly"
          ? null
          : holidayDate,
      holidayFor,
      repeatType,
      weeklyDay:
        repeatType === "weekly"
          ? weeklyDay
          : "",
      description,
      isActive: true,
    };

    try {
      if (editingId) {
        const res = await axios.put(
          `${API_URL}/${editingId}`,
          payload
        );

        if (res.data.success) {
          alert("Holiday Updated Successfully");
        }
      } else {
        const res = await axios.post(
          API_URL,
          payload
        );

        if (res.data.success) {
          alert("Holiday Added Successfully");
        }
      }

      clearForm();
      fetchHolidays();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Unable to save holiday."
      );
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);

      fetchHolidays();
    } catch (err) {
      console.error(err);
      alert("Unable to delete holiday.");
    }
  };

  const handleEditHoliday = (holiday) => {
    setEditingId(holiday._id);

    setHolidayName(holiday.holidayName || "");

    setHolidayDate(
      holiday.holidayDate
        ? holiday.holidayDate.substring(0, 10)
        : ""
    );

    setHolidayFor(
      holiday.holidayFor || "both"
    );

    setRepeatType(
      holiday.repeatType || "once"
    );

    setWeeklyDay(
      holiday.weeklyDay || ""
    );

    setDescription(
      holiday.description || ""
    );
  };
  return (
    <div>
      <h1 className="text-5xl font-black mb-10">
        Holiday
        <span className="text-cyan-400"> Control</span>
      </h1>

      <div className="bg-slate-900 p-8 rounded-3xl mb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Holiday Name */}

          <input
            type="text"
            placeholder="Holiday Name"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          />

          {/* Holiday Date */}

          <input
            type="date"
            value={holidayDate}
            disabled={repeatType === "weekly"}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          />

          {/* Holiday For */}

          <select
            value={holidayFor}
            onChange={(e) => setHolidayFor(e.target.value)}
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          >
            <option value="both">
              Student + Employee
            </option>

            <option value="student">
              Student Only
            </option>

            <option value="employee">
              Employee Only
            </option>
          </select>

          {/* Repeat Type */}

          <select
            value={repeatType}
            onChange={(e) =>
              setRepeatType(e.target.value)
            }
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          >
            <option value="once">
              One Time
            </option>

            <option value="weekly">
              Weekly
            </option>

            <option value="yearly">
              Every Year
            </option>
          </select>

          {/* Weekly Day */}

          {repeatType === "weekly" && (
            <select
              value={weeklyDay}
              onChange={(e) =>
                setWeeklyDay(e.target.value)
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none md:col-span-2"
            >
              <option value="">
                Select Weekly Holiday
              </option>

              <option value="Sunday">
                Sunday
              </option>

              <option value="Monday">
                Monday
              </option>

              <option value="Tuesday">
                Tuesday
              </option>

              <option value="Wednesday">
                Wednesday
              </option>

              <option value="Thursday">
                Thursday
              </option>

              <option value="Friday">
                Friday
              </option>

              <option value="Saturday">
                Saturday
              </option>
            </select>
          )}

          {/* Description */}

          <textarea
            rows="3"
            placeholder="Holiday Description (Optional)"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="bg-slate-800 p-5 rounded-2xl outline-none md:col-span-2"
          />

        </div>

        <button
          onClick={handleSaveHoliday}
          className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 py-5 rounded-2xl text-lg font-bold transition-all duration-300"
        >
          {editingId
            ? "Update Holiday"
            : "Save Holiday"}
        </button>

      </div>
      {/* Holiday List */}

      <div className="mt-10">

        <h2 className="text-3xl font-bold mb-6">
          Saved Holidays
        </h2>

        {loading ? (
          <div className="bg-slate-900 rounded-3xl p-8 text-center">
            Loading Holidays...
          </div>
        ) : holidays.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-8 text-center text-gray-400">
            No Holidays Found
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {holidays.map((holiday) => (

              <div
                key={holiday._id}
                className="bg-slate-900 rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <h2 className="text-2xl font-bold mb-3">
                      {holiday.holidayName}
                    </h2>

                    <p className="text-gray-400 mb-2">
                      📅{" "}
                      {holiday.holidayDate
                        ? new Date(
                            holiday.holidayDate
                          ).toLocaleDateString()
                        : "--"}
                    </p>

                    <p className="text-gray-400 mb-2">
                      👥 Holiday For :
                      {" "}
                      <span className="text-cyan-400 font-semibold">
                        {holiday.holidayFor === "both"
                          ? "Student + Employee"
                          : holiday.holidayFor ===
                            "student"
                          ? "Student"
                          : "Employee"}
                      </span>
                    </p>

                    <p className="text-gray-400 mb-2">
                      🔁 Repeat :
                      {" "}
                      <span className="text-yellow-400 font-semibold">
                        {holiday.repeatType}
                      </span>
                    </p>

                    {holiday.repeatType ===
                      "weekly" && (

                      <p className="text-gray-400 mb-2">
                        📆 Weekly :
                        {" "}
                        <span className="text-green-400">
                          {holiday.weeklyDay}
                        </span>
                      </p>

                    )}

                    {holiday.description && (

                      <p className="text-gray-400 mt-4">
                        📝 {holiday.description}
                      </p>

                    )}

                  </div>

                  <div className="flex flex-col gap-3">

  <button
    onClick={() => handleEditHoliday(holiday)}
    className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-xl font-semibold transition-all"
  >
    Edit
  </button>
</div>

                  <button
                    onClick={() =>
                      handleDeleteHoliday(
                        holiday._id
                      )
                    }
                    className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl font-semibold transition-all"
                  >
                    Delete
                  </button>
                  </div>

              </div>

            ))}

          </div>
        )}
      </div>

    </div>

  );
}   