export default function OverviewAttendance({
  attendanceRecords,
}) {

  // Subject Data
  const subjects = {};

  attendanceRecords.forEach((record) => {

    if (!subjects[record.subject]) {

      subjects[record.subject] = {
        total: 0,
        present: 0,
      };
    }

    subjects[record.subject].total++;

    if (record.status === "Present") {
      subjects[record.subject].present++;
    }

  });

  return (
    <div>

      <h1 className="text-5xl font-black mb-10">
        Overview of Attendance
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {Object.keys(subjects).map((subject, index) => {

          const total =
            subjects[subject].total;

          const present =
            subjects[subject].present;

          const percentage =
            Math.round(
              (present / total) * 100
            );

          return (

            <div
              key={index}
              className="bg-slate-900/80 border border-cyan-500/10 rounded-3xl p-8"
            >

              {/* Subject */}
              <h2 className="text-3xl font-black mb-8">
                {subject}
              </h2>

              {/* Stats */}
              <div className="space-y-4">

                <div className="flex justify-between bg-slate-800/80 p-4 rounded-2xl">

                  <p>Total Classes</p>

                  <span className="text-cyan-400 font-bold">
                    {total}
                  </span>

                </div>

                <div className="flex justify-between bg-slate-800/80 p-4 rounded-2xl">

                  <p>Present</p>

                  <span className="text-green-400 font-bold">
                    {present}
                  </span>

                </div>

                <div className="flex justify-between bg-slate-800/80 p-4 rounded-2xl">

                  <p>Absent</p>

                  <span className="text-red-400 font-bold">
                    {total - present}
                  </span>

                </div>

              </div>

              {/* Percentage */}
              <div className="mt-8">

                <div className="flex justify-between mb-3">

                  <p className="text-gray-400">
                    Attendance %
                  </p>

                  <p
                    className={`font-bold ${
                      percentage >= 75
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {percentage}%
                  </p>

                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">

                  <div
                    className={`h-4 rounded-full ${
                      percentage >= 75
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : "bg-gradient-to-r from-red-400 to-rose-500"
                    }`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>

                </div>

              </div>

            </div>

          );
        })}

      </div>

    </div>
  );
}