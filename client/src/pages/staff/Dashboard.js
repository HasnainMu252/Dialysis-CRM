import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../../layouts/PageShell";
import Toast from "../../components/ui/Toast";
import { todayWorkload } from "../../api/shifts.api";
import { todaySchedules } from "../../api/schedules.api";

// small helpers (safe + generic)
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const pickNumber = (obj, keys) => {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj?.[k];
    if (isNum(v)) return v;
  }
  return null;
};
const pickText = (obj, keys) => {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};
const formatTime = (s) => (s ? String(s).slice(0, 5) : "");
const badgeClass = (tone) => {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "danger":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
};

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value ?? <span className="text-slate-300">—</span>}
          </div>
          {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
        </div>
        <div className="h-10 w-10 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="col-span-4 h-4 rounded bg-slate-100" />
      <div className="col-span-2 h-4 rounded bg-slate-100" />
      <div className="col-span-2 h-4 rounded bg-slate-100" />
      <div className="col-span-2 h-4 rounded bg-slate-100" />
      <div className="col-span-2 h-4 rounded bg-slate-100" />
    </div>
  );
}

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [workload, setWorkload] = useState(null);
  const [today, setToday] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const [w, t] = await Promise.allSettled([todayWorkload(), todaySchedules()]);
        if (!mounted) return;

        if (w.status === "fulfilled") setWorkload(w.value?.data ?? null);
        if (t.status === "fulfilled") {
          const data = t.value?.data;
          const items = Array.isArray(data) ? data : data?.items || data?.rows || [];
          setToday(Array.isArray(items) ? items : []);
        }
      } catch (e) {
        if (mounted) setErr("Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Try to read common workload keys (works even if your backend uses different names)
  const stats = useMemo(() => {
    const w = workload || {};
    return {
      totalPatients:
        pickNumber(w, ["totalPatients", "patients", "patientCount", "total"]) ??
        pickNumber(w?.summary, ["patients", "totalPatients"]) ??
        null,
      totalSessions:
        pickNumber(w, ["totalSessions", "sessions", "sessionCount", "appointments"]) ??
        pickNumber(w?.summary, ["sessions", "totalSessions"]) ??
        null,
      occupiedBeds:
        pickNumber(w, ["occupiedBeds", "busyBeds", "bedsOccupied"]) ??
        pickNumber(w?.beds, ["occupied", "busy"]) ??
        null,
      availableBeds:
        pickNumber(w, ["availableBeds", "freeBeds", "bedsAvailable"]) ??
        pickNumber(w?.beds, ["available", "free"]) ??
        null,
    };
  }, [workload]);

  const rows = useMemo(() => {
    return (today || []).map((r, idx) => {
      // Make it resilient to different shapes
      const patientName =
        pickText(r, ["patientName", "name", "fullName"]) ||
        [pickText(r, ["firstName"]), pickText(r, ["lastName"])].filter(Boolean).join(" ") ||
        pickText(r?.patient, ["fullName", "name"]) ||
        [pickText(r?.patient, ["firstName"]), pickText(r?.patient, ["lastName"])].filter(Boolean).join(" ") ||
        `Patient #${idx + 1}`;

      const shift =
        pickText(r, ["shift", "shiftName"]) ||
        pickText(r?.shift, ["name", "title"]) ||
        "—";

      const bed =
        pickText(r, ["bed", "bedCode", "bedNo"]) ||
        pickText(r?.bed, ["code", "bedCode", "name"]) ||
        "—";

      const start =
        formatTime(pickText(r, ["startTime", "from", "start"])) ||
        formatTime(pickText(r?.slot, ["start", "from"])) ||
        "";

      const end =
        formatTime(pickText(r, ["endTime", "to", "end"])) ||
        formatTime(pickText(r?.slot, ["end", "to"])) ||
        "";

      const status =
        pickText(r, ["status", "state"]) ||
        pickText(r?.schedule, ["status"]) ||
        "Scheduled";

      const tone =
        status.toLowerCase().includes("done") || status.toLowerCase().includes("completed")
          ? "success"
          : status.toLowerCase().includes("cancel")
          ? "danger"
          : status.toLowerCase().includes("late") || status.toLowerCase().includes("pending")
          ? "warning"
          : "neutral";

      return {
        key: r?._id || r?.id || `${idx}`,
        patientName,
        shift,
        bed,
        time: start || end ? `${start || "—"} - ${end || "—"}` : "—",
        status,
        tone,
        raw: r,
      };
    });
  }, [today]);

  return (
    <PageShell>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Today overview — workload + schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {err ? (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      ) : null}

      {/* Stats */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Patients (today)"
          value={loading ? "…" : stats.totalPatients}
          hint="Total patients scheduled for today"
        />
        <StatCard
          label="Sessions (today)"
          value={loading ? "…" : stats.totalSessions}
          hint="Total dialysis sessions planned"
        />
        <StatCard
          label="Beds occupied"
          value={loading ? "…" : stats.occupiedBeds}
          hint="Currently assigned / busy beds"
        />
        <StatCard
          label="Beds available"
          value={loading ? "…" : stats.availableBeds}
          hint="Free capacity for today"
        />
      </div>

      {/* Main */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {/* Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Today Schedules</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {loading ? "Loading…" : `${rows.length} items`}
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="text-sm font-medium text-slate-900">No schedules found</div>
                <div className="mt-1 text-sm text-slate-500">
                  There are no sessions scheduled for today (or API returned empty).
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-12 gap-3 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
                  <div className="col-span-4">Patient</div>
                  <div className="col-span-2">Shift</div>
                  <div className="col-span-2">Bed</div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Status</div>
                </div>

                <div className="divide-y divide-slate-200">
                  {rows.map((r) => (
                    <div
                      key={r.key}
                      className="grid grid-cols-12 gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <div className="col-span-4">
                        <div className="font-medium text-slate-900">{r.patientName}</div>
                        <div className="mt-0.5 text-xs text-slate-500">Today</div>
                      </div>
                      <div className="col-span-2 text-slate-700">{r.shift}</div>
                      <div className="col-span-2 text-slate-700">{r.bed}</div>
                      <div className="col-span-2 text-slate-700">{r.time}</div>
                      <div className="col-span-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                            badgeClass(r.tone),
                          ].join(" ")}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Quick Insights</div>
          <div className="mt-1 text-sm text-slate-500">
            Helpful snapshot for staff on duty.
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">High-level</div>
              <div className="mt-1 text-sm text-slate-800">
                {rows.length
                  ? `You have ${rows.length} schedules listed for today.`
                  : "No schedules to show today."}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Tip</div>
              <div className="mt-1 text-sm text-slate-800">
                If any fields look “—”, send me one sample schedule JSON shape and I’ll map exact
                columns (patient, nurse, modality, chair/bed, times, status).
              </div>
            </div>

            {/* Debug (collapsible) */}
            <details className="rounded-2xl border border-slate-200 p-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-800">
                Raw API data (debug)
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-xs font-medium text-slate-600">workload</div>
                  <pre className="mt-1 max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                    {JSON.stringify(workload, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-600">todaySchedules</div>
                  <pre className="mt-1 max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                    {JSON.stringify(today, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
