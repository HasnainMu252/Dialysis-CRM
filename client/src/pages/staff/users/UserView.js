import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { getUser, toggleUserActive, deleteUser } from "../../../api/users.api";

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleString();
};

const roleBadge = (role) => {
  const colors = {
    Admin: "bg-purple-100 text-purple-700",
    Nurse: "bg-blue-100 text-blue-700",
    CaseManager: "bg-green-100 text-green-700",
    Biller: "bg-orange-100 text-orange-700",
    Patient: "bg-gray-100 text-gray-700",
  };
  return colors[role] || "bg-gray-100 text-gray-700";
};

export default function UserView() {
  const { id } = useParams(); // This is now userId (e.g., "usr-01")
  const nav = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      setErr("");
      setLoading(true);
      
      try {
        const res = await getUser(id);
        const obj = res.data?.user;
        
        if (!obj) throw new Error("User not found");
        if (mounted) setUser(obj);
      } catch (e) {
        if (mounted) {
          setErr(e?.response?.data?.message || e.message || "Failed to load user");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleToggle = async () => {
    if (!user) return;
    
    try {
      const res = await toggleUserActive(id);
      const updated = res.data?.user;
      
      if (updated) {
        setUser(updated);
        setSuccess(`User ${updated.active ? "activated" : "deactivated"} successfully`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Toggle failed");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    
    try {
      await deleteUser(id);
      nav("/staff/users");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Details</h2>
        <div className="flex gap-2">
          <Link to="/staff/users">
            <Button variant="outline">Back to List</Button>
          </Link>
          {user && (
            <>
              <Link to={`/staff/users/${id}/edit`}>
                <Button>Edit</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} onClose={() => setErr("")} />
        </div>
      )}
      {success && (
        <div className="mt-4">
          <Toast type="success" message={success} onClose={() => setSuccess("")} />
        </div>
      )}

      {/* Content */}
      <div className="mt-5 rounded-2xl border bg-white p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
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
              Loading user...
            </div>
          </div>
        ) : !user ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">User not found</div>
            <Link to="/staff/users">
              <Button variant="outline">Go Back</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">
                  Basic Information
                </h3>
                
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      User ID
                    </label>
                    <div className="mt-1 font-mono text-sm bg-slate-100 px-3 py-2 rounded-lg">
                      {user.userId || "-"}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="mt-1 text-slate-900 font-medium">
                      {user.name}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      Email
                    </label>
                    <div className="mt-1 text-slate-900">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      Role
                    </label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Dates */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">
                  Status & Activity
                </h3>

                <div className="grid gap-3">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      Created At
                    </label>
                    <div className="mt-1 text-slate-900">
                      {fmtDate(user.createdAt)}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      Last Updated
                    </label>
                    <div className="mt-1 text-slate-900">
                      {fmtDate(user.updatedAt)}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wide">
                      MongoDB ID
                    </label>
                    <div className="mt-1 font-mono text-xs text-slate-500 break-all">
                      {user.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-4 flex gap-3">
              <Button
                variant={user.active ? "warning" : "success"}
                onClick={handleToggle}
              >
                {user.active ? "Deactivate User" : "Activate User"}
              </Button>
              
              <Button variant="danger" onClick={handleDelete}>
                Delete User
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}