import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { getShift, removeShiftStaff, updateShift } from "../../../api/shifts.api";

// ✅ helper (top of file)
const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString(); // date + time
};

export default function ShiftView() {
  const { code } = useParams();
  const nav = useNavigate();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(""); // busy nurse id
  const [busyShift, setBusyShift] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const res = await getShift(code);
      // depending backend shape:
      const obj = res.data?.shift || res.data?.data || res.data;
      if (!obj) throw new Error("Shift not found");
      setRow(obj);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Load failed");
    }
  };

  useEffect(() => {
    load();
  }, [code]);

  const onRemoveNurse = async (userId) => {
    if (!userId) return;
    if (!window.confirm("Remove this nurse from shift?")) return;
    setBusyId(userId);
    setErr("");
    try {
      await removeShiftStaff(code, userId);
      // update UI locally
      setRow((prev) => ({
        ...prev,
        staff: (prev?.staff || []).filter((s) => s?.userId?._id !== userId),
      }));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Remove failed");
    } finally {
      setBusyId("");
    }
  };

  const onDeactivate = async () => {
    if (!window.confirm(`Deactivate shift ${code}?`)) return;
    setBusyShift(true);
    setErr("");
    try {
      await updateShift(code, { isActive: false });
      setRow((prev) => ({ ...prev, isActive: false }));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Deactivate failed");
    } finally {
      setBusyShift(false);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Shift Details</h2>
        <div className="flex gap-2">
          <Link to={`/staff/shifts/${encodeURIComponent(code)}/edit`}>
            <Button>Edit</Button>
          </Link>
          <Button variant="outline" onClick={() => nav("/staff/shifts")}>
            Back
          </Button>
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
          <div className="grid gap-3 text-sm">
            <div>
              <b>Code:</b> {row.code || "-"}
            </div>
            <div>
              <b>Name:</b> {row.name || "-"}
            </div>

            {/* ✅ NEW: created date/time */}
            <div>
              <b>Created:</b> {fmtDateTime(row.createdAt)}
            </div>

            <div>
              <b>Start:</b> {row.startTime || "-"}
            </div>
            <div>
              <b>End:</b> {row.endTime || "-"}
            </div>
            <div>
              <b>Active:</b> {row.isActive ? "Yes" : "No"}
            </div>

            <div className="pt-2">
              <b>Assigned Nurses:</b>
              <div className="mt-2 grid gap-2">
                {(row.staff || []).length === 0 ? (
                  <div className="text-slate-500">No staff assigned</div>
                ) : (
                  row.staff.map((s) => {
                    const user = s.userId || {};
                    const uid = user._id;
                    return (
                      <div
                        key={s._id}
                        className="rounded-xl border p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{user.name || "-"}</div>
                          <div className="text-xs text-slate-600">
                            {user.email || "-"}
                          </div>
                          <div className="text-xs text-slate-600">
                            {user.role || s.role || "-"}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={!uid || busyId === uid}
                          onClick={() => onRemoveNurse(uid)}
                        >
                          {busyId === uid ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <Button variant="outline" onClick={load}>
                Reload
              </Button>
              <Button variant="danger" disabled={busyShift} onClick={onDeactivate}>
                {busyShift ? "Deactivating..." : "Deactivate Shift"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
