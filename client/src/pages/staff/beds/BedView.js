import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import { deleteBed, getBed } from "../../../api/beds.api";

export default function BedView() {
  const { code } = useParams(); // /staff/beds/:code
  const nav = useNavigate();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const res = await getBed(code);
      const obj = res.data?.bed || res.data?.data || res.data;
      if (!obj) throw new Error("Bed not found");
      setRow(obj);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Load failed");
    }
  };

  useEffect(() => { load(); }, [code]);

  const onDelete = async () => {
    if (!window.confirm(`Delete bed ${code}?`)) return;
    setBusy(true);
    setErr("");
    try {
      await deleteBed(code);
      nav("/staff/beds");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bed Details</h2>
        <div className="flex gap-2">
          <Link to={`/staff/beds/${encodeURIComponent(code)}/edit`}>
            <Button>Edit</Button>
          </Link>
          <Button variant="outline" onClick={() => nav("/staff/beds")}>Back</Button>
        </div>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {!row ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="grid gap-2 text-sm">
            <div><b>Code:</b> {row.code || "-"}</div>
            <div><b>Name:</b> {row.name || "-"}</div>
            <div><b>Type:</b> {row.type || "-"}</div>
            <div><b>Status:</b> {row.status || "-"}</div>
            <div><b>Capacity:</b> {row.capacity ?? "-"}</div>
            <div><b>Notes:</b> {row.notes || "-"}</div>
            <div><b>Ward:</b> {row.location?.ward || "-"}</div>
            <div><b>Room:</b> {row.location?.room || "-"}</div>
            <div><b>Floor:</b> {row.location?.floor || "-"}</div>

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
