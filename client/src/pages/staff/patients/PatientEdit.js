import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import PatientForm from "../../../components/forms/PatientForm";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import { getPatient, updatePatient } from "../../../api/patients.api";
import { unwrapOne } from "../../../utils/unwrap";

export default function PatientEdit() {
  const { mrn } = useParams(); // route: /staff/patients/:mrn/edit
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setErr("");
      try {
        const res = await getPatient(mrn);
        const obj = unwrapOne(res.data, ["patient"]);
        if (!obj) throw new Error("Patient not found");
        if (mounted) setInitial(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [mrn]);

  const onSubmit = async (payload) => {
    setErr("");
    try {
      await updatePatient(mrn, payload);
      nav(`/staff/patients/${mrn}`);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Update failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Patient</h2>
        <Link to={`/staff/patients/${mrn}`}>
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {initial ? (
          <PatientForm initial={initial} onSubmit={onSubmit} submitText="Save Changes" />
        ) : (
          <div className="text-sm text-slate-500">Loading...</div>
        )}
      </div>
    </PageShell>
  );
}
