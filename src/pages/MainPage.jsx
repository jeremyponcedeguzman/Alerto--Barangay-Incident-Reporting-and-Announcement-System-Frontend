import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  AlertTriangle,
  FileText,
  Radio,
  Flame,
  Waves,
  HeartPulse,
  ShieldAlert,
  PhoneCall,
  Bell,
  ArrowRight,
  ChevronRight,
  Calendar,
  Users,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useIncidents, INCIDENT_CATEGORIES } from "../context/IncidentContext";

export default function MainPage() {
  // PULL IN ANNOUNCEMENTS FROM CONTEXT
  const { incidents, userReports, announcements } = useIncidents();

  const activeIncidents = incidents.filter((i) => i.status !== "Resolved");
  const criticalIncidents = incidents.filter(
    (i) => i.severity === "critical" || i.severity === "high"
  );

  const activeByCategory = useMemo(() => {
    const counts = {};
    incidents
      .filter((i) => i.status !== "Resolved")
      .forEach((i) => {
        counts[i.category] = (counts[i.category] || 0) + 1;
      });
    return counts;
  }, [incidents]);

  const highVolumeAlerts = useMemo(() => {
    return Object.entries(activeByCategory)
      .filter(([_, count]) => count >= 3)
      .map(([catKey, count]) => {
        const cat = INCIDENT_CATEGORIES[catKey] || {};
        return {
          id: `cluster-${catKey}`,
          badge: "HIGH VOLUME CLUSTER",
          badgeColor: cat.color || "#e11d48",
          title: `${count} Active ${cat.label} Reports`,
          detail: `High incident concentration recorded across the barangay`,
          link: `/map?category=${catKey}`,
        };
      });
  }, [activeByCategory]);

  const highSeverityAlerts = useMemo(() => {
    return incidents
      .filter(
        (i) =>
          i.status !== "Resolved" &&
          (i.severity === "critical" || i.severity === "high")
      )
      .map((i) => {
        const cat = INCIDENT_CATEGORIES[i.category] || {};
        const isCritical = i.severity === "critical";
        return {
          id: `severity-${i.id}`,
          badge: isCritical ? "CRITICAL ALERT" : "HIGH PRIORITY",
          badgeColor: isCritical ? "#dc2626" : "#ea580c",
          title: i.title,
          detail: `${cat.label} at ${i.locationName}`,
          link: `/map?id=${i.id}`,
        };
      });
  }, [incidents]);

  const broadcastAlerts = useMemo(() => {
    return [...highVolumeAlerts, ...highSeverityAlerts];
  }, [highVolumeAlerts, highSeverityAlerts]);

  return (
    <div className="main-page-wrapper">
      <div
        className={`emergency-alert-banner ${
          broadcastAlerts.length === 0 ? "banner-normal" : "banner-urgent"
        }`}
      >
        <div className="broadcast-indicator">
          <Radio
            size={16}
            className={broadcastAlerts.length > 0 ? "animate-pulse" : ""}
          />
          <span>LIVE BROADCAST</span>
        </div>

        {broadcastAlerts.length === 0 ? (
          <div className="broadcast-single-text">
            <span>
              🟢 <strong>Operations Normal:</strong> No critical emergencies or high-volume incident clusters active in Barangay Anupul.
            </span>
          </div>
        ) : broadcastAlerts.length === 1 ? (
          <div className="broadcast-single-text">
            <Link
              to={broadcastAlerts[0].link}
              className="ticker-item-link"
              title={`View on live map: ${broadcastAlerts[0].title}`}
            >
              <span
                className="ticker-item-badge"
                style={{ backgroundColor: broadcastAlerts[0].badgeColor }}
              >
                {broadcastAlerts[0].badge}
              </span>
              <span className="ticker-item-text">
                <strong>{broadcastAlerts[0].title}:</strong> {broadcastAlerts[0].detail}
              </span>
            </Link>
          </div>
        ) : (
          <div className="broadcast-ticker-wrapper">
            <div
              className="broadcast-ticker-track"
              style={{
                animationDuration: `${Math.max(20, broadcastAlerts.length * 5)}s`,
              }}
            >
              <div className="broadcast-ticker-group">
                {broadcastAlerts.map((alert) => (
                  <Link
                    key={`g1-${alert.id}`}
                    to={alert.link}
                    className="ticker-item-link"
                    title={`View on live map: ${alert.title}`}
                  >
                    <span
                      className="ticker-item-badge"
                      style={{ backgroundColor: alert.badgeColor }}
                    >
                      {alert.badge}
                    </span>
                    <span className="ticker-item-text">
                      <strong>{alert.title}</strong> — {alert.detail}
                    </span>
                    <span className="ticker-divider">•</span>
                  </Link>
                ))}
              </div>
              <div className="broadcast-ticker-group" aria-hidden="true">
                {broadcastAlerts.map((alert) => (
                  <Link
                    key={`g2-${alert.id}`}
                    to={alert.link}
                    tabIndex={-1}
                    className="ticker-item-link"
                    title={`View on live map: ${alert.title}`}
                  >
                    <span
                      className="ticker-item-badge"
                      style={{ backgroundColor: alert.badgeColor }}
                    >
                      {alert.badge}
                    </span>
                    <span className="ticker-item-text">
                      <strong>{alert.title}</strong> — {alert.detail}
                    </span>
                    <span className="ticker-divider">•</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <Link
          to="/map"
          className="broadcast-action-link"
          title="Open live incident map"
        >
          <span>View Live Map</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="main-page-container">
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-pill">
              <ShieldCheck size={14} /> Barangay Incident & Emergency Response
            </span>
            <h1 className="hero-title">
              Barangay Anupul <br />
              <span className="hero-title-accent">Incident Reporting & Map</span>
            </h1>
            <p className="hero-subtitle">
              Stay informed with real-time incident heatmaps, community emergency broadcasts,
              and fast response dispatch for all residents and responders.
            </p>

            <div className="hero-cta-buttons">
              <Link to="/report-incident" className="btn-hero-primary-report">
                <AlertTriangle size={20} />
                <span>Report an Incident Now</span>
              </Link>

              <Link to="/map" className="btn-hero-secondary-map">
                <MapPin size={20} />
                <span>Open Live Incident Map</span>
              </Link>
            </div>
          </div>

          <div className="hero-live-card">
            <div className="live-card-header">
              <div className="live-card-title-group">
                <span className="live-pulse-dot"></span>
                <span className="live-card-heading">Live Incident Snapshot</span>
              </div>
              <span className="live-timestamp">Updated just now</span>
            </div>

            <div className="live-stats-row">
              <div className="live-stat-box">
                <span className="stat-number">{activeIncidents.length}</span>
                <span className="stat-caption">Active Reports</span>
              </div>
              <div className="live-stat-box critical-box">
                <span className="stat-number">{criticalIncidents.length}</span>
                <span className="stat-caption">High Priority</span>
              </div>
              <div className="live-stat-box user-box">
                <span className="stat-number">{userReports.length}</span>
                <span className="stat-caption">My Reports</span>
              </div>
            </div>

            <div className="hero-recent-incidents">
              <span className="recent-list-title">Active Response Queue:</span>
              {incidents.slice(0, 3).map((item) => {
                const cat = INCIDENT_CATEGORIES[item.category] || {};
                return (
                  <Link
                    key={item.id}
                    to={`/map?id=${item.id}`}
                    className="hero-mini-incident-item"
                  >
                    <span
                      className="mini-cat-bullet"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="mini-item-title">{item.title}</span>
                    <span className="mini-item-time" title={item.exactTime}>
                      {item.relativeTime}
                    </span>
                  </Link>
                );
              })}
            </div>

            <Link to="/map" className="btn-view-map-full">
              Explore Full Incident Map & Heatmap <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        <section className="portal-cards-grid">
          <Link to="/map" className="portal-card feature-map-card">
            <div className="portal-card-icon map-icon-bg">
              <MapPin size={28} />
            </div>
            <div className="portal-card-body">
              <div className="portal-badge map-badge">Interactive Map & Heatmap</div>
              <h3 className="portal-card-title">Live Incident Map</h3>
              <p className="portal-card-desc">
                View incident pin locations across the barangay and observe heatmaps when incident density peaks.
              </p>
              <div className="portal-card-link">
                Launch Live Map <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          <Link
            to="/report-incident"
            className="portal-card feature-report-card highlight-card"
          >
            <div className="portal-card-icon report-icon-bg">
              <AlertTriangle size={28} />
            </div>
            <div className="portal-card-body">
              <div className="portal-badge emergency-badge">Emergency Reporting</div>
              <h3 className="portal-card-title">Report an Incident</h3>
              <p className="portal-card-desc">
                Submit an urgent report for fires, floods, medical needs, crime, or road accidents. Drop a pin on the map and dispatch barangay teams immediately.
              </p>
              <div className="portal-card-link">
                Submit New Report <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          <Link to="/my-reports" className="portal-card feature-reports-card">
            <div className="portal-card-icon myreports-icon-bg">
              <FileText size={28} />
            </div>
            <div className="portal-card-body">
              <div className="portal-badge status-badge">Resident Tracking</div>
              <h3 className="portal-card-title">My Reports</h3>
              <p className="portal-card-desc">
                Track the progress of your submitted reports in real-time — from initial review to responder dispatch and final resolution.
              </p>
              <div className="portal-card-link">
                View My Reports ({userReports.length}) <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </section>

        <section className="announcements-section">
          <div className="section-header-row">
            <div>
              <div className="section-tag">
                <Bell size={14} /> Official Broadcasts
              </div>
              <h2 className="section-title">Barangay Announcements</h2>
            </div>
            <span className="section-sub-info">Barangay Anupul Operations Center</span>
          </div>

          <div className="announcements-list">
            {announcements && announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="announcement-item-card">
                  <div className="ann-header">
                    <span className={`ann-badge badge-${ann.badgeType}`}>
                      {ann.badge}
                    </span>
                    <span className="ann-date">
                      <Calendar size={13} /> {ann.date}
                    </span>
                  </div>
                  <h3 className="ann-title">{ann.title}</h3>
                  <p className="ann-summary">{ann.summary}</p>
                  <div className="ann-footer">
                    <span className="ann-author">Issued by: {ann.author}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "gray", fontStyle: "italic", padding: "20px" }}>No official announcements currently active.</p>
            )}
          </div>
        </section>

        <section className="hotlines-section">
          <div className="hotlines-header">
            <PhoneCall size={22} className="hotlines-icon" />
            <div>
              <h3 className="hotlines-title">Barangay Emergency Hotlines</h3>
              <p className="hotlines-sub">
                Keep these numbers handy or call directly for immediate emergency assistance.
              </p>
            </div>
          </div>

          <div className="hotlines-grid">
            <div className="hotline-card">
              <div className="hotline-role">Barangay Hall / Tanod</div>
              <div className="hotline-number">[insert the real number here]</div>
              <div className="hotline-desc">Operations Desk (24/7)</div>
            </div>
            <div className="hotline-card">
              <div className="hotline-role">BFP Fire Substation</div>
              <div className="hotline-number">[insert the real number here]</div>
              <div className="hotline-desc">Fire & Rescue Response</div>
            </div>
            <div className="hotline-card">
              <div className="hotline-role">PNP Police Substation</div>
              <div className="hotline-number">[insert the real number here]</div>
              <div className="hotline-desc">Law Enforcement & Security</div>
            </div>
            <div className="hotline-card">
              <div className="hotline-role">Barangay Ambulance / BHERT</div>
              <div className="hotline-number">[insert the real number here]</div>
              <div className="hotline-desc">Medical & Emergency Transport</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}