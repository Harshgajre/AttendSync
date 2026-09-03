import { useEffect, useState } from "react";
import { getApiUrl } from "../../config/api";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(getApiUrl("/api/admin/students"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students from database!");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching registered students:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter logic across student name, college, division, batch, and semester
  const filteredStudents = students.filter((student) => {
    const name = student.name ? student.name.toLowerCase() : "";
    const college = student.college ? student.college.toLowerCase() : "";
    const semester = student.semester ? String(student.semester).toLowerCase() : "";
    const division = student.division ? student.division.toLowerCase() : "";
    const batch = student.batch ? student.batch.toLowerCase() : "";
    const searchWord = search.toLowerCase().trim();

    return (
      name.includes(searchWord) ||
      college.includes(searchWord) ||
      semester.includes(searchWord) ||
      division.includes(searchWord) ||
      batch.includes(searchWord)
    );
  });

  const handleDelete = async (student) => {
    const studentName = student.name || "this student";
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${studentName}"?\n\nThis will permanently remove the student's registration, biometric face data, and attendance history.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(student._id);
      setNotification("");
      const token = localStorage.getItem("adminToken");
      const response = await fetch(getApiUrl(`/api/admin/student/${student._id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotification(`Student "${studentName}" was deleted successfully.`);
        // Remove locally immediately & refresh
        setStudents((prev) => prev.filter((std) => std._id !== student._id));
        await fetchStudents();
      } else {
        alert(result.message || "Failed to delete student.");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Server connection error while trying to delete student.");
    } finally {
      setDeletingId(null);
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div>
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8">
        <div>
          <h2 className="text-4xl font-black text-white">
            Registered <span className="text-cyan-400">Students</span>
          </h2>
          <p className="text-gray-400 mt-1 text-sm">
            Total Registered: <strong className="text-white">{students.length}</strong> • Face Enrolled:{" "}
            <strong className="text-emerald-400">
              {students.filter((s) => s.faceRegistered).length}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name, college, div, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 bg-slate-800 px-5 py-3 rounded-2xl outline-none border border-white/10 focus:border-cyan-400 text-white placeholder-gray-500 text-sm transition"
          />
          <button
            onClick={fetchStudents}
            title="Refresh student list"
            className="p-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-2xl border border-white/10 transition"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold text-center">
          {notification}
        </div>
      )}

      {loading && students.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
          Loading registered student database...
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl text-center text-red-400 text-sm">
          ⚠️ Error loading students: {error}
          <div className="mt-4">
            <button
              onClick={fetchStudents}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-cyan-500/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/90 text-gray-300 text-xs uppercase tracking-wider border-b border-white/10">
                  <th className="p-4 pl-6">Student Info</th>
                  <th className="p-4">College / Office</th>
                  <th className="p-4">Academic Group</th>
                  <th className="p-4">Biometric Status</th>
                  <th className="p-4">Attendance</th>
                  <th className="p-4">Reg. Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-500">
                      No registered students found matching "{search}".
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isDeleting = deletingId === student._id;

                    return (
                      <tr
                        key={student._id}
                        className="hover:bg-slate-800/50 transition duration-200 text-gray-300"
                      >
                        {/* Student Info */}
                        <td className="p-4 pl-6 font-bold text-white">
                          <div className="flex items-center gap-3.5">
                            {student.faceImage ? (
                              <img
                                src={student.faceImage}
                                alt={student.name}
                                className="w-11 h-11 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-md"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-base shadow-md">
                                {student.name ? student.name[0].toUpperCase() : "S"}
                              </div>
                            )}
                            <div>
                              <p className="text-white font-bold text-base leading-tight">
                                {student.name}
                              </p>
                              {student.electiveSubjectName && (
                                <p className="text-[11px] text-cyan-400 font-normal mt-0.5">
                                  Elective: {student.electiveSubjectName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* College */}
                        <td className="p-4 font-medium text-gray-200">
                          {student.college || "N/A"}
                        </td>

                        {/* Academic Group (Semester, Division, Batch) */}
                        <td className="p-4">
                          <div className="flex flex-col text-xs gap-0.5">
                            <span className="font-bold text-cyan-300">
                              Sem {student.semester || "1"}
                            </span>
                            <span className="text-gray-400">
                              Div: <strong className="text-white">{student.division || "All"}</strong>
                              {student.batch && (
                                <>
                                  {" "}
                                  • Batch: <strong className="text-white">{student.batch}</strong>
                                </>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Face Biometric Status */}
                        <td className="p-4">
                          {student.faceRegistered ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              ✓ Enrolled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              ● Pending
                            </span>
                          )}
                        </td>

                        {/* Attendance Count */}
                        <td className="p-4 font-bold text-emerald-400">
                          {student.attendance || 0} <span className="text-xs text-gray-400 font-normal">attended</span>
                        </td>

                        {/* Registration Date */}
                        <td className="p-4 text-xs text-gray-400">
                          {formatDate(student.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(student)}
                            disabled={isDeleting}
                            className="bg-red-500/15 hover:bg-red-600 active:scale-95 text-red-300 hover:text-white px-4 py-2 rounded-xl transition duration-200 font-semibold text-xs border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                          >
                            {isDeleting ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Deleting...
                              </>
                            ) : (
                              <>🗑 Delete</>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}