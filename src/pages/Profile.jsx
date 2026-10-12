import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapPin, Phone, Mail, ShieldCheck } from "lucide-react"; 

export default function Profile() {
  // Pull the live user data from our global database
  const { currentUser } = useAuth();

  return (
    <div className="standard-page-container" style={{ maxWidth: "600px", margin: "3rem auto", fontFamily: "sans-serif", padding: "0 1rem" }}>
      <div className="standard-card" style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800 }}>
            {currentUser?.firstName?.charAt(0) || "R"}
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ backgroundColor: "#dcfce7", color: "#166534", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <ShieldCheck size={14} /> 
                {currentUser?.verificationStatus === "approved" ? "Verified Resident" : "Pending Verification"}
              </span>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "1.25rem" }}>
          Personal Information
        </h3>

        {/* User Details Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.75rem", borderRadius: "10px", color: "#475569" }}>
              <Mail size={22} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>Email Address</span>
              <span style={{ display: "block", fontSize: "1rem", color: "#0f172a", fontWeight: 600 }}>{currentUser?.email || "Not provided"}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.75rem", borderRadius: "10px", color: "#475569" }}>
              <Phone size={22} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>Contact Number</span>
              <span style={{ display: "block", fontSize: "1rem", color: "#0f172a", fontWeight: 600 }}>{currentUser?.contactNumber || "Not provided"}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ backgroundColor: "#f1f5f9", padding: "0.75rem", borderRadius: "10px", color: "#475569" }}>
              <MapPin size={22} />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>Registered Address</span>
              <span style={{ display: "block", fontSize: "1rem", color: "#0f172a", fontWeight: 600 }}>{currentUser?.sitioAddress || "Barangay Anupul"}</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
          <Link to="/" style={{ display: "inline-block", padding: "0.75rem 1.5rem", backgroundColor: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem", transition: "all 0.2s" }}>
            ← Return to Dashboard
          </Link>
        </div>
        
      </div>
    </div>
  );
}