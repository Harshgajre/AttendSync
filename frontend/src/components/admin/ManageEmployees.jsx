import { useEffect, useState } from "react";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/employees/all"
        );

        const data = await response.json();

        if (data.success) {
          setEmployees(data.employees);
        }
      } catch (error) {
        console.error(
          "Employee Fetch Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();

    const interval = setInterval(
      fetchEmployees,
      3000
    );

    return () =>
      clearInterval(interval);
  }, []);

  const filteredEmployees =
    employees.filter((employee) =>
      `${employee.name || ""} ${
        employee.company || ""
      }`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const handleDelete =
    async (employeeId) => {
      if (
        !window.confirm(
          "Delete Employee?"
        )
      )
        return;

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/employees/${employeeId}`,
            {
              method: "DELETE",
            }
          );

        const data =
          await response.json();

        if (data.success) {
          setEmployees(
            employees.filter(
              (emp) =>
                emp._id !==
                employeeId
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">
        <div>
          <h2 className="text-4xl font-black">
            Employees
          </h2>

          <p className="text-gray-400">
            Total Employees :
            {employees.length}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search Employee..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="bg-slate-800 px-5 py-3 rounded-2xl outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">
          Loading Employees...
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl overflow-hidden">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-4">
                  Name
                </th>
                <th className="p-4">
                  Company
                </th>
                <th className="p-4">
                  Status
                </th>
                <th className="p-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-gray-500"
                  >
                    No Employees Found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(
                  (
                    employee,
                    index
                  ) => (
                    <tr
                      key={
                        employee._id ||
                        index
                      }
                      className="border-t border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="p-4">
                        {employee.name}
                      </td>

                      <td className="p-4">
                        {employee.company}
                      </td>

                      <td className="p-4 text-green-400">
                        Active
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            handleDelete(
                              employee._id
                            )
                          }
                          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}