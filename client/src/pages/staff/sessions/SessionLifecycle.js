import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Toast from "../../../components/ui/Toast";
import Table from "../../../components/ui/Table";
import { useAuth } from "../../../auth/AuthContext";
import {
  checkin,
  startSession,
  completeSession,
  markNoShow,
} from "../../../api/lifecycle.api";
import { listSchedules } from "../../../api/schedules.api";

export default function SessionLifecycle() {
  const { staff, loading: authLoading } = useAuth();

  const role = staff?.role || ""; // Admin | Nurse | CaseManager
  const canCheckin = ["Admin", "Nurse", "CaseManager"].includes(role);
  const canStart = ["Admin", "Nurse"].includes(role);
  const canComplete = ["Admin", "Nurse"].includes(role);
  const canNoShow = ["Admin", "Nurse"].includes(role);

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "info", text: "" });

  const getCode = (r) => r?.scheduleCode || r?.scheduleId || r?.code || r?.id || "";

  const load = async () => {
    setMsg({ type: "info", text: "" });
    setBusy(true);
    try {
      const res = await listSchedules();
      const list = Array.isArray(res.data?.schedules) ? res.data.schedules : [];
      setRows(list);
    } catch (e) {
      setRows([]);
      setMsg({
        type: "error",
        text: e?.response?.data?.message || e.message || "Failed to load schedules",
      });
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
      const code = getCode(r).toLowerCase();
      const mrn = String(r.patientMrn || "").toLowerCase();
      const name = String(
        r.patientName ||
          `${r.patient?.firstName || ""} ${r.patient?.lastName || ""}`.trim()
      ).toLowerCase();
      const bed = String(r.bedCode || r.bed?.code || "").toLowerCase();
      const phone = String(r.patientPhone || r.patient?.phone || "").toLowerCase();
      return (
        code.includes(s) ||
        mrn.includes(s) ||
        name.includes(s) ||
        bed.includes(s) ||
        phone.includes(s)
      );
    });
  }, [rows, q]);

  const selectedCode = getCode(selected);

  const run = async (fn, label) => {
  setMsg({ type: "info", text: "" });
  try {
    if (!selectedCode) throw new Error("Select a schedule first");

    const res = await fn(selectedCode);

    const updated = res.data?.schedule; // ✅ backend sends updated schedule here
    const updatedCode = updated?.code || updated?.scheduleCode || updated?.scheduleId;

    // ✅ optimistic update rows so state changes instantly
    if (updated && updatedCode) {
      setRows((prev) =>
        prev.map((r) => {
          const code = getCode(r);
          if (code !== updatedCode) return r;

          return {
            ...r,
            state: updated.state || r.state,
            status: updated.status || r.status,
            updatedAt: updated.updatedAt || r.updatedAt,
          };
        })
      );

      // ✅ also update selected card
      setSelected((prev) =>
        prev ? { ...prev, state: updated.state || prev.state, status: updated.status || prev.status } : prev
      );
    }

    setMsg({ type: "success", text: res.data?.message || `${label} success` });

    // Optional reload if you want:
    // await load();
  } catch (e) {
    setMsg({
      type: "error",
      text: e?.response?.data?.message || e.message || `${label} failed`,
    });
  }
};


  if (authLoading) {
    return (
      <PageShell>
        <div className="text-sm text-slate-500">Loading auth...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Session Lifecycle</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a scheduled patient and perform lifecycle actions.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Logged in as: <b>{role || "Unknown"}</b>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Reloading..." : "Reload"}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Input
          label="Search schedules"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Schedule code / MRN / patient name / bed / phone"
        />
      </div>

      {msg?.text ? (
        <div className="mt-4">
          <Toast type={msg.type} message={msg.text} />
        </div>
      ) : null}

      {/* Selected card + actions */}
      <div className="mt-4 rounded-2xl border bg-white p-4">
        <div className="text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold">Selected:</div>
            <div>{selectedCode || "-"}</div>
            {selected?.patientMrn ? <div className="text-slate-600">| MRN: {selected.patientMrn}</div> : null}
            {selected?.patientName ? <div className="text-slate-600">| {selected.patientName}</div> : null}
            {selected?.bedCode ? <div className="text-slate-600">| Bed: {selected.bedCode}</div> : null}
            {selected?.state ? <div className="text-slate-600">| State: {selected.state}</div> : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!canCheckin || !selectedCode}
              onClick={() => run(checkin, "Check-in")}
              title={!canCheckin ? "Not allowed for your role" : ""}
            >
              Check-in
            </Button>

            <Button
              disabled={!canStart || !selectedCode}
              onClick={() => run(startSession, "Start")}
              title={!canStart ? "Not allowed for your role" : ""}
            >
              Start
            </Button>

            <Button
              variant="outline"
              disabled={!canComplete || !selectedCode}
              onClick={() => run(completeSession, "Complete")}
              title={!canComplete ? "Not allowed for your role" : ""}
            >
              Complete
            </Button>

            <Button
              variant="danger"
              disabled={!canNoShow || !selectedCode}
              onClick={() => run(markNoShow, "No-show")}
              title={!canNoShow ? "Not allowed for your role" : ""}
            >
              No-show
            </Button>
          </div>
        </div>
      </div>

      {/* Schedules list */}
      <div className="mt-5">
        <Table
          columns={[
            { key: "code", title: "Code", render: (r) => getCode(r) || "-" },
            { key: "mrn", title: "MRN", render: (r) => r.patientMrn || "-" },
            {
              key: "patient",
              title: "Patient",
              render: (r) =>
                r.patientName ||
                `${r.patient?.firstName || ""} ${r.patient?.lastName || ""}`.trim() ||
                "-",
            },
            { key: "phone", title: "Phone", render: (r) => r.patientPhone || r.patient?.phone || "-" },
            { key: "bed", title: "Bed", render: (r) => r.bedCode || r.bed?.code || "-" },
            { key: "date", title: "Date", render: (r) => String(r.date || "").slice(0, 10) || "-" },
            { key: "time", title: "Time", render: (r) => `${r.startTime || "-"} - ${r.endTime || "-"}` },
            { key: "status", title: "Status", render: (r) => r.status || "-" },
            { key: "state", title: "State", render: (r) => r.state || "-" },
            {
              key: "select",
              title: "Select",
              render: (r) => {
                const code = getCode(r);
                const isSel = code && code === selectedCode;
                return (
                  <Button size="sm" variant={isSel ? "outline" : "default"} onClick={() => setSelected(r)}>
                    {isSel ? "Selected" : "Select"}
                  </Button>
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
