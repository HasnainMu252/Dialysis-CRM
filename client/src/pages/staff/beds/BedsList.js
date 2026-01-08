import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Table from "../../../components/ui/Table";
import Toast from "../../../components/ui/Toast";
import { deleteBed, listBeds, updateBedStatus } from "../../../api/beds.api";

export default function BedsList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await listBeds({ search: q });
      const list = Array.isArray(res.data?.beds) ? res.data.beds : [];
      setRows(list);
    } catch (e) {
      setRows([]);
      setErr(e?.response?.data?.message || e.message || "Failed to load beds");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const code = (r.code || r.bedCode || "").toLowerCase();
      const name = (r.name || "").toLowerCase();
      const type = (r.type || "").toLowerCase();
      return code.includes(s) || name.includes(s) || type.includes(s);
    });
  }, [rows, q]);

  const quickStatus = async (code, status) => {
    if (!code) return;
    setErr("");
    try {
      await updateBedStatus(code, status);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Status update failed");
    }
  };

  const onDelete = async (code) => {
    if (!code) return setErr("Bed code missing, cannot delete.");
    if (!window.confirm(`Delete bed ${code}?`)) return;
    setErr("");
    try {
      await deleteBed(code);
      setRows((prev) => prev.filter((x) => (x.code || x.bedCode) !== code));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Beds</h2>
          <p className="mt-1 text-sm text-slate-500">Manage bed inventory and status.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="code / name / type"
          />
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Reloading..." : "Reload"}
          </Button>
          <Link to="/staff/beds/new"><Button>Add New</Button></Link>
        </div>
      </div>

      {err && <div className="mt-4"><Toast type="error" message={err} /></div>}

      <div className="mt-5">
        <Table
          columns={[
            { key: "code", title: "Bed Code", render: (r) => r.code || r.bedCode || "-" },
            { key: "name", title: "Name", render: (r) => r.name || "-" },
            { key: "type", title: "Type", render: (r) => r.type || "-" },
            { key: "status", title: "Status", render: (r) => r.status || "-" },
            {
              key: "quick",
              title: "Quick Status",
              render: (r) => {
                const code = r.code || r.bedCode;
                return (
                  <div className="flex flex-wrap gap-2">
                    <button className="underline" onClick={() => quickStatus(code, "Available")}>Available</button>
                    <button className="underline" onClick={() => quickStatus(code, "Occupied")}>Occupied</button>
                    <button className="underline" onClick={() => quickStatus(code, "Maintenance")}>Maintenance</button>
                  </div>
                );
              }
            },
            {
              key: "actions",
              title: "Actions",
              render: (r) => {
                const code = r.code || r.bedCode;
                return (
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => nav(`/staff/beds/${encodeURIComponent(code)}`)}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => nav(`/staff/beds/${encodeURIComponent(code)}/edit`)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(code)}>
                      Delete
                    </Button>
                  </div>
                );
              }
            }
          ]}
          rows={filtered}
        />
      </div>
    </PageShell>
  );
}
