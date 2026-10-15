import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIncidents } from "../context/IncidentContext";
import {
  ShieldAlert,
  Users,
  FileWarning,
  MapPin,
  Megaphone,
  UserCheck,
  UserPlus,
  ClipboardList,
  LogOut,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

export default function AdminNavbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { isBackendOnline, isMongoAvailable } = useIncidents ? useIncidents() : {};

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { id: "approvals", label: "Resident Approvals", icon: <Users size={16} /> },
    { id: "reports", label: "Incident Reports", icon: <FileWarning size={16} /> },
    { id: "map", label: "Incident Map", icon: <MapPin size={16} /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone size={16} /> },
    { id: "roster", label: "Duty Roster", icon: <UserCheck size={16} /> },
    { id: "users", label: "Manage Users", icon: <Users size={16} />, route: "/manage-users" },
    { id: "staff", label: "Staff Portal", icon: <UserPlus size={16} />, route: "/add-staff" },
    { id: "audit", label: "Audit Logs", icon: <ClipboardList size={16} />, route: "/audit-logs" },
  ];

  return (
    <>
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
        maxWidth: "1350px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Brand */}
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
              <span style={{
                backgroundColor: (isBackendOnline && isMongoAvailable) ? "#10b981" : "#ef4444",
                color: "white",
                fontSize: "0.62rem",
                fontWeight: 700,
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                letterSpacing: "0.03em"
              }}>
                {(isBackendOnline && isMongoAvailable) ? "MONGODB ONLINE" : "MONGODB OFFLINE"}
              </span>
            </div>
            <span style={{ color: "#94a3b8", fontSize: "0.72rem", display: "block" }}>
              Barangay Anupul • Bamban, Tarlac
            </span>
          </div>
        </div>

        {/* Tab / Route Navigation */}
        <nav style={{ display: "flex", gap: "0.35rem", background: "#1e293b", padding: "0.3rem", borderRadius: "10px", overflowX: "auto" }}>
          {navItems.map((item) => {
            if (item.route) {
              return (
                <Link
                  key={item.id}
                  to={item.route}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    backgroundColor: activeTab === item.id ? "#ef4444" : "transparent",
                    color: activeTab === item.id ? "white" : "#cbd5e1",
                    whiteSpace: "nowrap"
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: activeTab === item.id ? "#ef4444" : "transparent",
                  color: activeTab === item.id ? "white" : "#cbd5e1",
                  whiteSpace: "nowrap"
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Badge & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "0.45rem 0.75rem",
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.75rem",
              fontWeight: 700
            }}
            title="Switch to Resident Front View"
          >
            <span>Resident View</span>
            <ExternalLink size={13} />
          </Link>

          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#f1f5f9", fontSize: "0.82rem", fontWeight: 700, display: "block" }}>
              {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : (currentUser?.email || "Admin Officer")}
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
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
    {(!isBackendOnline || !isMongoAvailable) && (
      <div
        style={{
          backgroundColor: "#450a0a",
          borderBottom: "1px solid #7f1d1d",
          color: "#fca5a5",
          padding: "0.55rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          fontSize: "0.82rem",
          fontWeight: 600,
          textAlign: "center",
          zIndex: 900,
        }}
      >
        <AlertTriangle size={15} style={{ flexShrink: 0, color: "#ef4444" }} />
        <span>
          <strong>MongoDB Database Unavailable:</strong> Backend API connection to MongoDB is offline. Admin operations are operating in local cache mode.
        </span>
      </div>
    )}
  </>
  );
}
