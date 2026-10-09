import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { IncidentProvider } from "./context/IncidentContext";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import IncidentMap from "./pages/IncidentMap";
import MyReports from "./pages/MyReports";
import ReportIncident from "./pages/ReportIncident";
import Profile from "./pages/Profile";
import EditIncident from "./pages/EditIncident";
import Login from "./pages/Login";
import AddStaff from "./pages/AddStaff";
import AuditLogs from "./pages/AuditLogs";
import ChangePassword from "./pages/ChangePassword";

export default function App() {
  return (
    <IncidentProvider>
      <div className="app-container">
        <Navbar />
        <main className="app-content-body">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/map" element={<IncidentMap />} />
            <Route path="/incident-map" element={<Navigate to="/map" replace />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/report-incident" element={<ReportIncident />} />
            <Route path="/report" element={<Navigate to="/report-incident" replace />} />

            {/* Supplementary Pages */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-incident" element={<EditIncident />} />
            <Route path="/login" element={<Login />} />
            <Route path="/add-staff" element={<AddStaff />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </IncidentProvider>
  );
}
