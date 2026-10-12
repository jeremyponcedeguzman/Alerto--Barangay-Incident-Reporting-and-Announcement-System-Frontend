import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Clock, ShieldAlert, LogOut, CheckCircle } from "lucide-react";

export default function PendingVerification() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const isRejected = currentUser?.verificationStatus === "rejected";

  return (
    <div className="standard-page-container" style={{ maxWidth: "680px", margin: "3rem auto", fontFamily: "sans-serif", padding: "0 1rem" }}>
      <div className="standard-card" style={{ textAlign: "center", padding: "2.75rem 2rem", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }}>
        
        {isRejected ? (
          <div>
            <div style={{ width: "68px", height: "68px", borderRadius: "50%", backgroundColor: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <ShieldAlert size={36} />
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              Residency Verification Rejected
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: "1.5rem" }}>
              Your application for Barangay Anupul residency verification could not be approved by officials.
            </p>

            <div style={{ padding: "1.25rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", textAlign: "left", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase" }}>Reason for Rejection:</span>
              <p style={{ fontSize: "0.9rem", color: "#7f1d1d", marginTop: "0.25rem", margin: 0 }}>
                {currentUser?.rejectionReason || "Uploaded proof of residency is illegible or address is outside Barangay Anupul boundaries."}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ width: "68px", height: "68px", borderRadius: "50%", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <Clock size={36} />
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              Application Under Review
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: "1.5rem" }}>
              Thank you for registering, <strong>{currentUser?.firstName || "Resident"}</strong>! Your Barangay Anupul residency proof is currently being verified by the operations desk.
            </p>

            <div style={{ padding: "1.25rem", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "10px", textAlign: "left", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>Notice:</span>
              <p style={{ fontSize: "0.88rem", color: "#92400e", marginTop: "0.25rem", margin: 0 }}>
                Official verification typically takes 15 minutes to 2 hours during office hours. Once approved, you will have complete access to real-time incident reporting and emergency dispatches.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.65rem 1.25rem",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            <LogOut size={16} /> Log Out & Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
