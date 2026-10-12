import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useIncidents } from "../context/IncidentContext";
import { Megaphone, Send, Calendar, AlertTriangle, ArrowLeft } from "lucide-react";

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("General");
  
  const { announcements, addAnnouncement } = useIncidents() || {};

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Please provide a title and advisory message content.");
      return;
    }
    
    if (addAnnouncement) {
      addAnnouncement(title, message, priority);
    }
    
    setTitle("");
    setMessage("");
    setPriority("General");
    alert(`Broadcast Published to Barangay Anupul: ${title}`);
  };

  return (
    <div className="standard-page-container" style={{ maxWidth: "1000px", margin: "1.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
      <div className="standard-card" style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase" }}>
              Public Safety Advisories
            </span>
            <h2 className="card-title" style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0.2rem 0" }}>
              Barangay Anupul Broadcast Command
            </h2>
            <p className="card-subtitle" style={{ color: "#64748b", margin: 0 }}>
              Publish official announcements, weather advisories, and emergency alerts to all residents.
            </p>
          </div>
        </div>

        {/* Broadcast Creation Form */}
        <form onSubmit={handleBroadcast} style={{ backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 1rem 0", color: "#0f172a" }}>
            New Official Broadcast
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700, fontSize: "0.85rem" }}>
                Broadcast Title / Headline <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Heavy Rainfall Warning & Drainage Maintenance Operation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700, fontSize: "0.85rem" }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
              >
                <option value="General">General Info (Blue)</option>
                <option value="Weather Advisory">Weather Advisory (Amber)</option>
                <option value="Emergency">Emergency Alert (Red)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700, fontSize: "0.85rem" }}>
              Advisory Message Details <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide complete public advisory details, instructions for residents, and contact hotlines..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.75rem 1.5rem",
              backgroundColor: priority === "Emergency" ? "#dc2626" : "#0f172a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <Megaphone size={16} /> Publish Broadcast to Residents
          </button>
        </form>

        {/* Existing Broadcasts List */}
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 1rem 0", color: "#0f172a" }}>
            Published Broadcast History ({announcements?.length || 0})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {announcements && announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    borderLeft: ann.badgeType === "warning" ? "5px solid #ef4444" : ann.badgeType === "notice" ? "5px solid #f59e0b" : "5px solid #3b82f6",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "4px",
                      backgroundColor: ann.badgeType === "warning" ? "#fee2e2" : ann.badgeType === "notice" ? "#fef3c7" : "#e0f2fe",
                      color: ann.badgeType === "warning" ? "#b91c1c" : ann.badgeType === "notice" ? "#b45309" : "#0369a1"
                    }}>
                      {ann.badge}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} /> {ann.date}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 0.4rem 0", color: "#0f172a" }}>
                    {ann.title}
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#475569", margin: "0 0 0.5rem 0", lineHeight: 1.5 }}>
                    {ann.summary}
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Issued by: {ann.author}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>No announcements published yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
