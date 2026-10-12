import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { login } = auth;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim() || !password) {
      setErrorMsg("Please enter your official admin email and password.");
      return;
    }

    const cleanId = identifier.trim().toLowerCase();

    // Check for admin domain or official username
    if (
      !cleanId.endsWith("@anupul.gov") &&
      !cleanId.endsWith("@barangay.gov") &&
      cleanId !== "admin"
    ) {
      setErrorMsg("Access denied. Admin portal is strictly for @anupul.gov official accounts.");
      return;
    }

    if (login) {
      const result = login(identifier, password);

      if (result && result.success) {
        if (result.user?.role === "admin" || cleanId.includes("admin")) {
          navigate("/admin-approvals");
        } else {
          setErrorMsg("This account does not have administrator privileges.");
        }
      } else if (result?.isPending) {
        setErrorMsg("Your administrator account is awaiting authorization from the Head Barangay Official.");
      } else {
        setErrorMsg(result?.message || "Invalid administrative credentials.");
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0b1329",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div style={{
        maxWidth: "440px",
        width: "100%",
        backgroundColor: "#0f172a",
        borderRadius: "16px",
        border: "1px solid #1e293b",
        padding: "2.5rem 2rem",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
        color: "#ffffff"
      }}>
        {/* Back Link */}
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#94a3b8",
            fontSize: "0.82rem",
            textDecoration: "none",
            marginBottom: "1.5rem",
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Return to Resident Portal
        </Link>

        {/* Header Badge */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: "56px",
            height: "56px",
            backgroundColor: "#ef4444",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            boxShadow: "0 8px 16px rgba(239, 68, 68, 0.3)"
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>
            ALERT0 OFFICIAL DESK
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.84rem", margin: 0 }}>
            Barangay Anupul • Bamban, Tarlac
          </p>
          <span style={{
            display: "inline-block",
            marginTop: "0.5rem",
            backgroundColor: "#1e293b",
            color: "#cbd5e1",
            padding: "0.2rem 0.6rem",
            borderRadius: "9999px",
            fontSize: "0.72rem",
            fontWeight: 700
          }}>
            Restricted to Authorized Personnel Only
          </span>
        </div>

        {errorMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            color: "#fca5a5",
            fontSize: "0.82rem"
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.4rem" }}>
              Official Gov Email / Username
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="admin@anupul.gov"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <Mail size={16} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
            <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "4px", display: "block" }}>
              Quick Demo: admin@anupul.gov (Password: admin123)
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.4rem" }}>
              Security Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <Lock size={16} color="#64748b" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: "0.85rem",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.92rem",
              cursor: "pointer",
              marginTop: "0.5rem",
              transition: "background 0.2s ease"
            }}
          >
            Authenticate & Open Operations Desk
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem", borderTop: "1px solid #1e293b", paddingTop: "1.25rem" }}>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
            New Barangay Official or Tanod Head?{" "}
            <Link to="/admin/signup" style={{ color: "#f87171", fontWeight: 700, textDecoration: "none" }}>
              Register Official Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
