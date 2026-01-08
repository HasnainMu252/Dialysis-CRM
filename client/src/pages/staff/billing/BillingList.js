import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Toast from "../../../components/ui/Toast";
import Input from "../../../components/ui/Input";
import { deleteBill, listBills, updateBill } from "../../../api/billing.api";

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
};

const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";

  return dt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // ✅ 12-hour format with AM/PM
  });
};

export default function BillingList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await listBills();
      const list = Array.isArray(res?.data?.billings) ? res.data.billings : [];
      setRows(list);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load");
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      const code = String(r?.billingCode || "").toLowerCase();
      const mrn = String(r?.patientMrn || "").toLowerCase();
      const name = String(r?.patientName || "").toLowerCase();
      const schedule = String(r?.scheduleCode || "").toLowerCase();
      return (
        code.includes(s) || mrn.includes(s) || name.includes(s) || schedule.includes(s)
      );
    });
  }, [rows, q]);

  const onDelete = async (billingCode) => {
    if (!billingCode) {
      setErr("Billing code missing.");
      return;
    }
    if (!window.confirm(`Delete bill ${billingCode}?`)) return;

    setErr("");
    try {
      await deleteBill(billingCode);
      setRows((prev) => prev.filter((x) => x.billingCode !== billingCode));
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const onPay = async (billingCode) => {
    if (!billingCode) {
      setErr("Billing code missing.");
      return;
    }

    if (!window.confirm(`Mark ${billingCode} as Paid?`)) return;

    setErr("");
    try {
      await updateBill(billingCode, { status: "Paid" });

      // ✅ Update UI instantly (status + paidAt)
      setRows((prev) =>
        prev.map((b) =>
          b.billingCode === billingCode
            ? {
                ...b,
                status: "Paid",
                paidAt: new Date().toISOString(), // ✅ visible immediately
              }
            : b
        )
      );
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Payment failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="mt-1 text-sm text-slate-500">Invoices / bills management.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Reloading..." : "Reload"}
          </Button>
          <Link to="/staff/billing/new">
            <Button>Add New</Button>
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Input
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="BILL code / MRN / name / schedule"
        />
        <Button variant="outline" onClick={() => setQ("")}>
          Clear
        </Button>
      </div>

      <div className="mt-5">
        <Table
          columns={[
            { key: "billingCode", title: "Bill Code", render: (r) => r?.billingCode || "-" },
            { key: "patientMrn", title: "MRN", render: (r) => r?.patientMrn || "-" },
            { key: "patientName", title: "Patient", render: (r) => r?.patientName || "-" },
            { key: "scheduleCode", title: "Schedule", render: (r) => r?.scheduleCode || "-" },
            { key: "amount", title: "Amount", render: (r) => (r?.amount ?? "-") },
            { key: "paymentMethod", title: "Method", render: (r) => r?.paymentMethod || "-" },
            { key: "status", title: "Status", render: (r) => r?.status || "-" },
            { key: "createdAt", title: "Created", render: (r) => fmtDate(r?.createdAt) },

            // ✅ NEW COLUMN
            {
              key: "paidAt",
              title: "Paid At",
              render: (r) => fmtDateTime(r?.paidAt),
            },

            {
              key: "actions",
              title: "Actions",
              render: (r) => {
                const code = r?.billingCode;
                const isPaid = r?.status === "Paid";

                return (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => nav(`/staff/billing/${encodeURIComponent(code)}`)}
                      disabled={!code}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => nav(`/staff/billing/${encodeURIComponent(code)}/edit`)}
                      disabled={!code}
                    >
                      Edit
                    </Button>

                    {!isPaid && (
                      <Button size="sm" variant="success" onClick={() => onPay(code)} disabled={!code}>
                        Pay
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(code)}
                      disabled={!code}
                    >
                      Delete
                    </Button>
                  </div>
                );
              },
            },
          ]}
          rows={filtered}
        />
      </div>
    </PageShell>
  );
}
