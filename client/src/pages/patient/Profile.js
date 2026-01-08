import React, { useEffect, useState } from "react";
import PageShell from "../../layouts/PageShell";
import Toast from "../../components/ui/Toast";
import { patientSelf } from "../../api/patients.api";

export default function Profile() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await patientSelf();
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed");
      }
    })();
  }, []);

  return (
    <PageShell>
      <h2 className="text-lg font-semibold">My Profile</h2>
      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}
      <pre className="mt-5 overflow-auto rounded-2xl border bg-white p-5 text-xs">{JSON.stringify(data, null, 2)}</pre>
    </PageShell>
  );
}
