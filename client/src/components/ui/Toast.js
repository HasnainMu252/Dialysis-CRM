import React from "react";

export default function Toast({ type="info", message }) {
  if (!message) return null;
  const styles = {
    info: "bg-slate-900 text-white",
    error: "bg-rose-600 text-white",
    success: "bg-emerald-600 text-white",
  };
  return <div className={`rounded-xl px-4 py-3 text-sm ${styles[type] || styles.info}`}>{message}</div>;
}
