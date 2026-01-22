import React, { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const SHIFT_SLOTS = [
  { key: "morning", label: "Morning", name: "Morning", startTime: "08:00", endTime: "16:00" },
  { key: "evening", label: "Evening", name: "Evening", startTime: "16:00", endTime: "00:00" },
  { key: "night", label: "Night", name: "Night", startTime: "00:00", endTime: "08:00" },
];

export default function ShiftForm({
  initial = null,
  onSubmit,
  submitText = "Save",
}) {
  const [v, setV] = useState({
    name: "",
    startTime: "",
    endTime: "",
    isActive: true,
  });

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setV({
      name: initial.name || "",
      startTime: initial.startTime || "",
      endTime: initial.endTime || "",
      isActive: initial.isActive !== false,
    });
  }, [initial]);

  const validate = () => {
    if (!v.name.trim()) return "Shift name is required";
    if (!v.startTime) return "Start time is required";
    if (!v.endTime) return "End time is required";
    return "";
  };

  const applySlot = (slot) => {
    setV((p) => ({
      ...p,
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  const isSlotSelected = (slot) =>
    v.name?.trim().toLowerCase() === slot.name.toLowerCase() &&
    v.startTime === slot.startTime &&
    v.endTime === slot.endTime;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) return setErr(msg);

    try {
      setSaving(true);

      const payload = {
        name: v.name.trim(),
        startTime: v.startTime,
        endTime: v.endTime,
        isActive: v.isActive,
      };

      await onSubmit(payload);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Shift Code (read-only in edit mode) */}
      {initial?.code && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Shift Code
          </label>
          <div className="w-full rounded-xl border bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600">
            {initial.code}
          </div>
        </div>
      )}

      {/* Quick Shift Slots */}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700">
          Quick Slots
        </label>

        <div className="flex flex-wrap gap-2">
          {SHIFT_SLOTS.map((slot) => {
            const active = isSlotSelected(slot);
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => applySlot(slot)}
                className={[
                  "rounded-xl border px-3 py-2 text-sm transition",
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
                title={`${slot.startTime} - ${slot.endTime}`}
              >
                {slot.label}
                <span className="ml-2 text-xs text-slate-500">
                  {slot.startTime}–{slot.endTime}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-500">
          Tip: Click a slot to auto-fill name and times. You can still edit manually.
        </p>
      </div>

      <Input
        label="Shift Name"
        value={v.name}
        onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))}
        placeholder="e.g. Morning, Evening, Night"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Start Time
          </label>
          <input
            type="time"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={v.startTime}
            onChange={(e) => setV((p) => ({ ...p, startTime: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            End Time
          </label>
          <input
            type="time"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={v.endTime}
            onChange={(e) => setV((p) => ({ ...p, endTime: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Duration Display */}
      {v.startTime && v.endTime && (
        <div className="text-sm text-slate-500">
          Duration: {calculateDuration(v.startTime, v.endTime)}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={v.isActive}
          onChange={(e) => setV((p) => ({ ...p, isActive: e.target.checked }))}
          className="w-4 h-4 rounded border-slate-300"
        />
        <span>
          Active
          <span className="text-slate-500 ml-1">
            (Inactive shifts won't appear in scheduling)
          </span>
        </span>
      </label>

      <div className="flex justify-end pt-2 border-t">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}

// Helper to calculate duration
function calculateDuration(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;

  // Handle overnight shifts
  if (endMins <= startMins) {
    endMins += 24 * 60;
  }

  const diff = endMins - startMins;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (mins === 0) return `${hours} hour(s)`;
  return `${hours}h ${mins}m`;
}
