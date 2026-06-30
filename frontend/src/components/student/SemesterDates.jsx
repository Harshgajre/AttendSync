import { useState } from "react";

export default function SemesterDates({
  setSemesterData,
  userName,
}) {
  // States
  const [semesterStart, setSemesterStart] = useState("");
  const [semesterEnd, setSemesterEnd] = useState("");
  const [savedData, setSavedData] = useState([]);

  // Save Semester
  const handleSaveSemester = () => {

    if (
      !semesterStart ||
      !semesterEnd
    ) {
      return;
    }

    const semesterObject = {

  start: semesterStart,
  end: semesterEnd,


};

setSavedData([
  semesterObject,
]);

// Save Local Storage
localStorage.setItem(

  `semesterDates-${userName}`,

  JSON.stringify(
    semesterObject
  )

);

// Update Dashboard Live
setSemesterData(
  semesterObject
);
    
  };

  return (
    <div>

      <h1 className="text-5xl font-black mb-10">
        Semester Dates
      </h1>

      {/* Input Section */}
      <div className="bg-slate-900 p-8 rounded-3xl space-y-6 mb-10">

        {/* Start */}
        <div>

          <p className="text-lg mb-3 text-cyan-400">
            Semester Start Date
          </p>

          <input
            type="date"
            value={semesterStart}
            onChange={(e) =>
              setSemesterStart(e.target.value)
            }
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          />

        </div>

        {/* End */}
        <div>

          <p className="text-lg mb-3 text-cyan-400">
            Semester End Date
          </p>

          <input
            type="date"
            value={semesterEnd}
            onChange={(e) =>
              setSemesterEnd(e.target.value)
            }
            className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
          />

        </div>


        {/* Save */}
        <button
          onClick={handleSaveSemester}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-5 rounded-2xl text-lg font-bold transition-all duration-300" >
          Save Semester Dates
        </button>

      </div>

      {/* Saved Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {savedData.map((item, index) => (

          <div
            key={index}
            className="bg-slate-900 p-8 rounded-3xl"
          >

            <h2 className="text-3xl font-black mb-8">
              Semester
            </h2>

            <div className="space-y-4">

              <div className="bg-slate-800 p-4 rounded-2xl flex justify-between">

                <p>Start Date</p>

                <span className="text-cyan-400 font-bold">
                  {item.start}
                </span>

              </div>

              <div className="bg-slate-800 p-4 rounded-2xl flex justify-between">

                <p>End Date</p>

                <span className="text-cyan-400 font-bold">
                  {item.end}
                </span>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}