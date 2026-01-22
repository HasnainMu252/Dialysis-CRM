import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Toast from "../../../components/ui/Toast";
import { listShifts, deleteShift } from "../../../api/shifts.api";

export default function ShiftsList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await listShifts();
      setRows(Array.isArray(res.data?.shifts) ? res.data.shifts : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load shifts");
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (code) => {
    if (!window.confirm("Delete this shift?")) return;
    try {
      await deleteShift(code);
      setRows((prev) => prev.filter((x) => x.code !== code));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shifts</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage shift schedules and staff assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Loading..." : "Reload"}
          </Button>
          <Link to="/staff/shifts/new">
            <Button>+ Add Shift</Button>
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} onClose={() => setErr("")} />
        </div>
      )}

      <div className="mt-5">
        <Table
          columns={[
            {
              key: "code",
              title: "Code",
              render: (r) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                  {r.code}
                </span>
              ),
            },
            { key: "name", title: "Name", render: (r) => r.name || "-" },
            {
              key: "time",
              title: "Time",
              render: (r) => `${r.startTime} - ${r.endTime}`,
            },
            {
              key: "staff",
              title: "Staff",
              render: (r) => (
                <span className="text-sm">
                  {r.staff?.length || 0} assigned
                </span>
              ),
            },
            {
              key: "status",
              title: "Status",
              render: (r) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    r.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {r.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "actions",
              title: "Actions",
              render: (r) => (
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => nav(`/staff/shifts/${r.code}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => nav(`/staff/shifts/${r.code}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(r.code)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          rows={rows}
          emptyText="No shifts found"
        />
      </div>
    </PageShell>
  );
}