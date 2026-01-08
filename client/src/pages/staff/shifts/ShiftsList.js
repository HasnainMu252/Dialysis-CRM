import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Toast from "../../../components/ui/Toast";
import { deleteShift, listShifts, updateShift } from "../../../api/shifts.api";

// ✅ helper (top of file)
const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
};

export default function ShiftsList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await listShifts();
      const list = Array.isArray(res.data?.shifts) ? res.data.shifts : [];
      setRows(list);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const code = (r.code || "").toLowerCase();
      const name = (r.name || "").toLowerCase();
      return code.includes(s) || name.includes(s);
    });
  }, [rows, q]);

  const onDelete = async (code) => {
    if (!code) return setErr("Shift code missing, cannot delete.");
    if (!window.confirm(`Delete shift ${code}?`)) return;

    setErr("");
    try {
      await deleteShift(code);
      setRows((prev) => prev.filter((x) => x.code !== code));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  // ✅ Activate / Deactivate (single function)
  const setActive = async (code, isActive) => {
    if (!code) return setErr("Shift code missing.");
    const action = isActive ? "Activate" : "Deactivate";
    if (!window.confirm(`${action} shift ${code}?`)) return;

    setErr("");
    try {
      await updateShift(code, { isActive });
      setRows((prev) =>
        prev.map((x) => (x.code === code ? { ...x, isActive } : x))
      );
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || `${action} failed`);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shifts</h2>
          <p className="mt-1 text-sm text-slate-500">Create and manage shifts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Reloading..." : "Reload"}
          </Button>
          <Link to="/staff/shifts/new">
            <Button>Add New</Button>
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by code or name..."
          className="w-full max-w-lg rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <Button variant="outline" onClick={() => setQ("")}>
          Clear
        </Button>
      </div>

      <div className="mt-5">
        <Table
          columns={[
            { key: "code", title: "Code", render: (r) => r.code || "-" },
            { key: "name", title: "Name", render: (r) => r.name || "-" },
            { key: "createdAt", title: "Created", render: (r) => fmtDate(r.createdAt) },
            { key: "startTime", title: "Start", render: (r) => r.startTime || "-" },
            { key: "endTime", title: "End", render: (r) => r.endTime || "-" },
            {
              key: "nurses",
              title: "Nurses",
              render: (r) => (r.staff?.length ? r.staff.length : 0),
            },
            {
              key: "actions",
              title: "Actions",
              render: (r) => {
                const code = r.code;
                const isActive = r.isActive !== false;

                return (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => nav(`/staff/shifts/${encodeURIComponent(code)}`)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => nav(`/staff/shifts/${encodeURIComponent(code)}/edit`)}
                    >
                      Edit
                    </Button>

                    {isActive ? (
                      <button
                        onClick={() => setActive(code, false)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setActive(code, true)}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Active
                      </button>
                    )}

                    <Button size="sm" variant="danger" onClick={() => onDelete(code)}>
                      Delete
                    </Button>
                  </div>
                );
              },
            },
          ]}
          rows={filtered}
        />
      </div>
    </PageShell>
  );
}
