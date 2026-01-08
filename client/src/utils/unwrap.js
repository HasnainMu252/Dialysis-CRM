// src/utils/unwrap.js

// ✅ unwrap LIST responses (arrays)
export function unwrapList(payload, keys = []) {
  const d = payload;

  if (Array.isArray(d)) return d;

  const candidates = [
    ...keys,
    "items",
    "data",
    "result",
    "results",
    "rows",
    "patients",
    "schedules",
    "beds",
    "shifts",
    "billings",
    "referrals",
  ];

  for (const k of candidates) {
    if (Array.isArray(d?.[k])) return d[k];
    if (Array.isArray(d?.data?.[k])) return d.data[k];
  }

  return [];
}

// ✅ unwrap SINGLE item responses (objects)
export function unwrapOne(payload, keys = []) {
  const d = payload;

  // direct object already
  if (d && typeof d === "object" && !Array.isArray(d)) {
    if (d._id || d.id || d.code || d.mrn) return d;
  }

  const candidates = [...keys, "item", "data", "result", "schedule", "patient"];

  for (const k of candidates) {
    const v = d?.[k];
    if (v && typeof v === "object" && !Array.isArray(v)) return v;

    const v2 = d?.data?.[k];
    if (v2 && typeof v2 === "object" && !Array.isArray(v2)) return v2;
  }

  return null;
}
