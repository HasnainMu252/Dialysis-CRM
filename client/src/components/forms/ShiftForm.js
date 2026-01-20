import React, { useEffect, useMemo, useRef, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { listUsers } from "../../api/users.api";

const SHIFT_NAME_OPTIONS = ["Morning", "Evening", "Night", "Afternoon"];
const TIME_PRESETS = {
  Morning: { startTime: "08:00", endTime: "16:00" },
  Evening: { startTime: "16:00", endTime: "00:00" },
  Night: { startTime: "00:00", endTime: "08:00" },
  Afternoon: { startTime: "12:00", endTime: "18:00" },
};

// ✅ Extract staff IDs from initial data (handles all possible structures)
const extractStaffIds = (staff) => {
  if (!staff || !Array.isArray(staff)) return [];

  return staff
    .map((s) => {
      if (typeof s === "string") return s;
      
      // Handle: { userId: { id: "xxx" } } or { userId: { _id: "xxx" } }
      if (s?.userId && typeof s.userId === "object") {
        return s.userId.id || s.userId._id;
      }
      
      // Handle: { userId: "xxx" }
      if (s?.userId && typeof s.userId === "string") {
        return s.userId;
      }
      
      // Handle: { id: "xxx" } or { _id: "xxx" }
      return s?.id || s?._id;
    })
    .filter(Boolean);
};

export default function ShiftForm({ initial = {}, onSubmit, submitText = "Save" }) {
  // ✅ State
  const [formData, setFormData] = useState({
    code: initial.code || "",
    name: initial.name || "Morning",
    startTime: initial.startTime || "",
    endTime: initial.endTime || "",
    isActive: initial.isActive ?? true,
    staffIds: extractStaffIds(initial.staff),
  });

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // ✅ Update staffIds when initial changes (for edit mode)
  useEffect(() => {
    const ids = extractStaffIds(initial.staff);
    console.log("[ShiftForm] Initial staff extracted:", ids);
    setFormData((prev) => ({ ...prev, staffIds: ids }));
  }, [initial.staff]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch users
  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        const res = await listUsers();
        const userList = Array.isArray(res.data?.users) ? res.data.users : [];
        console.log("[ShiftForm] Users loaded:", userList.length);
        if (mounted) setAllUsers(userList);
      } catch (e) {
        console.error("[ShiftForm] Failed to load users:", e?.message);
      }
    };

    fetchUsers();
    return () => { mounted = false; };
  }, []);

  // ✅ Filter staff (exclude Admins)
  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const nonAdmins = allUsers.filter((u) => u.role !== "Admin");

    if (!query) return nonAdmins.slice(0, 15);

    return nonAdmins
      .filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(query) || email.includes(query);
      })
      .slice(0, 15);
  }, [allUsers, searchQuery]);

  // ✅ Get selected staff objects for display chips
  const selectedStaffObjects = useMemo(() => {
    return allUsers.filter((user) => formData.staffIds.includes(user.id));
  }, [allUsers, formData.staffIds]);

  // ✅ Check if staff is selected (use user.id from API)
  const isStaffSelected = (userId) => {
    return formData.staffIds.includes(userId);
  };

  // ✅ Toggle staff selection
  const handleToggleStaff = (userId, userName) => {
    if (!userId) {
      console.error("[ShiftForm] Invalid userId");
      return;
    }

    setFormData((prev) => {
      const isCurrentlySelected = prev.staffIds.includes(userId);
      console.log(`[ShiftForm] Toggle: ${userName} (${userId}) | Selected: ${isCurrentlySelected}`);

      const newStaffIds = isCurrentlySelected
        ? prev.staffIds.filter((id) => id !== userId)
        : [...prev.staffIds, userId];

      console.log("[ShiftForm] Updated staffIds:", newStaffIds);
      return { ...prev, staffIds: newStaffIds };
    });
  };

  // ✅ Remove staff by ID
  const handleRemoveStaff = (userId) => {
    setFormData((prev) => ({
      ...prev,
      staffIds: prev.staffIds.filter((id) => id !== userId),
    }));
  };

  // ✅ Clear all staff
  const handleClearAll = () => {
    setFormData((prev) => ({ ...prev, staffIds: [] }));
  };

  // ✅ Apply time preset
  const applyPreset = (shiftName) => {
    const preset = TIME_PRESETS[shiftName];
    if (!preset) return;

    setFormData((prev) => ({
      ...prev,
      name: shiftName,
      startTime: preset.startTime,
      endTime: preset.endTime,
    }));
  };

  // ✅ Validation
  const validate = () => {
    if (!formData.name) return "Shift name is required";
    if (!formData.startTime) return "Start time is required";
    if (!formData.endTime) return "End time is required";
    return "";
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const validationError = validate();
    if (validationError) return setErr(validationError);

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isActive: formData.isActive,
        staffIds: formData.staffIds,
      };

      if (formData.code) {
        payload.code = formData.code;
      }

      console.log("[ShiftForm] Submitting payload:", payload);
      await onSubmit(payload);
    } catch (e2) {
      console.error("[ShiftForm] Submit error:", e2);
      setErr(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Error Display */}
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Shift Name & Time Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Shift Name
          </label>
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          >
            {SHIFT_NAME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(TIME_PRESETS).map((presetName) => (
              <button
                key={presetName}
                type="button"
                className={`rounded-lg border px-3 py-1 text-xs transition-colors ${
                  formData.name === presetName
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => applyPreset(presetName)}
              >
                {presetName}
              </button>
            ))}
          </div>
        </div>

        <Input
          type="time"
          label="Start Time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
        />

        <Input
          type="time"
          label="End Time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
        />
      </div>

      {/* ✅ Staff Selection Dropdown */}
      <div ref={dropdownRef} className="relative">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Assign Staff ({formData.staffIds.length} selected)
        </label>

        <input
          type="text"
          className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search staff by name or email..."
        />

        {/* Dropdown List */}
        {isDropdownOpen && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border bg-white shadow-xl max-h-72 overflow-auto">
            {filteredStaff.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 text-center">
                No staff found
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-slate-50 border-b p-2 flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    {filteredStaff.length} staff available
                  </span>
                  {formData.staffIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Staff Items */}
                {filteredStaff.map((user) => {
                  const isSelected = isStaffSelected(user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleToggleStaff(user.id, user.name)}
                      className={`flex items-center justify-between p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                        isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {user.name || "No Name"}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {user.email}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.role}
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                          isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ✅ Selected Staff Chips */}
        {selectedStaffObjects.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedStaffObjects.slice(0, 5).map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs text-blue-800"
              >
                {user.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStaff(user.id);
                  }}
                  className="ml-1 text-blue-500 hover:text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedStaffObjects.length > 5 && (
              <span className="text-xs text-slate-500 py-1">
                +{selectedStaffObjects.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}