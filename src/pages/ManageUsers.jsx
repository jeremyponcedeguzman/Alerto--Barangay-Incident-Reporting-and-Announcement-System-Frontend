import React from "react";
import { Link } from "react-router-dom";

export default function ManageUsers() {
  return (
    <div className="standard-page-container">
      <div className="standard-card">
        <h2 className="card-title">Manage Users</h2>
        <p className="card-subtitle">User and resident account management placeholder</p>
        <Link to="/" className="btn-back-link">Back to Main Page</Link>
      </div>
    </div>
  );
}
