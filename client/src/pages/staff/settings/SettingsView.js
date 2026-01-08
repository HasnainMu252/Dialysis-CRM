import React, { useEffect, useState } from "react";
import PageShell from "../../../layouts/PageShell";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import JsonPayloadForm from "../../../components/forms/JsonPayloadForm";
import { getSettings, patchSettings } from "../../../api/settings.api";

export default function SettingsView() {
  const [initial, setInitial] = useState(null);
  const [msg, setMsg] = useState({ type:"info", text:"" });

  const load = async () => {
    setMsg({ type:"info", text:"" });
    try {
      const res = await getSettings();
      setInitial(res.data);
    } catch (e) {
      setMsg({ type:"error", text: e?.response?.data?.message || e.message || "Load failed" });
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (payload) => {
    setMsg({ type:"info", text:"" });
    try {
      const res = await patchSettings(payload);
      setMsg({ type:"success", text:"Saved" });
      setInitial(res.data || payload);
    } catch (e) {
      setMsg({ type:"error", text: e?.response?.data?.message || e.message || "Save failed" });
    }
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="mt-1 text-sm text-slate-500">GET /settings, PATCH /settings</p>
        </div>
        <Button variant="outline" onClick={load}>Reload</Button>
      </div>

      <div className="mt-4">
        <Toast type={msg.type} message={msg.text} />
      </div>

      <div className="mt-5 rounded-2xl border bg-white p-5">
        {initial ? <JsonPayloadForm initial={initial} onSubmit={onSubmit} submitText="Save" /> : <div>Loading...</div>}
      </div>
    </PageShell>
  );
}
