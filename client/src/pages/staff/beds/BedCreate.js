import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import BedForm from "../../../components/forms/BedForm";
import { createBed } from "../../../api/beds.api";

export default function BedCreate() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const onSubmit = async (payload) => {
    setErr("");
    await createBed(payload); // ✅ matches postman body
    nav("/staff/beds");
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add Bed</h2>
        <Button variant="outline" onClick={() => nav("/staff/beds")}>Back</Button>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        <BedForm onSubmit={onSubmit} submitText="Create" />
      </div>
    </PageShell>
  );
}
