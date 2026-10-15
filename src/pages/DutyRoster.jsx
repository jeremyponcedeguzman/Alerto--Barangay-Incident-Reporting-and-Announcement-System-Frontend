import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Phone, Clock, Search, UserCheck, UserX, ArrowLeft } from "lucide-react";
import { authApi, getAuthToken } from "../api";

export const INITIAL_PERSONNEL = [
  { id: 1, name: "Hon. Roberto Santos", role: "Barangay Captain", category: "Official", isDuty: true, shift: "Day (8:00 AM - 5:00 PM)", contact: "0917-111-2222", badge: "BRGY-CPT-01" },
  { id: 2, name: "Hon. Maria Clara", role: "Kagawad - Health & Peace", category: "Official", isDuty: true, shift: "Day (8:00 AM - 5:00 PM)", contact: "0918-222-3333", badge: "BRGY-KAG-02" },
  { id: 3, name: "Juan Dela Cruz", role: "Chief Tanod", category: "Tanod", isDuty: true, shift: "Night (8:00 PM - 8:00 AM)", contact: "0919-333-4444", badge: "TND-CHIEF-01" },
  { id: 4, name: "Pedro Penduko", role: "Barangay Tanod", category: "Tanod", isDuty: false, shift: "Off Duty (Rotating)", contact: "0920-444-5555", badge: "TND-004" },
  { id: 5, name: "Ana Reyes", role: "Barangay Medic / BHERT", category: "Medic", isDuty: true, shift: "Night (8:00 PM - 8:00 AM)", contact: "0921-555-6666", badge: "MED-005" },
  { id: 6, name: "Carlos Agoncillo", role: "Barangay Tanod", category: "Tanod", isDuty: true, shift: "Day (8:00 AM - 8:00 PM)", contact: "0922-777-8888", badge: "TND-006" },
];

export default function DutyRoster() {
  const [personnelList, setPersonnelList] = useState(() => {
    const saved = localStorage.getItem("alerto_staff_roster");
    if (!saved) return INITIAL_PERSONNEL;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PERSONNEL;
    } catch {
      return INITIAL_PERSONNEL;
    }
  });

  // Sync with officials from backend (only when authenticated)
  useEffect(() => {
    async function loadBackendOfficials() {
      if (!getAuthToken()) return;
      try {
        const res = await authApi.getOfficials();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const backendStaff = res.data.map((off, idx) => ({
            id: off._id || off.id || idx + 10,
            name: off.fullName,
            role: off.position || off.role || "Barangay Official",
            category: off.role === "Admin" ? "Official" : "Tanod",
            isDuty: true,
            shift: "Day (8:00 AM - 5:00 PM)",
            contact: off.contactNumber || "0917-123-4567",
            badge: `OFF-${String(idx + 1).padStart(3, '0')}`,
          }));
          setPersonnelList((prev) => {
            const map = new Map();
            prev.forEach((p) => map.set(p.name, p));
            backendStaff.forEach((p) => map.set(p.name, p));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Backend officials sync note:", err.message);
      }
    }
    loadBackendOfficials();
  }, []);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPersonnel = personnelList.filter((person) => {
    const matchesTab = 
      activeTab === "ALL" || 
      (activeTab === "ONDUTY" && person.isDuty) ||
      person.category.toUpperCase() === activeTab;
    
    const matchesSearch =
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.badge && person.badge.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const onDutyCount = personnelList.filter(p => p.isDuty).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "2rem" }}>
      <main style={{ maxWidth: "1150px", margin: "1.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        
        {/* Header Section */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          padding: "1.75rem",
          borderRadius: "16px",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fef08a", textTransform: "uppercase" }}>
              🏛️ Barangay Anupul • Public Safety Command
            </span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0.25rem 0 0" }}>
              Official Duty Roster & Personnel
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>
              Directory of active responders, Tanod night patrols, and on-call health medics.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "0.6rem 1.25rem", borderRadius: "10px", textAlign: "center" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#10b981", display: "block" }}>{onDutyCount}</span>
              <span style={{ fontSize: "0.7rem", color: "#cbd5e1", fontWeight: 600 }}>CURRENTLY ON DUTY</span>
            </div>
            <Link
              to="/add-staff"
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                padding: "0.65rem 1rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                whiteSpace: "nowrap"
              }}
            >
              + Onboard Staff
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: `All (${personnelList.length})` },
              { id: "ONDUTY", label: `On Duty (${onDutyCount})` },
              { id: "OFFICIAL", label: "Officials" },
              { id: "TANOD", label: "Tanod Patrol" },
              { id: "MEDIC", label: "BHERT Medics" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  backgroundColor: activeTab === tab.id ? "#0f172a" : "#f1f5f9",
                  color: activeTab === tab.id ? "white" : "#475569"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", minWidth: "260px" }}>
            <input
              type="text"
              placeholder="Search personnel by name or badge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem 0.55rem 2.25rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                boxSizing: "border-box"
              }}
            />
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        {/* Personnel Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {filteredPersonnel.map((person) => (
            <div
              key={person.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "1.25rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.2rem 0", color: "#0f172a" }}>
                    {person.name}
                  </h3>
                  <span style={{ fontSize: "0.82rem", color: "#3b82f6", fontWeight: 700, display: "block" }}>
                    {person.role}
                  </span>
                  {person.badge && (
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace" }}>
                      Badge: {person.badge}
                    </span>
                  )}
                </div>

                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  backgroundColor: person.isDuty ? "#dcfce7" : "#f1f5f9",
                  color: person.isDuty ? "#166534" : "#64748b"
                }}>
                  {person.isDuty ? <UserCheck size={13} /> : <UserX size={13} />}
                  {person.isDuty ? "On Duty" : "Off Duty"}
                </span>
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem", color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} color="#64748b" />
                  <span><strong>Shift:</strong> {person.shift}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} color="#64748b" />
                  <span><strong>Contact:</strong> {person.contact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
