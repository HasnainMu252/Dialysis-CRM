import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import ShiftForm from "../../../components/forms/ShiftForm";
import { addShiftStaff, createShift } from "../../../api/shifts.api";

export default function ShiftCreate() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const onSubmit = async (payload) => {
    setErr("");
    // create shift
    const res = await createShift({
      code: payload.code || undefined,
      name: payload.name,
      startTime: payload.startTime,
      endTime: payload.endTime,
      isActive: payload.isActive,
    });

    // get created code (backend may return shift/code)
    const created = res.data?.shift || res.data?.data || res.data;
    const code = created?.code || res.data?.code;

    // assign nurses
    if (code && Array.isArray(payload.nurseIds) && payload.nurseIds.length) {
      for (const userId of payload.nurseIds) {
        await addShiftStaff(code, { userId });
      }
    }

    nav("/staff/shifts");
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add Shift</h2>
        <Button variant="outline" onClick={() => nav("/staff/shifts")}>Back</Button>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        <ShiftForm onSubmit={onSubmit} submitText="Create" />
      </div>
    </PageShell>
  );
}
