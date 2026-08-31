import { useEffect, useState } from "react";
import { getApiUrl } from "../../config/api";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(getApiUrl("/api/admin/employees"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setEmployees(data.employees || []);
        }
      } catch (error) {
        console.error("Employee Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    `${employee.name || ""} ${employee.company || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(getApiUrl(`/api/admin/employee/${employeeId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setEmployees(employees.filter((emp) => emp._id !== employeeId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8">
        <div>
          <h2 className="text-4xl font-black">
            Manage <span className="text-green-400">Employees</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Total Employees: {employees.length} • Face Enrolled:{" "}
            {employees.filter((e) => e.faceRegistered).length}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search Employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 px-5 py-3 rounded-2xl outline-none border border-white/10 focus:border-green-400 text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading employee database records...</div>
      ) : (
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-green-500/10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Company / Office</th>
                <th className="p-4">Face Status</th>
                <th className="p-4">Account</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No Employees Found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee, index) => (
                  <tr
                    key={employee._id || index}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition text-gray-300"
                  >
                    <td className="p-4 pl-6 font-bold text-white flex items-center gap-3">
                      {employee.faceImage ? (
                        <img
                          src={employee.faceImage}
                          alt={employee.name}
                          className="w-10 h-10 rounded-xl object-cover border border-green-400"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white">
                          {employee.name ? employee.name[0] : "E"}
                        </div>
                      )}
                      <span>{employee.name}</span>
                    </td>

                    <td className="p-4">{employee.company || "N/A"}</td>

                    <td className="p-4">
                      {employee.faceRegistered ? (
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
                        onClick={() => handleDelete(employee._id)}
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