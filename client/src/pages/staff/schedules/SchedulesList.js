import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Toast from "../../../components/ui/Toast";
import Input from "../../../components/ui/Input";
import { deleteSchedule, listSchedules } from "../../../api/schedules.api";
import { unwrapList } from "../../../utils/unwrap";
import {
  checkin,
  startSession,
  completeSession,
  markNoShow,
} from "../../../api/lifecycle.api";

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
};

export default function SchedulesList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await listSchedules();
      const list = unwrapList(res.data, ["schedules"]);
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setRows([]);
      setErr(e?.response?.data?.message || e.message || "Failed to load schedules");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      const code = String(r?.scheduleCode || r?.scheduleId || r?.code || r?.id || "").toLowerCase();
      const mrn = String(r?.patientMrn || r?.patient?.mrn || "").toLowerCase();
      const name = String(
        r?.patientName ||
          `${r?.patient?.firstName || ""} ${r?.patient?.lastName || ""}`.trim()
      ).toLowerCase();
      const bed = String(r?.bedCode || r?.bed?.code || "").toLowerCase();

      return code.includes(s) || mrn.includes(s) || name.includes(s) || bed.includes(s);
    });
  }, [rows, q]);

  const onDelete = async (scheduleCode) => {
    if (!scheduleCode) return setErr("Schedule code missing.");
    if (!window.confirm(`Delete ${scheduleCode}?`)) return;

    setErr("");
    try {
      await deleteSchedule(scheduleCode);
      setRows((prev) =>
        prev.filter((x) => (x.scheduleCode || x.scheduleId || x.code || x.id) !== scheduleCode)
      );
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  const applyState = (code, patch) => {
    setRows((prev) =>
      prev.map((r) => {
        const c = r.scheduleCode || r.scheduleId || r.code || r.id;
        return c === code ? { ...r, ...patch } : r;
      })
    );
  };

  const runLifecycle = async (fn, code) => {
    if (!code) return;
    setErr("");
    try {
      const res = await fn(code);
      const s = res.data?.schedule;
      if (s) {
        applyState(code, {
          state: s.state,
          status: s.status,
          updatedAt: s.updatedAt,
        });
      } else {
        // fallback: refresh list if API didn't return schedule object
        await load();
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Action failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Schedules</h2>
          <p className="mt-1 text-sm text-slate-500">Manage dialysis schedules.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Reloading..." : "Reload"}
          </Button>
          <Link to="/staff/schedules/new">
            <Button>Add New</Button>
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Input
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Schedule code / MRN / name / bed"
        />
        <Button variant="outline" onClick={() => setQ("")}>
          Clear
        </Button>
      </div>

      <div className="mt-5">
        <Table
          columns={[
            {
              key: "scheduleCode",
              title: "Code",
              render: (r) => r?.scheduleCode || r?.scheduleId || r?.code || r?.id || "-",
            },
            { key: "patientMrn", title: "MRN", render: (r) => r?.patientMrn || r?.patient?.mrn || "-" },
            {
              key: "patientName",
              title: "Patient",
              render: (r) =>
                r?.patientName ||
                `${r?.patient?.firstName || ""} ${r?.patient?.lastName || ""}`.trim() ||
                "-",
            },
            { key: "bedCode", title: "Bed", render: (r) => r?.bedCode || r?.bed?.code || "-" },
            { key: "date", title: "Date", render: (r) => fmtDate(r?.date) },
            { key: "startTime", title: "Start", render: (r) => r?.startTime || "-" },
            { key: "endTime", title: "End", render: (r) => r?.endTime || "-" },
            { key: "status", title: "Status", render: (r) => r?.status || "-" },
            { key: "state", title: "State", render: (r) => r?.state || "-" },
            {
              key: "actions",
              title: "Actions",
              render: (r) => {
                const code = r?.scheduleCode || r?.scheduleId || r?.code || r?.id;
                return (
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!code}
                      onClick={() => nav(`/staff/schedules/${encodeURIComponent(code)}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      disabled={!code}
                      onClick={() => nav(`/staff/schedules/${encodeURIComponent(code)}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!code}
                      onClick={() => onDelete(code)}
                    >
                      Delete
                    </Button>

                    {/* Lifecycle */}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!code}
                      onClick={() => runLifecycle(checkin, code)}
                    >
                      Check-in
                    </Button>
                    <Button
                      size="sm"
                      disabled={!code}
                      onClick={() => runLifecycle(startSession, code)}
                    >
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!code}
                      onClick={() => runLifecycle(completeSession, code)}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!code}
                      onClick={() => runLifecycle(markNoShow, code)}
                    >
                      No-show
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
