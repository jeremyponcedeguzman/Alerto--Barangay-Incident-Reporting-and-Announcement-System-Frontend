import React, { useState } from "react";

export default function DutyRoster() {
  // We use a local state array to store our officials and tanods. 
  // In the future, this can be moved to a Context just like incidents!
  const [personnelList] = useState([
    { id: 1, name: "Hon. Roberto Santos", role: "Barangay Captain", category: "Official", isDuty: true, shift: "Day (8AM - 5PM)", contact: "0917-111-2222", image: "👨‍💼" },
    { id: 2, name: "Hon. Maria Clara", role: "Kagawad - Health & Peace", category: "Official", isDuty: true, shift: "Day (8AM - 5PM)", contact: "0918-222-3333", image: "👩‍💼" },
    { id: 3, name: "Juan Dela Cruz", role: "Chief Tanod", category: "Tanod", isDuty: true, shift: "Night (8PM - 8AM)", contact: "0919-333-4444", image: "👮‍♂️" },
    { id: 4, name: "Pedro Penduko", role: "Barangay Tanod", category: "Tanod", isDuty: false, shift: "Off Duty", contact: "0920-444-5555", image: "👮" },
    { id: 5, name: "Ana Reyes", role: "Barangay Medic", category: "Medic", isDuty: true, shift: "Night (8AM - 8PM)", contact: "0921-555-6666", image: "👩‍⚕️" },
    { id: 6, name: "Carlos Agoncillo", role: "Barangay Tanod", category: "Tanod", isDuty: true, shift: "Day (8AM - 8PM)", contact: "0922-777-8888", image: "👮‍♂️" },
  ]);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter the list based on the selected tab and search bar
  const filteredPersonnel = personnelList.filter((person) => {
    const matchesTab = 
      activeTab === "ALL" || 
      (activeTab === "ONDUTY" && person.isDuty) ||
      person.category.toUpperCase() === activeTab;
    
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          person.role.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const onDutyCount = personnelList.filter(p => p.isDuty).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "2rem" }}>
      <main style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        
        {/* Header Section */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "1.75rem", borderRadius: "16px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fef08a", textTransform: "uppercase" }}>
              🛡️ Barangay Anupul
            </span>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0.25rem 0 0" }}>Duty Roster & Directory</h1>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>Active patrols, barangay officials, and emergency responders.</p>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#34d399", display: "block" }}>{onDutyCount}</span>
            <span style={{ fontSize: "0.7rem", color: "#d1fae5", fontWeight: 700, textTransform: "uppercase" }}>Currently On Duty</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <button onClick={() => setActiveTab("ALL")} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, backgroundColor: activeTab === "ALL" ? "#0f172a" : "#f1f5f9", color: activeTab === "ALL" ? "white" : "#475569" }}>
              👥 All Personnel
            </button>
            <button onClick={() => setActiveTab("ONDUTY")} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, backgroundColor: activeTab === "ONDUTY" ? "#10b981" : "#f1f5f9", color: activeTab === "ONDUTY" ? "white" : "#475569" }}>
              🟢 On Duty Now
            </button>
            <button onClick={() => setActiveTab("OFFICIAL")} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, backgroundColor: activeTab === "OFFICIAL" ? "#3b82f6" : "#f1f5f9", color: activeTab === "OFFICIAL" ? "white" : "#475569" }}>
              🏛️ Officials
            </button>
            <button onClick={() => setActiveTab("TANOD")} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, backgroundColor: activeTab === "TANOD" ? "#ef4444" : "#f1f5f9", color: activeTab === "TANOD" ? "white" : "#475569" }}>
              👮 Tanods
            </button>
          </div>

          <input 
            type="text" 
            placeholder="Search by name or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.9rem" }} 
          />
        </div>

        {/* Personnel Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {filteredPersonnel.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
              <h3>No personnel found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredPersonnel.map((person) => (
              <div key={person.id} style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                
                {/* Status Badge */}
                <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem" }}>
                  {person.isDuty ? (
                    <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <span style={{ width: "6px", height: "6px", backgroundColor: "#16a34a", borderRadius: "50%", display: "inline-block" }}></span>
                      ON DUTY
                    </span>
                  ) : (
                    <span style={{ backgroundColor: "#f1f5f9", color: "#64748b", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700 }}>
                      OFF DUTY
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "2.5rem", backgroundColor: "#f8fafc", width: "60px", height: "60px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%", border: "1px solid #e2e8f0" }}>
                    {person.image}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 0.15rem 0", fontSize: "1.1rem", color: "#0f172a", fontWeight: 800 }}>{person.name}</h3>
                    <span style={{ fontSize: "0.8rem", color: person.category === "Official" ? "#2563eb" : "#ef4444", fontWeight: 700, textTransform: "uppercase" }}>
                      {person.role}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem", color: "#334155" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <strong>Shift:</strong> 
                    <span style={{ color: person.isDuty ? "#0f172a" : "#94a3b8" }}>{person.shift}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Contact:</strong> 
                    <span>{person.contact}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}