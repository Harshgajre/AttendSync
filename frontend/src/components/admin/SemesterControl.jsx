import { useEffect, useState } from "react";

export default function SemesterControl() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [semester, setSemester] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("adminSemester"));
    if (stored) {
      setSemester(stored);
    }
  }, []);

  const handleSaveSemester = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const newSemester = {
      startDate,
      endDate,
    };

    setSemester(newSemester);
    localStorage.setItem("adminSemester", JSON.stringify(newSemester));
    setStartDate("");
    setEndDate("");
  };

  return (
    <div>
      <h1 className="text-5xl font-black mb-10">
        Semester
        <span className="text-cyan-400"> Control</span>
      </h1>

      <div className="bg-slate-900 p-8 rounded-3xl mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-400 mb-3">Semester Start Date</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          />
        </div>
        <div>
          <p className="text-gray-400 mb-3">Semester End Date</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleSaveSemester}
        className="w-full bg-cyan-500 hover:bg-cyan-600 py-5 rounded-2xl text-lg font-bold transition-all duration-300"
      >
        Save Semester Dates
      </button>

      {semester && (
        <div className="mt-10 bg-slate-900 p-8 rounded-3xl border border-cyan-500/10">
          <h2 className="text-3xl font-bold mb-6">Current Semester</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-3xl">
              <p className="text-gray-400">Start Date</p>
              <p className="text-white font-bold mt-2">{semester.startDate}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-3xl">
              <p className="text-gray-400">End Date</p>
              <p className="text-white font-bold mt-2">{semester.endDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
