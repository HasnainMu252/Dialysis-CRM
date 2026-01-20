import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import ShiftForm from "../../../components/forms/ShiftForm";
import { getShift, updateShift } from "../../../api/shifts.api";

export default function ShiftEdit() {
  const { code } = useParams();
  const nav = useNavigate();

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchShift = async () => {
      setErr("");
      setLoading(true);

      try {
        const res = await getShift(code);
        const obj = res.data?.shift || res.data?.data || res.data;

        if (!obj) throw new Error("Shift not found");

        console.log("[ShiftEdit] Loaded shift:", obj);

        if (mounted) setInitial(obj);
      } catch (e) {
        if (mounted) {
          setErr(e?.response?.data?.message || e.message || "Load failed");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchShift();
    return () => { mounted = false; };
  }, [code]);

  const handleSubmit = async (payload) => {
    setErr("");
    setSuccess("");

    console.log("[ShiftEdit] Updating shift with payload:", payload);

    await updateShift(code, payload);
    
    setSuccess("Shift updated successfully!");
    setTimeout(() => nav("/staff/shifts"), 1000);
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Shift: {code}</h2>
        <Link to="/staff/shifts">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      {success && (
        <div className="mt-4">
          <Toast type="success" message={success} />
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading shift...
          </div>
        ) : !initial ? (
          <div className="py-8 text-center">
            <div className="text-red-500 mb-4">Failed to load shift</div>
            <Link to="/staff/shifts">
              <Button variant="outline">Go Back</Button>
            </Link>
          </div>
        ) : (
          <ShiftForm
            initial={initial}
            onSubmit={handleSubmit}
            submitText="Update Shift"
          />
        )}
      </div>
    </PageShell>
  );
}