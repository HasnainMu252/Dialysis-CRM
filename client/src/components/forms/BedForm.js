import React, { useEffect, useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

const TYPE_OPTIONS = ["Standard", "ICU"];
const STATUS_OPTIONS = ["Available", "Occupied", "Maintenance", "Busy"];

const empty = {
  name: "",
  type: "Standard",
  status: "Available",
  location: { ward: "", room: "", floor: "" },
  capacity: 1,
  notes: "",
};

export default function BedForm({ initial, onSubmit, submitText = "Save" }) {
  const [v, setV] = useState(empty);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ sync when editing
  useEffect(() => {
    if (!initial) return;
    setV({
      name: initial.name || "",
      type: initial.type || "Standard",
      status: initial.status || "Available",
      location: {
        ward: initial.location?.ward || "",
        room: initial.location?.room || "",
        floor: initial.location?.floor || "",
      },
      capacity: Number.isFinite(Number(initial.capacity)) ? Number(initial.capacity) : 1,
      notes: initial.notes || "",
    });
  }, [initial]);

  const setLoc = (key, value) =>
    setV((p) => ({ ...p, location: { ...(p.location || {}), [key]: value } }));

  const validate = () => {
    if (!v.name.trim()) return "Bed name is required";
    if (!v.type) return "Bed type is required";
    if (!v.status) return "Bed status is required";
    if (!v.location?.ward?.trim()) return "Ward is required";
    if (!v.location?.room?.trim()) return "Room is required";
    if (!v.location?.floor?.trim()) return "Floor is required";
    const cap = Number(v.capacity);
    if (!Number.isFinite(cap) || cap <= 0) return "Capacity must be a positive number";
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
        name: v.name.trim(),
        type: v.type,
        status: v.status,
        location: {
          ward: v.location.ward.trim(),
          room: v.location.room.trim(),
          floor: v.location.floor.trim(),
        },
        capacity: Number(v.capacity),
        notes: v.notes || "",
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
          label="Bed Name"
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })}
          placeholder="Bed A-01"
        />

        <Select
          label="Type"
          value={v.type}
          onChange={(e) => setV({ ...v, type: e.target.value })}
          options={TYPE_OPTIONS}
        />

        <Select
          label="Status"
          value={v.status}
          onChange={(e) => setV({ ...v, status: e.target.value })}
          options={STATUS_OPTIONS}
        />

        <Input
          type="number"
          label="Capacity"
          value={v.capacity}
          onChange={(e) => setV({ ...v, capacity: e.target.value })}
          placeholder="1"
          min="1"
        />

        <Input
          label="Ward"
          value={v.location.ward}
          onChange={(e) => setLoc("ward", e.target.value)}
          placeholder="General"
        />

        <Input
          label="Room"
          value={v.location.room}
          onChange={(e) => setLoc("room", e.target.value)}
          placeholder="R1"
        />

        <Input
          label="Floor"
          value={v.location.floor}
          onChange={(e) => setLoc("floor", e.target.value)}
          placeholder="1"
        />
      </div>

      <Input
        label="Notes"
        value={v.notes}
        onChange={(e) => setV({ ...v, notes: e.target.value })}
        placeholder="Near window"
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}
