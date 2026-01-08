import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import ScheduleForm from "../../../components/forms/ScheduleForm";
import { getSchedule, updateSchedule } from "../../../api/schedules.api";

export default function ScheduleEdit() {
  const { code } = useParams(); // ✅ must be :code in route
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const res = await getSchedule(code);
        const obj = res.data?.schedule || res.data?.data || res.data;
        if (!obj) throw new Error("Schedule not found");
        if (mounted) setInitial(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [code]);

  const onSubmit = async (payload) => {
    await updateSchedule(code, payload);
    nav(`/staff/schedules/${encodeURIComponent(code)}`);
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Schedule</h2>

        {/* ✅ keep wrapper for future buttons */}
        <div className="flex gap-2">
          <Link to={`/staff/schedules/${encodeURIComponent(code)}`}>
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
        {!initial ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <ScheduleForm initial={initial} onSubmit={onSubmit} submitText="Update" />
        )}
      </div>
    </PageShell>
  );
}
