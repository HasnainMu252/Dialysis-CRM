import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ type = "staff", children }) {
  const { staff, patient, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;

  if (type === "staff" && !staff) return <Navigate to="/staff/login" replace />;
  if (type === "patient" && !patient) return <Navigate to="/patient/login" replace />;

  return children;
}
