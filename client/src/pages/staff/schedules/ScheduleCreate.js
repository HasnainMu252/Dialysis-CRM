import React from "react";
import { useNavigate, Link } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import ScheduleForm from "../../../components/forms/ScheduleForm";
import { createSchedule } from "../../../api/schedules.api";

export default function ScheduleCreate() {
  const nav = useNavigate();
  const [err, setErr] = React.useState("");

  const onSubmit = async (payload) => {
    try {
      setErr("");
      // payload from form: { patientMrn, date, shift, bed, status }
      await createSchedule(payload);
      nav("/staff/schedules");
    } catch (e) {
      setErr(e?.message || "Failed to create schedule");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add Schedule</h2>

        {/* ✅ Back using Link (as requested) */}
        <Link to="/staff/schedules">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        <ScheduleForm onSubmit={onSubmit} submitText="Create" />
      </div>
    </PageShell>
  );
}
