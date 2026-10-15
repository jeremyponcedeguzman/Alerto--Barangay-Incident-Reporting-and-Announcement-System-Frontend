import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, SITIO_LIST } from "../context/AuthContext";
import { Radio, ShieldCheck, Mail, Lock, Phone, User, MapPin, Upload, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { register, login } = auth;

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    sitioAddress: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAnupulResident: false,
    proofOfResidencyName: "",
  });

  const [errors, setErrors] = useState({});

  const handleSignupInputChange = (field, value) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignupData((prev) => ({
        ...prev,
        proofOfResidencyName: file.name,
      }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!loginData.identifier.trim() || !loginData.password) {
      setAuthError("Please fill in both email/phone and password.");
      return;
    }

    if (login) {
      const result = await login(loginData.identifier, loginData.password);
      if (result.success) {
        if (result.user?.role === "admin") {
          navigate("/admin-approvals");
        } else {
          navigate("/");
        }
      } else if (result.isPending) {
        navigate("/login");
        setAuthError(result.message);
      } else if (result.isRejected) {
        setAuthError(result.message);
      } else {
        setAuthError(result.message || "Invalid credentials.");
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!signupData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!signupData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!signupData.contactNumber.trim()) newErrors.contactNumber = "Mobile number is required.";
    if (!signupData.sitioAddress) newErrors.sitioAddress = "Please select your Sitio in Barangay Anupul.";
    if (!signupData.email.trim()) newErrors.email = "Email address is required.";
    if (!signupData.password || signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!signupData.isAnupulResident) {
      newErrors.isAnupulResident = "You must confirm you are a bona fide resident of Barangay Anupul.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (register) {
      await register(signupData);
      alert("Registration submitted! Your Barangay Anupul residency is awaiting verification.");
      setIsLogin(true);
      setLoginData({
        identifier: signupData.email,
        password: signupData.password,
      });
    }
  };

  const handleDemoResidentLogin = () => {
    setLoginData({
      identifier: "resident@gmail.com",
      password: "resident123",
    });
    if (login) {
      const result = login("resident@gmail.com", "resident123");
      if (result.success) {
        navigate("/");
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ maxWidth: isLogin ? "460px" : "540px", width: "100%", backgroundColor: "#ffffff", borderRadius: "16px", padding: "2.5rem 2rem", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.4)" }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#ef4444", color: "white", marginBottom: "0.75rem" }}>
            <Radio size={28} className="animate-pulse" />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.2rem 0", color: "#0f172a" }}>
            ALERTO • Barangay Anupul
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Incident Reporting & Emergency Notification System
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "10px", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setAuthError(""); }}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              backgroundColor: isLogin ? "#ffffff" : "transparent",
              color: isLogin ? "#0f172a" : "#64748b",
              boxShadow: isLogin ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Resident Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setAuthError(""); }}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              backgroundColor: !isLogin ? "#ffffff" : "transparent",
              color: !isLogin ? "#0f172a" : "#64748b",
              boxShadow: !isLogin ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Register Residency
          </button>
        </div>

        {authError && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.75rem", marginBottom: "1.25rem", color: "#b91c1c", fontSize: "0.82rem" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {isLogin ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                Email or Mobile Number
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="resident@gmail.com or 0917-123-4567"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem 0.75rem 0.75rem 2.4rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem 2.4rem 0.75rem 2.4rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{ padding: "0.85rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "0.92rem", cursor: "pointer", marginTop: "0.5rem" }}
            >
              Sign In as Resident
            </button>

            {/* Quick Demo Bypass Button */}
            <button
              type="button"
              onClick={handleDemoResidentLogin}
              style={{ padding: "0.65rem", backgroundColor: "#f8fafc", color: "#475569", border: "1px dashed #cbd5e1", borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
            >
              ⚡ Quick Demo Resident Login (Juan Dela Cruz)
            </button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>First Name</label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={signupData.firstName}
                  onChange={(e) => handleSignupInputChange("firstName", e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: errors.firstName ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {errors.firstName && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.firstName}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Last Name</label>
                <input
                  type="text"
                  placeholder="Dela Cruz"
                  value={signupData.lastName}
                  onChange={(e) => handleSignupInputChange("lastName", e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: errors.lastName ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {errors.lastName && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.lastName}</span>}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Sitio / Sector (Barangay Anupul)</label>
              <select
                value={signupData.sitioAddress}
                onChange={(e) => handleSignupInputChange("sitioAddress", e.target.value)}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: errors.sitioAddress ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
              >
                <option value="">Select your Sitio address...</option>
                {SITIO_LIST.map((sitio) => (
                  <option key={sitio} value={sitio}>{sitio}</option>
                ))}
              </select>
              {errors.sitioAddress && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.sitioAddress}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Mobile Number</label>
                <input
                  type="text"
                  placeholder="0917-123-4567"
                  value={signupData.contactNumber}
                  onChange={(e) => handleSignupInputChange("contactNumber", e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: errors.contactNumber ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {errors.contactNumber && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.contactNumber}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="resident@gmail.com"
                  value={signupData.email}
                  onChange={(e) => handleSignupInputChange("email", e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: errors.email ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {errors.email && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.email}</span>}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Proof of Residency Document (ID / Barangay Clearance)</label>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "0.8rem", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => handleSignupInputChange("password", e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: errors.password ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {errors.password && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.password}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => handleSignupInputChange("confirmPassword", e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: errors.confirmPassword ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {errors.confirmPassword && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "4px" }}>
              <input
                type="checkbox"
                id="isAnupulResident"
                checked={signupData.isAnupulResident}
                onChange={(e) => handleSignupInputChange("isAnupulResident", e.target.checked)}
                style={{ marginTop: "3px" }}
              />
              <label htmlFor="isAnupulResident" style={{ fontSize: "0.78rem", color: "#475569" }}>
                I certify under oath that I am an actual resident of Barangay Anupul, Bamban, Tarlac.
              </label>
            </div>
            {errors.isAnupulResident && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{errors.isAnupulResident}</span>}

            <button
              type="submit"
              style={{ padding: "0.85rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "0.92rem", cursor: "pointer", marginTop: "0.5rem" }}
            >
              Submit Residency Application
            </button>
          </form>
        )}

        {/* Admin Portal Gateway Link */}
        <div style={{ textAlign: "center", marginTop: "2rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
          <Link to="/admin/login" style={{ color: "#64748b", fontSize: "0.82rem", textDecoration: "none", fontWeight: 600 }}>
            🏛️ Authorized Official / Tanod Officer? <strong style={{ color: "#0f172a" }}>Open Official Desk</strong>
          </Link>
        </div>

      </div>
    </div>
  );
}
