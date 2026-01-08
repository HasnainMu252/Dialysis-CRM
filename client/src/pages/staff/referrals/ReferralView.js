import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import * as api from "../../../api/referrals.api.js";

export default function ReferralView() {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getReferral(id);
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed to load");
      }
    })();
  }, [id]);

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Referral Details</h2>
          <div className="text-sm text-slate-500">ID: {id}</div>
        </div>
        <Link to='/staff/referrals'><Button variant="outline">Back</Button></Link>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <pre className="mt-5 overflow-auto rounded-2xl border bg-white p-5 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </PageShell>
  );
}
