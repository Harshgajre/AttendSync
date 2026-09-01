import { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";

export default function ManageTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("All");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("09:15");
  const [endTime, setEndTime] = useState("10:05");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [room, setRoom] = useState("Room 201");
  const [semester, setSemester] = useState("6");
  const [division, setDivision] = useState("A");
  const [batch, setBatch] = useState("");
  const [lectureType, setLectureType] = useState("Lecture");
  const [isActive, setIsActive] = useState(true);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Fetch Timetable & Employees
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ttRes, empRes] = await Promise.all([
        fetch(getApiUrl("/api/timetable")),
        fetch(getApiUrl("/api/admin/employees")),
      ]);

      const ttData = await ttRes.json();
      if (ttData.success) {
        setTimetable(ttData.entries || []);
      }

      const empData = await empRes.json();
      if (empData.success) {
        setEmployees(empData.employees || []);
      }
    } catch (err) {
      console.error("Fetch timetable error:", err);
      setError("Failed to load timetable entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setDay(selectedDay === "All" ? "Monday" : selectedDay);
    setStartTime("09:15");
    setEndTime("10:05");
    setSubjectCode("");
    setSubjectName("");
    setFacultyId("");
    setFacultyName("");
    setRoom("Room 201");
    setSemester("6");
    setDivision("A");
    setBatch("");
    setLectureType("Lecture");
    setIsActive(true);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingId(entry._id);
    setDay(entry.day);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setSubjectCode(entry.subjectCode);
    setSubjectName(entry.subjectName);
    setFacultyId(entry.facultyId || "");
    setFacultyName(entry.facultyName || "");
    setRoom(entry.room || "");
    setSemester(entry.semester || "6");
    setDivision(entry.division || "A");
    setBatch(entry.batch || "");
    setLectureType(entry.lectureType || "Lecture");
    setIsActive(entry.isActive !== undefined ? entry.isActive : true);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleFacultyChange = (e) => {
    const selectedEmpId = e.target.value;
    setFacultyId(selectedEmpId);
    if (!selectedEmpId) {
      setFacultyName("");
    } else {
      const emp = employees.find((em) => em._id === selectedEmpId);
      if (emp) {
        setFacultyName(emp.name);
      }
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!day || !startTime || !endTime || !subjectCode.trim() || !subjectName.trim()) {
      setError("Please fill all required fields: Day, Start Time, End Time, Subject Code, Subject Name");
      return;
    }

    try {
      const url = editingId
        ? getApiUrl(`/api/timetable/${editingId}`)
        : getApiUrl("/api/timetable");
      const method = editingId ? "PUT" : "POST";

      const payload = {
        day,
        startTime,
        endTime,
        subjectCode: subjectCode.trim(),
        subjectName: subjectName.trim(),
        facultyId: facultyId || null,
        facultyName: facultyName.trim(),
        room: room.trim(),
        semester: semester.trim(),
        division: division.trim(),
        batch: batch.trim(),
        lectureType,
        isActive,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save lecture entry");
        return;
      }

      setSuccessMsg(data.message || "Timetable lecture saved successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError("Server connection error while saving lecture");
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lecture from timetable?")) return;

    try {
      const res = await fetch(getApiUrl(`/api/timetable/${id}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTimetable(timetable.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error("Delete timetable error:", err);
    }
  };

  const filteredEntries =
    selectedDay === "All"
      ? timetable
      : timetable.filter((t) => t.day === selectedDay);

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-black">
            Timetable <span className="text-cyan-400">Manager</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Configure weekly college lecture timetable with day, time, subjects & assigned faculty
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          <span>＋</span>
          <span>Add Lecture</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-2xl mb-6 text-sm">
          {successMsg}
        </div>
      )}

      {/* Day Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", ...daysOfWeek].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              selectedDay === d
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 hover:bg-slate-700 text-gray-400"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Timetable Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading timetable entries...</div>
      ) : (
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-cyan-500/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/90 text-white text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Day</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Faculty</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Class / Batch</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      No timetable lectures found for {selectedDay}. Click "Add Lecture" to schedule one!
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr
                      key={entry._id}
                      className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4 pl-6 font-bold text-cyan-400">{entry.day}</td>
                      <td className="p-4 text-white font-mono text-xs">
                        {entry.startTime} – {entry.endTime}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{entry.subjectName}</span>
                        <span className="text-xs text-gray-400 font-mono">{entry.subjectCode}</span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {entry.facultyName || <span className="text-gray-500 italic">Unassigned</span>}
                      </td>
                      <td className="p-4 text-gray-300">{entry.room || "—"}</td>
                      <td className="p-4 text-gray-300 text-xs">
                        Sem {entry.semester || 6} • Div {entry.division || "A"}
                        {entry.batch ? ` (Batch ${entry.batch})` : ""}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            entry.lectureType === "Practical"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {entry.lectureType || "Lecture"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(entry)}
                          className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 rounded-xl font-semibold text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition border border-red-500/30"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black mb-6">
              {editingId ? "Edit Timetable Lecture" : "Add Lecture to Timetable"}
            </h3>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Day *
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                    required
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSC601"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Machine Learning"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                  Assign Faculty Member
                </label>
                <select
                  value={facultyId}
                  onChange={handleFacultyChange}
                  className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400 mb-2"
                >
                  <option value="">-- Choose Registered Faculty / HOD --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.role?.toUpperCase() || "FACULTY"})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom Faculty Name (e.g. Prof. B. Patel)"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="Room 201"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    placeholder="6"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Division
                  </label>
                  <input
                    type="text"
                    placeholder="A"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Batch (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B1"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                  Lecture Type
                </label>
                <select
                  value={lectureType}
                  onChange={(e) => setLectureType(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none text-white focus:border-cyan-400"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Practical">Practical / Lab</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveLectureCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-cyan-500"
                />
                <label htmlFor="isActiveLectureCheck" className="text-sm font-semibold text-gray-300">
                  Active (scheduled for live attendance)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-bold text-white shadow-lg transition"
                >
                  {editingId ? "Save Changes" : "Create Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
