import React, { useEffect, useState } from "react";
import PageShell from "../../layouts/PageShell";
import Toast from "../../components/ui/Toast";
import { patientSelf } from "../../api/patients.api";
import { patientUpcoming } from "../../api/schedules.api";

export default function PatientDashboard() {
  const [me, setMe] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.allSettled([patientSelf(), patientUpcoming()]);
        if (a.status === "fulfilled") setMe(a.value.data);
        if (b.status === "fulfilled") setUpcoming(Array.isArray(b.value.data) ? b.value.data : (b.value.data?.items || []));
      } catch (e) {
        setErr("Failed to load");
      }
    })();
  }, []);

  return (
    <PageShell>
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <p className="mt-1 text-sm text-slate-500">Your profile + upcoming schedules.</p>
      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">My Profile</div>
          <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(me, null, 2)}</pre>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">Upcoming</div>
          <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(upcoming, null, 2)}</pre>
        </div>
      </div>
    </PageShell>
  );
}
