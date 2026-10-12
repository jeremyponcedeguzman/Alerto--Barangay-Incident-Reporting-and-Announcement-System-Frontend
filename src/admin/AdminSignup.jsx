import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Lock, Mail, User, Briefcase, Key, ArrowLeft, CheckCircle } from "lucide-react";

export default function AdminSignup() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { registerAdmin } = auth;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    officialPosition: "",
    secretCode: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const POSITIONS = [
    "Barangay Captain / Chairman",
    "Barangay Councilor (Kagawad)",
    "SK Chairman",
    "Barangay Secretary",
    "Barangay Treasurer",
    "Barangay Emergency Responder",
    "Chief Tanod",
    "IT System Administrator"
  ];

  // Official Secret Security Code
  const OFFICIAL_ADMIN_CODE = "ANUPUL2026";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    
    if (!formData.email.trim()) {
      newErrors.email = "Official email is required.";
    } else if (!formData.email.endsWith("@anupul.gov") && !formData.email.endsWith("@barangay.gov")) {
      newErrors.email = "Email must end with @anupul.gov official domain.";
    }

    if (!formData.officialPosition) {
      newErrors.officialPosition = "Please select your official position.";
    }

    if (formData.secretCode.trim().toUpperCase() !== OFFICIAL_ADMIN_CODE) {
      newErrors.secretCode = `Invalid official security code. Contact the Head Official (Hint: ANUPUL2026).`;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (registerAdmin) {
      const result = registerAdmin({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        officialPosition: formData.officialPosition,
        password: formData.password,
      });

      if (result.success) {
        setSuccessMsg("Official registration submitted! Redirecting to login...");
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);
      } else {
        setErrors({ email: result.message || "Failed to register account." });
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
        maxWidth: "520px",
        width: "100%",
        backgroundColor: "#0f172a",
        borderRadius: "16px",
        border: "1px solid #1e293b",
        padding: "2.5rem 2rem",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
        color: "#ffffff"
      }}>
        <Link
          to="/admin/login"
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
          <ArrowLeft size={16} /> Return to Official Login
        </Link>

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
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
            Register Official Personnel
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.84rem", margin: 0 }}>
            Barangay Anupul Administrative Desk
          </p>
        </div>

        {successMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            color: "#6ee7b7",
            fontSize: "0.85rem"
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.3rem" }}>
                First Name
              </label>
              <input
                type="text"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  backgroundColor: "#1e293b",
                  border: errors.firstName ? "1px solid #ef4444" : "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  boxSizing: "border-box"
                }}
              />
              {errors.firstName && <span style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.firstName}</span>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.3rem" }}>
                Last Name
              </label>
              <input
                type="text"
                placeholder="Dela Cruz"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  backgroundColor: "#1e293b",
                  border: errors.lastName ? "1px solid #ef4444" : "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  boxSizing: "border-box"
                }}
              />
              {errors.lastName && <span style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.lastName}</span>}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.3rem" }}>
              Official Gov Email (@anupul.gov)
            </label>
            <input
              type="email"
              placeholder="officer.name@anupul.gov"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem",
                backgroundColor: "#1e293b",
                border: errors.email ? "1px solid #ef4444" : "1px solid #334155",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.85rem",
                boxSizing: "border-box"
              }}
            />
            {errors.email && <span style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.email}</span>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.3rem" }}>
              Official Position
            </label>
            <select
              value={formData.officialPosition}
              onChange={(e) => handleChange("officialPosition", e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem",
                backgroundColor: "#1e293b",
                border: errors.officialPosition ? "1px solid #ef4444" : "1px solid #334155",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.85rem",
                boxSizing: "border-box"
              }}
            >
              <option value="">Select official designation...</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.officialPosition && <span style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.officialPosition}</span>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.3rem" }}>
              Official Authorization Code
            </label>
            <input
              type="text"
              placeholder="Enter ANUPUL2026 security key"
              value={formData.secretCode}
              onChange={(e) => handleChange("secretCode", e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem",
                backgroundColor: "#1e293b",
                border: errors.secretCode ? "1px solid #ef4444" : "1px solid #334155",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.85rem",
                boxSizing: "border-box"
              }}
            />
            {errors.secretCode && <span style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.secretCode}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.3rem" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  backgroundColor: "#1e293b",
                  border: errors.password ? "1px solid #ef4444" : "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  boxSizing: "border-box"
                }}
              />
              {errors.password && <span style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.password}</span>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.3rem" }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  backgroundColor: "#1e293b",
                  border: errors.confirmPassword ? "1px solid #ef4444" : "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  boxSizing: "border-box"
                }}
              />
              {errors.confirmPassword && <span style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.confirmPassword}</span>}
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
              marginTop: "0.5rem"
            }}
          >
            Submit Official Personnel Registration
          </button>
        </form>
      </div>
    </div>
  );
}
