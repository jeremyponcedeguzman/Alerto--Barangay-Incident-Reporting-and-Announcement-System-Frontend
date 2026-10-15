import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, generateSampleCertificate } from "../context/AuthContext";
import { useIncidents } from "../context/IncidentContext";
import AdminNavbar from "./AdminNavbar";
import Announcements from "../pages/Announcements";
import IncidentMap from "../pages/IncidentMap";
import DutyRoster from "../pages/DutyRoster";
import { FileText, Eye, ZoomIn, ZoomOut, RotateCcw, ExternalLink, X, CheckCircle, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

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
  const [inspectingProofUser, setInspectingProofUser] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);

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
      
    const matchesSitio = selectedSitio === "ALL" || user?.sitioAddress === selectedSitio || user?.role === "admin";

    return matchesTab && matchesSearch && matchesSitio;
  });

  const pendingCount = dbList.filter((u) => (u?.verificationStatus || "pending") === "pending").length;
  const approvedCount = dbList.filter((u) => u?.verificationStatus === "approved").length;
  const rejectedCount = dbList.filter((u) => u?.verificationStatus === "rejected").length;

  const handleConfirmReject = (userId) => {
    if (!rejectionReasonInput.trim()) {
      alert("Please provide a reason for rejecting the application.");
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
        (inc.reportedBy && inc.reportedBy.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase())
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <AdminNavbar activeTab={adminMainTab} setActiveTab={setAdminMainTab} />

      <main style={{ 
        maxWidth: adminMainTab === "map" ? "100%" : "1200px", 
        margin: "1.5rem auto", 
        padding: "0 1rem", 
        fontFamily: "sans-serif" 
      }}>

        {/* 1. RESIDENT & OFFICIAL APPROVALS TAB */}
        {adminMainTab === "approvals" && (
          <div>
            <div style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "white",
              padding: "1.5rem 1.75rem",
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
                  🏛️ Barangay Anupul • Official Operations Desk
                </span>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.25rem 0 0" }}>Account Verification Queue</h1>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>Review registered residents and incoming barangay official accounts.</p>
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
                <button
                  type="button"
                  onClick={() => setApprovalSubTab("pending")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    backgroundColor: approvalSubTab === "pending" ? "#0f172a" : "#f1f5f9",
                    color: approvalSubTab === "pending" ? "white" : "#475569"
                  }}
                >
                  ⏳ Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalSubTab("approved")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    backgroundColor: approvalSubTab === "approved" ? "#0f172a" : "#f1f5f9",
                    color: approvalSubTab === "approved" ? "white" : "#475569"
                  }}
                >
                  ✓ Approved ({approvedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalSubTab("rejected")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    backgroundColor: approvalSubTab === "rejected" ? "#0f172a" : "#f1f5f9",
                    color: approvalSubTab === "rejected" ? "white" : "#475569"
                  }}
                >
                  ✕ Rejected ({rejectedCount})
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="Search by resident name, email, or contact number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem" }}
                />
                <select
                  value={selectedSitio}
                  onChange={(e) => setSelectedSitio(e.target.value)}
                  style={{ padding: "0.65rem 0.85rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.88rem" }}
                >
                  <option value="ALL">All Sitios / Sectors</option>
                  {SITIO_LIST.map((sitio) => (
                    <option key={sitio} value={sitio}>{sitio}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
                  <h3>No Records Found</h3>
                  <p style={{ fontSize: "0.85rem" }}>
                    {approvalSubTab === "pending"
                      ? "There are currently no pending verification requests to review."
                      : `No ${approvalSubTab} records match your search filter.`}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const status = user?.verificationStatus || "pending";
                  const isAdminReg = user?.role === "admin";
                  const userReports = getUserIncidents(user);
                  const isExpanded = !!expandedUserReports[user.id];

                  return (
                    <div
                      key={user.id}
                      style={{
                        backgroundColor: "white",
                        padding: "1.35rem",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        borderLeft: status === "approved" ? "5px solid #10b981" : status === "rejected" ? "5px solid #ef4444" : "5px solid #f59e0b"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                              {user.firstName} {user.lastName}
                            </h3>
                            {isAdminReg && (
                              <span style={{ fontSize: "0.68rem", backgroundColor: "#3b82f6", color: "white", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 700 }}>
                                OFFICIAL APPLICANT
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Submitted: {user.submittedAt || "Recently"}</span>
                        </div>
                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.25rem 0.65rem",
                          borderRadius: "9999px",
                          backgroundColor: status === "approved" ? "#dcfce7" : status === "rejected" ? "#fee2e2" : "#fef3c7",
                          color: status === "approved" ? "#166534" : status === "rejected" ? "#991b1b" : "#92400e"
                        }}>
                          {status === "approved" ? (isAdminReg ? "✓ Approved Official" : "✓ Approved Resident") : status === "rejected" ? "✕ Rejected" : "⏳ Pending Verification"}
                        </span>
                      </div>

                      <div style={{
                        backgroundColor: "#f8fafc",
                        padding: "1rem",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        marginBottom: "1rem",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        fontSize: "0.85rem"
                      }}>
                        {isAdminReg ? (
                          <>
                            <div style={{ gridColumn: "span 2" }}><strong>Designation:</strong> {user.officialPosition || "Barangay Official"}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Official Email:</strong> {user.email || "N/A"}</div>
                          </>
                        ) : (
                          <>
                            <div><strong>Sitio / Street:</strong> {user.sitioAddress || "N/A"}</div>
                            <div><strong>Contact Number:</strong> {user.contactNumber || "N/A"}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Email Address:</strong> {user.email || "N/A"}</div>
                            <div style={{ gridColumn: "span 2", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <strong>Proof of Residency Document:</strong>
                                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Official Verified Copy</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginTop: "4px", padding: "6px 10px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                                  <FileText size={18} color="#0284c7" />
                                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {user.proofOfResidencyName || user.proofOfResidency?.name || "barangay_clearance.png"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInspectingProofUser(user);
                                    setZoomScale(1);
                                  }}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "0.35rem 0.75rem",
                                    border: "1px solid #0284c7",
                                    borderRadius: "6px",
                                    backgroundColor: "#0284c7",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "0.76rem",
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 1px 2px rgba(2, 132, 199, 0.2)"
                                  }}
                                >
                                  <Eye size={13} />
                                  Inspect File
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {!isAdminReg && (
                        <div style={{ marginBottom: "1rem" }}>
                          <button
                            type="button"
                            onClick={() => toggleUserReports(user.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "0.65rem 0.85rem",
                              backgroundColor: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#1e293b"
                            }}
                          >
                            <span>🚨 Incident Reports Submitted by Resident ({userReports.length})</span>
                            <span>{isExpanded ? "▲ Hide" : "▼ View Reports"}</span>
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "#fafafa", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                              {userReports.length === 0 ? (
                                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontStyle: "italic" }}>No emergency reports submitted by this resident yet.</p>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                  {userReports.map((report) => (
                                    <div key={report.id} style={{ padding: "0.65rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "6px", borderLeft: "4px solid #ef4444" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700 }}>
                                        <span style={{ color: "#dc2626" }}>{report.title || "Emergency Report"}</span>
                                        <span style={{ color: "#64748b" }}>{report.relativeTime || "Recent"}</span>
                                      </div>
                                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem" }}><strong>Location:</strong> {report.locationName || "Barangay Anupul"}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {status === "pending" && (
                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                          {rejectingUserId === user.id ? (
                            <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                              <input
                                type="text"
                                placeholder="Reason for rejection (e.g. proof outside Barangay Anupul)..."
                                value={rejectionReasonInput}
                                onChange={(e) => setRejectionReasonInput(e.target.value)}
                                style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #fecaca" }}
                              />
                              <button type="button" onClick={() => setRejectingUserId(null)} style={{ padding: "0.4rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                              <button type="button" onClick={() => handleConfirmReject(user.id)} style={{ padding: "0.4rem 0.75rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}>Confirm Reject</button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setRejectingUserId(user.id)}
                                style={{ padding: "0.5rem 1rem", backgroundColor: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}
                              >
                                ✕ Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => approveResident && approveResident(user.id)}
                                style={{ padding: "0.5rem 1.25rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}
                              >
                                ✓ Approve Account
                              </button>
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

        {/* 2. ALL INCIDENT REPORTS VIEW */}
        {adminMainTab === "reports" && (
          <div>
            <div style={{ backgroundColor: "#0f172a", color: "white", padding: "1.25rem 1.5rem", borderRadius: "12px", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>🚨 All Emergency Incident Reports</h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>Total Reports in Queue: {incidents.length}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {incidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <p style={{ color: "#64748b", margin: 0 }}>No incident reports have been submitted yet.</p>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    style={{
                      backgroundColor: "white",
                      padding: "1.25rem",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      borderLeft: "5px solid #ef4444"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                      <h3 style={{ margin: 0, color: "#ef4444", fontSize: "1.1rem" }}>{incident.title}</h3>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{incident.relativeTime || incident.timestamp || "Recent"}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem", color: "#334155" }}>
                      <p style={{ margin: 0 }}><strong>Reporter:</strong> {incident.reportedBy || "Juan Dela Cruz"}</p>
                      <p style={{ margin: 0 }}><strong>Assigned Responder:</strong> {incident.responder || "Unassigned"}</p>
                      <p style={{ margin: 0, gridColumn: "span 2" }}><strong>Exact Location:</strong> 📍 {incident.locationName || "Barangay Anupul"}</p>
                      <p style={{ margin: 0, gridColumn: "span 2" }}><strong>Status:</strong> <span style={{ fontWeight: 700, color: incident.status === "Resolved" ? "#10b981" : "#ea580c" }}>{incident.status}</span></p>
                      {incident.description && (
                        <p style={{ margin: 0, gridColumn: "span 2", backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
                          <strong>Description:</strong> {incident.description}
                        </p>
                      )}
                      {incident.imageEvidence && (
                        <div style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                          <strong>Live Camera Evidence:</strong>
                          <img
                            src={incident.imageEvidence}
                            alt="Live Camera Evidence"
                            style={{ maxWidth: "200px", maxHeight: "140px", borderRadius: "8px", display: "block", marginTop: "4px", border: "1px solid #cbd5e1" }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed #cbd5e1", textAlign: "right" }}>
                      <Link 
                        to={`/edit-incident/${incident.id}`} 
                        style={{ 
                          display: "inline-block", 
                          padding: "0.5rem 1rem", 
                          backgroundColor: "#ef4444", 
                          color: "white", 
                          textDecoration: "none", 
                          borderRadius: "6px", 
                          fontWeight: "bold", 
                          fontSize: "0.85rem" 
                        }}
                      >
                        Manage & Dispatch ➔
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. INCIDENT MAP LOCATION VIEW */}
        {adminMainTab === "map" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ backgroundColor: "#0f172a", color: "white", padding: "1.25rem 1.5rem", borderRadius: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>📍 Live Incident Command Map</h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>Real-time geographic distribution and heatmaps of reported emergencies in Barangay Anupul.</p>
            </div>
            
            <div style={{ minHeight: "750px", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <IncidentMap />
            </div>
          </div>
        )}

        {/* 4. ANNOUNCEMENTS DASHBOARD VIEW */}
        {adminMainTab === "announcements" && (
          <Announcements />
        )}

        {/* 5. DUTY ROSTER VIEW */}
        {adminMainTab === "roster" && (
          <DutyRoster />
        )}

      </main>

      {/* 6. DOCUMENT INSPECTION LIGHTBOX MODAL */}
      {inspectingProofUser && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingProofUser(null);
          }}
        >
          <div
            style={{
              maxWidth: "880px",
              width: "100%",
              maxHeight: "92vh",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              overflow: "hidden",
              border: "1px solid #e2e8f0"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.2rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#0f172a",
                color: "#ffffff"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={22} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "white" }}>
                    Residency Verification Inspection
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                    {inspectingProofUser.firstName} {inspectingProofUser.lastName} • {inspectingProofUser.sitioAddress || "Sitio Centro"}, Barangay Anupul
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                    backgroundColor: inspectingProofUser.verificationStatus === "approved" ? "#166534" : inspectingProofUser.verificationStatus === "rejected" ? "#991b1b" : "#b45309",
                    color: "white"
                  }}
                >
                  {inspectingProofUser.verificationStatus === "approved" ? "✓ Approved Resident" : inspectingProofUser.verificationStatus === "rejected" ? "✕ Rejected" : "⏳ Pending Approval"}
                </span>
                <button
                  type="button"
                  onClick={() => setInspectingProofUser(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Inspection Controls Toolbar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.6rem 1.25rem",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                fontSize: "0.8rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155" }}>
                <FileText size={16} color="#0284c7" />
                <span style={{ fontWeight: 600 }}>File:</span>
                <span style={{ fontFamily: "monospace", color: "#0f172a", backgroundColor: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                  {inspectingProofUser.proofOfResidencyName || "barangay_clearance.png"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.25))}
                  title="Zoom Out"
                  style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                >
                  <ZoomOut size={14} /> -
                </button>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, minWidth: "40px", textAlign: "center" }}>
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.25))}
                  title="Zoom In"
                  style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                >
                  <ZoomIn size={14} /> +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  title="Reset Zoom"
                  style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const docUrl = inspectingProofUser.proofOfResidencyUrl || generateSampleCertificate(`${inspectingProofUser.firstName} ${inspectingProofUser.lastName}`, inspectingProofUser.sitioAddress);
                    const win = window.open();
                    if (win) {
                      win.document.write(`<title>Barangay Document - ${inspectingProofUser.firstName} ${inspectingProofUser.lastName}</title><body style="margin:0;background:#1e293b;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${docUrl}" style="max-width:90%;max-height:95vh;box-shadow:0 10px 30px rgba(0,0,0,0.5);"/></body>`);
                    }
                  }}
                  title="Open Full Screen in New Tab"
                  style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #0284c7", backgroundColor: "#f0f9ff", color: "#0284c7", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  <ExternalLink size={13} /> Open Tab
                </button>
              </div>
            </div>

            {/* Document Image Viewport */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                backgroundColor: "#0b1329",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "380px",
                maxHeight: "56vh"
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease",
                  maxWidth: "100%",
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <img
                  src={
                    inspectingProofUser.proofOfResidencyUrl ||
                    generateSampleCertificate(
                      `${inspectingProofUser.firstName} ${inspectingProofUser.lastName}`,
                      inspectingProofUser.sitioAddress
                    )
                  }
                  alt={`Proof of Residency for ${inspectingProofUser.firstName} ${inspectingProofUser.lastName}`}
                  style={{
                    maxWidth: "680px",
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    border: "2px solid #334155",
                    backgroundColor: "white"
                  }}
                />
              </div>
            </div>

            {/* Verification Checklist & Footer Controls */}
            <div
              style={{
                padding: "1rem 1.5rem",
                backgroundColor: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.78rem", color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span><strong>Applicant:</strong> {inspectingProofUser.firstName} {inspectingProofUser.lastName} ({inspectingProofUser.email || "No email"})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span><strong>Declared Address:</strong> {inspectingProofUser.sitioAddress || "Sitio Centro"}, Barangay Anupul, Bamban, Tarlac</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setInspectingProofUser(null)}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#334155",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  Close Document
                </button>

                {inspectingProofUser.verificationStatus === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt(`Reason for rejecting residency application for ${inspectingProofUser.firstName} ${inspectingProofUser.lastName}:`, "Document not within Barangay Anupul jurisdiction or illegible.");
                        if (reason && reason.trim()) {
                          if (rejectResident) rejectResident(inspectingProofUser.id, reason.trim());
                          setInspectingProofUser(null);
                        }
                      }}
                      style={{
                        padding: "0.6rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #ef4444",
                        backgroundColor: "#fef2f2",
                        color: "#ef4444",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      Reject Application
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (approveResident) approveResident(inspectingProofUser.id);
                        setInspectingProofUser(null);
                      }}
                      style={{
                        padding: "0.6rem 1.25rem",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#10b981",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)"
                      }}
                    >
                      ✓ Approve Residency
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
