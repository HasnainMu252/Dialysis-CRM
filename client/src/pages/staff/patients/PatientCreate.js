import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import PatientForm from "../../../components/forms/PatientForm";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import { createPatient } from "../../../api/patients.api";

export default function PatientCreate() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const onSubmit = async (payload) => {
    setErr("");
    try {
      const { mrn, ...rest } = payload;
      const body = mrn ? payload : rest;
      await createPatient(body);
      nav("/staff/patients");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Create failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create Patient</h2>
        <Link to="/staff/patients"><Button variant="outline">Back</Button></Link>
      </div>
      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}
      <div className="mt-5 rounded-2xl border bg-white p-5">
        <PatientForm onSubmit={onSubmit} submitText="Create" />
      </div>
    </PageShell>
  );
}
