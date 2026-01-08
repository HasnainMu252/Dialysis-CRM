import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../.././layouts/PageShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { patientRegister } from "../../api/patients.api";
import { storage, TOKENS } from "../../utils/storage";

export default function PatientRegister() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    phone: "",
    email: "",
    password: "",
    address: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";
    if (!form.dob) return "DOB is required";
    if (!form.gender) return "Gender is required";
    if (!form.phone.trim()) return "Phone is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const v = validate();
    if (v) return setErr(v);

    try {
      setBusy(true);
      const res = await patientRegister(form);

      const token = res.data?.token;
      if (token) storage.set(TOKENS.patient, token);

      // since status is Pending, send them to login or a pending screen
      nav("/patient/pending");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Patient Registration</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create your account. It will be <b>Pending</b> until approved by admin.
            </p>
          </div>
          <Link to="/patient/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>

        {err && (
          <div className="mt-4">
            <Toast type="error" message={err} />
          </div>
        )}

        <form onSubmit={submit} className="mt-5 grid gap-4 rounded-2xl border bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First Name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
            <Input label="Last Name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input type="date" label="DOB" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
              <select
                className="w-full rounded-xl border px-3 py-2"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="03xxxxxxxxx" />
            <Input label="Email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@gmail.com" />
          </div>

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Min 6 characters"
          />

          <Input
            label="Address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street, City, Pakistan"
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
