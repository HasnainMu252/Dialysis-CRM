import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Toast from "../../../components/ui/Toast";
import Input from "../../../components/ui/Input";
import { deleteUser, listUsers, toggleUserActive } from "../../../api/users.api";

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString();
};

// Helper to get the correct identifier (prefer userId, fallback to id)
const getUserIdentifier = (user) => user.userId || user.id;

// Role badge colors
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

export default function UsersList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  // Search & Filter states
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const load = useCallback(async () => {
    setErr("");
    setBusy(true);
    try {
      const params = {};
      if (q.trim()) params.q = q.trim();
      if (roleFilter) params.role = roleFilter;
      if (activeFilter) params.active = activeFilter;

      const res = await listUsers(params);

      const filtered = (res.data?.users || []).filter(
        (u) => ["CaseManager", "Biller", "Nurse"].includes(u.role)
      );
      setRows(filtered);

    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load users");
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [q, roleFilter, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);



  const clearFilters = () => {
    setQ("");
    setRoleFilter("");
    setActiveFilter("");
  };

  // ✅ Toggle using userId
  const onToggle = async (user) => {
    const identifier = getUserIdentifier(user);
    if (!identifier) return;

    try {
      const res = await toggleUserActive(identifier);
      const updated = res.data?.user;

      if (updated) {
        setRows((prev) =>
          prev.map((x) =>
            getUserIdentifier(x) === getUserIdentifier(updated) ? updated : x
          )
        );
        setSuccess(`User ${updated.active ? "activated" : "deactivated"} successfully`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        load();
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Toggle failed");
    }
  };

  // ✅ Delete using userId
  const onDelete = async (user) => {
    const identifier = getUserIdentifier(user);
    if (!identifier) return;

    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;

    try {
      await deleteUser(identifier);
      setRows((prev) => prev.filter((x) => getUserIdentifier(x) !== identifier));
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Users Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage staff accounts (Nurse/Biller/CaseManager).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Loading..." : "Reload"}
          </Button>
          <Link to="/staff/users/new">
            <Button>+ Add User</Button>
          </Link>
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

      {/* Filters */}
      <div className="mt-4 rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or email..."
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              
              <option value="Nurse">Nurse</option>
              <option value="CaseManager">CaseManager</option>
              <option value="Biller">Biller</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-slate-500">
        Showing {rows.length} user(s)
      </div>

      {/* Table */}
      <div className="mt-2">
        <Table
          columns={[
            {
              key: "userId",
              title: "User ID",
              render: (r) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                  {r.userId || "-"}
                </span>
              ),
            },
            {
              key: "name",
              title: "Name",
              render: (r) => r.name || "-",
            },
            {
              key: "email",
              title: "Email",
              render: (r) => r.email || "-",
            },
            {
              key: "role",
              title: "Role",
              render: (r) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge(r.role)}`}>
                  {r.role || "-"}
                </span>
              ),
            },
            {
              key: "active",
              title: "Status",
              render: (r) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${r.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {r.active ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "createdAt",
              title: "Created",
              render: (r) => fmtDate(r.createdAt),
            },
            {
              key: "actions",
              title: "Actions",
              render: (r) => {
                const identifier = getUserIdentifier(r);
                return (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => nav(`/staff/users/${identifier}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => nav(`/staff/users/${identifier}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={r.active ? "warning" : "success"}
                      onClick={() => onToggle(r)}
                    >
                      {r.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(r)}
                    >
                      Delete
                    </Button>
                  </div>
                );
              },
            },
          ]}
          rows={rows}
          emptyText="No users found"
        />
      </div>
    </PageShell>
  );
}