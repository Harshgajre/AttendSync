import { useEffect, useState } from "react";

export default function LeaveApproval() {

  const [leaveType, setLeaveType] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [leaveRequests, setLeaveRequests] =
    useState([]);

  // Fetch All Leaves
  const fetchLeaves = async () => {

    try {

      const response =
        await fetch(
          "http://localhost:5000/api/leaves/all"
        );

      const data =
        await response.json();

      if (data.success) {

        setLeaveRequests(
          data.leaves
        );

      }

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    fetchLeaves();

  }, []);

  // Submit Leave
  const handleSubmit =
    async () => {

      if (
        !leaveType ||
        !fromDate ||
        !toDate ||
        !reason
      ) {
        alert(
          "Please fill all fields"
        );
        return;
      }

      try {

        const response =
          await fetch(
            "http://localhost:5000/api/leaves/create",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                employeeName:
                  "Harsh",

                employeeId:
                  "EMP001",

                leaveType,

                fromDate,

                toDate,

                reason,

              }),

            }
          );

        const data =
          await response.json();

        if (data.success) {

          alert(
            "Leave Request Submitted"
          );

          fetchLeaves();

          setLeaveType("");
          setFromDate("");
          setToDate("");
          setReason("");

        }

      } catch (error) {

        console.log(error);

      }

    };

  return (
    <div>

      <h1 className="text-4xl sm:text-5xl font-black mb-10">

        Leave
        <span className="text-green-400">
          {" "}Approval
        </span>

      </h1>

      <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-6 sm:p-8 mb-10">

        <h2 className="text-3xl font-black mb-8">

          Apply Leave

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <label className="block text-lg font-bold mb-3">

              Leave Type

            </label>

            <select
              value={leaveType}
              onChange={(e) =>
                setLeaveType(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            >

              <option value="">
                Select Leave Type
              </option>

              <option value="Casual Leave">
                Casual Leave
              </option>

              <option value="Sick Leave">
                Sick Leave
              </option>

              <option value="Emergency Leave">
                Emergency Leave
              </option>

            </select>

          </div>

          <div>

            <label className="block text-lg font-bold mb-3">

              From Date

            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

          <div>

            <label className="block text-lg font-bold mb-3">

              To Date

            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

          <div>

            <label className="block text-lg font-bold mb-3">

              Reason

            </label>

            <input
              type="text"
              placeholder="Enter reason"
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

        </div>

        <button
          onClick={handleSubmit}
          className="mt-8 w-full bg-green-500 hover:bg-green-600 py-5 rounded-2xl text-lg font-bold transition-all"
        >
          Submit Leave Request
        </button>

      </div>

      <div>

        <h2 className="text-3xl font-black mb-8">

          Leave Requests

        </h2>

        <div className="grid gap-6">

          {leaveRequests.length === 0 && (

            <div className="bg-slate-900 p-8 rounded-3xl border border-green-500/10 text-center text-gray-400 text-lg">

              No Leave Requests Yet

            </div>

          )}

          {leaveRequests.map((leave) => (

            <div
              key={leave._id}
              className="bg-slate-900 border border-green-500/10 rounded-3xl p-6"
            >

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div>

                  <h3 className="text-2xl font-black mb-3">

                    {leave.leaveType}

                  </h3>

                  <p className="text-gray-300 mb-2">

                    <span className="font-bold text-white">
                      From:
                    </span>{" "}

                    {new Date(
                      leave.fromDate
                    ).toLocaleDateString()}

                  </p>

                  <p className="text-gray-300 mb-2">

                    <span className="font-bold text-white">
                      To:
                    </span>{" "}

                    {new Date(
                      leave.toDate
                    ).toLocaleDateString()}

                  </p>

                  <p className="text-gray-300">

                    <span className="font-bold text-white">
                      Reason:
                    </span>{" "}

                    {leave.reason}

                  </p>

                </div>

                <div>

                  <div
                    className={`px-6 py-3 rounded-2xl text-center font-bold ${
                      leave.status === "Approved"
                        ? "bg-green-500"
                        : leave.status === "Rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500 text-black"
                    }`}
                  >

                    {leave.status}

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}