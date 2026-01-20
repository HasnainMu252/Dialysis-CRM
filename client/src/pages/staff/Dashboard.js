import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../layouts/PageShell";
import Toast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import { todaySchedules, upcomingSchedules } from "../../api/schedules.api";
import { listPatients } from "../../api/patients.api";

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
};

const fmtTime = (t) => (t ? String(t).slice(0, 5) : "-");

const pill = (tone) => {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "warning":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "danger":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
};

const toneByStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("complete")) return "success";
  if (s.includes("cancel")) return "danger";
  if (s.includes("pending")) return "warning";
  return "neutral";
};

function StatCard({ title, value, sub, tone = "neutral" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
        </div>

        <div
          className={[
            "inline-flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-inset",
            pill(tone),
          ].join(" ")}
        >
          <span className="text-xs font-bold">●</span>
        </div>
      </div>
    </div>
  );
}

function TableShell({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [patients, setPatients] = useState([]);
  const [today, setToday] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const [pRes, tRes, uRes] = await Promise.allSettled([
          listPatients(),
          todaySchedules(),
          upcomingSchedules(),
        ]);

        if (!mounted) return;

        if (pRes.status === "fulfilled") {
          const list = Array.isArray(pRes.value?.data?.patients) ? pRes.value.data.patients : [];
          setPatients(list);
        }

        if (tRes.status === "fulfilled") {
          const list = Array.isArray(tRes.value?.data?.schedules) ? tRes.value.data.schedules : [];
          setToday(list);
        }

        if (uRes.status === "fulfilled") {
          const list = Array.isArray(uRes.value?.data?.schedules) ? uRes.value.data.schedules : [];
          setUpcoming(list);
        }
      } catch (e) {
        setErr("Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalPatients = patients.length;

    const pendingPatients = patients.filter(
      (p) => String(p.status || "").toLowerCase() === "pending"
    ).length;

    const activePatients = patients.filter(
      (p) => String(p.status || "").toLowerCase() === "active"
    ).length;

    return {
      totalPatients,
      pendingPatients,
      activePatients,
      todaySchedules: today.length,
      upcomingSchedules: upcoming.length,
    };
  }, [patients, today, upcoming]);

  const topUpcoming = useMemo(() => upcoming.slice(0, 6), [upcoming]);

  return (
    <PageShell>
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Patients, schedules & approvals overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            {new Date().toLocaleDateString()}
          </div>

          <Link to="/staff/patients/new">
            <Button>Add Patient</Button>
          </Link>
          <Link to="/staff/schedules/new">
            <Button variant="outline">Add Schedule</Button>
          </Link>
        </div>
      </div>

      {err ? (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      ) : null}

      {/* STATS */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Patients"
          value={loading ? "…" : stats.totalPatients}
          sub={loading ? "" : `${stats.activePatients} Active`}
          tone="neutral"
        />
        <StatCard
          title="Pending Patients"
          value={loading ? "…" : stats.pendingPatients}
          sub="Needs admin approval"
          tone={stats.pendingPatients ? "warning" : "success"}
        />
        <StatCard
          title="Today Schedules"
          value={loading ? "…" : stats.todaySchedules}
          sub="Scheduled today"
          tone="neutral"
        />
        <StatCard
          title="Upcoming Schedules"
          value={loading ? "…" : stats.upcomingSchedules}
          sub="Next few days"
          tone="neutral"
        />
        <StatCard
          title="System Health"
          value={loading ? "…" : "OK"}
          sub="APIs responding"
          tone="success"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Quick Actions</div>
            <div className="mt-1 text-xs text-slate-500">
              Manage patients & schedules faster
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/staff/patients">
              <Button variant="outline">View Patients</Button>
            </Link>
            <Link to="/staff/schedules">
              <Button variant="outline">View Schedules</Button>
            </Link>
            <Link to="/staff/beds">
              <Button variant="outline">Beds</Button>
            </Link>
            <Link to="/staff/shifts">
              <Button variant="outline">Shifts</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* TABLES */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* TODAY TABLE */}
        <TableShell
          title="Today Schedules"
          right={
            <Link to="/staff/schedules">
              <Button variant="outline" size="sm">Open</Button>
            </Link>
          }
        >
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : today.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              No schedules found for today.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 gap-3 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
                <div className="col-span-4">Patient</div>
                <div className="col-span-2">MRN</div>
                <div className="col-span-2">Bed</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              <div className="divide-y divide-slate-200">
                {today.map((r) => {
                  const code = r.scheduleCode || r.scheduleId || r.id;
                  const tone = toneByStatus(r.status);
                  return (
                    <div
                      key={code}
                      className="grid grid-cols-12 gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <div className="col-span-4">
                        <div className="font-medium text-slate-900">{r.patientName || "-"}</div>
                        <div className="text-xs text-slate-500">{fmtDate(r.date)}</div>
                      </div>
                      <div className="col-span-2 text-slate-700">{r.patientMrn || "-"}</div>
                      <div className="col-span-2 text-slate-700">{r.bedCode || "-"}</div>
                      <div className="col-span-2 text-slate-700">
                        {fmtTime(r.startTime)} - {fmtTime(r.endTime)}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                            pill(tone),
                          ].join(" ")}
                        >
                          {r.status || "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TableShell>

        {/* UPCOMING TABLE */}
        <TableShell
          title="Upcoming (next)"
          right={
            <Link to="/staff/schedules">
              <Button variant="outline" size="sm">Open</Button>
            </Link>
          }
        >
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              No upcoming schedules found.
            </div>
          ) : (
            <div className="space-y-3">
              {topUpcoming.map((r) => {
                const code = r.scheduleCode || r.scheduleId || r.id;
                const tone = toneByStatus(r.status);
                return (
                  <div
                    key={code}
                    className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {r.patientName || "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {r.patientMrn || "-"} • {fmtDate(r.date)} •{" "}
                          {fmtTime(r.startTime)}-{fmtTime(r.endTime)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Bed: {r.bedCode || "—"} {r.bedName ? `(${r.bedName})` : ""}
                        </div>
                      </div>

                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                          pill(tone),
                        ].join(" ")}
                      >
                        {r.status || "—"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {upcoming.length > topUpcoming.length ? (
                <div className="text-center">
                  <Link to="/staff/schedules">
                    <Button variant="outline">View all upcoming</Button>
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </TableShell>
      </div>
    </PageShell>
  );
}
