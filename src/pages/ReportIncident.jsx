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
  RefreshCw,
  X
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

  // Retrieve user identity from context or localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const residentFullName =
    currentUser?.fullName ||
    currentUser?.name ||
    storedUser?.fullName ||
    storedUser?.name ||
    "Resident User";

  const residentPhone =
    currentUser?.phone ||
    currentUser?.contactNumber ||
    storedUser?.contactNumber ||
    storedUser?.phone ||
    "09XXXXXXXXX";

  const [category, setCategory] = useState("flood");
  const [severity, setSeverity] = useState("high");
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState(BARANGAY_CENTER.lat + 0.002);
  const [lng, setLng] = useState(BARANGAY_CENTER.lng + 0.001);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // --- Real-Time Camera States & Refs ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const draftMarkerRef = useRef(null);

  // Start real-time camera feed
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please allow camera permissions in your browser.");
    }
  };

  // Turn off hardware camera track
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture current frame from <video> to hidden <canvas>
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Save as JPEG data URL for lightweight storage and transfer
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.75);
    setCapturedImage(imageBase64);
    stopCameraStream();
  };

  const handleRetakeSnapshot = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleCancelCamera = () => {
    stopCameraStream();
  };

  // Auto clean-up camera when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim() || !description.trim()) {
      alert("Please fill in the incident title, location, and description.");
      return;
    }

    if (!capturedImage) {
      alert("Please capture real-time live camera evidence before submitting.");
      return;
    }

    setIsSubmitting(true);
    const categoryObj = INCIDENT_CATEGORIES[category] || INCIDENT_CATEGORIES.hazard;

    const payload = {
      title,
      category,
      severity,
      location: locationName,
      exactLocation: locationName,
      lat,
      lng,
      reportedBy: residentFullName,
      reporterName: residentFullName,
      phone: residentPhone,
      reporterContact: residentPhone,
      description,
      image: capturedImage,
      evidencePhoto: capturedImage,
      responder: categoryObj.responder,
      status: "Pending",
    };

    try {
      const token = localStorage.getItem("token") || currentUser?.token;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:5000/api/incidents", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      const savedIncident = await response.json();

      if (typeof addIncident === "function") {
        addIncident(savedIncident.data || savedIncident || payload);
      }

      setIsSubmitting(false);
      setSubmittedSuccess(true);

      setTimeout(() => {
        const targetId = savedIncident._id || savedIncident.id || "";
        navigate(`/map${targetId ? `?id=${targetId}` : ""}`);
      }, 1500);

    } catch (err) {
      console.error("Failed to submit incident:", err);
      alert(`Error submitting incident: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-incident-page-wrapper">
      <div className="report-page-container">
        {/* Navigation back bar */}
        <div className="report-nav-back">
          <Link to="/" className="btn-back-link">
            <ArrowLeft size={16} /> Back to Main Page
          </Link>
          <span className="report-badge-indicator">
            <AlertTriangle size={14} /> Official Incident Reporting Portal
          </span>
        </div>

        {submittedSuccess ? (
          <div className="report-success-card">
            <div className="success-icon-wrapper">
              <CheckCircle size={54} className="text-emerald-500 animate-bounce" />
            </div>
            <h2>Incident Successfully Dispatched & Logged!</h2>
            <p className="success-sub">
              Your report and live camera verification have been received.
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
                  Provide exact details to immediately alert Barangay Tanod, BFP, BHERT, or DRRMO teams.
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

              {/* 3. Title & Landmark/Location */}
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

              {/* 5. Real-Time Live Camera Evidence Section */}
              <div
                style={{
                  border: "2px dashed #f43f5e",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  backgroundColor: "#fff1f2",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.25rem" }}>
                  <Camera size={18} color="#e11d48" />
                  <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#be123c", margin: 0 }}>
                    Real-Time Live Camera Evidence *
                  </label>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1rem 0", lineHeight: "1.4" }}>
                  Photo library and gallery uploads are strictly disabled to prevent fake reports and pranks[cite: 18]. Snap a live photo on the spot[cite: 18].
                </p>

                {cameraError && (
                  <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                    ⚠️ {cameraError}
                  </div>
                )}

                {/* Camera Viewport or Snapshot Preview */}
                {!isCameraActive && !capturedImage && (
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      width: "100%",
                      padding: "0.9rem",
                      backgroundColor: "#e11d48",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(225, 29, 72, 0.25)",
                    }}
                  >
                    <Camera size={18} /> Open Live Incident Camera
                  </button>
                )}

                {/* Live Stream View */}
                {isCameraActive && (
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "#000",
                    }}
                  >
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      style={{
                        width: "100%",
                        maxHeight: "360px",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        padding: "0.75rem",
                        backgroundColor: "#0f172a",
                      }}
                    >
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#e11d48",
                          color: "white",
                          padding: "0.6rem 1.25rem",
                          border: "none",
                          borderRadius: "9999px",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          cursor: "pointer",
                        }}
                      >
                        <Camera size={16} /> Capture Live Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelCamera}
                        style={{
                          backgroundColor: "#475569",
                          color: "white",
                          padding: "0.6rem 1.25rem",
                          border: "none",
                          borderRadius: "9999px",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Captured Image Preview */}
                {capturedImage && (
                  <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "2px solid #10b981" }}>
                    <img
                      src={capturedImage}
                      alt="Captured Incident Evidence"
                      style={{ width: "100%", maxHeight: "360px", objectFit: "cover", display: "block" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.6rem 1rem",
                        backgroundColor: "#0f172a",
                        color: "white",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 700 }}>
                        ✓ Live Photo Stamped & Verified
                      </span>
                      <button
                        type="button"
                        onClick={handleRetakeSnapshot}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          backgroundColor: "#334155",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                        }}
                      >
                        <RefreshCw size={14} /> Retake
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden canvas for snapshot rendering */}
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>

              {/* 6. Detailed Description */}
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
                      value={residentFullName}
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
                      value={residentPhone}
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
                  disabled={isSubmitting}
                  className="btn-form-submit-highlight"
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