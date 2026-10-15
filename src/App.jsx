import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { IncidentProvider, useIncidents } from "./context/IncidentContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Pages
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
import ManageUsers from "./pages/ManageUsers";
import DutyRoster from "./pages/DutyRoster";
import Announcements from "./pages/Announcements";
import PendingVerification from "./pages/PendingVerification";

// Admin Components
import AdminApprovals from "./admin/AdminApprovals";
import AdminLogin from "./admin/AdminLogin";
import AdminSignup from "./admin/AdminSignup";

// Protected Route Guard for Residents
function ProtectedResidentRoute({ children }) {
  const { currentUser, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser?.email === "admin@anupul.gov" || currentUser?.role === "admin";

  if (!isAdmin && currentUser?.verificationStatus !== "approved") {
    return <PendingVerification />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const { isBackendOnline, isMongoAvailable } = useIncidents ? useIncidents() : {};

  // Hide resident navbar on auth pages and dedicated admin desks
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/admin/login" ||
    location.pathname === "/admin/signup" ||
    location.pathname === "/admin-approvals" ||
    location.pathname.startsWith("/edit-incident") ||
    location.pathname === "/manage-users" ||
    location.pathname === "/add-staff" ||
    location.pathname === "/audit-logs";

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/admin/login" ||
    location.pathname === "/admin/signup";

  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      {isAuthPage && (!isBackendOnline || !isMongoAvailable) && (
        <div
          style={{
            backgroundColor: "#fef3c7",
            borderBottom: "1px solid #fde68a",
            color: "#92400e",
            padding: "0.5rem 1rem",
            fontSize: "0.82rem",
            fontWeight: 600,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <span>⚠️</span>
          <span>MongoDB server is currently unavailable. Using local demo mode (default: admin@anupul.gov / admin123).</span>
        </div>
      )}
      <main className="app-content-body">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Admin Operations Desk Routes */}
          <Route path="/admin-approvals" element={<AdminApprovals />} />
          <Route path="/edit-incident/:id" element={<EditIncident />} />
          <Route path="/edit-incident" element={<EditIncident />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/users" element={<Navigate to="/manage-users" replace />} />
          <Route path="/add-staff" element={<AddStaff />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/duty-roster" element={<DutyRoster />} />
          <Route path="/announcements" element={<Announcements />} />

          {/* Protected Resident / User Routes */}
          <Route
            path="/"
            element={
              <ProtectedResidentRoute>
                <MainPage />
              </ProtectedResidentRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedResidentRoute>
                <IncidentMap />
              </ProtectedResidentRoute>
            }
          />
          <Route path="/incident-map" element={<Navigate to="/map" replace />} />
          <Route
            path="/my-reports"
            element={
              <ProtectedResidentRoute>
                <MyReports />
              </ProtectedResidentRoute>
            }
          />
          <Route
            path="/report-incident"
            element={
              <ProtectedResidentRoute>
                <ReportIncident />
              </ProtectedResidentRoute>
            }
          />
          <Route path="/report" element={<Navigate to="/report-incident" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedResidentRoute>
                <Profile />
              </ProtectedResidentRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedResidentRoute>
                <ChangePassword />
              </ProtectedResidentRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <IncidentProvider>
        <AppContent />
      </IncidentProvider>
    </AuthProvider>
  );
}
