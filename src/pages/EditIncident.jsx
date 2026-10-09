import React from "react";
import { Link } from "react-router-dom";

export default function EditIncident() {
  return (
    <div className="standard-page-container">
      <div className="standard-card">
        <h2 className="card-title">Manage Incident</h2>
        <p className="card-subtitle">Status update placeholder</p>
        <Link to="/map" className="btn-back-link">Back to Map</Link>
      </div>
    </div>
  );
}
