import React, { useState } from "react";
import PageShell from "../../../layouts/PageShell";
import JsonPayloadForm from "../../../components/forms/JsonPayloadForm";
import Toast from "../../../components/ui/Toast";
import { releaseBed } from "../../../api/maintenance.api";

export default function MaintenanceRelease() {
  const [err, setErr] = useState("");

  const onSubmit = async (payload) => {
    setErr("");
    try {
      await releaseBed(payload);
      setErr("Released successfully.");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Release failed");
    }
  };

  return (
    <PageShell>
      <h2 className="text-lg font-semibold">Maintenance Release</h2>
      <p className="mt-1 text-sm text-slate-500">POST /maintenance/release</p>

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {err && <Toast type={err.includes("success") ? "success" : "info"} message={err} />}
        <JsonPayloadForm initial={{}} onSubmit={onSubmit} submitText="Release" />
      </div>
    </PageShell>
  );
}
