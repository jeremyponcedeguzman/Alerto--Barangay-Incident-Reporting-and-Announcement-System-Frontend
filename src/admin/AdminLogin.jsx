import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { login: contextLogin } = auth;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim() || !password) {
      setErrorMsg("Please enter your admin email and password.");
      return;
    }

    const cleanEmail = identifier.trim().toLowerCase();

    // Enforce domain check for official accounts
    if (!cleanEmail.endsWith("@anupul.gov")) {
      setErrorMsg("Access denied. Admin portal is strictly for @anupul.gov official accounts.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send authentication request to Express backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials. Access denied.");
      }

      // 2. Persist authentication session
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // 3. Keep local React AuthContext synchronized if supported
      if (typeof contextLogin === "function") {
        try {
          contextLogin(cleanEmail, password);
        } catch {
          // Fallback if context implementation is purely synchronous mock
        }
      }

      // 4. Verify admin role and route to approvals dashboard
      const userRole = data.user?.role?.toLowerCase();
      if (userRole === "admin" || userRole === "barangay official" || cleanEmail === "admin@anupul.gov") {
        navigate("/admin-approvals");
      } else {
        setErrorMsg("This account does not have official administrator privileges.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setErrorMsg(err.message || "Failed to connect to the authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "3rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <button
        type="button"
        onClick={() => navigate("/login")}
        style={{ marginBottom: "1rem", background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 700 }}
      >
        ← Resident Login Portal
      </button>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "1.5rem", textAlign: "center", color: "white" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "white" }}>
            ALERT0 Admin Access
          </h2>
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginTop: "0.25rem" }}>
            BARANGAY ANUPUL • OFFICIAL VERIFICATION PORTAL
          </p>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {errorMsg && (
            <div style={{ 
              padding: "0.85rem", 
              backgroundColor: errorMsg.includes("⏳") ? "#fef3c7" : "#fee2e2", 
              color: errorMsg.includes("⏳") ? "#92400e" : "#991b1b", 
              borderRadius: "8px", 
              fontSize: "0.82rem", 
              fontWeight: 600, 
              lineHeight: "1.4", 
              marginBottom: "1.25rem", 
              border: errorMsg.includes("⏳") ? "1px solid #fde68a" : "1px solid #fecaca" 
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Official Admin Email (@anupul.gov)
              </label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="official@anupul.gov"
                style={{ width: "100%", padding: "0.65rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "0.65rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              />
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "0.65rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#64748b" }}>
              💡 Super Admin: <code>admin@anupul.gov</code> / <code>admin123</code>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "0.75rem",
                backgroundColor: isLoading ? "#475569" : "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                marginTop: "0.25rem"
              }}
            >
              {isLoading ? "Authenticating..." : "Log In as Barangay Official"}
            </button>
          </form>
        </div>

        <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "0.85rem 1.25rem", textAlign: "center", fontSize: "0.78rem", color: "#64748b" }}>
          New Barangay Official?{" "}
          <a href="/admin/signup" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
            Register Official Account →
          </a>
        </div>

      </div>
    </div>
  );
}