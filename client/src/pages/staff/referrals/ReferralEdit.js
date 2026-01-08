import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import JsonPayloadForm from "../../../components/forms/JsonPayloadForm";
import { getReferral, updateReferral } from "../../../api/referrals.api";

export default function ReferralEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getReferral(id);
        setInitial(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
  }, [id]);

  const onSubmit = async (payload) => {
    setErr("");
    try {
      await updateReferral(id, payload);
      nav(`/staff/referrals/${id}`);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Update failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Referral</h2>
        <Link to={`/staff/referrals/${id}`}><Button variant="outline">Back</Button></Link>
      </div>
      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}
      <div className="mt-5 rounded-2xl border bg-white p-5">
        {initial ? <JsonPayloadForm initial={initial} onSubmit={onSubmit} submitText="Save Changes" /> : <div>Loading...</div>}
      </div>
    </PageShell>
  );
}
