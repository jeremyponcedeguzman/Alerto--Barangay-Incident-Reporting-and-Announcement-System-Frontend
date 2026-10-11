import React, { useState } from "react";
import { useIncidents } from "../context/IncidentContext";

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("General");
  
  const { announcements, addAnnouncement } = useIncidents() || {};

  const handleBroadcast = (e) => {
    e.preventDefault();
    
    if (addAnnouncement) {
      addAnnouncement(title, message, priority);
    }
    
    setTitle("");
    setMessage("");
    setPriority("General");
    alert(`Broadcast Published: ${title}`);
  };

  return (
    <div className="standard-page-container">
      <div className="standard-card">
        <h2 className="card-title">Barangay Announcements</h2>
        <p className="card-subtitle">Broadcast advisories and warnings to residents.</p>

        <form onSubmit={handleBroadcast} style={{ marginTop: "20px", marginBottom: "40px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Priority Level</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="General">General Info</option>
              <option value="Weather Advisory">Weather Advisory</option>
              <option value="Emergency">Emergency Alert</option>
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Announcement Title</label>
            <input type="text" required placeholder="e.g., Scheduled Power Interruption" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Message</label>
            <textarea required rows="4" placeholder="Write the details of the announcement here..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", resize: "vertical" }} />
          </div>

          <button type="submit" style={{ padding: "10px 15px", backgroundColor: "#0b2046", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
            Publish Broadcast
          </button>
        </form>

        <hr style={{ margin: "30px 0", border: "0.5px solid #eee" }} />

        <h3 style={{ marginBottom: "15px" }}>Recent Broadcasts</h3>
        {!announcements || announcements.length === 0 ? (
          <p style={{ color: "gray", fontStyle: "italic" }}>No announcements have been published yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {announcements.map((item) => (
              <div key={item.id} style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#f9f9f9", borderLeft: item.badgeType === "warning" ? "5px solid red" : "5px solid #0ea5e9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <strong style={{ color: item.badgeType === "warning" ? "red" : "black" }}>
                    [{item.badge}] {item.title}
                  </strong>
                  <span style={{ fontSize: "0.85em", color: "gray" }}>{item.date}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.95em" }}>{item.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}