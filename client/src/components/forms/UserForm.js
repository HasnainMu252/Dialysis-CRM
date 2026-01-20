import React, { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const ROLES = ["Admin", "Nurse", "CaseManager", "Biller"];

export default function UserForm({
  initial = null,
  mode = "create", // "create" | "edit"
  onSubmit,
  submitText,
}) {
  const [v, setV] = useState({
    name: "",
    email: "",
    password: "",
    role: "Nurse",
    active: true,
  });

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setV({
      name: initial.name || "",
      email: initial.email || "",
      password: "", // Never auto-fill password
      role: initial.role || "Nurse",
      active: initial.active !== false,
    });
  }, [initial]);

  const validate = () => {
    if (!v.name.trim()) return "Name is required";
    if (!v.email.trim()) return "Email is required";
    if (mode === "create" && !v.password.trim()) return "Password is required";
    if (mode === "create" && v.password.length < 6) return "Password must be at least 6 characters";
    if (!ROLES.includes(v.role)) return "Invalid role";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) return setErr(msg);

    try {
      setSaving(true);

      // Build payload based on mode
      const payload =
        mode === "create"
          ? {
              name: v.name.trim(),
              email: v.email.trim().toLowerCase(),
              password: v.password,
              role: v.role,
            }
          : {
              name: v.name.trim(),
              role: v.role,
              active: !!v.active,
            };

      await onSubmit(payload);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 max-w-lg">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Show User ID in edit mode */}
      {mode === "edit" && initial?.userId && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            User ID
          </label>
          <div className="w-full rounded-xl border bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600">
            {initial.userId}
          </div>
        </div>
      )}

      <Input
        label="Full Name"
        value={v.name}
        onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))}
        placeholder="e.g. John Doe"
        required
      />

      <Input
        label="Email"
        type="email"
        value={v.email}
        onChange={(e) => setV((p) => ({ ...p, email: e.target.value }))}
        placeholder="e.g. john@dialysiscrm.com"
        disabled={mode === "edit"} // Email cannot be changed in edit
        required
      />

      {mode === "create" && (
        <Input
          label="Password"
          type="password"
          value={v.password}
          onChange={(e) => setV((p) => ({ ...p, password: e.target.value }))}
          placeholder="Min 6 characters"
          required
        />
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={v.role}
          onChange={(e) => setV((p) => ({ ...p, role: e.target.value }))}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          {v.role === "Admin" && "Full system access"}
          {v.role === "Nurse" && "Can manage patients and sessions"}
          {v.role === "CaseManager" && "Can manage patients and schedules"}
          {v.role === "Biller" && "Can manage billing records"}
        </p>
      </div>

      {mode === "edit" && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!v.active}
            onChange={(e) => setV((p) => ({ ...p, active: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300"
          />
          <span>
            Active
            <span className="text-slate-500 ml-1">
              (Inactive users cannot log in)
            </span>
          </span>
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText || (mode === "create" ? "Create User" : "Update User")}
        </Button>
      </div>
    </form>
  );
}