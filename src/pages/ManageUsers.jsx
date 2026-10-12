import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, SITIO_LIST } from "../context/AuthContext";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Trash2,
  UserPlus,
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  Filter,
  Eye,
  X
} from "lucide-react";

export default function ManageUsers() {
  const {
    userDatabase = [],
    approveResident,
    rejectResident,
    updateUserRole,
    deleteUser,
    addUser
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sitioFilter, setSitioFilter] = useState("ALL");

  // Modal states
  const [inspectUser, setInspectUser] = useState(null);
  const [rejectModalUser, setRejectModalUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Add User Form state
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "0917-123-4567",
    sitioAddress: "Sitio Centro",
    role: "resident",
    verificationStatus: "approved",
    password: "password123",
  });

  const filteredUsers = userDatabase.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const contact = (user.contactNumber || "").toLowerCase();
    const sitio = (user.sitioAddress || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      email.includes(search) ||
      contact.includes(search) ||
      sitio.includes(search) ||
      (user.id && user.id.toLowerCase().includes(search));

    const matchesStatus =
      statusFilter === "ALL" || (user.verificationStatus || "pending") === statusFilter;

    const matchesRole =
      roleFilter === "ALL" || (user.role || "resident") === roleFilter;

    const matchesSitio =
      sitioFilter === "ALL" || user.sitioAddress === sitioFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesSitio;
  });

  const totalUsers = userDatabase.length;
  const pendingCount = userDatabase.filter((u) => (u.verificationStatus || "pending") === "pending").length;
  const approvedCount = userDatabase.filter((u) => u.verificationStatus === "approved").length;
  const adminCount = userDatabase.filter((u) => u.role === "admin").length;

  const handleApprove = (userId) => {
    if (approveResident) {
      approveResident(userId);
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert("Please specify a reason for rejecting this applicant.");
      return;
    }
    if (rejectResident && rejectModalUser) {
      rejectResident(rejectModalUser.id, rejectReason);
      setRejectModalUser(null);
      setRejectReason("");
    }
  };

  const handleRoleChange = (userId, newRole) => {
    if (updateUserRole) {
      updateUserRole(userId, newRole);
    }
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete account for ${user.firstName} ${user.lastName}?`)) {
      if (deleteUser) {
        deleteUser(user.id);
      }
    }
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.firstName.trim() || !newUserForm.lastName.trim() || !newUserForm.email.trim()) {
      alert("Please fill in the required resident information.");
      return;
    }

    if (addUser) {
      addUser(newUserForm);
      setShowAddUserModal(false);
      setNewUserForm({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "0917-123-4567",
        sitioAddress: "Sitio Centro",
        role: "resident",
        verificationStatus: "approved",
        password: "password123",
      });
      alert("New user account created successfully!");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "3rem" }}>
      <main style={{ maxWidth: "1280px", margin: "1.5rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        
        {/* Header Section */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          padding: "1.75rem 2rem",
          borderRadius: "16px",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
              <Link
                to="/admin-approvals"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "6px"
                }}
              >
                <ArrowLeft size={14} /> Operations Desk
              </Link>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fef08a", textTransform: "uppercase" }}>
                Barangay Anupul Registry
              </span>
            </div>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, margin: 0 }}>
              Resident & User Management Directory
            </h1>
            <p style={{ fontSize: "0.86rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>
              Full administrative records for verified residents, pending applicants, and official emergency personnel.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "0.65rem 1.25rem",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
              }}
            >
              <UserPlus size={16} /> Add Resident Manually
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Registered</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>{totalUsers}</div>
            <span style={{ fontSize: "0.75rem", color: "#10b981" }}>Barangay Anupul Citizens</span>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Verified Approved</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#10b981", marginTop: "0.2rem" }}>{approvedCount}</div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Active Reporting Rights</span>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Awaiting Review</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>{pendingCount}</div>
            <span style={{ fontSize: "0.75rem", color: "#f59e0b" }}>Pending ID Verification</span>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Officials / Admins</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#3b82f6", marginTop: "0.2rem" }}>{adminCount}</div>
            <span style={{ fontSize: "0.75rem", color: "#3b82f6" }}>Barangay Operations Staff</span>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "0.75rem",
          alignItems: "center"
        }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search by resident name, ID, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem 0.65rem 2.4rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                boxSizing: "border-box"
              }}
            />
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="approved">Approved / Verified</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
            >
              <option value="ALL">All Roles</option>
              <option value="resident">Resident</option>
              <option value="admin">Administrator / Official</option>
              <option value="tanod">Barangay Tanod</option>
              <option value="medic">BHERT Medic</option>
            </select>
          </div>

          <div>
            <select
              value={sitioFilter}
              onChange={(e) => setSitioFilter(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
            >
              <option value="ALL">All Sitios</option>
              {SITIO_LIST.map((sitio) => (
                <option key={sitio} value={sitio}>{sitio}</option>
              ))}
            </select>
          </div>
        </div>

        {/* User Table */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.78rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.9rem 1rem" }}>User / Resident</th>
                <th style={{ padding: "0.9rem 1rem" }}>Contact Details</th>
                <th style={{ padding: "0.9rem 1rem" }}>Sitio Location</th>
                <th style={{ padding: "0.9rem 1rem" }}>Role</th>
                <th style={{ padding: "0.9rem 1rem" }}>Status</th>
                <th style={{ padding: "0.9rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    No resident accounts match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = user.verificationStatus || "pending";
                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: user.role === "admin" ? "#3b82f6" : "#0f172a",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem"
                          }}>
                            {user.firstName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                              {user.firstName} {user.lastName}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace" }}>
                              ID: {user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "0.9rem 1rem", color: "#334155" }}>
                        <div>{user.email || "N/A"}</div>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{user.contactNumber || "0917-123-4567"}</span>
                      </td>

                      <td style={{ padding: "0.9rem 1rem", color: "#334155" }}>
                        <span style={{ fontWeight: 600 }}>{user.sitioAddress || "Barangay Anupul"}</span>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8" }}>Bamban, Tarlac</span>
                      </td>

                      <td style={{ padding: "0.9rem 1rem" }}>
                        <select
                          value={user.role || "resident"}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          style={{
                            padding: "0.3rem 0.6rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            backgroundColor: user.role === "admin" ? "#eff6ff" : "#f8fafc",
                            color: user.role === "admin" ? "#1d4ed8" : "#334155"
                          }}
                        >
                          <option value="resident">Resident</option>
                          <option value="tanod">Barangay Tanod</option>
                          <option value="medic">BHERT Medic</option>
                          <option value="admin">Admin Official</option>
                        </select>
                      </td>

                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          backgroundColor: status === "approved" ? "#dcfce7" : status === "rejected" ? "#fee2e2" : "#fef3c7",
                          color: status === "approved" ? "#166534" : status === "rejected" ? "#991b1b" : "#92400e"
                        }}>
                          {status === "approved" ? <CheckCircle size={12} /> : status === "rejected" ? <XCircle size={12} /> : <Clock size={12} />}
                          {status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: "0.9rem 1rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {/* Inspect Document */}
                          <button
                            type="button"
                            onClick={() => setInspectUser(user)}
                            title="Inspect ID proof / resident details"
                            style={{ padding: "0.35rem 0.6rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", color: "#334155" }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Quick Approve (if pending) */}
                          {status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleApprove(user.id)}
                              title="Approve verification"
                              style={{ padding: "0.35rem 0.6rem", backgroundColor: "#dcfce7", border: "1px solid #86efac", color: "#166534", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "0.75rem" }}
                            >
                              Approve
                            </button>
                          )}

                          {/* Quick Reject (if pending) */}
                          {status === "pending" && (
                            <button
                              type="button"
                              onClick={() => setRejectModalUser(user)}
                              title="Reject verification"
                              style={{ padding: "0.35rem 0.6rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "0.75rem" }}
                            >
                              Reject
                            </button>
                          )}

                          {/* Delete Account */}
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            title="Delete resident record"
                            style={{ padding: "0.35rem 0.6rem", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48", borderRadius: "6px", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL 1: Inspect User ID Proof & Details */}
        {inspectUser && (
          <div style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "1.75rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Resident Verification File</h3>
                <button
                  type="button"
                  onClick={() => setInspectUser(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
                <p style={{ margin: "0 0 0.4rem 0" }}><strong>Full Name:</strong> {inspectUser.firstName} {inspectUser.lastName}</p>
                <p style={{ margin: "0 0 0.4rem 0" }}><strong>Sitio Address:</strong> {inspectUser.sitioAddress || "Sitio Centro"}, Barangay Anupul</p>
                <p style={{ margin: "0 0 0.4rem 0" }}><strong>Mobile Contact:</strong> {inspectUser.contactNumber || "0917-123-4567"}</p>
                <p style={{ margin: "0 0 0.4rem 0" }}><strong>Email Address:</strong> {inspectUser.email}</p>
                <p style={{ margin: "0 0 0.4rem 0" }}><strong>Current Status:</strong> <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{inspectUser.verificationStatus}</span></p>
                <p style={{ margin: "0 0 0.4rem 0" }}><strong>Registration Timestamp:</strong> {inspectUser.submittedAt || "Recently"}</p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Proof of Residency Document:</span>
                <div style={{
                  height: "160px",
                  backgroundColor: "#0f172a",
                  color: "#94a3b8",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "6px",
                  border: "1px solid #334155"
                }}>
                  <FileText size={40} color="#cbd5e1" />
                  <span style={{ marginTop: "8px", fontSize: "0.82rem", fontWeight: 600 }}>
                    {inspectUser.proofOfResidencyName || "Barangay_Clearance_Certificate.pdf"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Official Verified Document</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setInspectUser(null)}
                  style={{ padding: "0.6rem 1rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                >
                  Close
                </button>
                {inspectUser.verificationStatus === "pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(inspectUser.id);
                      setInspectUser(null);
                    }}
                    style={{ padding: "0.6rem 1.2rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                  >
                    ✓ Approve Resident
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Rejection Reason Dialog */}
        {rejectModalUser && (
          <div style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              padding: "1.75rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 800, color: "#dc2626" }}>
                Reject Residency Verification
              </h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: "0.84rem", color: "#64748b" }}>
                Provide reason for rejecting application for <strong>{rejectModalUser.firstName} {rejectModalUser.lastName}</strong>:
              </p>

              <form onSubmit={handleRejectSubmit}>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Uploaded certificate does not match registered Sitio address or proof is outside Barangay Anupul."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "0.85rem", boxSizing: "border-box", marginBottom: "1.25rem" }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setRejectModalUser(null)}
                    style={{ padding: "0.6rem 1rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "0.6rem 1.25rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: Add User Manually */}
        {showAddUserModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "1.75rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>Onboard Resident to Barangay Database</h3>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Juan"
                      value={newUserForm.firstName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dela Cruz"
                      value={newUserForm.lastName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>Sitio Address (Barangay Anupul) *</label>
                  <select
                    value={newUserForm.sitioAddress}
                    onChange={(e) => setNewUserForm({ ...newUserForm, sitioAddress: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  >
                    {SITIO_LIST.map((sitio) => (
                      <option key={sitio} value={sitio}>{sitio}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>Contact Number</label>
                    <input
                      type="text"
                      value={newUserForm.contactNumber}
                      onChange={(e) => setNewUserForm({ ...newUserForm, contactNumber: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="resident@anupul.gov"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    >
                      <option value="resident">Resident</option>
                      <option value="tanod">Barangay Tanod</option>
                      <option value="medic">BHERT Medic</option>
                      <option value="admin">Admin Official</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>Status</label>
                    <select
                      value={newUserForm.verificationStatus}
                      onChange={(e) => setNewUserForm({ ...newUserForm, verificationStatus: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    style={{ padding: "0.6rem 1rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "0.6rem 1.25rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                  >
                    Add Resident
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
