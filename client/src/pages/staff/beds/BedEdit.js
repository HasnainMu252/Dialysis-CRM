import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import BedForm from "../../../components/forms/BedForm";
import { getBed, updateBed } from "../../../api/beds.api";

export default function BedEdit() {
  const { code } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const res = await getBed(code);
        const obj = res.data?.bed || res.data?.data || res.data;
        if (!obj) throw new Error("Bed not found");
        if (mounted) setInitial(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
    return () => { mounted = false; };
  }, [code]);

  const onSubmit = async (payload) => {
    await updateBed(code, payload); // ✅ full body update
    nav(`/staff/beds/${encodeURIComponent(code)}`);
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Bed</h2>
        <Link to={`/staff/beds/${encodeURIComponent(code)}`}>
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {!initial ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <BedForm initial={initial} onSubmit={onSubmit} submitText="Update" />
        )}
      </div>
    </PageShell>
  );
}
