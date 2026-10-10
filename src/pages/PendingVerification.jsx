import React from "react";
import { useAuth } from "../context/AuthContext";

export default function PendingVerification() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="standard-page-container" style={{ maxWidth: "680px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <div className="standard-card" style={{ textAlign: "center", padding: "2.5rem 1.75rem", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        
        {currentUser?.verificationStatus === "rejected" ? (
          <div>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.5rem" }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              Residency Verification Rejected
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: "1.25rem" }}>
              Your application for Barangay Anupul residency verification could not be approved by officials.
            </p>

            <div style={{ padding: "1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", textAlign: "left", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase" }}>Reason for Rejection:</span>
              <p style={{ fontSize: "0.88rem", color: "#7f1d1d", marginTop: "0.25rem", margin: 0 }}>
                {currentUser?.rejectionReason || "Uploaded proof of residency is unclear or location address does not match Barangay Anupul records."}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.5rem" }}>
              ⏳
            </div>

            <span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 700, display: "inline-block", marginBottom: "0.75rem" }}>
              Pending Official Approval
            </span>

            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              Account Under Review
            </h2>

            <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              Thank you for registering, <strong>{currentUser?.firstName} {currentUser?.lastName}</strong>. Your account is currently awaiting validation by <strong>Barangay Anupul Officials</strong>.
            </p>

            <div style={{ textAlign: "left", backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Sitio / Street</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{currentUser?.sitioAddress}</span>
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Contact Number</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{currentUser?.contactNumber}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Proof of Residency File</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2563eb" }}>
                  📄 {currentUser?.proofOfResidency?.name || "Uploaded Document"}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          style={{ padding: "0.65rem 1.25rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 700, cursor: "pointer", color: "#334155" }}
        >
          Log Out & Return to Login
        </button>
      </div>
    </div>
  );
}