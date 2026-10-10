import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { IncidentProvider } from "./context/IncidentContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Pages
import MainPage from "./pages/MainPage";
import IncidentMap from "./pages/IncidentMap";
import MyReports from "./pages/MyReports";
import ReportIncident from "./pages/ReportIncident";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import PendingVerification from "./pages/PendingVerification";

// Admin Components
import AdminApprovals from "./admin/AdminApprovals";
import AdminLogin from "./admin/AdminLogin";

// Protected Route Guard for Residents
function ProtectedResidentRoute({ children }) {
  const { currentUser, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Allow admins or approved residents
  const isAdmin = currentUser?.email === "admin@anupul.gov" || currentUser?.role === "admin";

  if (!isAdmin && currentUser?.verificationStatus !== "approved") {
    return <PendingVerification />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();

  // Hide resident navbar on auth pages and admin dashboard
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/admin/login" ||
    location.pathname === "/admin-approvals";

  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      <main className="app-content-body">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Dedicated Admin Portal Route */}
          <Route path="/admin-approvals" element={<AdminApprovals />} />

          {/* Protected Resident Routes */}
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
          <Route
            path="/profile"
            element={
              <ProtectedResidentRoute>
                <Profile />
              </ProtectedResidentRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
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