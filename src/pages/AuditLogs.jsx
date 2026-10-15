import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Shield,
  FileText,
  UserCheck,
  Megaphone,
  Lock,
  Clock,
  Eye,
  X
} from "lucide-react";
import {
  getAuditLogs,
  clearAuditLogs,
  fetchAuditLogsFromBackend,
  AUDIT_CATEGORIES
} from "../utils/auditLogger";

export default function AuditLogs() {
  const [logs, setLogs] = useState(() => getAuditLogs());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);

  const refreshLogs = async () => {
    const backendLogs = await fetchAuditLogsFromBackend();
    if (backendLogs) setLogs(backendLogs);
    else setLogs(getAuditLogs());
  };

  useEffect(() => {
    fetchAuditLogsFromBackend().then((res) => {
      if (res) setLogs(res);
    });

    const handleStorage = () => setLogs(getAuditLogs());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(search) ||
      log.actor.toLowerCase().includes(search) ||
      (log.target && log.target.toLowerCase().includes(search)) ||
      (log.details && log.details.toLowerCase().includes(search)) ||
      (log.id && log.id.toLowerCase().includes(search));

    const matchesCategory =
      categoryFilter === "ALL" || log.category === categoryFilter;

    const matchesSeverity =
      severityFilter === "ALL" || log.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const totalLogs = logs.length;
  const dispatchCount = logs.filter((l) => l.category === AUDIT_CATEGORIES.DISPATCH).length;
  const verificationCount = logs.filter((l) => l.category === AUDIT_CATEGORIES.VERIFICATION).length;
  const securityCount = logs.filter((l) => l.category === AUDIT_CATEGORIES.SECURITY).length;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Barangay_Anupul_Audit_Trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case AUDIT_CATEGORIES.DISPATCH:
        return <AlertTriangle size={15} color="#ef4444" />;
      case AUDIT_CATEGORIES.VERIFICATION:
        return <UserCheck size={15} color="#10b981" />;
      case AUDIT_CATEGORIES.BROADCAST:
        return <Megaphone size={15} color="#3b82f6" />;
      case AUDIT_CATEGORIES.SECURITY:
        return <Lock size={15} color="#8b5cf6" />;
      default:
        return <FileText size={15} color="#64748b" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "critical":
        return <span style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 800 }}>CRITICAL</span>;
      case "warning":
        return <span style={{ backgroundColor: "#ffedd5", color: "#ea580c", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 800 }}>WARNING</span>;
      case "notice":
        return <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 800 }}>NOTICE</span>;
      default:
        return <span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 800 }}>INFO</span>;
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
                Barangay Anupul Security Trail
              </span>
            </div>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 800, margin: 0 }}>
              Administrative System Audit Logs
            </h1>
            <p style={{ fontSize: "0.86rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>
              Immutable record of all incident dispatches, resident approvals, broadcasts, and security authentications.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={refreshLogs}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "0.6rem 1rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.6rem 1.1rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <Download size={14} /> Export Audit Trail
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Events Tracked</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>{totalLogs}</div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Past 48 Hours</span>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Emergency Dispatches</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ef4444", marginTop: "0.2rem" }}>{dispatchCount}</div>
            <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>Fire, Flood, Medical & Tanod</span>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Resident Verifications</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#10b981", marginTop: "0.2rem" }}>{verificationCount}</div>
            <span style={{ fontSize: "0.75rem", color: "#10b981" }}>Approvals & Rejections</span>
          </div>

          <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Security & Access</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#8b5cf6", marginTop: "0.2rem" }}>{securityCount}</div>
            <span style={{ fontSize: "0.75rem", color: "#8b5cf6" }}>Logins, Roles & Passwords</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "0.75rem",
          alignItems: "center"
        }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search logs by action, actor, target entity, or details..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
            >
              <option value="ALL">All Categories</option>
              {Object.values(AUDIT_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
            >
              <option value="ALL">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="notice">Notice</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.76rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.85rem 1rem" }}>Timestamp</th>
                <th style={{ padding: "0.85rem 1rem" }}>Category</th>
                <th style={{ padding: "0.85rem 1rem" }}>Action Performed</th>
                <th style={{ padding: "0.85rem 1rem" }}>Actor</th>
                <th style={{ padding: "0.85rem 1rem" }}>Target Entity</th>
                <th style={{ padding: "0.85rem 1rem" }}>Severity</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 1rem", color: "#475569", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: 600, display: "block", color: "#0f172a" }}>
                        {log.formattedTime}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {getCategoryIcon(log.category)}
                        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{log.category}</span>
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", maxWidth: "320px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {log.details}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", color: "#334155", fontWeight: 600 }}>
                      {log.actor}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", color: "#64748b", fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {log.target}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {getSeverityBadge(log.severity)}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        style={{ padding: "0.35rem 0.6rem", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", color: "#334155" }}
                        title="View log event details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* LOG DETAILS MODAL */}
        {selectedLog && (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Audit Event Log Details</h3>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1.25rem", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div><strong>Log Event ID:</strong> <span style={{ fontFamily: "monospace" }}>{selectedLog.id}</span></div>
                <div><strong>Exact Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()} ({selectedLog.formattedTime})</div>
                <div><strong>Category:</strong> {selectedLog.category}</div>
                <div><strong>Action:</strong> {selectedLog.action}</div>
                <div><strong>Actor:</strong> {selectedLog.actor}</div>
                <div><strong>Target Entity:</strong> {selectedLog.target}</div>
                <div><strong>Severity:</strong> {getSeverityBadge(selectedLog.severity)}</div>
                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "0.6rem", marginTop: "0.2rem" }}>
                  <strong>Activity Description:</strong>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#334155", lineHeight: 1.5 }}>
                    {selectedLog.details}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{ padding: "0.6rem 1.25rem", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
