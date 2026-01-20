import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";

import StaffLayout from "./layouts/StaffLayout";
import PatientLayout from "./layouts/PatientLayout";

import StaffLogin from "./pages/auth/StaffLogin";
import PatientLogin from "./pages/auth/PatientLogin";
import NotFound from "./pages/common/NotFound";

import StaffDashboard from "./pages/staff/Dashboard";

import PatientsList from "./pages/staff/patients/PatientsList";
import PatientCreate from "./pages/staff/patients/PatientCreate";
import PatientEdit from "./pages/staff/patients/PatientEdit";
import PatientView from "./pages/staff/patients/PatientView";

import PatientPending from "./pages/auth/PatientPending";
import PatientRegister from "./pages/auth/PatientRegister";

import BedsList from "./pages/staff/beds/BedsList";
import BedCreate from "./pages/staff/beds/BedCreate";
import BedEdit from "./pages/staff/beds/BedEdit";
import BedView from "./pages/staff/beds/BedView";

import ShiftsList from "./pages/staff/shifts/ShiftsList";
import ShiftCreate from "./pages/staff/shifts/ShiftCreate";
import ShiftEdit from "./pages/staff/shifts/ShiftEdit";
import ShiftView from "./pages/staff/shifts/ShiftView";

import SchedulesList from "./pages/staff/schedules/SchedulesList";
import ScheduleCreate from "./pages/staff/schedules/ScheduleCreate";
import ScheduleEdit from "./pages/staff/schedules/ScheduleEdit";
import ScheduleView from "./pages/staff/schedules/ScheduleView";

import SessionLifecycle from "./pages/staff/sessions/SessionLifecycle";
import MaintenanceRelease from "./pages/staff/maintenance/MaintenanceRelease";

import BillingList from "./pages/staff/billing/BillingList";
import BillingEdit from "./pages/staff/billing/BillingEdit";
import BillingView from "./pages/staff/billing/BillingView";
import BillingNew from "./pages/staff/billing/BillingCreate";

import ReferralsList from "./pages/staff/referrals/ReferralsList";
import ReferralCreate from "./pages/staff/referrals/ReferralCreate";
import ReferralEdit from "./pages/staff/referrals/ReferralEdit";
import ReferralView from "./pages/staff/referrals/ReferralView";

import SettingsView from "./pages/staff/settings/SettingsView";

// ✅ User Management Pages
import UsersList from "./pages/staff/users/UserList";
import UserNew from "./pages/staff/users/UserNew";
import UserEdit from "./pages/staff/users/UserEdit";
import UserView from "./pages/staff/users/UserView";

import PatientDashboard from "./pages/patient/Dashboard";
import PatientProfile from "./pages/patient/Profile";
import MySchedule from "./pages/patient/MySchedule";
import MyBilling from "./pages/patient/MyBilling";
import MySessions from "./pages/patient/MySessions";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff/login" replace />} />

      {/* Public auth pages */}
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/patient/register" element={<PatientRegister />} />
      <Route path="/patient/pending" element={<PatientPending />} />

      {/* Staff (protected) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute type="staff">
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />

        {/* Patients */}
        <Route path="patients" element={<PatientsList />} />
        <Route path="patients/new" element={<PatientCreate />} />
        <Route path="patients/:mrn" element={<PatientView />} />
        <Route path="patients/:mrn/edit" element={<PatientEdit />} />

        {/* Beds */}
        <Route path="beds" element={<BedsList />} />
        <Route path="beds/new" element={<BedCreate />} />
        <Route path="beds/:code" element={<BedView />} />
        <Route path="beds/:code/edit" element={<BedEdit />} />

        {/* Shifts */}
        <Route path="shifts" element={<ShiftsList />} />
        <Route path="shifts/new" element={<ShiftCreate />} />
        <Route path="shifts/:code" element={<ShiftView />} />
        <Route path="shifts/:code/edit" element={<ShiftEdit />} />

        {/* Schedules */}
        <Route path="schedules" element={<SchedulesList />} />
        <Route path="schedules/new" element={<ScheduleCreate />} />
        <Route path="schedules/:code" element={<ScheduleView />} />
        <Route path="schedules/:code/edit" element={<ScheduleEdit />} />

        {/* Sessions & Maintenance */}
        <Route path="sessions" element={<SessionLifecycle />} />
        <Route path="maintenance" element={<MaintenanceRelease />} />

        {/* Billing */}
        <Route path="billing" element={<BillingList />} />
        <Route path="billing/new" element={<BillingNew />} />
        <Route path="billing/:code" element={<BillingView />} />
        <Route path="billing/:code/edit" element={<BillingEdit />} />

        {/* Referrals */}
        <Route path="referrals" element={<ReferralsList />} />
        <Route path="referrals/new" element={<ReferralCreate />} />
        <Route path="referrals/:id" element={<ReferralView />} />
        <Route path="referrals/:id/edit" element={<ReferralEdit />} />

        {/* ✅ Users Management */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/new" element={<UserNew />} />
        <Route path="users/:id" element={<UserView />} />
        <Route path="users/:id/edit" element={<UserEdit />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsView />} />
      </Route>

      {/* Patient (protected) */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute type="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="schedule" element={<MySchedule />} />
        <Route path="billing" element={<MyBilling />} />
        <Route path="sessions" element={<MySessions />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}