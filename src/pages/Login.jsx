import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, SITIO_LIST } from "../context/AuthContext";
import { Radio, ShieldCheck, Mail, Lock, Phone, User, MapPin, Upload, AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginSchema, signupSchema } from "../schemas";
import { uploadApi } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { register: authRegister, login } = auth;

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [uploadedProofName, setUploadedProofName] = useState("");
  const [proofPreview, setProofPreview] = useState(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // 1. React Hook Form for Resident Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // 2. React Hook Form for Resident Registration
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    setValue: setSignupValue,
    setError: setSignupError,
    formState: { errors: signupErrors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      sitioAddress: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAnupulResident: false,
      proofOfResidencyName: "",
      proofOfResidencyUrl: "",
    },
  });

  const onLogin = async (data) => {
    setAuthError("");
    if (login) {
      const result = await login(data.identifier, data.password);
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

  const onSignup = async (data) => {
    setAuthError("");
    if (authRegister) {
      const result = await authRegister(data);
      if (result && result.success === false) {
        setAuthError(result.message || "An account with this email address already exists.");
        setSignupError("email", {
          type: "manual",
          message: result.message || "This email address is already registered.",
        });
        return;
      }
      alert("Registration submitted! Your Barangay Anupul residency is awaiting verification.");
      setIsLogin(true);
      setLoginValue("identifier", data.email);
      setLoginValue("password", data.password);
    }
  };

  const handleDemoResidentLogin = () => {
    setLoginValue("identifier", "resident@gmail.com");
    setLoginValue("password", "resident123");
    if (login) {
      const result = login("resident@gmail.com", "resident123");
      if (result.success) {
        navigate("/");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedProofName(file.name);
      setSignupValue("proofOfResidencyName", file.name);

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64Data = evt.target.result;
        setProofPreview(base64Data);
        setSignupValue("proofOfResidencyUrl", base64Data);

        try {
          setIsUploadingProof(true);
          const uploadRes = await uploadApi.uploadImage(base64Data, "barangay-emergency/residents");
          if (uploadRes?.data?.url || uploadRes?.url) {
            const remoteUrl = uploadRes.data?.url || uploadRes.url;
            setSignupValue("proofOfResidencyUrl", remoteUrl);
          }
        } catch (uploadErr) {
          console.warn("Retaining base64 document proof (upload notice):", uploadErr?.message);
        } finally {
          setIsUploadingProof(false);
        }
      };
      reader.readAsDataURL(file);
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
          /* LOGIN FORM WITH REACT HOOK FORM + ZOD */
          <form onSubmit={handleLoginSubmit(onLogin)} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                Email or Mobile Number
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="resident@gmail.com or 09171234567"
                  {...registerLogin("identifier")}
                  style={{ width: "100%", padding: "0.75rem 0.75rem 0.75rem 2.4rem", borderRadius: "8px", border: loginErrors.identifier ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              </div>
              {loginErrors.identifier && (
                <span style={{ color: "#ef4444", fontSize: "0.74rem", marginTop: "4px", display: "block" }}>
                  {loginErrors.identifier.message}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...registerLogin("password")}
                  style={{ width: "100%", padding: "0.75rem 2.4rem 0.75rem 2.4rem", borderRadius: "8px", border: loginErrors.password ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
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
              {loginErrors.password && (
                <span style={{ color: "#ef4444", fontSize: "0.74rem", marginTop: "4px", display: "block" }}>
                  {loginErrors.password.message}
                </span>
              )}
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
          /* SIGNUP FORM WITH REACT HOOK FORM + ZOD */
          <form onSubmit={handleSignupSubmit(onSignup)} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>First Name</label>
                <input
                  type="text"
                  placeholder="Juan"
                  {...registerSignup("firstName")}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: signupErrors.firstName ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {signupErrors.firstName && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.firstName.message}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Last Name</label>
                <input
                  type="text"
                  placeholder="Dela Cruz"
                  {...registerSignup("lastName")}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: signupErrors.lastName ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {signupErrors.lastName && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.lastName.message}</span>}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Sitio / Sector (Barangay Anupul)</label>
              <select
                {...registerSignup("sitioAddress")}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: signupErrors.sitioAddress ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
              >
                <option value="">Select your Sitio address...</option>
                {SITIO_LIST.map((sitio) => (
                  <option key={sitio} value={sitio}>{sitio}</option>
                ))}
              </select>
              {signupErrors.sitioAddress && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.sitioAddress.message}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Mobile Number</label>
                <input
                  type="text"
                  placeholder="0917-123-4567"
                  {...registerSignup("contactNumber")}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: signupErrors.contactNumber ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {signupErrors.contactNumber && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.contactNumber.message}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="resident@gmail.com"
                  {...registerSignup("email")}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: signupErrors.email ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {signupErrors.email && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.email.message}</span>}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Proof of Residency Document (ID / Barangay Clearance)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "0.8rem", boxSizing: "border-box" }}
              />
              {proofPreview && (
                <div style={{ marginTop: "8px", padding: "8px 10px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
                  {proofPreview.startsWith("data:image/") || proofPreview.startsWith("http") ? (
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  ) : (
                    <div style={{ width: "44px", height: "44px", borderRadius: "6px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                      📄
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {uploadedProofName || "Uploaded Proof Document"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: isUploadingProof ? "#d97706" : "#059669", fontWeight: 600 }}>
                      {isUploadingProof ? "Uploading to Cloud..." : "✓ Document attached & ready for official inspection"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProofPreview(null);
                      setUploadedProofName("");
                      setSignupValue("proofOfResidencyName", "");
                      setSignupValue("proofOfResidencyUrl", "");
                    }}
                    style={{ fontSize: "0.74rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 700, padding: "4px" }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerSignup("password")}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: signupErrors.password ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {signupErrors.password && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.password.message}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerSignup("confirmPassword")}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: signupErrors.confirmPassword ? "1px solid #ef4444" : "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
                {signupErrors.confirmPassword && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.confirmPassword.message}</span>}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "4px" }}>
              <input
                type="checkbox"
                id="isAnupulResident"
                {...registerSignup("isAnupulResident")}
                style={{ marginTop: "3px" }}
              />
              <label htmlFor="isAnupulResident" style={{ fontSize: "0.78rem", color: "#475569" }}>
                I certify under oath that I am an actual resident of Barangay Anupul, Bamban, Tarlac.
              </label>
            </div>
            {signupErrors.isAnupulResident && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{signupErrors.isAnupulResident.message}</span>}

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
