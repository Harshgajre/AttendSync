import { useEffect, useState } from "react";
import { getApiUrl } from "../../config/api";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
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
        console.error("Error fetching students:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter logic safely
  const filteredStudents = students.filter((student) => {
    const name = student.name ? student.name.toLowerCase() : "";
    const college = student.college ? student.college.toLowerCase() : "";
    const searchWord = search.toLowerCase();
    return name.includes(searchWord) || college.includes(searchWord);
  });

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(getApiUrl(`/api/admin/student/${studentId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setStudents(students.filter((std) => std._id !== studentId));
      }
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  return (
    <div>
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8">
        <div>
          <h2 className="text-4xl font-black">
            Manage <span className="text-cyan-400">Students</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Total Students: {students.length} • Face Enrolled:{" "}
            {students.filter((s) => s.faceRegistered).length}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search Student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 px-5 py-3 rounded-2xl outline-none border border-white/10 focus:border-cyan-400 text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading student database records...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-400">⚠️ Error: {error}</div>
      ) : (
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-cyan-500/10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">College</th>
                <th className="p-4">Semester</th>
                <th className="p-4">Face Status</th>
                <th className="p-4">Account</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No students found matching search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr
                    key={student._id || index}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition text-gray-300"
                  >
                    <td className="p-4 pl-6 font-bold text-white flex items-center gap-3">
                      {student.faceImage ? (
                        <img
                          src={student.faceImage}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover border border-cyan-400"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white">
                          {student.name ? student.name[0] : "S"}
                        </div>
                      )}
                      <span>{student.name}</span>
                    </td>
                    <td className="p-4">{student.college || "N/A"}</td>
                    <td className="p-4 text-cyan-300">Sem {student.semester || "1"}</td>
                    <td className="p-4">
                      {student.faceRegistered ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
                          ✓ Enrolled
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
                          ● Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-green-400 font-semibold">Active</td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-4 py-2 rounded-xl transition font-semibold border border-red-500/30"
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
      )}
    </div>
  );
}