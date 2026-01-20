import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/AuthContext";

const sidebarItems = [
  { to: "/staff", label: "Dashboard", end: true },
  { to: "/staff/patients", label: "Patients" },
  { to: "/staff/beds", label: "Beds" },
  { to: "/staff/shifts", label: "Shifts" },
  { to: "/staff/schedules", label: "Schedules" },
  { to: "/staff/sessions", label: "Sessions" },
  { to: "/staff/maintenance", label: "Maintenance" },
  { to: "/staff/billing", label: "Billing" },
  { to: "/staff/referrals", label: "Referrals" },
  { to: "/staff/users", label: "Users" },
  { to: "/staff/settings", label: "Settings" },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/staff/login");
  };

  return (
    <div className="min-h-screen md:flex">
      <Sidebar items={sidebarItems} title="Dialysis CRM" />
      
      <main className="flex-1">
        
        
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}