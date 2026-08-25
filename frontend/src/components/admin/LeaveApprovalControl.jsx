import { useEffect, useState } from "react";
import { getApiUrl } from "../../config/api";

export default function LeaveApprovalControl() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(getApiUrl("/api/leaves/all"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLeaveRequests(data.leaves || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(getApiUrl(`/api/leaves/approve/${id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchLeaves();
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(getApiUrl(`/api/leaves/reject/${id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchLeaves();
    } catch (error) {
      console.log(error);
    }
  };



  return (
    <div>

      <h1 className="text-4xl sm:text-5xl font-black mb-10">

        Leave
        <span className="text-cyan-400">
          {" "}Approval Control
        </span>

      </h1>

      <div className="grid gap-6">

        {leaveRequests.length === 0 && (

          <div className="bg-slate-900 p-8 rounded-3xl border border-cyan-500/10 text-center text-gray-400 text-lg">

            No Leave Requests Found

          </div>

        )}

        {leaveRequests.map((leave) => (

          <div
            key={leave._id}
            className="bg-slate-900 border border-cyan-500/10 rounded-3xl p-6"
          >

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>

                <h2 className="text-3xl font-black mb-4">

                  {leave.employeeName}

                </h2>

                <p className="text-gray-300 mb-2">

                  <span className="font-bold text-white">
                    Leave Type:
                  </span>{" "}

                  {leave.leaveType}

                </p>

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

                <p className="text-gray-300 mb-2">

                  <span className="font-bold text-white">
                    Reason:
                  </span>{" "}

                  {leave.reason}

                </p>

                {leave.approvedBy && (

                  <p className="text-green-400">

                    Approved By:
                    {" "}
                    {leave.approvedBy}

                  </p>

                )}

              </div>

              <div className="flex flex-col gap-4">

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

                {leave.status ===
                  "Pending" && (

                  <div className="flex gap-4">

                    <button
                      onClick={() =>
                        handleApprove(
                          leave._id
                        )
                      }
                      className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-2xl font-bold"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleReject(
                          leave._id
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-2xl font-bold"
                    >
                      Reject
                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}