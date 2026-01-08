import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import BillingForm from "../../../components/forms/BillingForm";
import { getBill, updateBill } from "../../../api/billing.api";

export default function BillingEdit() {
  const { code } = useParams(); // /staff/billing/:code/edit
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const res = await getBill(code);
        const obj = res.data?.billing || res.data?.bill || res.data?.data || res.data;
        if (!obj) throw new Error("Bill not found");
        if (mounted) setInitial(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
    return () => { mounted = false; };
  }, [code]);

  const onSubmit = async (payload) => {
    setErr("");
    try {
      await updateBill(code, payload);
      nav(`/staff/billing/${encodeURIComponent(code)}`);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Update failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Bill</h2>
        <Link to={`/staff/billing/${encodeURIComponent(code)}`}>
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {!initial ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <BillingForm initial={initial} onSubmit={onSubmit} submitText="Update" />
        )}
      </div>
    </PageShell>
  );
}
