import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";

export default function ChangePassword() {
  const { currentUser, changePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength evaluation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const criteriaMetCount = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  let strengthLabel = "Weak";
  let strengthColor = "#ef4444";
  let strengthWidth = "25%";

  if (criteriaMetCount >= 5) {
    strengthLabel = "Very Strong";
    strengthColor = "#10b981";
    strengthWidth = "100%";
  } else if (criteriaMetCount >= 4) {
    strengthLabel = "Strong";
    strengthColor = "#3b82f6";
    strengthWidth = "75%";
  } else if (criteriaMetCount >= 3) {
    strengthLabel = "Moderate";
    strengthColor = "#f59e0b";
    strengthWidth = "50%";
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword) {
      setErrorMsg("Please enter your current account password.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters in length.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg("New password cannot be identical to your current password.");
      return;
    }

    if (!currentUser) {
      setErrorMsg("No active user session. Please sign in first.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (changePassword) {
        const result = changePassword(currentUser.id, currentPassword, newPassword);
        setIsSubmitting(false);

        if (result.success) {
          setSuccessMsg("Your password has been updated securely!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");

          setTimeout(() => {
            navigate("/profile");
          }, 1800);
        } else {
          setErrorMsg(result.message || "Failed to update password.");
        }
      } else {
        setIsSubmitting(false);
        setErrorMsg("Password reset service unavailable.");
      }
    }, 600);
  };

  return (
    <div className="standard-page-container" style={{ maxWidth: "560px", margin: "2.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <div className="standard-card" style={{ backgroundColor: "white", padding: "2.25rem 2rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.25rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KeyRound size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 0.15rem 0", color: "#0f172a" }}>
              Update Security Password
            </h1>
            <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0 }}>
              Account security for <strong>{currentUser?.firstName || "Resident"} {currentUser?.lastName || ""}</strong> ({currentUser?.email || "resident@gmail.com"})
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.75rem", marginBottom: "1.25rem", color: "#b91c1c", fontSize: "0.82rem" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#dcfce7", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem", marginBottom: "1.25rem", color: "#166534", fontSize: "0.82rem" }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg} Redirecting to profile...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          {/* Current Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
              Current Password <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="Enter existing password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: "100%", padding: "0.7rem 2.4rem 0.7rem 2.4rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
              New Security Password <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                required
                placeholder="Enter at least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: "100%", padding: "0.7rem 2.4rem 0.7rem 2.4rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Dynamic Strength Bar */}
            {newPassword && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "4px" }}>
                  <span style={{ color: "#64748b" }}>Password Strength:</span>
                  <span style={{ fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
                </div>
                <div style={{ height: "4px", backgroundColor: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: strengthWidth, height: "100%", backgroundColor: strengthColor, transition: "all 0.3s ease" }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
              Confirm New Password <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: "100%", padding: "0.7rem 2.4rem 0.7rem 2.4rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div style={{ backgroundColor: "#f8fafc", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.78rem" }}>
            <span style={{ fontWeight: 700, color: "#475569", display: "block", marginBottom: "6px" }}>Security Requirements:</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              <span style={{ color: hasMinLength ? "#166534" : "#94a3b8", fontWeight: hasMinLength ? 700 : 400 }}>
                {hasMinLength ? "✓" : "○"} Minimum 8 characters
              </span>
              <span style={{ color: hasUpper ? "#166534" : "#94a3b8", fontWeight: hasUpper ? 700 : 400 }}>
                {hasUpper ? "✓" : "○"} At least 1 uppercase
              </span>
              <span style={{ color: hasLower ? "#166534" : "#94a3b8", fontWeight: hasLower ? 700 : 400 }}>
                {hasLower ? "✓" : "○"} At least 1 lowercase
              </span>
              <span style={{ color: hasNumber ? "#166534" : "#94a3b8", fontWeight: hasNumber ? 700 : 400 }}>
                {hasNumber ? "✓" : "○"} At least 1 number
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "0.75rem" }}>
            <Link
              to="/profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                flex: 1,
                border: "1px solid #cbd5e1"
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.75rem",
                backgroundColor: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.88rem",
                cursor: "pointer",
                flex: 2
              }}
            >
              {isSubmitting ? "Updating Password..." : "Save New Password"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
