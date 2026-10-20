import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminApprovals() {
  const [adminMainTab, setAdminMainTab] = useState("approvals");
  const [approvalSubTab, setApprovalSubTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSitio, setSelectedSitio] = useState("ALL");
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [expandedUserReports, setExpandedUserReports] = useState({});

  const [userList, setUserList] = useState([]);
  const [incidentList, setIncidentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [updatingIncidentId, setUpdatingIncidentId] = useState(null);

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
    "MacArthur Highway / Main Road",
  ];

  // Fetch live accounts (Officials + Residents) & Incidents from MongoDB
  const loadDashboardData = async () => {
    setLoading(true);
    setFetchError("");
    const token = localStorage.getItem("token");

    const authHeaders = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      // 1. Fetch Incidents
      const incRes = await fetch("http://localhost:5000/api/incidents", { headers: authHeaders });
      if (incRes.ok) {
        const incData = await incRes.json();
        setIncidentList(Array.isArray(incData) ? incData : incData.data || []);
      }

      // 2. Fetch Officials (User collection)
      let officials = [];
      const officialsRes = await fetch("http://localhost:5000/api/auth/officials", { headers: authHeaders });
      if (officialsRes.ok) {
        const offData = await officialsRes.json();
        const rawOff = Array.isArray(offData) ? offData : offData.data || [];
        officials = rawOff.map((u) => ({ ...u, accountType: "admin" }));
      }

      // 3. Fetch Residents (Resident collection)
      let residents = [];
      const resRes = await fetch("http://localhost:5000/api/residents", { headers: authHeaders });
      if (resRes.ok) {
        const resData = await resRes.json();
        const rawRes = Array.isArray(resData) ? resData : resData.data || [];
        residents = rawRes.map((r) => ({ ...r, accountType: "resident" }));
      }

      // Merge both into the single review list
      setUserList([...officials, ...residents]);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setFetchError("Failed to fetch records from backend. Verify your backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter accounts by approval subtab, search, and location
  const filteredUsers = userList.filter((user) => {
    const status = (user?.status || user?.verificationStatus || "pending").toLowerCase();
    const matchesTab = status === approvalSubTab.toLowerCase();

    const fullName = (user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`).toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const contact = user?.contactNumber || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(search) || email.includes(search) || contact.includes(search);

    const matchesSitio =
      selectedSitio === "ALL" ||
      user?.sitioAddress === selectedSitio ||
      user?.sitio === selectedSitio ||
      user?.role?.toLowerCase() === "admin" ||
      user?.accountType === "admin";

    return matchesTab && matchesSearch && matchesSitio;
  });

  const pendingCount = userList.filter(
    (u) => (u?.status || u?.verificationStatus || "pending").toLowerCase() === "pending"
  ).length;
  const approvedCount = userList.filter(
    (u) => (u?.status || u?.verificationStatus || "").toLowerCase() === "approved"
  ).length;
  const rejectedCount = userList.filter(
    (u) => (u?.status || u?.verificationStatus || "").toLowerCase() === "rejected"
  ).length;

  // Account Status Modification: routes dynamically to /api/auth/users or /api/residents
  const handleUpdateUserStatus = async (user, targetStatus, reason = "") => {
    const token = localStorage.getItem("token");
    const userId = user._id || user.id;
    const isResident = user.accountType === "resident" || user.role?.toLowerCase() !== "admin";

    const endpoint = isResident
      ? `http://localhost:5000/api/residents/${userId}/status`
      : `http://localhost:5000/api/auth/users/${userId}/status`;

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: targetStatus, rejectionReason: reason }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update status in database");
      }

      setUserList((prev) =>
        prev.map((u) =>
          (u._id === userId || u.id === userId)
            ? { ...u, status: targetStatus, verificationStatus: targetStatus }
            : u
        )
      );

      await loadDashboardData();
    } catch (err) {
      console.error("Error updating user status:", err);
      alert(`Could not save approval to database: ${err.message}`);
    }

    setRejectingUserId(null);
    setRejectionReasonInput("");
  };

  const handleUpdateIncidentStatus = async (incidentId, newStatus) => {
    setUpdatingIncidentId(incidentId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/incidents/${incidentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update incident status");
      }

      setIncidentList((prev) =>
        prev.map((inc) =>
          (inc._id === incidentId || inc.id === incidentId)
            ? { ...inc, status: newStatus }
            : inc
        )
      );
    } catch (err) {
      console.error("Incident status update error:", err);
      alert(`Could not update incident status: ${err.message}`);
    } finally {
      setUpdatingIncidentId(null);
    }
  };

  const toggleUserReports = (userId) => {
    setExpandedUserReports((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const getUserIncidents = (user) => {
    if (!user) return [];
    const uName = (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`).toLowerCase();
    const uEmail = (user.email || "").toLowerCase();

    return incidentList.filter((inc) => {
      const repName = (inc.reportedBy || inc.reporterName || "").toLowerCase();
      const repEmail = (inc.reporterEmail || "").toLowerCase();
      return repName === uName || repEmail === uEmail;
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <AdminNavbar activeTab={adminMainTab} setActiveTab={setAdminMainTab} />

      <main style={{ maxWidth: "1100px", margin: "1.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        
        {fetchError && (
          <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem", fontWeight: 600 }}>
            ⚠️ {fetchError}
          </div>
        )}

        {/* 1. RESIDENT & ADMIN APPROVALS VIEW */}
        {adminMainTab === "approvals" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "1.5rem 1.75rem", borderRadius: "16px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fef08a", textTransform: "uppercase" }}>
                  🏛️ Barangay Anupul • Official Portal
                </span>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.25rem 0 0" }}>Account Verification Panel</h1>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>Validate registered residents and incoming barangay official accounts.</p>
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
                  <option value="ALL">All Locations / Roles</option>
                  {SITIO_LIST.map((sitio) => <option key={sitio} value={sitio}>{sitio}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>Loading accounts...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
                  <h3>No Account Records Found</h3>
                  <p style={{ fontSize: "0.85rem" }}>
                    {approvalSubTab === "pending" ? "There are currently no pending verification requests to review." : `No ${approvalSubTab} records match your search criteria.`}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const uid = user._id || user.id;
                  const status = (user?.status || user?.verificationStatus || "pending").toLowerCase();
                  const isAdminReg = user?.role?.toLowerCase() === "admin" || user?.accountType === "admin";
                  const userReports = getUserIncidents(user);
                  const isExpanded = !!expandedUserReports[uid];

                  return (
                    <div key={uid} style={{ backgroundColor: "white", padding: "1.35rem", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: status === "approved" ? "5px solid #10b981" : status === "rejected" ? "5px solid #ef4444" : "5px solid #f59e0b" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                              {user.fullName || `${user.firstName || ""} ${user.lastName || ""}`}
                            </h3>
                            <span style={{ fontSize: "0.68rem", backgroundColor: isAdminReg ? "#3b82f6" : "#10b981", color: "white", padding: "0.1rem 0.45rem", borderRadius: "4px", fontWeight: 700 }}>
                              {isAdminReg ? "ADMIN ACCOUNT" : "RESIDENT ACCOUNT"}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "9999px", backgroundColor: status === "approved" ? "#dcfce7" : status === "rejected" ? "#fee2e2" : "#fef3c7", color: status === "approved" ? "#166534" : status === "rejected" ? "#991b1b" : "#92400e" }}>
                          {status === "approved" ? (isAdminReg ? "✓ Active Official" : "✓ Verified Resident") : status === "rejected" ? "✕ Rejected" : "⏳ Pending Verification"}
                        </span>
                      </div>

                      <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                        {isAdminReg ? (
                          <>
                            <div><strong>Official Position / Title:</strong> {user.position || user.officialPosition || "Barangay Official"}</div>
                            <div><strong>Contact Number:</strong> {user.contactNumber || "N/A"}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Email Address:</strong> {user.email || "N/A"}</div>
                          </>
                        ) : (
                          <>
                            <div><strong>Sitio / Street:</strong> {user.sitioAddress || user.sitio || "N/A"}</div>
                            <div><strong>Contact Number:</strong> {user.contactNumber || "N/A"}</div>
                            <div style={{ gridColumn: "span 2" }}><strong>Email Address:</strong> {user.email || "N/A"}</div>
                            {(user.proofOfResidency || user.proofFile) && (
                              <div style={{ gridColumn: "span 2", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                                <strong>Proof of Residency:</strong>
                                <span style={{ marginLeft: "0.5rem", color: "#2563eb", fontWeight: 600 }}>
                                  📄 {typeof user.proofOfResidency === "object" ? user.proofOfResidency.name || "Uploaded Document" : "Uploaded Document"}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <button type="button" onClick={() => toggleUserReports(uid)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0.85rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                          <span>🚨 Reported Incidents by User ({userReports.length})</span>
                          <span>{isExpanded ? "▲ Hide" : "▼ View Reports"}</span>
                        </button>

                        {isExpanded && (
                          <div style={{ marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "#fafafa", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                            {userReports.length === 0 ? (
                              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontStyle: "italic" }}>No incidents registered under this user.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {userReports.map((report) => (
                                  <div key={report._id || report.id} style={{ padding: "0.65rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "6px", borderLeft: "4px solid #ef4444" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700 }}>
                                      <span style={{ color: "#dc2626" }}>{report.title || report.category || "Emergency Report"}</span>
                                      <span style={{ color: "#64748b" }}>{report.status || "Pending"}</span>
                                    </div>
                                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem" }}><strong>Location:</strong> {report.location || report.exactLocation || "Barangay Anupul"}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {status === "pending" && (
                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                          {rejectingUserId === uid ? (
                            <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                              <input type="text" placeholder="Reason for rejection..." value={rejectionReasonInput} onChange={(e) => setRejectionReasonInput(e.target.value)} style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #fecaca" }} />
                              <button type="button" onClick={() => setRejectingUserId(null)} style={{ padding: "0.4rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                              <button type="button" onClick={() => handleUpdateUserStatus(user, "rejected", rejectionReasonInput)} style={{ padding: "0.4rem 0.75rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}>Confirm</button>
                            </div>
                          ) : (
                            <>
                              <button type="button" onClick={() => setRejectingUserId(uid)} style={{ padding: "0.5rem 1rem", backgroundColor: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>✕ Reject</button>
                              <button type="button" onClick={() => handleUpdateUserStatus(user, "approved")} style={{ padding: "0.5rem 1.25rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>✓ Approve Account</button>
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
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>Total Reports Submitted: {incidentList.length}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {incidentList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <p style={{ color: "#64748b", margin: 0 }}>No incident reports found in database.</p>
                </div>
              ) : (
                incidentList.map((incident) => {
                  const incId = incident._id || incident.id;
                  const currentStatus = incident.status || "Pending";
                  const isUpdating = updatingIncidentId === incId;

                  return (
                    <div key={incId} style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: currentStatus === "Resolved" ? "5px solid #10b981" : currentStatus === "Dispatched" ? "5px solid #3b82f6" : "5px solid #ef4444" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                        <h3 style={{ margin: 0, color: "#ef4444", fontSize: "1.1rem" }}>{incident.title || incident.category || "Emergency Report"}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", backgroundColor: currentStatus === "Resolved" ? "#dcfce7" : currentStatus === "Dispatched" ? "#dbeafe" : "#fee2e2", color: currentStatus === "Resolved" ? "#166534" : currentStatus === "Dispatched" ? "#1e40af" : "#991b1b" }}>
                            ● {currentStatus}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "Recent"}</span>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem", color: "#334155" }}>
                        <p style={{ margin: 0 }}><strong>Reporter Name:</strong> {incident.reportedBy || incident.reporterName || "Anonymous Resident"}</p>
                        <p style={{ margin: 0 }}><strong>Contact:</strong> {incident.phone || incident.reporterContact || "N/A"}</p>
                        <p style={{ margin: 0, gridColumn: "span 2" }}><strong>Exact Location / Landmark:</strong> 📍 {incident.location || incident.exactLocation || "Barangay Anupul"}</p>
                        {incident.description && (
                          <p style={{ margin: 0, gridColumn: "span 2", backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
                            <strong>Description:</strong> {incident.description}
                          </p>
                        )}
                        {(incident.evidencePhoto || incident.image) && (
                          <div style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                            <p style={{ margin: "0 0 0.25rem 0", fontWeight: 700, color: "#e11d48" }}>📷 Verified Live Photo Evidence:</p>
                            <img
                              src={incident.evidencePhoto || incident.image}
                              alt="Live Incident Evidence"
                              style={{ maxWidth: "280px", maxHeight: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                            />
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        {currentStatus !== "Dispatched" && currentStatus !== "Resolved" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateIncidentStatus(incId, "Dispatched")}
                            style={{ padding: "0.4rem 0.85rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer" }}
                          >
                            🚀 Dispatch Responders
                          </button>
                        )}
                        {currentStatus !== "Resolved" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateIncidentStatus(incId, "Resolved")}
                            style={{ padding: "0.4rem 0.85rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: isUpdating ? "not-allowed" : "pointer" }}
                          >
                            ✓ Mark as Resolved
                          </button>
                        )}
                        {currentStatus !== "Dismissed" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateIncidentStatus(incId, "Dismissed")}
                            style={{ padding: "0.4rem 0.85rem", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 600, cursor: isUpdating ? "not-allowed" : "pointer" }}
                          >
                            ✕ Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. INCIDENT MAP LOCATION VIEW */}
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
                <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "400px", marginTop: "0.35rem" }}>Displaying active report markers across Barangay Anupul.</p>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                  {SITIO_LIST.map((sitio) => {
                    const count = incidentList.filter((i) => (i.location || i.exactLocation || "").includes(sitio)).length;
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