import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import BillingForm from "../../../components/forms/BillingForm";
import { createBill } from "../../../api/billing.api";

export default function BillingNew() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const onSubmit = async (payload) => {
    setErr("");
    try {
      await createBill(payload);
      nav("/staff/billing");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Create failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create Bill</h2>
        <Link to="/staff/billing"><Button variant="outline">Back</Button></Link>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        <BillingForm onSubmit={onSubmit} submitText="Create" />
      </div>
    </PageShell>
  );
}
