import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/AuthContext";

export default function PatientLayout() {
  const { logoutPatient } = useAuth();
  const nav = useNavigate();

  const items = [
    { to: "/patient", label: "Dashboard", end: true },
    { to: "/patient/profile", label: "My Profile" },
    { to: "/patient/schedule", label: "My Schedule" },
    { to: "/patient/billing", label: "My Billing" },
    { to: "/patient/sessions", label: "My Sessions" },
  ];

  return (
    <div className="min-h-screen md:flex">
      <Sidebar items={items} title="Patient Portal" />
      <main className="flex-1">
        <Topbar
          title="Patient"
          right={
            <Button
              variant="outline"
              onClick={() => {
                logoutPatient();
                nav("/patient/login");
              }}
            >
              Logout
            </Button>
          }
        />
        <Outlet />
      </main>
    </div>
  );
}
