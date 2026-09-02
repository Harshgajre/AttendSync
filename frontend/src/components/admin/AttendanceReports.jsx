import { useEffect, useState } from "react";
import { getApiUrl } from "../../config/api";

export default function AttendanceReports() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterSlotId, setFilterSlotId] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [search, setSearch] = useState("");

  // Load Slots
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const res = await fetch(getApiUrl("/api/slots"));
        const data = await res.json();
        if (data.success) {
          setSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Failed to load slots:", err);
      }
    };
    loadSlots();
  }, []);

  // Load Reports & Stats
  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterDate) params.append("date", filterDate);
      if (filterSlotId) params.append("slotId", filterSlotId);
      if (filterRole) params.append("userRole", filterRole);
      if (search) params.append("search", search);

      const [recordsRes, statsRes] = await Promise.all([
        fetch(getApiUrl(`/api/attendance/all?${params.toString()}`)),
        fetch(getApiUrl("/api/attendance/stats")),
      ]);

      const recordsData = await recordsRes.json();
      const statsData = await statsRes.json();

      if (recordsData.success) {
        setRecords(recordsData.records || []);
      }
      if (statsData.success) {
        setStats(statsData);
      }
    } catch (error) {
      console.error("Report Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filterDate, filterSlotId, filterRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReports();
  };

  const handleClearFilters = () => {
    setFilterDate("");
    setFilterSlotId("");
    setFilterRole("");
    setSearch("");
  };

  return (
    <div>
      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-black mb-8">
        Slot Attendance <span className="text-cyan-400">Reports</span>
      </h1>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 border border-cyan-500/10 rounded-3xl p-6">
          <p className="text-gray-400 mb-2 text-sm font-semibold">Total Registered Students</p>
          <h2 className="text-4xl font-black text-cyan-400">{stats?.totalStudents || stats?.totalUsers || 0}</h2>
          <p className="text-xs text-gray-400 mt-2">
            Enrolled Student Accounts
          </p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/10 rounded-3xl p-6">
          <p className="text-gray-400 mb-2 text-sm font-semibold">Face Enrolled Students</p>
          <h2 className="text-4xl font-black text-emerald-400">
            {stats?.faceRegisteredStudents || stats?.totalFaceRegistered || 0}
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            Biometric Enrolled Students
          </p>
        </div>

        <div className="bg-slate-900 border border-yellow-500/10 rounded-3xl p-6">
          <p className="text-gray-400 mb-2 text-sm font-semibold">Today's Check-Ins</p>
          <h2 className="text-4xl font-black text-yellow-400">
            {stats?.todayAttendanceCount || 0}
          </h2>
          <p className="text-xs text-gray-400 mt-2">Verified Face Scans Today</p>
        </div>

        <div className="bg-slate-900 border border-purple-500/10 rounded-3xl p-6">
          <p className="text-gray-400 mb-2 text-sm font-semibold">Current Active Slot</p>
          <h2 className="text-2xl font-black text-purple-400 truncate">
            {stats?.currentSlot ? stats.currentSlot.slotName : "No Active Slot"}
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            {stats?.currentSlotAttendanceCount || 0} Checked in this slot
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 rounded-3xl p-6 mb-8 border border-white/10">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          {/* Date Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          {/* Slot Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">
              Filter by Slot
            </label>
            <select
              value={filterSlotId}
              onChange={(e) => setFilterSlotId(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-cyan-400 text-sm"
            >
              <option value="">All Attendance Slots</option>
              {slots.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.slotName} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">
              Status
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-cyan-400 text-sm"
            >
              <option value="">All Records</option>
              <option value="Student">Students Only</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5">
              Search User / Org
            </label>
            <input
              type="text"
              placeholder="Search by name, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 transition"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-slate-800 hover:bg-slate-700 py-3 px-4 rounded-xl font-bold text-sm text-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden border border-cyan-500/10">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-black">
            Verified Attendance Log ({records.length} Records)
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading attendance reports...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">User Name</th>
                <th className="p-4">Role & Institution</th>
                <th className="p-4">Slot</th>
                <th className="p-4">Date</th>
                <th className="p-4">Check-In Time</th>
                <th className="p-4">Method</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No verified attendance records match the selected filters.
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
                  <tr
                    key={rec._id || idx}
                    className="border-t border-slate-800 hover:bg-slate-800/40 transition text-gray-300"
                  >
                    <td className="p-4 pl-6 font-bold text-white">{rec.userName}</td>
                    <td className="p-4">
                      <span className="font-semibold text-cyan-300">{rec.userRole}</span>
                      <span className="text-gray-400 text-xs block">
                        {rec.collegeOrCompany || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{rec.slotName}</td>
                    <td className="p-4 font-mono">{rec.date}</td>
                    <td className="p-4">{rec.checkInTime}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 rounded-full text-xs font-bold">
                        {rec.verificationMethod || "FACE"}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="text-emerald-400 font-bold">✓ {rec.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}