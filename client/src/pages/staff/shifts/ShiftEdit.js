import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import ShiftForm from "../../../components/forms/ShiftForm";
import { addShiftStaff, getShift, removeShiftStaff, updateShift } from "../../../api/shifts.api";

export default function ShiftEdit() {
  const { code } = useParams(); // /staff/shifts/:code/edit
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const res = await getShift(code);
        const obj = res.data?.shift || res.data?.data || res.data;
        if (!obj) throw new Error("Shift not found");
        if (mounted) setInitial(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
    return () => { mounted = false; };
  }, [code]);

  const onSubmit = async (payload) => {
    // update main shift fields
    await updateShift(code, {
      name: payload.name,
      startTime: payload.startTime,
      endTime: payload.endTime,
      isActive: payload.isActive,
    });

    // sync nurses
    const currentIds = (initial?.staff || []).map((s) => s.userId?._id).filter(Boolean);
    const nextIds = Array.isArray(payload.nurseIds) ? payload.nurseIds : [];

    const toAdd = nextIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !nextIds.includes(id));

    for (const userId of toAdd) {
      await addShiftStaff(code, { userId });
    }
    for (const userId of toRemove) {
      await removeShiftStaff(code, userId);
    }

    nav(`/staff/shifts/${encodeURIComponent(code)}`);
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Shift</h2>
        <Link to={`/staff/shifts/${encodeURIComponent(code)}`}>
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {!initial ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <ShiftForm initial={initial} onSubmit={onSubmit} submitText="Update" />
        )}
      </div>
    </PageShell>
  );
}
