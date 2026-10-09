import React from "react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="standard-page-container">
      <div className="login-card">
        <h2 className="card-title">Barangay Portal Login</h2>
        <p className="card-subtitle">Authentication placeholder (backend pending)</p>
        <Link to="/" className="btn-login-submit" style={{ textDecoration: "none" }}>
          Continue as Resident
        </Link>
      </div>
    </div>
  );
}
