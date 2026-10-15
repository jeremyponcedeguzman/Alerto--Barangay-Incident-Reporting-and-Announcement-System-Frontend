import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useIncidents } from "../context/IncidentContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, CheckCircle, ShieldCheck, Clock, MapPin, AlertTriangle, ShieldAlert } from "lucide-react";

export default function EditIncident() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};
  
  const { incidents, updateIncidentDetails, canUserResolveIncident } = useIncidents() || {}; 
  
  const currentIncident = incidents?.find((inc) => String(inc.id) === String(id));

  const isAdmin = currentUser?.role === "admin" || currentUser?.email === "admin@anupul.gov";
  const isAuthorized = isAdmin || (canUserResolveIncident && currentIncident ? canUserResolveIncident(currentIncident) : false);

  const [status, setStatus] = useState("Pending Review");
  const [responder, setResponder] = useState("");

  useEffect(() => {
    if (currentIncident) {
      setStatus(currentIncident.status || "Pending Review");
      setResponder(currentIncident.responder || "");
    }
  }, [currentIncident]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!isAuthorized) {
      alert("Permission Denied: You are not authorized to dispatch or resolve this incident.");
      return;
    }

    if (updateIncidentDetails) {
      await updateIncidentDetails(id, status, responder);
    }
    
    alert(`Successfully updated Incident #${id}!\n\nNew Status: ${status}\nAssigned Unit: ${responder}`);
    navigate(-1); 
  };

  if (!currentIncident) {
    return (
      <div className="standard-page-container" style={{ textAlign: "center", padding: "50px" }}>
        <h2>Incident Not Found</h2>
        <p>Could not locate incident record with ID: {id}</p>
        <button onClick={() => navigate(-1)} className="btn-back-link">Return to Dashboard</button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="standard-page-container" style={{ maxWidth: "600px", margin: "3rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        <div className="standard-card" style={{ backgroundColor: "white", padding: "2.5rem 2rem", borderRadius: "16px", border: "1px solid #fee2e2", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(239,68,68,0.1)" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
            Restricted Operations Desk
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
            Regular residents and personnel not dispatched to Incident #{id} are not authorized to modify dispatch units or mark this incident as resolved.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <Link to="/map" style={{ padding: "0.6rem 1.25rem", backgroundColor: "#ef4444", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem" }}>
              Return to Incident Map
            </Link>
            <Link to="/my-reports" style={{ padding: "0.6rem 1.25rem", backgroundColor: "#f1f5f9", color: "#334155", textDecoration: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", border: "1px solid #cbd5e1" }}>
              My Reports
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="standard-page-container" style={{ maxWidth: "700px", margin: "2.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <div className="standard-card" style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase" }}>
              Incident Management & Dispatch
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.2rem 0", color: "#0f172a" }}>
              Manage Incident #{id}
            </h2>
          </div>
        </div>

        {/* Incident Summary Card */}
        <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1.75rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.5rem 0", color: "#0f172a" }}>
            {currentIncident.title}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", fontSize: "0.85rem", color: "#475569" }}>
            <div><strong>Location:</strong> {currentIncident.locationName || "Barangay Anupul"}</div>
            <div><strong>Reporter:</strong> {currentIncident.reportedBy || "Juan Dela Cruz"}</div>
            <div><strong>Severity:</strong> <span style={{ textTransform: "uppercase", fontWeight: 700, color: currentIncident.severity === "critical" ? "#dc2626" : "#ea580c" }}>{currentIncident.severity}</span></div>
            <div><strong>Logged At:</strong> {currentIncident.timestamp || "Recently"}</div>
            {currentIncident.description && (
              <div style={{ gridColumn: "span 2", marginTop: "0.25rem" }}>
                <strong>Details:</strong> {currentIncident.description}
              </div>
            )}
            {currentIncident.imageEvidence && (
              <div style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                <strong>Live Photo Evidence:</strong>
                <img
                  src={currentIncident.imageEvidence}
                  alt="Incident Evidence"
                  style={{ maxWidth: "220px", maxHeight: "150px", borderRadius: "8px", display: "block", marginTop: "4px", border: "1px solid #cbd5e1" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dispatch & Status Form */}
        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.4rem" }}>
              Dispatch Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", boxSizing: "border-box" }}
            >
              <option value="Pending Review">Pending Review</option>
              <option value="Dispatched">Dispatched (Units En Route)</option>
              <option value="In Progress">In Progress (Active Response)</option>
              <option value="Resolved">Resolved (Cleared on Site)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.4rem" }}>
              Assigned Responder Unit
            </label>
            <select
              value={responder}
              onChange={(e) => setResponder(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", boxSizing: "border-box" }}
            >
              <option value="">Select responding unit...</option>
              <option value="Barangay Tanod Patrol 👮">Barangay Tanod Patrol 👮</option>
              <option value="BFP Firefighters 🚒">BFP Firefighters 🚒</option>
              <option value="BHERT Medic 🚑">BHERT Medic / Ambulance 🚑</option>
              <option value="DRRMO Rescue Unit 🌊">DRRMO Rescue Unit 🌊</option>
              <option value="Traffic Enforcement & Tanod ⚠️">Traffic Enforcement & Tanod ⚠️</option>
              <option value="Barangay Engineering & Meralco ⚡">Barangay Engineering & Meralco ⚡</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ flex: 1, padding: "0.75rem", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 2, padding: "0.75rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: 800, cursor: "pointer" }}
            >
              Save & Dispatch Incident
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
