import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { deleteSchedule, getSchedule } from "../../../api/schedules.api";

const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString(); // ✅ date + time (user locale)
};

export default function ScheduleView() {
  const { code } = useParams(); // ✅ must be :code in route
  const nav = useNavigate();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const res = await getSchedule(code);
        // assume { success:true, schedule:{...} } OR { success:true, data:{...} } OR direct object
        const obj = res.data?.schedule || res.data?.data || res.data;
        if (!obj) throw new Error("Schedule not found");
        if (mounted) setRow(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [code]);

  const onDelete = async () => {
    if (!window.confirm(`Delete schedule ${code}?`)) return;
    setBusy(true);
    setErr("");
    try {
      await deleteSchedule(code);
      nav("/staff/schedules");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const scheduleCode =
    row?.scheduleCode || row?.scheduleId || row?.code || code;

  const patientMrn =
    row?.patientMrn || row?.mrn || row?.patient?.mrn || "-";

  const patientName =
    row?.patientName ||
    `${row?.patient?.firstName || ""} ${row?.patient?.lastName || ""}`.trim() ||
    "-";

  const bedCode =
    row?.bedCode || row?.bed?.code || row?.bed?.bedCode || "-";

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Schedule Details</h2>
        <div className="flex gap-2">
          <Link to={`/staff/schedules/${encodeURIComponent(code)}/edit`}>
            <Button>Edit</Button>
          </Link>
          <Link to="/staff/schedules">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {!row ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="grid gap-2 text-sm">
            <div>
              <b>Schedule Code:</b> {scheduleCode || "-"}
            </div>
            <div>
              <b>Patient MRN:</b> {patientMrn}
            </div>
            <div>
              <b>Patient:</b> {patientName}
            </div>
            <div>
              <b>Bed Code:</b> {bedCode}
            </div>
            <div>
              <b>Date:</b> {fmtDateTime(row?.date)}
            </div>
            <div>
              <b>Start:</b> {row?.startTime || "-"}
            </div>
            <div>
              <b>End:</b> {row?.endTime || "-"}
            </div>
            <div>
              <b>Status:</b> {row?.status || "-"}
            </div>
            <div>
              <b>State:</b> {row?.state || "-"}
            </div>

            <div className="pt-3">
              <Button variant="danger" disabled={busy} onClick={onDelete}>
                {busy ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
