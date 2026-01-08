import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { deleteBill, getBill } from "../../../api/billing.api";

export default function BillingView() {
  const { code } = useParams(); // /staff/billing/:code
  const nav = useNavigate();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const res = await getBill(code);
        const obj = res.data?.billing || res.data?.bill || res.data?.data || res.data;
        if (mounted) setRow(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
    return () => { mounted = false; };
  }, [code]);

  const onDelete = async () => {
    if (!window.confirm(`Delete bill ${code}?`)) return;
    setBusy(true);
    try {
      await deleteBill(code);
      nav("/staff/billing");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bill Details</h2>
        <div className="flex gap-2">
          <Link to={`/staff/billing/${encodeURIComponent(code)}/edit`}>
            <Button>Edit</Button>
          </Link>
          <Button variant="outline" onClick={() => nav("/staff/billing")}>Back</Button>
        </div>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {!row ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="grid gap-2 text-sm">
            <div><b>Billing Code:</b> {row.billingCode || row.billingId || "-"}</div>
            <div><b>Patient:</b> {row.patientName || "-"} ({row.patientMrn || "-"})</div>
            <div><b>Schedule:</b> {row.scheduleCode || "-"}</div>
            <div><b>Amount:</b> {row.amount ?? "-"}</div>
            <div><b>Method:</b> {row.paymentMethod || "-"}</div>
            <div><b>Status:</b> {row.status || "-"}</div>
            <div><b>Paid At:</b> {row.paidAt ? String(row.paidAt).slice(0, 10) : "-"}</div>
            <div><b>Notes:</b> {row.notes || "-"}</div>

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
