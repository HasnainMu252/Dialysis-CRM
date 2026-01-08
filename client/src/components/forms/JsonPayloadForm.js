import React, { useState } from "react";
import Toast from "../ui/Toast";

export default function JsonPayloadForm({ initial = {}, onSubmit, submitText="Save", hint }) {
  const [text, setText] = useState(JSON.stringify(initial, null, 2));
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    try {
      const obj = text.trim() ? JSON.parse(text) : {};
      onSubmit(obj);
    } catch (e2) {
      setErr("Invalid JSON");
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      {hint && <div className="text-sm text-slate-500">{hint}</div>}
      {err && <Toast type="error" message={err} />}
      <textarea
        className="h-72 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-slate-300"
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
        {submitText}
      </button>
    </form>
  );
}
