import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { deletePatient, listPatients } from "../../../api/patients.api";

function pickPatientsPayload(data) {
  // ✅ handles different backend response shapes safely
  // expected: { success: true, patients: [...] }
  if (Array.isArray(data?.patients)) return data.patients;
  if (Array.isArray(data?.data?.patients)) return data.data.patients;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

export default function PatientList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((p) => {
      const name = `${p.firstName || ""} ${p.lastName || ""}`.trim().toLowerCase();
      return (
        (p.mrn || "").toLowerCase().includes(s) ||
        (p.email || "").toLowerCase().includes(s) ||
        (p.phone || "").toLowerCase().includes(s) ||
        name.includes(s)
      );
    });
  }, [rows, q]);

  const load = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await listPatients();
      const list = pickPatientsPayload(res.data);
      setRows(list);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load patients");
      setRows([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (mrn) => {
    if (!mrn) return;
    if (!window.confirm(`Delete patient ${mrn}?`)) return;

    setErr("");
    try {
      await deletePatient(mrn);
      // ✅ refresh list
      setRows((prev) => prev.filter((x) => x.mrn !== mrn));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Patients</h2>
          <p className="text-sm text-slate-500">Manage patients (MRN-based)</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Refreshing..." : "Refresh"}
          </Button>
          <Link to="/staff/patients/new">
            <Button>Add New</Button>
          </Link>
        </div>
      </div>

      {err && (
        <div className="mt-4">
          <Toast type="error" message={err} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by MRN / name / email / phone..."
          className="w-full max-w-lg rounded-xl border px-3 py-2 text-sm outline-none"
        />
        <Button variant="outline" onClick={() => setQ("")}>
          Clear
        </Button>
      </div>

      <div className="mt-5 rounded-2xl border bg-white">
        <div className="grid grid-cols-12 gap-2 border-b p-3 text-xs font-semibold text-slate-600">
          <div className="col-span-2">MRN</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {busy && rows.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No patients found.</div>
        ) : (
          filtered.map((p) => {
            const mrn = p.mrn;
            const name =
              p.name ||
              `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
              "-";

            return (
              <div key={p._id || mrn} className="grid grid-cols-12 gap-2 p-3 text-sm border-b last:border-b-0">
                <div className="col-span-2 font-medium">{mrn || "-"}</div>
                <div className="col-span-3">{name}</div>
                <div className="col-span-3">{p.email || "-"}</div>
                <div className="col-span-2">{p.phone || p.contactNumber || "-"}</div>
                <div className="col-span-1">{p.status || "-"}</div>

                <div className="col-span-1 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => nav(`/staff/patients/${encodeURIComponent(mrn)}`)}>
                    View
                  </Button>

                  <Button size="sm" onClick={() => nav(`/staff/patients/${encodeURIComponent(mrn)}/edit`)}>
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(mrn)}
                    disabled={!mrn}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
