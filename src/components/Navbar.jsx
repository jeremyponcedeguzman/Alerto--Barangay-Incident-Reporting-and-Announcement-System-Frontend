import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Home,
  FileText,
  AlertTriangle,
  Menu,
  X,
  Radio,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  KeyRound,
  ShieldAlert,
  Users
} from "lucide-react";
import { useIncidents, RESPONDER_ROLES } from "../context/IncidentContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const { userReports, activeRole, setActiveRole, isBackendOnline, isMongoAvailable } = useIncidents();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const currentRoleObj =
    RESPONDER_ROLES.find((r) => r.id === activeRole) || RESPONDER_ROLES[0];

  const isAdmin = currentUser?.role === "admin" || currentUser?.email === "admin@anupul.gov";

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const isDbOnline = Boolean(isBackendOnline && isMongoAvailable);

  return (
    <>
      <header className="navbar-header">
        <div className="navbar-container">
          {/* Brand / Logo */}
          <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-logo-icon">
              <Radio className="brand-beacon-icon animate-pulse" size={20} />
            </div>
            <div className="brand-text">
              <div className="brand-name">
                ALERTO{" "}
                <span
                  className="brand-badge"
                  style={{
                    backgroundColor: isDbOnline ? "#10b981" : "#ef4444",
                    color: "white",
                    fontSize: "0.68rem",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "6px",
                    marginLeft: "0.3rem",
                    letterSpacing: "0.03em",
                    fontWeight: 700,
                  }}
                  title={
                    isDbOnline
                      ? "Connected to Express Backend & MongoDB Atlas"
                      : "MongoDB Database Unavailable - Local Standby Active"
                  }
                >
                  {isDbOnline ? "MONGODB ONLINE" : "MONGODB OFFLINE"}
                </span>
              </div>
              <div className="brand-sub">Brgy. Anupul</div>
            </div>
          </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            <Home size={18} />
            <span>Main Page</span>
          </NavLink>

          <NavLink
            to="/map"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            <div className="nav-link-with-dot">
              <MapPin size={18} />
              <span className="live-radar-dot"></span>
            </div>
            <span>Incident Map</span>
          </NavLink>

          <NavLink
            to="/my-reports"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            <FileText size={18} />
            <span>My Reports</span>
            {userReports.length > 0 && (
              <span className="nav-count-badge">{userReports.length}</span>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            <User size={18} />
            <span>Profile</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin-approvals"
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
              style={{ color: "#38bdf8", fontWeight: 700 }}
            >
              <ShieldAlert size={18} />
              <span>Admin Portal</span>
            </NavLink>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="navbar-actions desktop-nav">
          {/* Role selector to test responder roles */}
          <div className="role-selector-wrapper">
            <button
              type="button"
              className="role-selector-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              title="Switch user / responder perspective"
            >
              <ShieldCheck size={16} className="role-icon" />
              <span className="role-label">
                Role: {currentRoleObj.label}
              </span>
              <ChevronDown size={14} />
            </button>

            {roleDropdownOpen && (
              <div
                className="role-dropdown-menu"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="role-dropdown-header">
                  View Map & Incidents As:
                </div>
                {RESPONDER_ROLES.map((role) => (
                  <button
                    key={role.id}
                    className={`role-dropdown-item ${
                      activeRole === role.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveRole(role.id);
                      setRoleDropdownOpen(false);
                    }}
                  >
                    <span>{role.label}</span>
                    {activeRole === role.id && <span className="check-mark">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Highlighted Report Incident Button */}
          <Link
            to="/report-incident"
            className="btn-report-incident-highlight"
            title="Submit a new incident report"
          >
            <span className="btn-icon-wrapper">
              <AlertTriangle size={18} className="report-btn-icon" />
            </span>
            <span className="btn-report-text">Report Incident</span>
            <span className="btn-beacon-glow"></span>
          </Link>

          {/* Change password quick shortcut */}
          <Link
            to="/change-password"
            className="btn-logout"
            style={{ textDecoration: "none", color: "#64748b" }}
            title="Change Password"
          >
            <KeyRound size={16} />
          </Link>

          {/* Log Out Button */}
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
            title="Log Out of Session"
          >
            <LogOut size={16} />
            <span className="hide-on-mobile">Log Out</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={20} />
              <span>Main Page</span>
            </NavLink>

            <NavLink
              to="/map"
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin size={20} />
              <span>Incident Map (Live)</span>
            </NavLink>

            <NavLink
              to="/my-reports"
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText size={20} />
              <span>My Reports</span>
              {userReports.length > 0 && (
                <span className="nav-count-badge">{userReports.length}</span>
              )}
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <User size={20} />
              <span>Resident Profile</span>
            </NavLink>

            <NavLink
              to="/change-password"
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <KeyRound size={20} />
              <span>Change Password</span>
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin-approvals"
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#38bdf8", fontWeight: 700 }}
              >
                <ShieldAlert size={20} />
                <span>Admin Operations Portal</span>
              </NavLink>
            )}

            {/* Mobile Highlighted Report Button */}
            <div className="mobile-cta-wrapper">
              <Link
                to="/report-incident"
                className="btn-report-incident-highlight mobile-cta"
                onClick={() => setMobileMenuOpen(false)}
              >
                <AlertTriangle size={20} />
                <span>Report Incident</span>
              </Link>
            </div>

            {/* Role switch in mobile menu */}
            <div className="mobile-role-section">
              <span className="mobile-role-title">
                Responder Role Filter:
              </span>
              <div className="mobile-role-buttons">
                {RESPONDER_ROLES.map((role) => (
                  <button
                    key={role.id}
                    className={`mobile-role-chip ${
                      activeRole === role.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveRole(role.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Log Out */}
            <div className="mobile-logout-wrapper">
              <button
                type="button"
                className="mobile-btn-logout"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>

    {!isDbOnline && (
      <div
        className="db-offline-warning-bar"
        style={{
          backgroundColor: "#fef2f2",
          borderBottom: "1px solid #fecaca",
          color: "#991b1b",
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
        <AlertTriangle size={15} style={{ flexShrink: 0, color: "#dc2626" }} />
        <span>
          <strong>MongoDB Database Unavailable:</strong> Backend database connection is offline. Showing local standby data.
        </span>
      </div>
    )}
  </>
  );
}

