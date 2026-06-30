export default function EmployeeReports({ user }) {

  // Dynamic Employee Data
  const employeeData = {
    name: user?.name || "Employee Name",

    employeeId:
      user?.employeeId || "EMP-0000",

    department:
      user?.department || "Department",

    role:
      user?.role || "Employee Role",

    joiningDate:
      user?.joiningDate || "Joining Date",

    attendance:
      user?.attendancePercentage || 0,

    presentDays:
      user?.presentDays || 0,

    absentDays:
      user?.absentDays || 0,

    totalCL:
      user?.totalCL || 0,

    usedCL:
      user?.usedCL || 0,

    totalPF:
      user?.totalPF || 0,

    usedPF:
      user?.usedPF || 0,
  };

  // Dynamic Calculations
const remainingCL =
  Math.max(
    0,
    employeeData.totalCL -
    employeeData.usedCL
  );

const remainingPF =
  Math.max(
    0,
    employeeData.totalPF -
    employeeData.usedPF
  );

const clPercentage =
  employeeData.totalCL > 0
    ? Math.min(
        100,
        Math.round(
          (remainingCL /
            employeeData.totalCL) * 100
        )
      )
    : 0;

const pfPercentage =
  employeeData.totalPF > 0
    ? Math.min(
        100,
        Math.round(
          (remainingPF /
            employeeData.totalPF) * 100
        )
      )
    : 0;

  // Performance
  let performance = "Poor";

  if (
    employeeData.attendance >= 90
  ) {

    performance = "Excellent";

  }
  else if (
    employeeData.attendance >= 75
  ) {

    performance = "Good";

  }
  else if (
    employeeData.attendance >= 60
  ) {

    performance = "Average";

  }

  // Circle Progress
  const circleStyle = (
    percentage,
    color
  ) => ({
    background: `conic-gradient(
      ${color} ${percentage}%,
      #1e293b ${percentage}%
    )`,
  });

  return (

    <div className="space-y-10 text-white">

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">

        <div>

          <h1 className="text-4xl sm:text-5xl font-black">

            Employee
            <span className="text-green-400">
              {" "}Reports
            </span>

          </h1>

          <p className="text-gray-400 mt-2 text-lg">

            Real-time employee analytics
            and performance overview

          </p>

        </div>

      </div>

      {/* Employee Profile */}
      <div className="bg-slate-900/90 border border-green-500/10 rounded-[32px] p-8 overflow-hidden relative">

        <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/10 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">

          {/* Left */}
          <div className="space-y-5">

            <div>

              <p className="text-gray-400 mb-1">

                Employee ID

              </p>

              <h2 className="text-3xl font-black text-green-400">

                {employeeData.employeeId}

              </h2>

            </div>

            <div className="space-y-3 text-lg text-gray-300">

              <p>

                <span className="font-bold text-white">

                  Name:

                </span>{" "}

                {employeeData.name}

              </p>

              <p>

                <span className="font-bold text-white">

                  Department:

                </span>{" "}

                {employeeData.department}

              </p>

              <p>

                <span className="font-bold text-white">

                  Role:

                </span>{" "}

                {employeeData.role}

              </p>

              <p>

                <span className="font-bold text-white">

                  Joining Date:

                </span>{" "}

                {employeeData.joiningDate}

              </p>

              <p>

                <span className="font-bold text-white">

                  Performance:

                </span>{" "}

                <span className="text-green-400">

                  {performance}

                </span>

              </p>

            </div>

          </div>

          {/* Main Circle */}
          <div className="flex flex-col items-center">

            <div
              style={circleStyle(
                employeeData.attendance,
                "#22c55e"
              )}
              className="w-56 h-56 rounded-full flex items-center justify-center shadow-2xl"
            >

              <div className="w-40 h-40 bg-slate-950 rounded-full flex flex-col items-center justify-center">

                <h2 className="text-5xl font-black text-green-400">

                  {employeeData.attendance}%

                </h2>

                <p className="text-gray-400 mt-2">

                  Attendance

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Present */}
        <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-8">

          <p className="text-gray-400 mb-3">

            Present Days

          </p>

          <h2 className="text-5xl font-black text-green-400">

            {employeeData.presentDays}

          </h2>

        </div>

        {/* Absent */}
        <div className="bg-slate-900 border border-red-500/10 rounded-3xl p-8">

          <p className="text-gray-400 mb-3">

            Absent Days

          </p>

          <h2 className="text-5xl font-black text-red-400">

            {employeeData.absentDays}

          </h2>

        </div>

        {/* CL */}
        <div className="bg-slate-900 border border-yellow-500/10 rounded-3xl p-8">

          <p className="text-gray-400 mb-3">

            CL Remaining

          </p>

          <h2 className="text-5xl font-black text-yellow-400">

            {remainingCL}/
            {employeeData.totalCL}

          </h2>

          <p className="text-gray-400 mt-2">

           {clPercentage} % Remaining

          </p>

        </div>

        {/* PF */}
        <div className="bg-slate-900 border border-cyan-500/10 rounded-3xl p-8">

          <p className="text-gray-400 mb-3">

            PF Remaining

          </p>

          <h2 className="text-4xl font-black text-cyan-400">

            {remainingPF}

          </h2>

          <p className="text-gray-400 mt-2">

            {pfPercentage} % Remaining

          </p>

        </div>

      </div>

      {/* Circular Graphs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Attendance */}
        <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-8">

          <h2 className="text-2xl font-black mb-8">

            Attendance Status

          </h2>

          <div className="flex justify-center">

            <div
              style={circleStyle(
                employeeData.attendance,
                "#22c55e"
              )}
              className="w-44 h-44 rounded-full flex items-center justify-center"
            >

              <div className="w-32 h-32 bg-slate-950 rounded-full flex items-center justify-center">

                <h2 className="text-4xl font-black text-green-400">

                  {employeeData.attendance}%

                </h2>

              </div>

            </div>

          </div>

        </div>

        {/* CL */}
        <div className="bg-slate-900 border border-yellow-500/10 rounded-3xl p-8">

          <h2 className="text-2xl font-black mb-8">

            CL Balance

          </h2>

          <div className="flex justify-center">

            <div
             style={circleStyle(
  clPercentage,
  "#eab308"
)}
              className="w-44 h-44 rounded-full flex items-center justify-center"
            >

              <div className="w-32 h-32 bg-slate-950 rounded-full flex flex-col items-center justify-center">

                <h2 className="text-4xl font-black text-yellow-400">

                  {remainingCL}/
                  {employeeData.totalCL}

                </h2>

                <p className="text-gray-400 text-sm mt-1">

  {clPercentage}% Left

</p>

              </div>

            </div>

          </div>

        </div>

        {/* PF */}
        <div className="bg-slate-900 border border-cyan-500/10 rounded-3xl p-8">

          <h2 className="text-2xl font-black mb-8">

            PF Balance

          </h2>

          <div className="flex justify-center">

            <div
              style={circleStyle(
                pfPercentage,
                "#06b6d4"
              )}
              className="w-44 h-44 rounded-full flex items-center justify-center"
            >

              <div className="w-32 h-32 bg-slate-950 rounded-full flex flex-col items-center justify-center px-2">

                <h2 className="text-2xl font-black text-cyan-400 text-center">

                  {remainingPF}

                </h2>

                <p className="text-gray-400 text-sm mt-1 text-center">

  {pfPercentage}% Left

</p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}