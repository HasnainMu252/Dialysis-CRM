import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "../src/pages/admin/Login";
import Dashboard from "../src/pages/admin/Dashboard";
import BedsPage from "../src/pages/admin/Bedspage";
import SchedulePage from "./pages/SchedulingPages";
import NurseDashboard from "./pages/admin/NursePage"
import Patients from "./pages/admin/PatientPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />  } />
          <Route path="/dashboard/nurse" element={<NurseDashboard />} />
          <Route path="/beds" element={<BedsPage />} />
          <Route path="/schedules" element={<SchedulePage />} />
          <Route path="/Patients" element={<Patients />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
