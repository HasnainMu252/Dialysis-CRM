import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { loginPatient } from "../../api/auth.api";
import { useAuth } from "../../auth/AuthContext";
import { storage, TOKENS } from "../../utils/storage";

export default function PatientLogin() {
  const nav = useNavigate();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("hassanali@gmail.com");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState({ type: "info", text: "" });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: "info", text: "" });

    try {
      const res = await loginPatient({ email, password });

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.token ||
        res.data?.data?.accessToken;

      if (!token) throw new Error("Token missing from response");

      storage.set(TOKENS.patient, token);
      await refresh();
      nav("/patient");
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || err.message || "Login failed",
      });
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Patient Login</h1>
      <p className="mt-1 text-sm text-slate-500">Enter email + password.</p>

      <form onSubmit={submit} className="mt-5 grid gap-3">
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hassanali@gmail.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Toast type={msg.type} message={msg.text} />
        <Button type="submit">Login</Button>
      </form>

      <div className="mt-4 text-sm text-slate-600">
        Staff?{" "}
        <Link className="text-slate-900 underline" to="/staff/login">
          Login here
        </Link>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        Patient Register?{" "}
        <Link className="text-slate-900 underline" to="/patient/register">
          Patient Register here
        </Link>
      </div>
    </div>
  );
}
