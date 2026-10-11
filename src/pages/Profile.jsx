import React from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  return (
    <div className="standard-page-container">
      <div className="standard-card">
        <h2 className="card-title">Resident Profile</h2>
        <p className="card-subtitle">Profile placeholder</p>
        <Link to="/" className="btn-back-link">Back to Main Page</Link>
      </div>
    </div>
  );
}
