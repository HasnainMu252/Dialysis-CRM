import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Toast from "../../../components/ui/Toast";
import { listReferrals } from "../../../api/referrals.api";

export default function ReferralsList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await listReferrals();
      const data = res.data;
      setRows(Array.isArray(data) ? data : (data?.items || data?.data || []));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Referrals</h2>
          <p className="mt-1 text-sm text-slate-500">Referral records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>Refresh</Button>
          <Link to="/staff/referrals/new"><Button>Add New</Button></Link>
        </div>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5">
        <Table
          columns={[
            { key: "_id", title: "ID", render: (r)=> r._id || r.id || "-" },
            { key: "patientId", title: "Patient", render: (r)=> r.patientId || r.patient?._id || "-" },
            { key: "doctorName", title: "Doctor" },
            { key: "hospital", title: "Hospital" },
            {
              key: "actions",
              title: "Actions",
              render: (r) => (
                <div className="flex gap-2">
                  <Link className="underline" to={`/staff/referrals/${r._id || r.id}`}>View</Link>
                  <Link className="underline" to={`/staff/referrals/${r._id || r.id}/edit`}>Edit</Link>
                </div>
              )
            }
          ]}
          rows={rows}
        />
      </div>
    </PageShell>
  );
}
