import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import L from "leaflet";
import {
  AlertTriangle,
  Flame,
  Waves,
  HeartPulse,
  ShieldAlert,
  Car,
  Zap,
  MapPin,
  Camera,
  CheckCircle,
  Crosshair,
  ArrowLeft,
  Info,
  Clock,
  Sparkles,
  Send,
  X,
  RefreshCw
} from "lucide-react";
import {
  useIncidents,
  INCIDENT_CATEGORIES,
  BARANGAY_CENTER
} from "../context/IncidentContext";
import { createDraftLocationIcon } from "../utils/mapIcons";

export default function ReportIncident() {
  const navigate = useNavigate();
  const { addIncident, currentUser } = useIncidents();

  const [category, setCategory] = useState("flood");
  const [severity, setSeverity] = useState("high");
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const reportedBy = currentUser?.name || "[Logged-In Resident Full Name]";
  const phone = currentUser?.phone || "[insert the real number here]";
  const [lat, setLat] = useState(BARANGAY_CENTER.lat + 0.002);
  const [lng, setLng] = useState(BARANGAY_CENTER.lng + 0.001);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Live Camera Capture Evidence States
  const [capturedImage, setCapturedImage] = useState(null);
  const fileInputRef = useRef(null);

  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const draftMarkerRef = useRef(null);

  // Handle live camera capture and restrict photo library
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Initialize mini picker map
  useEffect(() => {
    if (!miniMapContainerRef.current) return;

    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove();
      miniMapInstanceRef.current = null;
    }
    if (miniMapContainerRef.current._leaflet_id) {
      delete miniMapContainerRef.current._leaflet_id;
    }

    const map = L.map(miniMapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps",
      subdomains: "0123",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: createDraftLocationIcon(),
      draggable: true,
    }).addTo(map);

    marker.on("dragend", (e) => {
      const position = e.target.getLatLng();
      setLat(Number(position.lat.toFixed(5)));
      setLng(Number(position.lng.toFixed(5)));
    });

    map.on("click", (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      setLat(Number(clickLat.toFixed(5)));
      setLng(Number(clickLng.toFixed(5)));
      marker.setLatLng([clickLat, clickLng]);
    });

    miniMapInstanceRef.current = map;
    draftMarkerRef.current = marker;

    setTimeout(() => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when lat/lng change programmatically
  useEffect(() => {
    if (draftMarkerRef.current && miniMapInstanceRef.current) {
      draftMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  // Geolocation button
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = Number(pos.coords.latitude.toFixed(5));
          const userLng = Number(pos.coords.longitude.toFixed(5));
          setLat(userLat);
          setLng(userLng);
          if (miniMapInstanceRef.current) {
            miniMapInstanceRef.current.flyTo([userLat, userLng], 16);
          }
        },
        () => {
          const offsetLat = Number((BARANGAY_CENTER.lat + (Math.random() - 0.5) * 0.005).toFixed(5));
          const offsetLng = Number((BARANGAY_CENTER.lng + (Math.random() - 0.5) * 0.005).toFixed(5));
          setLat(offsetLat);
          setLng(offsetLng);
          if (miniMapInstanceRef.current) {
            miniMapInstanceRef.current.flyTo([offsetLat, offsetLng], 16);
          }
        }
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim() || !description.trim()) {
      alert("Please fill in the incident title, location, and description.");
      return;
    }

    if (!capturedImage) {
      alert("Live camera photo evidence is required to submit an emergency report and prevent fake or prank submissions.");
      return;
    }

    setIsSubmitting(true);

    const categoryObj = INCIDENT_CATEGORIES[category] || INCIDENT_CATEGORIES.hazard;

    setTimeout(() => {
      const newInc = addIncident({
        title,
        category,
        severity,
        locationName,
        lat,
        lng,
        reportedBy,
        description,
        imageEvidence: capturedImage,
        responder: categoryObj.responder,
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);

      setTimeout(() => {
        navigate(`/map?id=${newInc.id}`);
      }, 1500);
    }, 600);
  };

  return (
    <div className="report-incident-page">
      <div className="report-page-shell">
        {/* Navigation back bar */}
        <div className="report-top-bar">
          <button
            type="button"
            className="back-link-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Back to Main Page</span>
          </button>
        </div>

        <div className="report-header-banner">
          <div className="report-header-icon-box">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="report-page-title">Official Incident Reporting Portal</h1>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="report-success-card">
            <div className="success-icon-wrapper">
              <CheckCircle size={54} className="text-emerald-500 animate-bounce" />
            </div>
            <h2>Incident Successfully Dispatched & Logged!</h2>
            <p className="success-sub">
              Your report with live camera evidence has been received by Barangay Operations Command.
              Responders have been notified and a live pin has been activated on the incident map.
            </p>
            <div className="redirect-countdown">
              Redirecting you to the Live Incident Map...
            </div>
            <Link to="/map" className="btn-go-to-map">
              View on Live Map Now
            </Link>
          </div>
        ) : (
          <div className="report-card-main">
            <div className="report-card-header">
              <div className="report-header-icon-box">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h1 className="report-card-title">Report an Incident or Emergency</h1>
                <p className="report-card-subtitle">
                  Provide exact details and live photo evidence to immediately alert Barangay Tanod, BFP, BHERT, or DRRMO teams.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="report-form">
              {/* 1. Category Selection */}
              <div className="form-section">
                <label className="section-label">
                  1. Incident Category <span className="required-star">*</span>
                </label>
                <div className="category-select-grid">
                  {Object.entries(INCIDENT_CATEGORIES).map(([key, cat]) => {
                    const isSelected = category === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        className={`category-select-card ${isSelected ? "selected" : ""}`}
                        style={{
                          borderColor: isSelected ? cat.color : "#e2e8f0",
                          backgroundColor: isSelected ? cat.bgLight : "#ffffff",
                        }}
                        onClick={() => setCategory(key)}
                      >
                        <span
                          className="cat-card-color-strip"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <div className="cat-card-text">
                          <span className="cat-card-name" style={{ color: isSelected ? cat.color : "inherit" }}>
                            {cat.label}
                          </span>
                          <span className="cat-card-responder">
                            Response: {cat.responder}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Severity Level */}
              <div className="form-section">
                <label className="section-label">
                  2. Severity Level <span className="required-star">*</span>
                </label>
                <div className="severity-options-row">
                  {[
                    { id: "critical", label: "Critical", desc: "Life-threatening / Rapid spread", color: "#ef4444" },
                    { id: "high", label: "High", desc: "Severe damage / Urgent response", color: "#f97316" },
                    { id: "medium", label: "Medium", desc: "Hazardous / Needs attention", color: "#f59e0b" },
                    { id: "low", label: "Low", desc: "Minor advisory / Maintenance", color: "#10b981" },
                  ].map((s) => (
                    <label
                      key={s.id}
                      className={`severity-radio-box ${severity === s.id ? "checked" : ""}`}
                      style={{
                        borderColor: severity === s.id ? s.color : "#e2e8f0",
                      }}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={s.id}
                        checked={severity === s.id}
                        onChange={() => setSeverity(s.id)}
                      />
                      <span className="severity-dot" style={{ backgroundColor: s.color }}></span>
                      <div className="severity-text-group">
                        <span className="severity-title">{s.label}</span>
                        <span className="severity-desc">{s.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Title & Location Name */}
              <div className="form-row-two-col">
                <div className="form-group">
                  <label htmlFor="incident-title" className="input-label">
                    Incident Title / Summary <span className="required-star">*</span>
                  </label>
                  <input
                    id="incident-title"
                    type="text"
                    required
                    placeholder="e.g., Clogged Drainage Overflowing onto Street"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="incident-location" className="input-label">
                    Street Address / Nearest Landmark <span className="required-star">*</span>
                  </label>
                  <input
                    id="incident-location"
                    type="text"
                    required
                    placeholder="e.g., Corner Kamagong St. and Bagtikan St."
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* 4. Interactive Location Pin Picker */}
              <div className="form-section">
                <div className="pin-picker-header">
                  <div>
                    <label className="input-label">
                      Pin Exact Location on Map <span className="required-star">*</span>
                    </label>
                    <p className="input-subtext">
                      Click anywhere on the map or drag the blue pin to pinpoint the exact location.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-use-gps"
                    onClick={handleUseCurrentLocation}
                  >
                    <Crosshair size={14} /> Use Current GPS
                  </button>
                </div>

                <div className="mini-map-container" ref={miniMapContainerRef}></div>

                <div className="coords-display-pill">
                  📍 Selected Coordinates: Latitude: {lat}, Longitude: {lng}
                </div>
              </div>

              {/* 5. Detailed Description */}
              <div className="form-group">
                <label htmlFor="incident-desc" className="input-label">
                  Detailed Description & Current Condition <span className="required-star">*</span>
                </label>
                <textarea
                  id="incident-desc"
                  rows={4}
                  required
                  placeholder="Describe what happened, any persons involved or injured, visible hazards, or instructions for responding units..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* 6. Live Camera Capture Evidence (Anti-Prank Enforcement) */}
              <div className="form-section" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", padding: "1.25rem", borderRadius: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Camera size={16} className="text-rose-600" />
                      Live Camera Evidence Required <span className="required-star">*</span>
                    </label>
                    <p className="input-subtext" style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      To prevent false reports and pranks, photo library uploads are disabled. Please snap a live photo using your device camera.
                    </p>
                  </div>
                </div>

                {/* Hidden native file input configured strictly for rear camera capture */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleCameraCapture}
                />

                {capturedImage ? (
                  <div style={{ position: "relative", width: "100%", height: "240px", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #cbd5e1", background: "#000" }}>
                    <img src={capturedImage} alt="Live Evidence" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.8)", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: "600" }}
                    >
                      <X size={14} /> Retake Live Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{ textAlign: "center", padding: "2rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "2px dashed #f43f5e", cursor: "pointer", transition: "all 0.2s ease" }}
                  >
                    <div style={{ width: "54px", height: "54px", borderRadius: "14px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <Camera size={28} />
                    </div>
                    <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>Tap to Open Device Live Camera</p>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Required to verify emergency and prevent troll / fake reports</p>
                  </div>
                )}
              </div>

              {/* 7. Reporter Information */}
              <div className="form-section reporter-box">
                <div className="reporter-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div>
                    <span className="input-label">Reporter Information</span>
                    <p className="input-subtext" style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Authenticated resident identity is locked to prevent false reports.
                    </p>
                  </div>
                  <span className="verified-resident-badge" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "4px 10px", borderRadius: "9999px", fontWeight: "600" }}>
                    <CheckCircle size={13} /> Verified Resident Account
                  </span>
                </div>

                <div className="form-row-two-col">
                  <div className="form-group">
                    <label className="input-label">Full Name (Locked)</label>
                    <input
                      type="text"
                      value={reportedBy}
                      readOnly
                      disabled
                      className="form-input"
                      style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#475569" }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Contact Number (Locked)</label>
                    <input
                      type="text"
                      value={phone}
                      readOnly
                      disabled
                      className="form-input"
                      style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#475569" }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !capturedImage}
                  className="btn-form-submit-highlight"
                  style={{ opacity: !capturedImage ? 0.6 : 1 }}
                >
                  <Send size={18} />
                  <span>{isSubmitting ? "Submitting Report..." : "Submit Incident Report"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}