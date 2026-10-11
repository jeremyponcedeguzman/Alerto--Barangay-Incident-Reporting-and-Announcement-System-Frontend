import React from "react";
import { Link } from "react-router-dom";

export default function AddStaff() {
  return (
    <div className="standard-page-container">
      <div className="standard-card">
        <h2 className="card-title">Add Staff</h2>
        <p className="card-subtitle">Staff management placeholder</p>
        <Link to="/" className="btn-back-link">Back to Main Page</Link>
      </div>
    </div>
  );
}
