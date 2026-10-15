import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  RotateCcw,
  Edit3
} from "lucide-react";
import { useIncidents, INCIDENT_CATEGORIES } from "../context/IncidentContext";

export default function MyReports() {
  const { userReports, updateIncidentStatus, canUserResolveIncident } = useIncidents();
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReports = userReports.filter((report) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return report.status !== "Resolved";
    if (statusFilter === "resolved") return report.status === "Resolved";
    return report.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const activeCount = userReports.filter((r) => r.status !== "Resolved").length;
  const resolvedCount = userReports.filter((r) => r.status === "Resolved").length;

  const getTimelineSteps = (status) => {
    const s = status.toLowerCase();
    if (s === "pending") {
      return [
        { label: "Submitted", done: true, current: true },
        { label: "Under Review", done: false, current: false },
        { label: "Dispatched", done: false, current: false },
        { label: "Resolved", done: false, current: false },
      ];
    }
    if (s === "dispatched" || s === "in progress") {
      return [
        { label: "Submitted", done: true, current: false },
        { label: "Under Review", done: true, current: false },
        { label: "Responders Dispatched", done: true, current: true },
        { label: "Resolved", done: false, current: false },
      ];
    }
    // Resolved
    return [
      { label: "Submitted", done: true, current: false },
      { label: "Under Review", done: true, current: false },
      { label: "Responders Dispatched", done: true, current: false },
      { label: "Resolved", done: true, current: true },
    ];
  };

  return (
    <div className="my-reports-page-wrapper">
      <div className="my-reports-container">
        {/* Header */}
        <div className="reports-page-header">
          <div className="header-title-group">
            <span className="reports-page-badge">
              <FileText size={14} /> Resident Incident Log
            </span>
            <h1 className="reports-page-title">My Reported Incidents</h1>
            <p className="reports-page-sub">
              Track real-time response updates, dispatch progress, and resolutions for your reports.
            </p>
          </div>

          <Link to="/report-incident" className="btn-report-incident-highlight">
            <AlertTriangle size={18} />
            <span>Report New Incident</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="reports-stats-grid">
          <div className="stat-card">
            <span className="stat-num">{userReports.length}</span>
            <span className="stat-label">Total Reports Logged</span>
          </div>
          <div className="stat-card active-card">
            <span className="stat-num">{activeCount}</span>
            <span className="stat-label">Active / In Progress</span>
          </div>
          <div className="stat-card resolved-card">
            <span className="stat-num">{resolvedCount}</span>
            <span className="stat-label">Resolved & Closed</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="reports-filter-tabs">
          <button
            className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Reports ({userReports.length})
          </button>
          <button
            className={`tab-btn ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Active & Dispatched ({activeCount})
          </button>
          <button
            className={`tab-btn ${statusFilter === "resolved" ? "active" : ""}`}
            onClick={() => setStatusFilter("resolved")}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="empty-reports-card">
            <div className="empty-icon-wrap">
              <FileText size={48} className="text-gray-400" />
            </div>
            <h3>No reports found</h3>
            <p>
              {statusFilter !== "all"
                ? "No incident reports match the selected filter."
                : "You have not submitted any incident reports yet."}
            </p>
            <Link to="/report-incident" className="btn-empty-report">
              <PlusCircle size={18} /> Report an Incident
            </Link>
          </div>
        ) : (
          <div className="reports-cards-list">
            {filteredReports.map((report) => {
              const cat =
                INCIDENT_CATEGORIES[report.category] || INCIDENT_CATEGORIES.hazard;
              const timeline = getTimelineSteps(report.status);

              return (
                <div key={report.id} className="report-detail-card">
                  {/* Card Header */}
                  <div className="report-card-top">
                    <div className="top-tags-left">
                      <span
                        className="report-cat-tag"
                        style={{
                          backgroundColor: cat.bgLight,
                          color: cat.color,
                        }}
                      >
                        {cat.label}
                      </span>
                      <span className="report-id-tag">ID: {report.id}</span>
                      <span
                        className={`report-sev-tag severity-${report.severity}`}
                      >
                        {report.severity.toUpperCase()}
                      </span>
                    </div>

                    <span
                      className={`report-status-pill status-${report.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {report.status}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <h2 className="report-item-title">{report.title}</h2>

                  <div className="report-location-box">
                    <MapPin size={16} className="loc-pin-icon" />
                    <span className="loc-name">{report.locationName}</span>
                    <span className="loc-time" title={report.exactTime}>
                      <Clock size={14} /> Reported {report.exactTime}{" "}
                      <span className="relative-time-tag">({report.relativeTime})</span>
                    </span>
                  </div>

                  <p className="report-item-desc">{report.description}</p>

                  {report.imageEvidence && (
                    <div style={{ margin: "0.75rem 0" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.35rem" }}>
                        📸 Live Camera Evidence:
                      </span>
                      <img
                        src={report.imageEvidence}
                        alt="Incident Evidence"
                        style={{
                          maxWidth: "260px",
                          maxHeight: "170px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          display: "block",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(report.imageEvidence, "_blank")}
                        title="Click to view full size"
                      />
                    </div>
                  )}

                  {/* Progress Timeline */}
                  <div className="timeline-tracker">
                    <div className="timeline-steps">
                      {timeline.map((step, idx) => (
                        <div
                          key={idx}
                          className={`timeline-step-item ${
                            step.done ? "step-done" : ""
                          } ${step.current ? "step-current" : ""}`}
                        >
                          <div className="step-circle">
                            {step.done ? "✓" : idx + 1}
                          </div>
                          <span className="step-label">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="report-card-footer">
                    <div className="responder-assigned-info">
                      <ShieldCheck size={16} />
                      <span>Assigned Unit: {report.responder}</span>
                    </div>

                    <div className="report-card-actions">
                      {canUserResolveIncident && canUserResolveIncident(report) && (
                        <button
                          className="btn-card-status-toggle"
                          onClick={() =>
                            updateIncidentStatus(
                              report.id,
                              report.status === "Resolved"
                                ? "In Progress"
                                : "Resolved"
                            )
                          }
                        >
                          <RotateCcw size={14} />
                          {report.status === "Resolved"
                            ? "Reopen Report"
                            : "Mark Resolved"}
                        </button>
                      )}

                      <Link
                        to={`/report-incident?edit=${report.id}`}
                        className="btn-card-edit-action"
                        title="Update information or photos for this incident report"
                      >
                        <Edit3 size={14} />
                        <span>Update Info</span>
                      </Link>

                      <Link
                        to={`/map?id=${report.id}`}
                        className="btn-view-on-map"
                        title="Locate this report on the live map"
                      >
                        <MapPin size={16} />
                        <span>View on Live Map</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
