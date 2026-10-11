import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useIncidents } from "../context/IncidentContext"; // Grabs your global data

export default function EditIncident() {
  const { id } = useParams(); // Gets the ID from the URL (e.g., /edit-incident/123)
  const navigate = useNavigate();
  
  // Extract our new function from context alongside incidents
  const { incidents, updateIncidentDetails } = useIncidents() || {}; 
  
  // Find the specific incident that matches the URL ID
  const currentIncident = incidents?.find((inc) => String(inc.id) === String(id));

  // State for our form
  const [status, setStatus] = useState("Pending Review");
  const [responder, setResponder] = useState("");

  // Pre-fill the form if the incident already has data
  useEffect(() => {
    if (currentIncident) {
      setStatus(currentIncident.status || "Pending Review");
      setResponder(currentIncident.responder || "");
    }
  }, [currentIncident]);

  const handleUpdate = (e) => {
    e.preventDefault();
    
    // Call the function from context to update global state!
    if (updateIncidentDetails) {
      updateIncidentDetails(id, status, responder);
    }
    
    alert(`Successfully updated Incident #${id}!\n\nNew Status: ${status}\nAssigned To: ${responder}`);
    
    // Send the admin back to the reports dashboard after saving
    navigate(-1); 
  };

  // If the incident ID doesn't exist, show an error
  if (!currentIncident) {
    return (
      <div className="standard-page-container" style={{ textAlign: "center", padding: "50px" }}>
        <h2>Incident Not Found</h2>
        <p>We couldn't find an incident with ID: {id}</p>
        <button onClick={() => navigate(-1)} className="btn-back-link">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="standard-page-container">
      <div className="standard-card">
        {/* Header showing specific incident details */}
        <div style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>
          <h2 className="card-title">Dispatch & Manage</h2>
          <p className="card-subtitle" style={{ color: "#ef4444", fontWeight: "bold" }}>
            {currentIncident.type || "Emergency"} • {currentIncident.location || currentIncident.sitio}
          </p>
          <p style={{ fontSize: "0.85rem", color: "gray", margin: 0 }}>
            Reported by: {currentIncident.reporterName || "Anonymous"} | Contact: {currentIncident.reporterContact || "N/A"}
          </p>
        </div>
        
        <form onSubmit={handleUpdate}>
          {/* Status Dropdown */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Incident Status
            </label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="Pending Review">Pending Review</option>
              <option value="Responders Dispatched">Responders Dispatched</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Assign Responder Input */}
          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Assign Responder (Tanod / Medic)
            </label>
            <input 
              type="text" 
              placeholder="e.g., Tanod Juan Cruz" 
              value={responder}
              onChange={(e) => setResponder(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <button 
            type="submit" 
            style={{ padding: "10px 15px", backgroundColor: "#0b2046", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "15px" }}
          >
            Save Updates
          </button>
        </form>

        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}>
          ← Cancel and Go Back
        </button>
      </div>
    </div>
  );
}