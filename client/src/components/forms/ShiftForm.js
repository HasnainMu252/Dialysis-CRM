import React, { useEffect, useMemo, useRef, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { listNurses } from "../../api/users.api";

const SHIFT_NAME_OPTIONS = ["Morning", "Evening", "Night", "Afternoon"];
const TIME_PRESETS = {
  Morning: { startTime: "08:00", endTime: "16:00" },
  Evening: { startTime: "16:00", endTime: "00:00" },
  Night: { startTime: "00:00", endTime: "08:00" },
  Afternoon: { startTime: "12:00", endTime: "18:00" },
};

// ✅ helper: show up to 5 selected names + “+X more”
const selectedPreview = (selectedUsers = [], max = 5) => {
  const names = selectedUsers
    .map((u) => u?.name || u?.fullName || u?.email || "Unknown")
    .filter(Boolean);

  const shown = names.slice(0, max);
  const more = names.length - shown.length;

  return { shown, more, total: names.length };
};

export default function ShiftForm({ initial = {}, onSubmit, submitText = "Save" }) {
  const [v, setV] = useState({
    code: initial.code || "",
    name: initial.name || "Morning",
    startTime: initial.startTime || "",
    endTime: initial.endTime || "",
    isActive: initial.isActive ?? true,
    nurseIds: (initial.staff || [])
      .map((s) => s?.userId?._id)
      .filter(Boolean),
  });

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // nurses dropdown
  const [nurses, setNurses] = useState([]);
  const [nOpen, setNOpen] = useState(false);
  const [nQuery, setNQuery] = useState("");
  const nWrap = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (nWrap.current && !nWrap.current.contains(e.target)) setNOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await listNurses();
        const list = Array.isArray(res.data?.nurses) ? res.data.nurses : [];
        if (mounted) setNurses(list);
      } catch (e) {
        console.log("Nurses load failed:", e?.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredNurses = useMemo(() => {
    const s = nQuery.trim().toLowerCase();
    if (!s) return nurses.slice(0, 10);
    return nurses
      .filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(s) || email.includes(s);
      })
      .slice(0, 10);
  }, [nurses, nQuery]);

  // ✅ selected nurse objects for preview chips
  const selectedNurses = useMemo(() => {
    const setIds = new Set(v.nurseIds);
    return nurses.filter((u) => setIds.has(u._id));
  }, [nurses, v.nurseIds]);

  const { shown, more, total } = useMemo(
    () => selectedPreview(selectedNurses, 5),
    [selectedNurses]
  );

  const applyPresetIfEmpty = (name) => {
    const p = TIME_PRESETS[name];
    if (!p) return;
    // only auto-fill if empty
    setV((prev) => ({
      ...prev,
      name,
      startTime: prev.startTime || p.startTime,
      endTime: prev.endTime || p.endTime,
    }));
  };

  const toggleNurse = (id) => {
    setV((prev) => {
      const has = prev.nurseIds.includes(id);
      return {
        ...prev,
        nurseIds: has ? prev.nurseIds.filter((x) => x !== id) : [...prev.nurseIds, id],
      };
    });
  };

  const validate = () => {
    if (!v.name) return "Shift name is required";
    if (!v.startTime) return "Start time is required";
    if (!v.endTime) return "End time is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const m = validate();
    if (m) return setErr(m);

    try {
      setSaving(true);
      await onSubmit({
        code: v.code, // optional (backend can generate)
        name: v.name,
        startTime: v.startTime,
        endTime: v.endTime,
        isActive: v.isActive,
        nurseIds: v.nurseIds,
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

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Code (optional)"
          value={v.code}
          onChange={(e) => setV({ ...v, code: e.target.value })}
          placeholder="SH-0003"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Shift Name
          </label>
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={v.name}
            onChange={(e) => applyPresetIfEmpty(e.target.value)}
          >
            {SHIFT_NAME_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(TIME_PRESETS).map((k) => (
              <button
                key={k}
                type="button"
                className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                onClick={() => setV((prev) => ({ ...prev, name: k, ...TIME_PRESETS[k] }))}
              >
                {k} preset
              </button>
            ))}
          </div>
        </div>

        <Input
          type="time"
          label="Start Time"
          value={v.startTime}
          onChange={(e) => setV({ ...v, startTime: e.target.value })}
        />

        <Input
          type="time"
          label="End Time"
          value={v.endTime}
          onChange={(e) => setV({ ...v, endTime: e.target.value })}
        />
      </div>

      {/* Nurses dropdown multi-select */}
      <div ref={nWrap} className="relative">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Assign Nurses (search + multi select)
        </label>

        <input
          className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
          value={nQuery}
          onChange={(e) => {
            setNQuery(e.target.value);
            setNOpen(true);
          }}
          onFocus={() => setNOpen(true)}
          placeholder="Type nurse name or email..."
        />

        {nOpen && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg max-h-64 overflow-auto">
            {filteredNurses.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">No nurses found.</div>
            ) : (
              filteredNurses.map((u) => {
                const checked = v.nurseIds.includes(u._id);
                return (
                  <button
                    type="button"
                    key={u._id}
                    onClick={() => toggleNurse(u._id)}
                    className="w-full text-left p-3 hover:bg-slate-50 border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{u.name || "-"}</div>
                        <div className="text-xs text-slate-600">{u.email || "-"}</div>
                      </div>
                      <div className="text-xs">{checked ? "✅" : "⬜"}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* ✅ NEW preview (count + up to 5 names) */}
        <div className="mt-2 text-sm text-slate-600">
          <div>Selected: {total}</div>

          {total > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {shown.map((n) => (
                <span key={n} className="rounded-full border px-2 py-1 text-xs">
                  {n}
                </span>
              ))}
              {more > 0 && <span className="text-xs text-slate-500">+{more} more</span>}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}
