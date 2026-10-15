import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Shield,
  Search,
  CheckCircle,
  Phone,
  Clock,
  Trash2,
  ArrowLeft,
  UserCheck,
  UserX,
  BadgeAlert,
  Users
} from "lucide-react";
import { INITIAL_PERSONNEL } from "./DutyRoster";
import { logAuditEvent, AUDIT_CATEGORIES } from "../utils/auditLogger";
import { staffApi } from "../api";

export default function AddStaff() {
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem("alerto_staff_roster");
    if (!saved) return INITIAL_PERSONNEL;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PERSONNEL;
    } catch {
      return INITIAL_PERSONNEL;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("alerto_staff_roster", JSON.stringify(staffList));
  }, [staffList]);

  // Sync with live staff from backend
  useEffect(() => {
    async function loadLiveStaff() {
      try {
        const res = await staffApi.getAll();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const live = res.data.map((s, idx) => ({
            id: s.customId || s._id || s.id || idx + 1,
            _id: s._id,
            name: s.name,
            role: s.role,
            category: s.category || "Official",
            isDuty: s.isDuty !== undefined ? s.isDuty : true,
            shift: s.shift || "Day (8:00 AM - 5:00 PM)",
            contact: s.contact || "0917-123-4567",
            badge: s.badge || `STF-${String(idx + 1).padStart(3, "0")}`,
          }));
          setStaffList(live);
        }
      } catch (err) {
        console.warn("Backend staff sync note:", err.message);
      }
    }
    loadLiveStaff();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dutyFilter, setDutyFilter] = useState("ALL");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    role: "Barangay Tanod",
    category: "Tanod",
    shift: "Day (8:00 AM - 5:00 PM)",
    contact: "0917-123-4567",
    isDuty: true,
    badge: `STF-2026-${String(staffList.length + 1).padStart(3, "0")}`,
  });

  const [feedbackMsg, setFeedbackMsg] = useState("");

  const ROLES = [
    { role: "Barangay Captain", category: "Official" },
    { role: "Kagawad - Peace & Order", category: "Official" },
    { role: "Kagawad - Health & Sanitation", category: "Official" },
    { role: "Chief Tanod", category: "Tanod" },
    { role: "Barangay Tanod", category: "Tanod" },
    { role: "BHERT Health Medic", category: "Medic" },
    { role: "BFP Fire Volunteer", category: "Fire & Rescue" },
    { role: "DRRMO Emergency Responder", category: "Disaster Response" },
    { role: "Operations Center Desk Officer", category: "Official" },
  ];

  const SHIFTS = [
    "Day (8:00 AM - 5:00 PM)",
    "Night (8:00 PM - 8:00 AM)",
    "Afternoon (1:00 PM - 9:00 PM)",
    "Rotating 24/7 Patrol",
    "On-Call Emergency Standby",
  ];

  const handleRoleSelect = (selectedRole) => {
    const matched = ROLES.find((r) => r.role === selectedRole);
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      category: matched ? matched.category : "Official",
    }));
  };

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter the staff member's full name.");
      return;
    }

    const newStaff = {
      id: Date.now(),
      name: formData.name.trim(),
      role: formData.role,
      category: formData.category,
      shift: formData.shift,
      contact: formData.contact || "0917-123-4567",
      isDuty: formData.isDuty,
      badge: formData.badge || `STF-${Date.now()}`,
    };

    const updated = [newStaff, ...staffList];
    setStaffList(updated);

    // Persist to backend MongoDB
    staffApi.create(newStaff).then((res) => {
      if (res.success && res.data) {
        const saved = res.data;
        setStaffList((prev) =>
          prev.map((s) => (s.id === newStaff.id ? { ...s, _id: saved._id, id: saved.customId || saved._id } : s))
        );
      }
    }).catch((err) => console.warn("Backend staff create note:", err.message));

    logAuditEvent({
      category: AUDIT_CATEGORIES.STAFF,
      action: "New Staff Onboarded",
      actor: "Operations Desk",
      target: newStaff.badge,
      details: `Onboarded ${newStaff.name} as ${newStaff.role} (${newStaff.shift}) to Barangay Anupul Operations.`,
      severity: "notice",
    });

    setFeedbackMsg(`✓ ${newStaff.name} onboarded successfully!`);
    setTimeout(() => setFeedbackMsg(""), 3000);

    // Reset Form
    setFormData({
      name: "",
      role: "Barangay Tanod",
      category: "Tanod",
      shift: "Day (8:00 AM - 5:00 PM)",
      contact: "0917-123-4567",
      isDuty: true,
      badge: `STF-2026-${String(updated.length + 1).padStart(3, "0")}`,
    });
  };

  const handleToggleDuty = (staffId) => {
    let nextDuty = true;
    const targetStaff = staffList.find((s) => s.id === staffId);
    if (targetStaff) {
      nextDuty = !targetStaff.isDuty;
      staffApi.update(targetStaff._id || staffId, { isDuty: nextDuty }).catch((err) => {
        console.warn("Backend duty update note:", err.message);
      });
    }

    const updated = staffList.map((s) => {
      if (s.id === staffId) {
        logAuditEvent({
          category: AUDIT_CATEGORIES.STAFF,
          action: "Duty Status Changed",
          actor: "Operations Desk",
          target: s.badge || s.name,
          details: `${s.name} marked as ${nextDuty ? "On Duty" : "Off Duty"}.`,
          severity: "info",
        });
        return { ...s, isDuty: nextDuty };
      }
      return s;
    });
    setStaffList(updated);
  };

  const handleDeleteStaff = (staff) => {
    if (window.confirm(`Remove ${staff.name} (${staff.role}) from the official staff roster?`)) {
      const updated = staffList.filter((s) => s.id !== staff.id);
      setStaffList(updated);

      staffApi.delete(staff._id || staff.id || staff.badge).catch((err) => {
        console.warn("Backend staff delete note:", err.message);
      });

      logAuditEvent({
        category: AUDIT_CATEGORIES.STAFF,
        action: "Staff Member Removed",
        actor: "Operations Desk",
        target: staff.badge || staff.name,
        details: `Removed ${staff.name} from active roster.`,
        severity: "warning",
      });
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      staff.name.toLowerCase().includes(search) ||
      staff.role.toLowerCase().includes(search) ||
      (staff.badge && staff.badge.toLowerCase().includes(search));

    const matchesCategory =
      categoryFilter === "ALL" || staff.category.toUpperCase() === categoryFilter;

    const matchesDuty =
      dutyFilter === "ALL" ||
      (dutyFilter === "ON" && staff.isDuty) ||
      (dutyFilter === "OFF" && !staff.isDuty);

    return matchesSearch && matchesCategory && matchesDuty;
  });

  const onDutyCount = staffList.filter((s) => s.isDuty).length;

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
                Barangay Anupul Personnel Command
              </span>
            </div>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, margin: 0 }}>
              Staff & Responder Onboarding Portal
            </h1>
            <p style={{ fontSize: "0.86rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>
              Add emergency responders, assign patrol shifts, and monitor real-time readiness across Barangay Anupul.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "0.6rem 1.25rem", borderRadius: "10px", textAlign: "center" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#10b981", display: "block" }}>{onDutyCount}</span>
              <span style={{ fontSize: "0.7rem", color: "#cbd5e1", fontWeight: 600 }}>CURRENTLY ON DUTY</span>
            </div>
            <Link
              to="/duty-roster"
              style={{
                backgroundColor: "#1e293b",
                color: "white",
                padding: "0.65rem 1rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                border: "1px solid #334155"
              }}
            >
              View Public Duty Roster ➔
            </Link>
          </div>
        </div>

        {feedbackMsg && (
          <div style={{
            backgroundColor: "#dcfce7",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            fontWeight: 700,
            fontSize: "0.9rem"
          }}>
            {feedbackMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem" }}>
          
          {/* LEFT COLUMN: Add Staff Form */}
          <div style={{ backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem", height: "fit-content" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#ef4444", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserPlus size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                  Onboard Staff Member
                </h2>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Register official personnel</span>
              </div>
            </div>

            <form onSubmit={handleAddStaffSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem", color: "#334155" }}>
                  Personnel Full Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Juan Dela Cruz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem", color: "#334155" }}>
                  Official Designation / Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                >
                  {ROLES.map((r) => (
                    <option key={r.role} value={r.role}>{r.role} ({r.category})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem", color: "#334155" }}>
                    Badge / Personnel ID
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem", color: "#334155" }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    readOnly
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box", backgroundColor: "#f8fafc", color: "#475569" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem", color: "#334155" }}>
                  Assigned Shift Schedule
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                >
                  {SHIFTS.map((shift) => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem", color: "#334155" }}>
                  Emergency Contact Mobile
                </label>
                <input
                  type="text"
                  placeholder="0917-123-4567"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.5rem 0" }}>
                <input
                  type="checkbox"
                  id="initialDuty"
                  checked={formData.isDuty}
                  onChange={(e) => setFormData({ ...formData, isDuty: e.target.checked })}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="initialDuty" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>
                  Activate immediately as <strong>On Duty</strong>
                </label>
              </div>

              <button
                type="submit"
                style={{
                  padding: "0.8rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <UserPlus size={16} /> Register & Add to Roster
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Current Staff Directory Table */}
          <div style={{ backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            
            {/* Table Filters */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ position: "relative", minWidth: "260px" }}>
                <input
                  type="text"
                  placeholder="Search staff by name, role, badge..."
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
                <Search size={15} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="OFFICIAL">Officials</option>
                  <option value="TANOD">Tanods</option>
                  <option value="MEDIC">Medics</option>
                  <option value="FIRE & RESCUE">Fire & Rescue</option>
                </select>

                <select
                  value={dutyFilter}
                  onChange={(e) => setDutyFilter(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                >
                  <option value="ALL">All Duty Statuses</option>
                  <option value="ON">On Duty Only</option>
                  <option value="OFF">Off Duty Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.76rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.75rem 1rem" }}>Staff Personnel</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Role & Badge</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Shift Schedule</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Contact</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "2.5rem", textAlign: "center", color: "#64748b" }}>
                        No personnel found matching the search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                            {staff.name}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#3b82f6", fontWeight: 600 }}>
                            {staff.category}
                          </span>
                        </td>

                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div>{staff.role}</div>
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>
                            {staff.badge}
                          </span>
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={13} color="#64748b" />
                            <span>{staff.shift}</span>
                          </div>
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Phone size={13} color="#64748b" />
                            <span>{staff.contact}</span>
                          </div>
                        </td>

                        <td style={{ padding: "0.75rem 1rem" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleDuty(staff.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              padding: "0.25rem 0.65rem",
                              borderRadius: "9999px",
                              border: "none",
                              cursor: "pointer",
                              backgroundColor: staff.isDuty ? "#dcfce7" : "#f1f5f9",
                              color: staff.isDuty ? "#166534" : "#64748b"
                            }}
                            title="Click to toggle on-duty / off-duty status"
                          >
                            {staff.isDuty ? <UserCheck size={12} /> : <UserX size={12} />}
                            {staff.isDuty ? "On Duty" : "Off Duty"}
                          </button>
                        </td>

                        <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff)}
                            title="Remove staff member"
                            style={{ padding: "0.35rem 0.6rem", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48", borderRadius: "6px", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
