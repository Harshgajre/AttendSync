import { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotName, setSlotName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Fetch Slots
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl("/api/slots"));
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Fetch slots error:", err);
      setError("Failed to load attendance slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const openCreateModal = () => {
    setEditingSlotId(null);
    setSlotName("");
    setStartTime("09:00");
    setEndTime("11:00");
    setDescription("");
    setIsActive(true);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (slot) => {
    setEditingSlotId(slot._id);
    setSlotName(slot.slotName);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setDescription(slot.description || "");
    setIsActive(slot.isActive !== undefined ? slot.isActive : true);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!slotName.trim() || !startTime || !endTime) {
      setError("Please fill all required slot fields");
      return;
    }

    try {
      const url = editingSlotId
        ? getApiUrl(`/api/slots/${editingSlotId}`)
        : getApiUrl("/api/slots");
      const method = editingSlotId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotName: slotName.trim(),
          startTime,
          endTime,
          description: description.trim(),
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save slot");
        return;
      }

      setSuccessMsg(data.message || "Slot saved successfully");
      setIsModalOpen(false);
      fetchSlots();
    } catch (err) {
      setError("Server error while saving slot");
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance slot?")) return;

    try {
      const res = await fetch(getApiUrl(`/api/slots/${id}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSlots(slots.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Delete slot error:", err);
    }
  };

  const handleToggleActive = async (slot) => {
    try {
      const res = await fetch(getApiUrl(`/api/slots/${slot._id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !slot.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSlots(
          slots.map((s) => (s._id === slot._id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch (err) {
      console.error("Toggle slot active error:", err);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-black">
            Attendance <span className="text-cyan-400">Slots</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Configure flexible slot time windows for automated face attendance
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          <span>＋</span>
          <span>Add New Slot</span>
        </button>
      </div>

      {/* Error & Success Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-6">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-2xl mb-6">
          {successMsg}
        </div>
      )}

      {/* Slots Table / Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading attendance slots...</div>
      ) : (
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-cyan-500/10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/90 text-white text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Slot Name</th>
                <th className="p-4">Start Time</th>
                <th className="p-4">End Time</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No attendance slots configured yet.
                  </td>
                </tr>
              ) : (
                slots.map((slot) => (
                  <tr
                    key={slot._id}
                    className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 pl-6 font-bold text-white">{slot.slotName}</td>
                    <td className="p-4 text-cyan-300 font-mono">{slot.startTime}</td>
                    <td className="p-4 text-cyan-300 font-mono">{slot.endTime}</td>
                    <td className="p-4 text-gray-400">{slot.description || "—"}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(slot)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          slot.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-gray-700/50 text-gray-400 border border-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        {slot.isActive ? "Active ✓" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(slot)}
                        className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3.5 py-1.5 rounded-xl font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot._id)}
                        className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-3.5 py-1.5 rounded-xl font-semibold transition border border-red-500/30"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            <h3 className="text-2xl font-black mb-6">
              {editingSlotId ? "Edit Attendance Slot" : "Create New Attendance Slot"}
            </h3>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                  Slot Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Slot 1 (Morning)"
                  value={slotName}
                  onChange={(e) => setSlotName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 p-3.5 rounded-xl outline-none text-white focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    Start Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3.5 rounded-xl outline-none text-white focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                    End Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 p-3.5 rounded-xl outline-none text-white focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Lecture Session"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 p-3.5 rounded-xl outline-none text-white focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-cyan-500"
                />
                <label htmlFor="isActiveCheck" className="text-sm font-semibold text-gray-300">
                  Active (available for face attendance scans)
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
                  {editingSlotId ? "Save Changes" : "Create Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
