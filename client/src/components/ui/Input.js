import React from "react";

export default function Input({ label, className="", ...props }) {
  return (
    <label className="grid gap-1 text-sm">
      {label && <span className="text-slate-600">{label}</span>}
      <input
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 ${className}`}
        {...props}
      />
    </label>
  );
}
