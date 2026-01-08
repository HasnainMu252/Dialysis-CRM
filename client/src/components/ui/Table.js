import React from "react";

function toCellValue(v) {
  if (v === null || v === undefined) return "-";

  // ✅ render primitives
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);

  // ✅ render dates
  if (v instanceof Date) return v.toLocaleString();

  // ✅ render arrays
  if (Array.isArray(v)) return v.map(toCellValue).join(", ");

  // ✅ render objects safely (pick common readable fields)
  if (typeof v === "object") {
    return (
      v.name ||
      v.title ||
      v.code ||
      v.bedCode ||
      v.mrn ||
      v._id ||
      "[object]"
    );
  }

  return String(v);
}

export default function Table({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-slate-500"
              >
                No data found
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={r._id || r.id || r.code || idx} className="border-t">
                {columns.map((c) => {
                  const raw = c.render ? c.render(r) : r?.[c.key];
                  return (
                    <td key={c.key} className="px-4 py-3">
                      {React.isValidElement(raw) ? raw : toCellValue(raw)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
