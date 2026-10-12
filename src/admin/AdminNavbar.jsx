import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminNavbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header style={{
      backgroundColor: "#0f172a",
      borderBottom: "1px solid #1e293b",
      padding: "0.75rem 1.5rem",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            backgroundColor: "#ef4444",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.85rem"
          }}>
            A0
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: "1.1rem" }}>
                ALERT0 ADMIN
              </span>
              <span style={{
                backgroundColor: "#3b82f6",
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                textTransform: "uppercase"
              }}>
                Official Desk
              </span>
            </div>
            <span style={{ color: "#94a3b8", fontSize: "0.72rem", display: "block" }}>
              Barangay Anupul • Bamban, Tarlac
            </span>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", background: "#1e293b", padding: "0.25rem", borderRadius: "10px", overflowX: "auto" }}>
          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "approvals" ? "#ef4444" : "transparent",
              color: activeTab === "approvals" ? "white" : "#cbd5e1"
            }}
          >
            👥 Resident Approvals
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "reports" ? "#ef4444" : "transparent",
              color: activeTab === "reports" ? "white" : "#cbd5e1"
            }}
          >
            🚨 Incident Reports
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("map")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "map" ? "#ef4444" : "transparent",
              color: activeTab === "map" ? "white" : "#cbd5e1"
            }}
          >
            📍 Incident Map Location
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("announcements")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "announcements" ? "#ef4444" : "transparent",
              color: activeTab === "announcements" ? "white" : "#cbd5e1"
            }}
          >
            📢 Announcements
          </button>

          {/* ADDED: Duty Roster Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("roster")}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "roster" ? "#ef4444" : "transparent",
              color: activeTab === "roster" ? "white" : "#cbd5e1",
              whiteSpace: "nowrap"
            }}
          >
            📋 Duty Roster
          </button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#f1f5f9", fontSize: "0.82rem", fontWeight: 700, display: "block" }}>
              {currentUser?.email || "Admin Officer"}
            </span>
            <span style={{ color: "#10b981", fontSize: "0.7rem", fontWeight: 600 }}>
              ● Verified Official
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.45rem 0.85rem",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}