import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [adminCredentials, setAdminCredentials] = useState({
    identifier: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!adminCredentials.identifier.trim() || !adminCredentials.password) {
      setErrorMessage("Please fill in both admin username and password.");
      return;
    }

    if (
      adminCredentials.identifier.trim().toLowerCase() === "admin@anupul.gov" &&
      adminCredentials.password === "admin123"
    ) {
      login("admin@anupul.gov", "admin123");
      navigate("/admin-approvals");
    } else {
      const result = login(adminCredentials.identifier, adminCredentials.password);
      if (result.success) {
        navigate("/admin-approvals");
      } else {
        setErrorMessage("Invalid Barangay Admin credentials. Access denied.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "3rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <button
        type="button"
        onClick={() => navigate("/login")}
        style={{ marginBottom: "1rem", background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 700 }}
      >
        ← Resident Login Portal
      </button>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "1.75rem", textAlign: "center", color: "white" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>ALERT0 Admin Access</h2>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "0.25rem 0 0", textTransform: "uppercase" }}>
            Barangay Anupul • Official Verification Portal
          </p>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {errorMessage && (
            <div style={{ padding: "0.65rem 0.85rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600, marginBottom: "1rem" }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>Admin Email / Username</label>
              <input
                type="text"
                value={adminCredentials.identifier}
                onChange={(e) => setAdminCredentials({ ...adminCredentials, identifier: e.target.value })}
                placeholder="admin@anupul.gov"
                style={{ width: "100%", padding: "0.65rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>Password</label>
              <input
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: "100%", padding: "0.65rem", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              />
            </div>

            <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.72rem", color: "#64748b" }}>
              💡 Demo Credentials: <code>admin@anupul.gov</code> / <code>admin123</code>
            </div>

            <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
              Log In as Barangay Official
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}