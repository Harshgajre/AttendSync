import { useEffect, useState } from "react";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌍 Live Database se Students ka data fetch karne ke liye useEffect
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/admin/students");
        
        if (!response.ok) {
          throw new Error("Database se data nahi aa paya!");
        }
        
        const data = await response.json();
        
        // 🔥 FIX: Backend se aane wale object me se `.students` array nikalna padega
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

  // Individual Student ko delete karne ka function
  const handleDelete = async (studentId) => {
    if (window.confirm("क्या aap is student ko delete karna chahte hain?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/student/${studentId}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          // UI se bhi hata do instant refresh ke liye
          setStudents(students.filter(std => std._id !== studentId));
          alert("Student delete ho gaya!");
        } else {
          alert("Delete karne me koi dikkat aayi.");
        }
      } catch (err) {
        console.error("Error deleting student:", err);
      }
    }
  };

  return (
    <div>
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">
        <div>
          <h2 className="text-4xl font-black">Students</h2>
          <p className="text-gray-400">
            Total Students : {students.length}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search Student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
        />
      </div>

      {/* Loading, Error aur Table state handling */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Database se Live Data load ho raha hai...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-400">⚠️ Error: {error}</div>
      ) : (
        <div className="bg-slate-900 rounded-3xl overflow-hidden">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-4">Name</th>
                <th className="p-4">College</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-gray-500">
                    Koyi bhi student nahi mila!
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student._id || index} className="border-t border-slate-800 hover:bg-slate-800/50 transition text-gray-300">
                    <td className="p-4">{student.name}</td>
                    <td className="p-4">{student.college || "N/A"}</td>
                    <td className="p-4 text-green-400">Active</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDelete(student._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
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