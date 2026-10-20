import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminSignup() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { registerAdmin } = auth;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    officialPosition: "",
    secretCode: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const POSITIONS = [
    "Barangay Captain / Chairman",
    "Barangay Councilor (Kagawad)",
    "SK Chairman",
    "Barangay Secretary",
    "Barangay Treasurer",
    "Barangay Emergency Responder",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Official email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.officialPosition) newErrors.officialPosition = "Select an official position.";

    const cleanSubmittedCode = formData.secretCode.trim().toUpperCase();
    if (!formData.secretCode.trim()) {
      newErrors.secretCode = "Barangay security code is required.";
    } else if (cleanSubmittedCode !== OFFICIAL_ADMIN_CODE) {
      newErrors.secretCode = "Invalid Security Code. Contact Barangay Chairman for access.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const payload = {
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: "Admin",
          position: formData.officialPosition,
          contactNumber: formData.contactNumber.trim() || "09123456789",
        };

        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || `Registration failed with status ${response.status}`);
        }

        if (typeof registerAdmin === "function") {
          registerAdmin(data.user || payload);
        }

        setSuccessMsg("Admin registration submitted! You can now log in.");
        setTimeout(() => {
          navigate("/admin/login");
        }, 1500);

      } catch (err) {
        console.error("Failed to register admin:", err);
        setErrors({ email: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: "520px", margin: "2.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <button
        type="button"
        onClick={() => navigate("/admin/login")}
        style={{ marginBottom: "1rem", background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 700 }}
      >
        ← Back to Official Admin Login
      </button>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "1.5rem", textAlign: "center", color: "white" }}>
          <span style={{ fontSize: "0.72rem", color: "#fef08a", fontWeight: 700, textTransform: "uppercase" }}>
            🏛️ Barangay Anupul • Official Portal
          </span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0.25rem 0 0" }}>
            Register Barangay Official Account
          </h2>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>
            Access incident dispatching and residency verification tools.
          </p>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {successMsg && (
            <div style={{ padding: "0.75rem", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem" }}>
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* First Name & Last Name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  First Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Official First Name"
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                />
                {errors.firstName && <p style={{ fontSize: "0.72rem", color: "#ef4444", margin: "0.2rem 0 0" }}>{errors.firstName}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Last Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Official Last Name"
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                />
                {errors.lastName && <p style={{ fontSize: "0.72rem", color: "#ef4444", margin: "0.2rem 0 0" }}>{errors.lastName}</p>}
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                Contact / Mobile Number
              </label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
                placeholder="09XXXXXXXXX"
                style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              />
            </div>

            {/* Official Position */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                Barangay Position / Designation <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={formData.officialPosition}
                onChange={(e) => handleChange("officialPosition", e.target.value)}
                style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              >
                <option value="">Select Official Title</option>
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              {errors.officialPosition && <p style={{ fontSize: "0.72rem", color: "#ef4444", margin: "0.2rem 0 0" }}>{errors.officialPosition}</p>}
            </div>

            {/* Official Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                Official Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="official@anupul.gov"
                style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              />
              {errors.email && <p style={{ fontSize: "0.72rem", color: "#ef4444", margin: "0.2rem 0 0" }}>{errors.email}</p>}
            </div>

            {/* Barangay Security Code */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                Barangay Official Authorization Code <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.secretCode}
                onChange={(e) => handleChange("secretCode", e.target.value)}
                placeholder="ANUPUL2026"
                style={{ 
                  width: "100%", 
                  padding: "0.6rem", 
                  border: errors.secretCode ? "1px solid #ef4444" : "1px solid #cbd5e1", 
                  borderRadius: "8px" 
                }}
              />
              <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block", marginTop: "0.2rem" }}>
                💡 Demo Passcode: <code>ANUPUL2026</code>
              </span>
              {errors.secretCode && <p style={{ fontSize: "0.72rem", color: "#ef4444", margin: "0.2rem 0 0" }}>{errors.secretCode}</p>}
            </div>

            {/* Password & Confirm Password */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Password <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                />
                {errors.password && <p style={{ fontSize: "0.72rem", color: "#ef4444", margin: "0.2rem 0 0" }}>{errors.password}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Confirm Password <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                />
                {errors.confirmPassword && <p style={{ fontSize: "0.72rem", color: "#ef4444", margin: "0.2rem 0 0" }}>{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.75rem",
                backgroundColor: isSubmitting ? "#64748b" : "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginTop: "0.5rem"
              }}
            >
              {isSubmitting ? "Registering..." : "Register Official Account"}
            </button>
          </form>
        </div>

        <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "0.85rem 1.25rem", textAlign: "center", fontSize: "0.78rem", color: "#64748b" }}>
          Already have an official account?{" "}
          <a href="/admin/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
            Log in here →
          </a>
        </div>

      </div>
    </div>
  );
}