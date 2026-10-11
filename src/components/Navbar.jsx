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
  LogOut
} from "lucide-react";
import { useIncidents, RESPONDER_ROLES } from "../context/IncidentContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const { userReports, activeRole, setActiveRole } = useIncidents();
  const navigate = useNavigate();

  const currentRoleObj =
    RESPONDER_ROLES.find((r) => r.id === activeRole) || RESPONDER_ROLES[0];

  const handleLogout = () => {
    alert("Logged out of Barangay System (Frontend prototype - redirecting to login)");
    navigate("/login");
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-logo-icon">
            <Radio className="brand-beacon-icon animate-pulse" size={20} />
          </div>
          <div className="brand-text">
            <div className="brand-name">
              ALERTO <span className="brand-badge">LIVE</span>
            </div>
            <div className="brand-sub">Brgy. [Barangay Name]</div>
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
        </nav>

        {/* Right Action Area */}
        <div className="navbar-actions desktop-nav">
          {/* Role selector to test responder roles */}
          <div className="role-selector-wrapper">
            <button
              type="button"
              className="role-selector-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              title="Switch user / responder perspective (Placeholder)"
            >
              <ShieldCheck size={16} className="role-icon" />
              <span className="role-label">
                Role: {currentRoleObj.label}{" "}
                <span className="placeholder-tag">(Placeholder Role Selector)</span>
              </span>
              <ChevronDown size={14} />
            </button>

            {roleDropdownOpen && (
              <div
                className="role-dropdown-menu"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="role-dropdown-header">
                  View Map & Incidents As: <br />
                  <small style={{ color: "#94a3b8", textTransform: "none" }}>(Placeholder Role Selector)</small>
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

          {/* Log Out Button */}
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
            title="Log Out (Frontend Prototype)"
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
                Responder Role Filter: <span className="placeholder-tag">(Placeholder Role Selector)</span>
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
  );
}
