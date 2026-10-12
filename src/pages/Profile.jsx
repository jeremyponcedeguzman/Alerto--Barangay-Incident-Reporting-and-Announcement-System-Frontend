import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapPin, Phone, Mail, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";

export default function Profile() {
  const { currentUser } = useAuth();

  return (
    <div className="standard-page-container" style={{ maxWidth: "620px", margin: "2.5rem auto", fontFamily: "sans-serif", padding: "0 1rem" }}>
      <div className="standard-card" style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }}>
        
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800 }}>
            {currentUser?.firstName?.charAt(0) || "J"}
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              {currentUser?.firstName || "Juan"} {currentUser?.lastName || "Dela Cruz"}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{
                backgroundColor: currentUser?.verificationStatus === "approved" ? "#dcfce7" : "#fef3c7",
                color: currentUser?.verificationStatus === "approved" ? "#166534" : "#92400e",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem"
              }}>
                <ShieldCheck size={14} /> 
                {currentUser?.verificationStatus === "approved" ? "Verified Resident" : "Pending Verification"}
              </span>
              {currentUser?.role === "admin" && (
                <span style={{ backgroundColor: "#3b82f6", color: "white", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "9999px" }}>
                  Official Administrator
                </span>
              )}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "1.25rem" }}>
          Resident Information
        </h3>

        {/* User Details Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.75rem", borderRadius: "10px", color: "#475569" }}>
              <Mail size={22} />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Email Address</span>
              <p style={{ margin: "0.1rem 0 0 0", fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                {currentUser?.email || "resident@gmail.com"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.75rem", borderRadius: "10px", color: "#475569" }}>
              <Phone size={22} />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Mobile Number</span>
              <p style={{ margin: "0.1rem 0 0 0", fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                {currentUser?.contactNumber || "0917-123-4567"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.75rem", borderRadius: "10px", color: "#475569" }}>
              <MapPin size={22} />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Registered Residency</span>
              <p style={{ margin: "0.1rem 0 0 0", fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                {currentUser?.sitioAddress || "Sitio Centro"}, Barangay Anupul, Bamban, Tarlac
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link
            to="/change-password"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.6rem 1rem",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              border: "1px solid #cbd5e1"
            }}
          >
            <KeyRound size={16} /> Change Password
          </Link>

          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.6rem 1.25rem",
              backgroundColor: "#0f172a",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 700
            }}
          >
            <ArrowLeft size={16} /> Back to Main Page
          </Link>
        </div>

      </div>
    </div>
  );
}
