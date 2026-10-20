import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { register: contextRegister, login: contextLogin } = auth;

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
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
    proofOfResidency: null,
  });

  const [errors, setErrors] = useState({});

  const SITIO_LIST = [
    "Sitio Baguingit",
    "Sitio Binitagan",
    "Sitio Centro",
    "Sitio Manga",
    "Sitio Mape",
    "Sitio Pag-asa",
    "Sitio Priority",
    "Sitio San Joseph",
    "Sitio San Roque",
    "MacArthur Highway / Main Road",
  ];

  const handleSignupInputChange = (field, value) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // --- 1. Resident Login (Hits POST /api/residents/login directly) ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const newErrors = {};

    if (!loginData.identifier.trim()) {
      newErrors.identifier = "Email or Contact Number is required.";
    }
    if (!loginData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const cleanId = loginData.identifier.trim().toLowerCase();

      // Prevent officials from logging in via the resident portal
      if (cleanId.endsWith("@anupul.gov") || cleanId === "admin@anupul.gov") {
        setAuthError("Barangay officials must log in through the Official Admin Portal.");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("http://localhost:5000/api/residents/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: loginData.identifier.trim(),
            password: loginData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid login credentials.");
        }

        const resident = data.resident;
        const currentStatus = (resident.status || resident.verificationStatus || "pending").toLowerCase();

        // Save fresh approved session to localStorage
        localStorage.setItem("alerto_current_user", JSON.stringify(resident));
        localStorage.setItem("user", JSON.stringify(resident));
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Keep local context synced
        if (typeof contextLogin === "function") {
          try {
            contextLogin(loginData.identifier, loginData.password);
          } catch {
            // Context fallback
          }
        }

        // Route based on approval status
        if (currentStatus === "approved") {
          navigate("/");
        } else if (currentStatus === "rejected") {
          setAuthError("✕ Your residency application was rejected by Barangay Officials.");
        } else {
          // Account still pending approval
          navigate("/");
        }
      } catch (err) {
        console.error("Login verification error:", err);
        setAuthError(err.message || "Failed to connect to authentication server.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // --- 2. Resident Registration ---
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const newErrors = {};

    if (!signupData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!signupData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!signupData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required.";
    if (!signupData.sitioAddress) newErrors.sitioAddress = "Please select your Sitio/Street.";

    if (!signupData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (signupData.email.toLowerCase().endsWith("@anupul.gov")) {
      newErrors.email = "Residents cannot use an @anupul.gov email. Please use a personal email.";
    }

    if (!signupData.password) {
      newErrors.password = "Password is required.";
    } else if (signupData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!signupData.isAnupulResident) {
      newErrors.isAnupulResident = "You must confirm residency in Barangay Anupul.";
    }

    if (!signupData.proofOfResidency) {
      newErrors.proofOfResidency = "A valid Proof of Residency document is required for verification.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const residentPayload = {
          fullName: `${signupData.firstName.trim()} ${signupData.lastName.trim()}`,
          firstName: signupData.firstName.trim(),
          lastName: signupData.lastName.trim(),
          email: signupData.email.trim().toLowerCase(),
          password: signupData.password,
          contactNumber: signupData.contactNumber.trim(),
          sitioAddress: signupData.sitioAddress,
          sitio: signupData.sitioAddress,
          address: `${signupData.sitioAddress}, Barangay Anupul, Bamban, Tarlac`,
          proofOfResidency: signupData.proofOfResidency?.name || "Uploaded Document",
          status: "pending",
          verificationStatus: "pending",
        };

        const response = await fetch("http://localhost:5000/api/residents/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(residentPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          setAuthError(data.message || "Failed to register resident in database.");
          setIsSubmitting(false);
          return;
        }

        // Sync local context state
        if (contextRegister) {
          await contextRegister({
            ...signupData,
            _id: data.data?._id,
            id: data.data?._id,
            sitio: signupData.sitioAddress,
            sitioAddress: signupData.sitioAddress,
            status: "pending",
            verificationStatus: "pending",
          });
        }

        alert("Registration submitted! Please wait for Barangay Anupul Officials to approve your account before logging in.");
        setIsLogin(true);
        setLoginData({ identifier: signupData.email, password: "", rememberMe: false });
      } catch (err) {
        console.error("Network error during registration:", err);
        setAuthError("Could not reach backend server at http://localhost:5000. Please ensure the backend is running.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          proofOfResidency: "File size exceeds 5MB limit. Please upload a smaller document.",
        }));
        return;
      }
      setSignupData((prev) => ({ ...prev, proofOfResidency: file }));
      setErrors((prev) => ({ ...prev, proofOfResidency: null }));
    }
  };

  const removeSelectedFile = (e) => {
    e.stopPropagation();
    setSignupData((prev) => ({ ...prev, proofOfResidency: null }));
  };

  return (
    <div className="standard-page-container">
      <div 
        className="profile-notice" 
        style={{ 
          marginBottom: "1rem", 
          backgroundColor: "var(--warning-light)", 
          borderLeft: "4px solid var(--warning)", 
          color: "#92400e", 
          gap: "0.75rem", 
          padding: "0.85rem 1rem" 
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div style={{ fontSize: "0.82rem", lineHeight: "1.4" }}>
          <strong>Notice:</strong> ALERT0 is an emergency accident reporting system currently exclusive to verified residents of <strong>Barangay Anupul, Bamban, Tarlac</strong>[cite: 8].
        </div>
      </div>

      <div className="login-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ 
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", 
          padding: "1.5rem", 
          textAlign: "center", 
          color: "white" 
        }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <div className="brand-logo-icon" style={{ width: "42px", height: "42px", background: "white", color: "#dc2626", fontWeight: 800, fontSize: "0.65rem", lineHeight: 1.1, textAlign: "center" }}>
              BRGY<br/>SEAL
            </div>
            <div style={{ textAlign: "left" }}>
              <h1 className="brand-name" style={{ color: "#fef08a", fontSize: "1.5rem" }}>ALERT0</h1>
              <p className="brand-sub" style={{ color: "#fee2e2" }}>Accident Emergency System</p>
            </div>
          </div>
          <p style={{ fontSize: "0.72rem", color: "#fee2e2", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginTop: "0.25rem" }}>
            Barangay Anupul • Bamban, Tarlac[cite: 8]
          </p>
        </div>

        <div className="reports-filter-tabs" style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-alt)", padding: "0.25rem" }}>
          <button
            type="button"
            className={`tab-btn ${isLogin ? "active" : ""}`}
            style={{ flex: 1, padding: "0.65rem", textAlign: "center" }}
            onClick={() => { setIsLogin(true); setErrors({}); setAuthError(""); }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLogin ? "active" : ""}`}
            style={{ flex: 1, padding: "0.65rem", textAlign: "center" }}
            onClick={() => { setIsLogin(false); setErrors({}); setAuthError(""); }}
          >
            Register Resident
          </button>
        </div>

        <div style={{ padding: "1.75rem" }}>
          {authError && (
            <div style={{ padding: "0.75rem", backgroundColor: "var(--emergency-light)", color: "var(--emergency)", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600, marginBottom: "1rem" }}>
              ⚠️ {authError}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="report-form" noValidate style={{ gap: "1.25rem" }}>
              <div className="form-group">
                <label className="input-label">Email or Contact Number</label>
                <div className="input-with-icon">
                  <svg className="input-inner-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                    placeholder="e.g. resident@gmail.com or 09123456789"
                    className="form-input with-icon"
                    style={errors.identifier ? { borderColor: "var(--emergency)" } : {}}
                  />
                </div>
                {errors.identifier && <p style={{ fontSize: "0.75rem", color: "var(--emergency)", marginTop: "0.2rem" }}>{errors.identifier}</p>}
              </div>

              <div className="form-group">
                <label className="input-label">Password</label>
                <div className="input-with-icon">
                  <svg className="input-inner-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="form-input with-icon"
                    style={errors.password ? { borderColor: "var(--emergency)" } : {}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: "0.75rem", color: "var(--emergency)", marginTop: "0.2rem" }}>{errors.password}</p>}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  />
                  Remember Me
                </label>
                <a href="#forgot" style={{ color: "var(--emergency)", fontWeight: 600, textDecoration: "none" }}>
                  Forgot Password?
                </a>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-hero-primary-report" 
                style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Verifying..." : "Access Alert Dashboard"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="report-form" noValidate style={{ gap: "1.1rem" }}>
              <div style={{ padding: "0.85rem", backgroundColor: "var(--emergency-light)", border: "1px solid #fecaca", borderRadius: "10px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer", fontSize: "0.82rem", color: "#7f1d1d" }}>
                  <input
                    type="checkbox"
                    checked={signupData.isAnupulResident}
                    onChange={(e) => handleSignupInputChange("isAnupulResident", e.target.checked)}
                    style={{ marginTop: "0.2rem" }}
                  />
                  <span>
                    I explicitly confirm that I am a bona fide resident of <strong>Barangay Anupul, Bamban, Tarlac</strong>[cite: 8].
                  </span>
                </label>
                {errors.isAnupulResident && <p style={{ fontSize: "0.75rem", color: "var(--emergency)", marginTop: "0.3rem", fontWeight: 600 }}>{errors.isAnupulResident}</p>}
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label className="input-label">First Name <span className="required-star">*</span></label>
                  <input
                    type="text"
                    value={signupData.firstName}
                    onChange={(e) => handleSignupInputChange("firstName", e.target.value)}
                    placeholder="First Name"
                    className="form-input"
                    style={errors.firstName ? { borderColor: "var(--emergency)" } : {}}
                  />
                  {errors.firstName && <p style={{ fontSize: "0.75rem", color: "var(--emergency)" }}>{errors.firstName}</p>}
                </div>

                <div className="form-group">
                  <label className="input-label">Last Name <span className="required-star">*</span></label>
                  <input
                    type="text"
                    value={signupData.lastName}
                    onChange={(e) => handleSignupInputChange("lastName", e.target.value)}
                    placeholder="Last Name"
                    className="form-input"
                    style={errors.lastName ? { borderColor: "var(--emergency)" } : {}}
                  />
                  {errors.lastName && <p style={{ fontSize: "0.75rem", color: "var(--emergency)" }}>{errors.lastName}</p>}
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label className="input-label">Contact Number <span className="required-star">*</span></label>
                  <input
                    type="text"
                    value={signupData.contactNumber}
                    onChange={(e) => handleSignupInputChange("contactNumber", e.target.value)}
                    placeholder="09123456789"
                    className="form-input"
                    style={errors.contactNumber ? { borderColor: "var(--emergency)" } : {}}
                  />
                  {errors.contactNumber && <p style={{ fontSize: "0.75rem", color: "var(--emergency)" }}>{errors.contactNumber}</p>}
                </div>

                <div className="form-group">
                  <label className="input-label">Sitio / Street <span className="required-star">*</span></label>
                  <select
                    value={signupData.sitioAddress}
                    onChange={(e) => handleSignupInputChange("sitioAddress", e.target.value)}
                    className="form-input"
                    style={errors.sitioAddress ? { borderColor: "var(--emergency)" } : {}}
                  >
                    <option value="">Select Sitio in Anupul</option>
                    {SITIO_LIST.map((sitio) => (
                      <option key={sitio} value={sitio}>{sitio}</option>
                    ))}
                  </select>
                  {errors.sitioAddress && <p style={{ fontSize: "0.75rem", color: "var(--emergency)" }}>{errors.sitioAddress}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Email Address (Personal / Gmail) <span className="required-star">*</span></label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => handleSignupInputChange("email", e.target.value)}
                  placeholder="resident@gmail.com"
                  className="form-input"
                  style={errors.email ? { borderColor: "var(--emergency)" } : {}}
                />
                {errors.email && <p style={{ fontSize: "0.75rem", color: "var(--emergency)", marginTop: "0.2rem", fontWeight: 600 }}>⚠️ {errors.email}</p>}
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label className="input-label">Password <span className="required-star">*</span></label>
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => handleSignupInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={errors.password ? { borderColor: "var(--emergency)" } : {}}
                  />
                  {errors.password && <p style={{ fontSize: "0.75rem", color: "var(--emergency)" }}>{errors.password}</p>}
                </div>

                <div className="form-group">
                  <label className="input-label">Confirm Password <span className="required-star">*</span></label>
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => handleSignupInputChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={errors.confirmPassword ? { borderColor: "var(--emergency)" } : {}}
                  />
                  {errors.confirmPassword && <p style={{ fontSize: "0.75rem", color: "var(--emergency)" }}>{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "0.3rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label className="input-label">
                    Proof of Residency Document <span className="required-star">*</span>
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Max: 5MB</span>
                </div>

                <p className="input-subtext" style={{ fontSize: "0.76rem", lineHeight: "1.35", marginBottom: "0.5rem" }}>
                  Please upload a clear copy of an official document verifying your Barangay Anupul residency.
                </p>

                <div 
                  style={{
                    position: "relative",
                    border: signupData.proofOfResidency 
                      ? "2px solid var(--success)" 
                      : errors.proofOfResidency 
                        ? "2px dashed var(--emergency)" 
                        : "2px dashed var(--border-color)",
                    borderRadius: "12px",
                    padding: "1.25rem 1rem",
                    textAlign: "center",
                    backgroundColor: signupData.proofOfResidency ? "#f0fdf4" : "var(--bg-alt)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", zIndex: 1 }}
                  />

                  {signupData.proofOfResidency ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#dcfce7", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>

                      <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#065f46", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {signupData.proofOfResidency.name}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "#166534", margin: 0 }}>
                          {(signupData.proofOfResidency.size / 1024 / 1024).toFixed(2)} MB • Ready for admin review
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        style={{
                          position: "relative",
                          zIndex: 2,
                          background: "none",
                          border: "none",
                          color: "var(--emergency)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: "var(--emergency-light)"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
                          Click to upload document
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}> or drag and drop</span>
                      </div>

                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Supported formats: JPG, PNG, WEBP, PDF
                      </span>
                    </div>
                  )}
                </div>

                {errors.proofOfResidency && (
                  <p style={{ fontSize: "0.75rem", color: "var(--emergency)", marginTop: "0.3rem", fontWeight: 600 }}>
                    ⚠️ {errors.proofOfResidency}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-hero-primary-report" 
                style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Registering..." : "Register & Request Verification"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}