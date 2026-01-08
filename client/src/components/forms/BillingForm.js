import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Toast from "../ui/Toast";
import { listPatients } from "../../api/patients.api";
import { listSchedules } from "../../api/schedules.api";

const empty = {
  patientMrn: "",
  scheduleCode: "",
  amount: "",
  paymentMethod: "Cash",
  notes: "",
};

const METHODS = ["Cash", "Card", "Bank", "Online", "Other"];

export default function BillingForm({ initial, onSubmit, submitText = "Save" }) {
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [patients, setPatients] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // load dropdowns
  useEffect(() => {
    (async () => {
      try {
        const pRes = await listPatients();
        setPatients(Array.isArray(pRes.data?.patients) ? pRes.data.patients : []);
      } catch {
        setPatients([]);
      }

      try {
        const sRes = await listSchedules();
        setSchedules(Array.isArray(sRes.data?.schedules) ? sRes.data.schedules : []);
      } catch {
        setSchedules([]);
      }
    })();
  }, []);

  // sync initial
  useEffect(() => {
    if (!initial) return;
    setForm({
      patientMrn: initial.patientMrn || "",
      scheduleCode: initial.scheduleCode || "",
      amount: initial.amount ?? "",
      paymentMethod: initial.paymentMethod || "Cash",
      notes: initial.notes || "",
    });
  }, [initial]);

  const scheduleOptions = useMemo(() => {
    // optional: only show schedules for selected patient
    if (!form.patientMrn) return schedules;
    return schedules.filter((s) => s.patientMrn === form.patientMrn);
  }, [schedules, form.patientMrn]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.patientMrn) return "Patient MRN is required";
    if (!form.scheduleCode) return "Schedule Code is required";
    if (form.amount === "" || Number(form.amount) <= 0) return "Amount must be > 0";
    if (!form.paymentMethod) return "Payment Method is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) return setErr(v);

    setSaving(true);
    try {
      await onSubmit({
        patientMrn: form.patientMrn,
        scheduleCode: form.scheduleCode,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      {err ? <Toast type="error" message={err} /> : null}

      {/* ✅ Patient dropdown */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Patient</label>
        <select
          className="w-full rounded-xl border px-3 py-2"
          value={form.patientMrn}
          onChange={(e) => {
            update("patientMrn", e.target.value);
            update("scheduleCode", ""); // reset schedule
          }}
        >
          <option value="">Select patient (MRN)</option>
          {patients
            .filter((p) => p.mrn) // must have MRN
            .map((p) => (
              <option key={p.mrn} value={p.mrn}>
                {p.mrn} — {(p.firstName || "") + " " + (p.lastName || "")}
              </option>
            ))}
        </select>
      </div>

      {/* ✅ Schedule dropdown */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Schedule</label>
        <select
          className="w-full rounded-xl border px-3 py-2"
          value={form.scheduleCode}
          onChange={(e) => update("scheduleCode", e.target.value)}
          disabled={!form.patientMrn}
        >
          <option value="">
            {form.patientMrn ? "Select schedule" : "Select patient first"}
          </option>
          {scheduleOptions.map((s) => (
            <option key={s.scheduleCode || s.code} value={s.scheduleCode || s.code}>
              {(s.scheduleCode || s.code)} — {s.patientName || ""} — {String(s.date || "").slice(0, 10)}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Amount"
        type="number"
        value={form.amount}
        onChange={(e) => update("amount", e.target.value)}
        placeholder="5000"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Payment Method</label>
        <select
          className="w-full rounded-xl border px-3 py-2"
          value={form.paymentMethod}
          onChange={(e) => update("paymentMethod", e.target.value)}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <Input
        label="Notes"
        value={form.notes}
        onChange={(e) => update("notes", e.target.value)}
        placeholder="Initial bill"
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}
