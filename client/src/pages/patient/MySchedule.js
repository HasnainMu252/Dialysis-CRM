import React, { useEffect, useState } from "react";
import PageShell from "../../layouts/PageShell";
import Toast from "../../components/ui/Toast";
import { patientUpcoming } from "../../api/schedules.api";

export default function MySchedule() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await patientUpcoming();
        const data = res.data;
        setRows(Array.isArray(data) ? data : (data?.items || data?.data || []));
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed");
      }
    })();
  }, []);

  return (
    <PageShell>
      <h2 className="text-lg font-semibold">My Schedule</h2>
      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}
      <pre className="mt-5 overflow-auto rounded-2xl border bg-white p-5 text-xs">{JSON.stringify(rows, null, 2)}</pre>
    </PageShell>
  );
}
