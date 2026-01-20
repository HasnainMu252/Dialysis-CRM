import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Navbar() {
  const nav = useNavigate();
  const { staff, patient, logoutStaff, logoutPatient } = useAuth();

  const user = staff || patient;

  const role = useMemo(() => staff?.role || "Patient", [staff]);
  const name = useMemo(() => {
    return (
      staff?.name ||
      staff?.fullName ||
      staff?.user?.name ||
      patient?.name ||
      [patient?.firstName, patient?.lastName].filter(Boolean).join(" ") ||
      "User"
    );
  }, [staff, patient]);

  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const logout = () => {
    if (staff) logoutStaff();
    if (patient) logoutPatient();
    setOpen(false);
    nav("/"); // or /staff/login etc
  };

  // close dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <header className="sticky top-2 z-40 w-full border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* LEFT */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">
            🩺 Dialysis System
          </span>
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* (optional) quick role pill */}
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 md:inline">
            {role}
          </span>

          {/* Profile Dropdown */}
          <div className="relative" ref={boxRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2 text-left hover:bg-slate-50"
            >
              {/* Avatar circle */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {String(name || "U").slice(0, 1).toUpperCase()}
              </div>

              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-semibold text-slate-900">
                  {user ? name : "Not logged in"}
                </div>
                <div className="text-xs text-slate-500">{role}</div>
              </div>

              {/* arrow */}
              <svg
                className={`h-4 w-4 text-slate-600 transition ${
                  open ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border bg-white shadow-lg">
                <div className="border-b px-4 py-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {name}
                  </div>
                  <div className="text-xs text-slate-500">{role}</div>
                </div>

                {/* links (optional) */}
                {staff && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      nav("/staff/profile");
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </button>
                )}

                {/* logout */}
                <button
                  onClick={logout}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
