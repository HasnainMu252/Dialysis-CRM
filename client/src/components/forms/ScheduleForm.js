import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { listPatients } from "../../api/patients.api";
import { listBeds } from "../../api/beds.api";
import { listShifts } from "../../api/shifts.api";

const emptySchedule = {
  patientMrn: "",
  shiftCode: "",
  bedCode: "",
  date: "",
  startTime: "",
  endTime: "",
  status: "Scheduled",
};

// as per your new requirement
const STATUS_OPTIONS = ["Scheduled", "Cancelled", "Completed"];

export default function ScheduleForm({ initial, onSubmit, submitText = "Save" }) {
  const [form, setForm] = useState(emptySchedule);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // dropdown states
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [pQuery, setPQuery] = useState("");
  const [pOpen, setPOpen] = useState(false);
  const [pBusy, setPBusy] = useState(false);

  const [bQuery, setBQuery] = useState("");
  const [bOpen, setBOpen] = useState(false);
  const [bBusy, setBBusy] = useState(false);

  const [sBusy, setSBusy] = useState(false);

  const pWrap = useRef(null);
  const bWrap = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (pWrap.current && !pWrap.current.contains(e.target)) setPOpen(false);
      if (bWrap.current && !bWrap.current.contains(e.target)) setBOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  // load patients + beds + shifts once
  useEffect(() => {
    let mounted = true;

    (async () => {
      setPBusy(true);
      try {
        const res = await listPatients();
        const list = Array.isArray(res.data?.patients) ? res.data.patients : [];
        if (mounted) setPatients(list);
      } catch (e) {
        console.log("Patients load failed:", e?.message);
      } finally {
        if (mounted) setPBusy(false);
      }
    })();

    (async () => {
      setBBusy(true);
      try {
        const res = await listBeds();
        const list = Array.isArray(res.data?.beds) ? res.data.beds : [];
        if (mounted) setBeds(list);
      } catch (e) {
        console.log("Beds load failed:", e?.message);
      } finally {
        if (mounted) setBBusy(false);
      }
    })();

    (async () => {
      setSBusy(true);
      try {
        const res = await listShifts();
        const list = Array.isArray(res.data?.shifts) ? res.data.shifts : [];
        if (mounted) setShifts(list);
      } catch (e) {
        console.log("Shifts load failed:", e?.message);
      } finally {
        if (mounted) setSBusy(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // sync initial
  useEffect(() => {
    if (!initial) return;

    const patientMrn =
      initial.patientMrn || initial.mrn || initial.patient?.mrn || "";

    const bedCode =
      initial.bedCode ||
      initial.bed?.code ||
      initial.bed?.bedCode ||
      initial.bed?.bed_code ||
      "";

    const shiftCode = initial.shiftCode || initial.shift?.code || "";

    setForm({
      patientMrn,
      shiftCode,
      bedCode,
      date: initial.date ? String(initial.date).slice(0, 10) : "",
      startTime: initial.startTime || "",
      endTime: initial.endTime || "",
      status: initial.status || "Scheduled",
    });

    setPQuery(patientMrn);
    setBQuery(bedCode);
  }, [initial]);

  // filters
  const filteredPatients = useMemo(() => {
    const s = (pQuery || "").trim().toLowerCase();
    if (!s) return patients.slice(0, 10);
    return patients
      .filter((p) => {
        const mrn = String(p.mrn || "").toLowerCase();
        const name = `${p.firstName || ""} ${p.lastName || ""}`
          .trim()
          .toLowerCase();
        const phone = String(p.phone || "").toLowerCase();
        const email = String(p.email || "").toLowerCase();
        return mrn.includes(s) || name.includes(s) || phone.includes(s) || email.includes(s);
      })
      .slice(0, 10);
  }, [patients, pQuery]);

  const filteredBeds = useMemo(() => {
    const s = (bQuery || "").trim().toLowerCase();
    const list = beds; // if you want only available: beds.filter(b => (b.status||"").toLowerCase()==="available")
    if (!s) return list.slice(0, 10);
    return list
      .filter((b) => {
        const code = (b.code || b.bedCode || "").toLowerCase();
        const name = (b.name || "").toLowerCase();
        const type = (b.type || "").toLowerCase();
        return code.includes(s) || name.includes(s) || type.includes(s);
      })
      .slice(0, 10);
  }, [beds, bQuery]);

  const shiftOptions = useMemo(() => {
    return shifts.map((s) => ({
      label: `${s.code} - ${s.name} (${s.startTime}-${s.endTime})`,
      value: s.code,
    }));
  }, [shifts]);

  const pickPatient = (p) => {
    update("patientMrn", p.mrn || "");
    setPQuery(p.mrn || "");
    setPOpen(false);
  };

  const pickBed = (b) => {
    const code = b.code || b.bedCode || "";
    update("bedCode", code);
    setBQuery(code);
    setBOpen(false);
  };

  const validate = () => {
    if (!form.patientMrn) return "Patient MRN is required";
    if (!form.shiftCode) return "Shift is required";
    if (!form.bedCode) return "Bed Code is required";
    if (!form.date) return "Date is required";
    if (!form.startTime) return "Start Time is required";
    if (!form.endTime) return "End Time is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const v = validate();
    if (v) return setErr(v);

    try {
      setSaving(true);
      // ✅ payload exactly as backend wants
      await onSubmit({
        patientMrn: form.patientMrn,
        shiftCode: form.shiftCode,
        bedCode: form.bedCode,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        status: form.status,
      });
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Patient dropdown */}
      <div ref={pWrap} className="relative">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Patient (Search MRN / Name / Phone / Email)
        </label>
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
          value={pQuery}
          onChange={(e) => {
            setPQuery(e.target.value);
            setPOpen(true);
            update("patientMrn", e.target.value);
          }}
          onFocus={() => setPOpen(true)}
          placeholder="Type MRN, name, phone..."
        />

        {pOpen && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg max-h-64 overflow-auto">
            {pBusy ? (
              <div className="p-3 text-sm text-slate-500">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">No patients found.</div>
            ) : (
              filteredPatients.map((p) => {
                const name = `${p.firstName || ""} ${p.lastName || ""}`.trim();
                return (
                  <button
                    type="button"
                    key={p._id || p.mrn}
                    onClick={() => pickPatient(p)}
                    className="w-full text-left p-3 hover:bg-slate-50 border-b last:border-b-0"
                  >
                    <div className="text-sm font-medium">{p.mrn || "NO MRN"}</div>
                    <div className="text-xs text-slate-600">
                      {name || "-"} • {p.phone || "-"} • {p.email || "-"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Shift dropdown */}
      <Select
        label="Shift"
        value={form.shiftCode}
        onChange={(e) => update("shiftCode", e.target.value)}
        options={["", ...shiftOptions.map((o) => o.value)]}
        disabled={sBusy}
        renderOption={(v) => {
          if (!v) return sBusy ? "Loading shifts..." : "-- Select shift --";
          const found = shiftOptions.find((x) => x.value === v);
          return found ? found.label : v;
        }}
      />

      {/* Bed dropdown */}
      <div ref={bWrap} className="relative">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Bed (Search Code / Name / Type)
        </label>
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
          value={bQuery}
          onChange={(e) => {
            setBQuery(e.target.value);
            setBOpen(true);
            update("bedCode", e.target.value);
          }}
          onFocus={() => setBOpen(true)}
          placeholder="Type bed code..."
        />

        {bOpen && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg max-h-64 overflow-auto">
            {bBusy ? (
              <div className="p-3 text-sm text-slate-500">Loading beds...</div>
            ) : filteredBeds.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">No beds found.</div>
            ) : (
              filteredBeds.map((b) => {
                const code = b.code || b.bedCode || "NO CODE";
                return (
                  <button
                    type="button"
                    key={b._id || code}
                    onClick={() => pickBed(b)}
                    className="w-full text-left p-3 hover:bg-slate-50 border-b last:border-b-0"
                  >
                    <div className="text-sm font-medium">{code}</div>
                    <div className="text-xs text-slate-600">
                      {b.name || "-"} • {b.type || "-"} • {b.status || "-"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <Input
        type="date"
        label="Schedule Date"
        value={form.date}
        onChange={(e) => update("date", e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Start Time"
          value={form.startTime}
          onChange={(e) => update("startTime", e.target.value)}
          placeholder="08:00"
        />
        <Input
          label="End Time"
          value={form.endTime}
          onChange={(e) => update("endTime", e.target.value)}
          placeholder="12:00"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select
          className="w-full rounded-xl border px-3 py-2"
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}
