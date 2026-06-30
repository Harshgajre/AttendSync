import { useEffect, useState } from "react";

export default function AttendanceReports() {
  const [students, setStudents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        // Students
        const studentResponse = await fetch(
          "http://localhost:5000/api/admin/students"
        );

        const studentData =
          await studentResponse.json();

        if (studentData.success) {
          setStudents(
            studentData.students
          );
        }

        // Employees
        const employeeResponse =
          await fetch(
            "http://localhost:5000/api/employees/all"
          );

        const employeeData =
          await employeeResponse.json();

        if (employeeData.success) {
          setEmployees(
            employeeData.employees
          );
        }
      } catch (error) {
        console.error(
          "Report Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();

    const interval =
      setInterval(
        loadReports,
        3000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400">
        Loading Reports...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-5xl font-black mb-10">
        Attendance
        <span className="text-cyan-400">
          {" "}
          Reports
        </span>
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-900 border border-cyan-500/10 rounded-3xl p-8">
          <p className="text-gray-400 mb-3">
            Student Records
          </p>

          <h2 className="text-5xl font-black text-cyan-400">
            {students.length}
          </h2>

          <p className="text-gray-300 mt-4">
            Students available in database.
          </p>
        </div>

        <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-8">
          <p className="text-gray-400 mb-3">
            Employee Records
          </p>

          <h2 className="text-5xl font-black text-green-400">
            {employees.length}
          </h2>

          <p className="text-gray-300 mt-4">
            Employees available in database.
          </p>
        </div>

        <div className="bg-slate-900 border border-yellow-500/10 rounded-3xl p-8">
          <p className="text-gray-400 mb-3">
            Total Records
          </p>

          <h2 className="text-5xl font-black text-yellow-400">
            {students.length +
              employees.length}
          </h2>

          <p className="text-gray-300 mt-4">
            Total users available.
          </p>
        </div>

      </div>

      <div className="bg-slate-900 rounded-3xl p-8">

        <h2 className="text-3xl font-black mb-6">
          Latest Entries
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-slate-800 p-6 rounded-3xl">

            <h3 className="text-2xl font-bold mb-4">
              Recent Students
            </h3>

            {students
              .slice(0, 5)
              .map(
                (
                  student,
                  idx
                ) => (
                  <div
                    key={idx}
                    className="border-b border-slate-700 py-3"
                  >
                    <p className="font-bold">
                      {student.name}
                    </p>

                    <p className="text-gray-400">
                      {student.college}
                    </p>
                  </div>
                )
              )}

          </div>

          <div className="bg-slate-800 p-6 rounded-3xl">

            <h3 className="text-2xl font-bold mb-4">
              Recent Employees
            </h3>

            {employees
              .slice(0, 5)
              .map(
                (
                  employee,
                  idx
                ) => (
                  <div
                    key={idx}
                    className="border-b border-slate-700 py-3"
                  >
                    <p className="font-bold">
                      {employee.name}
                    </p>

                    <p className="text-gray-400">
                      {employee.company}
                    </p>
                  </div>
                )
              )}

          </div>

        </div>

      </div>
    </div>
  );
}