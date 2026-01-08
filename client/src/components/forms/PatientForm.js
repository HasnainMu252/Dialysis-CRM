import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const emptyPatient = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  phone: "",
  email: "",
  password: "", // optional (keep empty on edit)
  address: "",
  modality: "HD",
  shift: "Morning",
  scheduleDays: ["Mon", "Wed", "Fri"],
  status: "Active",
};

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const MODALITY_OPTIONS = ["HD", "PD"];
const SHIFT_OPTIONS = ["Morning", "Evening", "Night"];
const STATUS_OPTIONS = ["Active", "Inactive"];

export default function PatientForm({ initial, onSubmit, submitText = "Save" }) {
  const isEdit = useMemo(() => !!initial, [initial]);

  const [form, setForm] = useState(emptyPatient);
  const [saving, setSaving] = useState(false);
  const [localErr, setLocalErr] = useState("");

  // ✅ IMPORTANT: sync when initial arrives from API
  useEffect(() => {
    if (!initial) {
      setForm(emptyPatient);
      return;
    }

    setForm({
      ...emptyPatient,
      ...initial,
      // normalize scheduleDays
      scheduleDays: Array.isArray(initial?.scheduleDays)
        ? initial.scheduleDays
        : emptyPatient.scheduleDays,
      // avoid showing password on edit
      password: "",
    });
  }, [initial]);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleDay = (day) => {
    setForm((p) => {
      const set = new Set(p.scheduleDays || []);
      if (set.has(day)) set.delete(day);
      else set.add(day);
      return { ...p, scheduleDays: Array.from(set) };
    });
  };

  const validate = () => {
    if (!form.firstName?.trim()) return "First name is required";
    if (!form.lastName?.trim()) return "Last name is required";
    if (!form.phone?.trim()) return "Phone is required";

    // On create, password must exist (if your backend requires it)
    if (!isEdit && !form.password?.trim()) return "Password is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setLocalErr("");

    const v = validate();
    if (v) {
      setLocalErr(v);
      return;
    }

    try {
      setSaving(true);

      // ✅ If editing and password empty, remove it from payload
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;

      await onSubmit(payload);
    } catch (e2) {
      setLocalErr(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      {localErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {localErr}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="First Name"
          value={form.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          placeholder="First name"
        />
        <Input
          label="Last Name"
          value={form.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          placeholder="Last name"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="DOB"
          type="date"
          value={form.dob ? String(form.dob).slice(0, 10) : ""}
          onChange={(e) => update("dob", e.target.value)}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Gender
          </label>
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          >
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="03xx..."
        />
        <Input
          label="Email"
          value={form.email || ""}
          onChange={(e) => update("email", e.target.value)}
          placeholder="email (optional)"
        />
      </div>

      <Input
        label="Address"
        value={form.address || ""}
        onChange={(e) => update("address", e.target.value)}
        placeholder="Address"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Modality
          </label>
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={form.modality}
            onChange={(e) => update("modality", e.target.value)}
          >
            {MODALITY_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Shift
          </label>
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={form.shift}
            onChange={(e) => update("shift", e.target.value)}
          >
            {SHIFT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <Input
          label={isEdit ? "New Password (optional)" : "Password"}
          type="password"
          value={form.password || ""}
          onChange={(e) => update("password", e.target.value)}
          placeholder={isEdit ? "Leave blank to keep same" : "Enter password"}
        />
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-700">
          Schedule Days
        </div>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((d) => {
            const active = (form.scheduleDays || []).includes(d);
            return (
              <button
                type="button"
                key={d}
                onClick={() => toggleDay(d)}
                className={
                  "rounded-full border px-3 py-1 text-sm " +
                  (active
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700")
                }
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}
