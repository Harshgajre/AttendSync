export default function EmployeeHome() {

  return (
    <div>

      {/* Welcome */}
      <p className="text-green-400 text-lg mb-4">
        Welcome Back 👋
      </p>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">

        Employee
        <span className="text-green-400">
          {" "}Dashboard
        </span>

      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-gray-300 max-w-3xl leading-relaxed mb-10">
        Manage attendance, PF/CL limits, holidays and reports from one smart dashboard.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Attendance */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10">

          <h2 className="text-2xl font-black mb-4">
            Attendance
          </h2>

          <p className="text-5xl font-black text-green-400">
            92%
          </p>

        </div>

        {/* Present */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10">

          <h2 className="text-2xl font-black mb-4">
            Present Days
          </h2>

          <p className="text-5xl font-black text-green-400">
            224
          </p>

        </div>

        {/* Absent */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-red-500/10">

          <h2 className="text-2xl font-black mb-4">
            Absent Days
          </h2>

          <p className="text-5xl font-black text-red-400">
            18
          </p>

        </div>

        {/* PF */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10">

          <h2 className="text-2xl font-black mb-4">
            PF Left
          </h2>

          <p className="text-5xl font-black text-green-400">
            16
          </p>

        </div>

      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

        {/* CL */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10">

          <h2 className="text-3xl font-black mb-6">
            Casual Leave
          </h2>

          <div className="flex items-center justify-between">

            <p className="text-lg text-gray-300">
              Remaining CL
            </p>

            <span className="text-4xl font-black text-green-400">
              9
            </span>

          </div>

        </div>

        {/* Performance */}
  <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10">

    <h2 className="text-3xl font-black mb-6">
      Performance
    </h2>

    <div className="w-full bg-slate-800 h-5 rounded-full overflow-hidden">

      <div
        className="bg-green-500 h-full rounded-full"
        style={{ width: "92%" }}
      ></div>

    </div>

    <p className="text-green-400 mt-4 text-lg font-bold">
      Excellent Attendance Record
    </p>

  </div>

      </div>

    </div>
  );
}