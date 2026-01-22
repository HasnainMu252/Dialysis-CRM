import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import Input from "../../../components/ui/Input";
import ShiftForm from "../../../components/forms/ShiftForm";
import { getShift, updateShift, assignStaff, removeStaff } from "../../../api/shifts.api";
import { listUsers } from "../../../api/users.api";

// Role badge colors
const roleBadge = (role) => {
  const colors = {
    Nurse: "bg-blue-100 text-blue-700",
    CaseManager: "bg-green-100 text-green-700",
    Biller: "bg-orange-100 text-orange-700",
  };
  return colors[role] || "bg-gray-100 text-gray-700";
};

export default function ShiftEdit() {
  const { code } = useParams();
  const nav = useNavigate();

  // Shift data
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Staff assignment
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [staffErr, setStaffErr] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");

  // Fetch shift data
  const fetchShift = async () => {
    setErr("");
    setLoading(true);

    try {
      const res = await getShift(code);
      const obj = res.data?.shift || res.data?.data || res.data;

      if (!obj) throw new Error("Shift not found");

      console.log("[ShiftEdit] Loaded shift:", obj);
      setInitial(obj);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available staff (Nurse, CaseManager, Biller only)
  const fetchAvailableStaff = async () => {
    try {
      const res = await listUsers({ active: true });
      const users = res.data?.users || [];
      
      // Filter only roles that can be assigned to shifts
      const eligible = users.filter((u) =>
        ["Nurse", "CaseManager", "Biller"].includes(u.role)
      );
      
      setAvailableStaff(eligible);
    } catch (e) {
      console.error("Failed to load staff:", e);
    }
  };

  useEffect(() => {
    fetchShift();
    fetchAvailableStaff();
  }, [code]);

  // Update shift details
  const handleSubmit = async (payload) => {
    setErr("");
    setSuccess("");

    console.log("[ShiftEdit] Updating shift with payload:", payload);

    await updateShift(code, payload);

    setSuccess("Shift updated successfully!");
    setTimeout(() => nav("/staff/shifts"), 1000);
  };

  // Assign staff to shift
  const handleAssignStaff = async () => {
    if (!selectedUserId) {
      setStaffErr("Please select a staff member");
      return;
    }

    setStaffErr("");
    setStaffSuccess("");
    setAssigning(true);

    try {
      console.log("[ShiftEdit] Assigning staff:", selectedUserId, "to shift:", code);
      
      const res = await assignStaff(code, selectedUserId);
      
      // Update local state with new shift data
      const updatedShift = res.data?.shift;
      if (updatedShift) {
        setInitial(updatedShift);
      } else {
        // Refetch if response doesn't include updated shift
        await fetchShift();
      }

      setStaffSuccess(`Staff assigned successfully!`);
      setSelectedUserId("");
      
      setTimeout(() => setStaffSuccess(""), 3000);
    } catch (e) {
      setStaffErr(e?.response?.data?.message || e.message || "Failed to assign staff");
    } finally {
      setAssigning(false);
    }
  };

  // Remove staff from shift
  const handleRemoveStaff = async (userId) => {
    if (!window.confirm("Remove this staff member from the shift?")) return;

    setStaffErr("");
    setStaffSuccess("");

    try {
      console.log("[ShiftEdit] Removing staff:", userId, "from shift:", code);
      
      const res = await removeStaff(code, userId);
      
      // Update local state
      const updatedShift = res.data?.shift;
      if (updatedShift) {
        setInitial(updatedShift);
      } else {
        await fetchShift();
      }

      setStaffSuccess("Staff removed successfully!");
      setTimeout(() => setStaffSuccess(""), 3000);
    } catch (e) {
      setStaffErr(e?.response?.data?.message || e.message || "Failed to remove staff");
    }
  };

  // Get staff members not already assigned
  const getUnassignedStaff = () => {
    const assignedIds = (initial?.staff || []).map((s) => s.userId || s._id);
    
    return availableStaff.filter((user) => {
      const userId = user.userId || user.id;
      return !assignedIds.some((id) => 
        id === userId || id === user.id || id === user._id
      );
    });
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Edit Shift: {code}</h2>
          {initial && (
            <p className="text-sm text-slate-500">
              {initial.name} ({initial.startTime} - {initial.endTime})
            </p>
          )}
        </div>
        <Link to="/staff/shifts">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {/* Global Alerts */}
      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} onClose={() => setErr("")} />
        </div>
      )}
      {success && (
        <div className="mt-4">
          <Toast type="success" message={success} />
        </div>
      )}

      {loading ? (
        <div className="mt-5 rounded-2xl border bg-white p-8 text-center">
          <div className="text-sm text-slate-500">
            <svg
              className="inline-block h-5 w-5 animate-spin mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading shift...
          </div>
        </div>
      ) : !initial ? (
        <div className="mt-5 rounded-2xl border bg-white p-8 text-center">
          <div className="text-red-500 mb-4">Failed to load shift</div>
          <Link to="/staff/shifts">
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {/* Left: Shift Details Form */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-semibold mb-4 pb-2 border-b">
              Shift Details
            </h3>
            <ShiftForm
              initial={initial}
              onSubmit={handleSubmit}
              submitText="Update Shift"
            />
          </div>

          {/* Right: Staff Assignment */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-semibold mb-4 pb-2 border-b">
              Staff Assignment
            </h3>

            {/* Staff Alerts */}
            {staffErr && (
              <div className="mb-4">
                <Toast type="error" message={staffErr} onClose={() => setStaffErr("")} />
              </div>
            )}
            {staffSuccess && (
              <div className="mb-4">
                <Toast type="success" message={staffSuccess} onClose={() => setStaffSuccess("")} />
              </div>
            )}

            {/* Assign New Staff */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Add Staff Member
              </label>
              
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={assigning}
                >
                  <option value="">Select staff member...</option>
                  {getUnassignedStaff().map((user) => (
                    <option key={user.userId || user.id} value={user.userId || user.id}>
                      {user.name} - {user.role} ({user.userId})
                    </option>
                  ))}
                </select>
                
                <Button
                  onClick={handleAssignStaff}
                  disabled={!selectedUserId || assigning}
                >
                  {assigning ? "Adding..." : "Add"}
                </Button>
              </div>

              {getUnassignedStaff().length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  All eligible staff members are already assigned to this shift.
                </p>
              )}
            </div>

            {/* Current Staff List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700">
                  Assigned Staff
                </h4>
                <span className="text-xs text-slate-500">
                  {initial.staff?.length || 0} member(s)
                </span>
              </div>

              {!initial.staff || initial.staff.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-xl">
                  <svg
                    className="mx-auto h-8 w-8 text-slate-300 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  No staff assigned yet
                </div>
              ) : (
                <div className="space-y-2">
                  {initial.staff.map((member, index) => {
                    // Handle both populated and non-populated data
                    const userId = member.userId?.userId || member.userId || member._id;
                    const name = member.userId?.name || member.name || "Unknown";
                    const email = member.userId?.email || member.email || "";
                    const role = member.role || member.userId?.role || "Staff";

                    return (
                      <div
                        key={userId || index}
                        className="flex items-center justify-between p-3 bg-white border rounded-xl hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div>
                            <div className="font-medium text-slate-900">
                              {name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {userId && (
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                  {userId}
                                </span>
                              )}
                              {email && <span>{email}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge(role)}`}>
                            {role}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRemoveStaff(userId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}