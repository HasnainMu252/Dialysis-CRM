import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import UserForm from "../../../components/forms/UserForm";
import { registerStaff } from "../../../api/users.api";

export default function UserNew() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (payload) => {
    setErr("");
    setSuccess("");

    try {
      const res = await registerStaff(payload);
      const newUser = res.data?.user;

      setSuccess(`User "${newUser?.name || payload.name}" created successfully!`);

      // Navigate after short delay
      setTimeout(() => nav("/staff/users"), 1000);
    } catch (e) {
      const message = e?.response?.data?.message || e.message || "Create failed";
      setErr(message);
      throw e;
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Add New User</h2>
          <p className="text-sm text-slate-500">
            Create a new staff account (Admin/Nurse/CaseManager/Biller)
          </p>
        </div>
        <Link to="/staff/users">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} onClose={() => setErr("")} />
        </div>
      )}

      {success && (
        <div className="mt-4">
          <Toast type="success" message={success} />
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        <UserForm
          mode="create"
          onSubmit={onSubmit}
          submitText="Create User"
        />
      </div>
    </PageShell>
  );
}