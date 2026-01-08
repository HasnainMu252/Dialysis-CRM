import React from "react";
import { Link } from "react-router-dom";
import PageShell from "../../layouts/PageShell";
import Button from "../../components/ui/Button";

export default function PatientPending() {
  return (
    <PageShell>
      <div className="max-w-xl mx-auto rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Account Pending Approval</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your registration is complete, but your account is currently <b>Pending</b>.
          Please wait for admin approval before logging in.
        </p>
        <div className="mt-4">
          <Link to="/patient/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
