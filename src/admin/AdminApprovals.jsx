import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useIncidents } from "../context/IncidentContext";
import AdminNavbar from "./AdminNavbar";

export default function AdminApprovals() {
  const auth = useAuth() || {};
  const { userDatabase = [], approveResident, rejectResident } = auth;
  
  const incidentCtx = useIncidents() || {};
  const incidents = incidentCtx.incidents || [];

  const [adminMainTab, setAdminMainTab] = useState("approvals");
  const [approvalSubTab, setApprovalSubTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSitio, setSelectedSitio] = useState("ALL");
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [expandedUserReports, setExpandedUserReports] = useState({});

  const SITIO_LIST = [
    "Sitio Baguingit",
    "Sitio Binitagan",
    "Sitio Centro",
    "Sitio Manga",
    "Sitio Mape",
    "Sitio Pag-asa",
    "Sitio Priority",
    "Sitio San Joseph",
    "Sitio San Roque",
    "MacArthur Highway / Main Road"
  ];

  const dbList = Array.isArray(userDatabase) ? userDatabase : [];

  const filteredUsers = dbList.filter((user) => {
    const status = user?.verificationStatus || "pending";
    const matchesTab = status === approvalSubTab;
    
    const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const contact = user?.contactNumber || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(search) || email.includes(search) || contact.includes(search);
      
    const matchesSitio = selectedSitio === "ALL" || user?.sitioAddress === selectedSitio;

    return matchesTab && matchesSearch && matchesSitio;
  });

  const pendingCount = dbList.filter((u) => (u?.verificationStatus || "pending") === "pending").length;
  const approvedCount = dbList.filter((u) => u?.verificationStatus === "approved").length;
  const rejectedCount = dbList.filter((u) => u?.verificationStatus === "rejected").length;

  const handleConfirmReject = (userId) => {
    if (!rejectionReasonInput.trim()) {
      alert("Please provide a reason for rejecting the residency application.");
      return;
    }
    if (rejectResident) {
      rejectResident(userId, rejectionReasonInput);
    }
    setRejectingUserId(null);
    setRejectionReasonInput("");
  };

  const toggleUserReports = (userId) => {
    setExpandedUserReports((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getUserIncidents = (user) => {
    if (!user) return [];
    return incidents.filter(
      (inc) =>
        inc.reporterId === user.id ||
        (inc.reporterEmail && inc.reporterEmail.toLowerCase() === user.email?.toLowerCase()) ||
        (inc.reporterName && inc.reporterName.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase())
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <AdminNavbar activeTab={adminMainTab} setActiveTab={setAdminMainTab} />

      <main style={{ maxWidth: "1100px", margin: "1.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        
        {/* RESIDENT APPROVALS VIEW */}
        {adminMainTab === "approvals" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "1.5rem 1.75rem", borderRadius: "16px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fef08a", textTransform: "uppercase" }}>
                  🏛️ Barangay Anupul • Official Portal
                </span>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.25rem 0 0" }}>Residency Verification Panel</h1>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>Validate registered residents and inspect proof documents.</p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ background: "rgba(255,255,255,0.1)", padding: "0.5rem 1rem", borderRadius: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b", display: "block" }}>{pendingCount}</span>
                  <span style={{ fontSize: "0.68rem", color: "#cbd5e1", fontWeight: 600 }}>PENDING</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", padding: "0.5rem 1rem", borderRadius: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981", display: "block" }}>{approvedCount}</span>
                  <span style={{ fontSize: "0.68rem", color: "#cbd5e1", fontWeight: 600 }}>APPROVED</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                <button type="button" onClick={() => setApprovalSubTab("pending")} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, backgroundColor: approvalSubTab === "pending" ? "#0f172a" : "#f1f5f9", color: approvalSubTab === "pending" ? "white" : "#475569" }}>
                  ⏳ Pending ({pendingCount})
                </button>
                <button type="button" onClick={() => setApprovalSubTab("approved")} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, backgroundColor: approvalSubTab === "approved" ? "#0f172a" : "#f1f5f9", color: approvalSubTab === "approved" ? "white" : "#475569" }}>
                  ✓ Approved ({approvedCount})
                </button>
                <button type="button" onClick={() => setApprovalSubTab("rejected")} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, backgroundColor: approvalSubTab === "rejected" ? "#0f172a" : "#f1f5f9", color: approvalSubTab === "rejected" ? "white" : "#475569" }}>
                  ✕ Rejected ({rejectedCount})
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "0.75rem" }}>
                <input type="text" placeholder="Search by name, email, or contact number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem" }} />
                <select value={selectedSitio} onChange={(e) => setSelectedSitio(e.target.value)} style={{ padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem" }}>
                  <option value="ALL">All Sitio Locations</option>
                  {SITIO_LIST.map((sitio) => <option key={sitio} value={sitio}>{sitio}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
                  <h3>No Resident Records Found</h3>
                  <p style={{ fontSize: "0.85rem" }}>
                    {approvalSubTab === "pending" ? "There are currently no pending residency applications to review." : `No ${approvalSubTab} resident records match your search criteria.`}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const status = user?.verificationStatus || "pending";
                  const userReports = getUserIncidents(user);
                  const isExpanded = !!expandedUserReports[user.id];

                  return (
                    <div key={user.id} style={{ backgroundColor: "white", padding: "1.35rem", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: status === "approved" ? "5px solid #10b981" : status === "rejected" ? "5px solid #ef4444" : "5px solid #f59e0b" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div>
                          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>{user.firstName} {user.lastName}</h3>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Submitted: {user.submittedAt || "Recently"}</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "9999px", backgroundColor: status === "approved" ? "#dcfce7" : status === "rejected" ? "#fee2e2" : "#fef3c7", color: status === "approved" ? "#166534" : status === "rejected" ? "#991b1b" : "#92400e" }}>
                          {status === "approved" ? "✓ Approved Resident" : status === "rejected" ? "✕ Rejected" : "⏳ Pending Verification"}
                        </span>
                      </div>

                      <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                        <div><strong>Sitio / Street:</strong> {user.sitioAddress || "N/A"}</div>
                        <div><strong>Contact Number:</strong> {user.contactNumber || "N/A"}</div>
                        <div style={{ gridColumn: "span 2" }}><strong>Email Address:</strong> {user.email || "N/A"}</div>
                        <div style={{ gridColumn: "span 2", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                          <strong>Proof of Residency Document:</strong>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", marginTop: "0.25rem" }}>
                            <span>📄 {user.proofOfResidency?.name || "Official Document Upload"}</span>
                            <button type="button" onClick={() => alert(`Inspecting document for ${user.firstName} ${user.lastName}`)} style={{ padding: "0.25rem 0.5rem", border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "#f8fafc", cursor: "pointer", fontSize: "0.75rem" }}>Inspect File</button>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <button type="button" onClick={() => toggleUserReports(user.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0.85rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                          <span>🚨 Reported Incidents by User ({userReports.length})</span>
                          <span>{isExpanded ? "▲ Hide" : "▼ View Reports"}</span>
                        </button>

                        {isExpanded && (
                          <div style={{ marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "#fafafa", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                            {userReports.length === 0 ? (
                              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontStyle: "italic" }}>No accident reports submitted by this resident.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {userReports.map((report) => (
                                  <div key={report.id} style={{ padding: "0.65rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "6px", borderLeft: "4px solid #ef4444" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700 }}>
                                      <span style={{ color: "#dc2626" }}>{report.type || "Accident Report"}</span>
                                      <span style={{ color: "#64748b" }}>{report.timestamp || "Recent"}</span>
                                    </div>
                                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem" }}><strong>Location:</strong> {report.location || report.sitio || "Barangay Anupul"}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {status === "pending" && (
                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                          {rejectingUserId === user.id ? (
                            <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                              <input type="text" placeholder="Reason for rejection..." value={rejectionReasonInput} onChange={(e) => setRejectionReasonInput(e.target.value)} style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #fecaca" }} />
                              <button type="button" onClick={() => setRejectingUserId(null)} style={{ padding: "0.4rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                              <button type="button" onClick={() => handleConfirmReject(user.id)} style={{ padding: "0.4rem 0.75rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}>Confirm</button>
                            </div>
                          ) : (
                            <>
                              <button type="button" onClick={() => setRejectingUserId(user.id)} style={{ padding: "0.5rem 1rem", backgroundColor: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>✕ Reject Application</button>
                              <button type="button" onClick={() => approveResident && approveResident(user.id)} style={{ padding: "0.5rem 1.25rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>✓ Approve Resident Account</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ALL INCIDENT REPORTS VIEW */}
        {adminMainTab === "reports" && (
          <div>
            <div style={{ backgroundColor: "#0f172a", color: "white", padding: "1.25rem 1.5rem", borderRadius: "12px", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>🚨 All Emergency Incident Reports</h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>Total Reports Submitted: {incidents.length}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {incidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <p style={{ color: "#64748b", margin: 0 }}>No incident reports have been submitted yet.</p>
                </div>
              ) : (
                incidents.map((incident, index) => (
                  <div key={incident.id || index} style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "5px solid #ef4444" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                      <h3 style={{ margin: 0, color: "#ef4444", fontSize: "1.1rem" }}>{incident.type || "Accident / Emergency"}</h3>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{incident.timestamp || incident.date || "Recent"}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem", color: "#334155" }}>
                      <p style={{ margin: 0 }}><strong>Reporter Name:</strong> {incident.reporterName || "Anonymous Resident"}</p>
                      <p style={{ margin: 0 }}><strong>Contact:</strong> {incident.reporterContact || "N/A"}</p>
                      <p style={{ margin: 0, gridColumn: "span 2" }}><strong>Exact Location / Sitio:</strong> 📍 {incident.location || incident.sitio || "Barangay Anupul"}</p>
                      {incident.description && (
                        <p style={{ margin: 0, gridColumn: "span 2", backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
                          <strong>Description:</strong> {incident.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* INCIDENT MAP LOCATION VIEW */}
        {adminMainTab === "map" && (
          <div>
            <div style={{ backgroundColor: "#0f172a", color: "white", padding: "1.25rem 1.5rem", borderRadius: "12px", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>📍 Incident Map Overview • Barangay Anupul</h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>Geographic distribution of reported emergency incidents.</p>
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ height: "400px", backgroundColor: "#e2e8f0", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🗺️</span>
                <h3 style={{ margin: 0, color: "#1e293b" }}>Barangay Anupul Emergency Map</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "400px", marginTop: "0.35rem" }}>Displaying active report markers across Sitio Baguingit, Sitio Centro, Sitio Pag-asa, and MacArthur Highway.</p>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                  {SITIO_LIST.map((sitio) => {
                    const count = incidents.filter(i => (i.location || "").includes(sitio) || (i.sitio || "").includes(sitio)).length;
                    return (
                      <span key={sitio} style={{ backgroundColor: count > 0 ? "#ef4444" : "#cbd5e1", color: "white", fontSize: "0.72rem", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontWeight: 700 }}>
                        📍 {sitio} ({count})
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}