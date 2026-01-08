import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import JsonPayloadForm from "../../../components/forms/JsonPayloadForm";
import { createReferral } from "../../../api/referrals.api";

export default function ReferralCreate() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const onSubmit = async (payload) => {
    setErr("");
    try {
      await createReferral(payload);
      nav("/staff/referrals");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Create failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create Referral</h2>
        <Link to="/staff/referrals"><Button variant="outline">Back</Button></Link>
      </div>
      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}
      <div className="mt-5 rounded-2xl border bg-white p-5">
        <JsonPayloadForm
          hint='Example: { "patientId":"...", "doctorName":"...", "hospital":"..." }'
          initial={{}}
          onSubmit={onSubmit}
          submitText="Create"
        />
      </div>
    </PageShell>
  );
}
