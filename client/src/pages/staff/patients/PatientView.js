import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { deletePatient, getPatient } from "../../../api/patients.api";
import { unwrapOne } from "../../../utils/unwrap";

export default function PatientView() {
  const { mrn } = useParams(); // ✅ route: /staff/patients/:mrn
  const nav = useNavigate();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const res = await getPatient(mrn);
        const obj = unwrapOne(res.data, ["patient"]);
        if (!obj) throw new Error("Patient not found");
        if (mounted) setRow(obj);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load failed");
      }
    })();
    return () => { mounted = false; };
  }, [mrn]);

  const onDelete = async () => {
    if (!window.confirm("Delete this patient?")) return;
    setBusy(true);
    setErr("");
    try {
      await deletePatient(mrn); // ✅ Use MRN for delete
      nav("/staff/patients");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Patient Details</h2>
        <div className="flex gap-2">
          <Link to={`/staff/patients/${mrn}/edit`}>
            <Button>Edit</Button>
          </Link>
          <Button variant="outline" onClick={() => nav("/staff/patients")}>Back</Button>
        </div>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {!row ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="grid gap-3 text-sm">
            <div><b>MRN:</b> {row.mrn || "-"}</div>
            <div><b>Name:</b> {row.name || `${row.firstName || ""} ${row.lastName || ""}`.trim() || "-"}</div>
            <div><b>Email:</b> {row.email || "-"}</div>
            <div><b>Phone:</b> {row.phone || row.contactNumber || "-"}</div>
            <div><b>Date of Birth:</b> {row.dob || row.dateOfBirth || "-"}</div>
            <div><b>Gender:</b> {row.gender || "-"}</div>
            <div><b>Blood Group:</b> {row.bloodGroup || "-"}</div>
            <div><b>Status:</b> {row.status || "-"}</div>
            <div><b>Address:</b> {row.address || "-"}</div>

            <div className="pt-3">
              <Button variant="danger" disabled={busy} onClick={onDelete}>
                {busy ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}