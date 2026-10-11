import React from "react";
import { Link } from "react-router-dom";

export default function AuditLogs() {
  return (
    <div className="standard-page-container">
      <div className="standard-card">
        <h2 className="card-title">Audit Logs</h2>
        <p className="card-subtitle">Audit logging placeholder</p>
        <Link to="/" className="btn-back-link">Back to Main Page</Link>
      </div>
    </div>
  );
}
