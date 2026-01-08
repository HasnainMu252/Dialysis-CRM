import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/AuthContext";

export default function StaffLayout() {
  const { logoutStaff } = useAuth();
  const nav = useNavigate();

  const items = [
    { to: "/staff", label: "Dashboard", end: true },
    { to: "/staff/patients", label: "Patients" },
    { to: "/staff/schedules", label: "Schedules" },
    { to: "/staff/shifts", label: "Shifts" },
    { to: "/staff/beds", label: "Beds" },
    { to: "/staff/sessions", label: "Session Lifecycle" },
    { to: "/staff/maintenance", label: "Maintenance" },
    { to: "/staff/billing", label: "Billing" },
    { to: "/staff/referrals", label: "Referrals" },
    { to: "/staff/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen md:flex">
      <Sidebar items={items} title="Staff Panel" />
      <main className="flex-1">
        <Topbar
          title="Staff"
          right={
            <Button
              variant="outline"
              onClick={() => {
                logoutStaff();
                nav("/staff/login");
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
