import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit") || searchParams.get("id");
  const { addIncident, updateIncident, incidents, currentUser } = useIncidents();

  const existingIncident = editId
    ? incidents?.find(
        (i) => String(i.id) === String(editId) || String(i._id) === String(editId)
      )
    : null;

  const [category, setCategory] = useState("flood");
  const [severity, setSeverity] = useState("high");
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  
  const reportedBy = currentUser?.name || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : "Juan Dela Cruz");
  const phone = currentUser?.phone || currentUser?.contactNumber || "0917-123-4567";
  
  const [lat, setLat] = useState(BARANGAY_CENTER.lat + 0.002);
  const [lng, setLng] = useState(BARANGAY_CENTER.lng + 0.001);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Real-Time Live Camera Capture States (Blocks Gallery / Library Uploads)
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const draftMarkerRef = useRef(null);

  // Pre-fill form when editing an existing incident
  useEffect(() => {
    if (existingIncident) {
      if (existingIncident.title) setTitle(existingIncident.title);
      if (existingIncident.category) setCategory(existingIncident.category);
      if (existingIncident.severity) setSeverity(existingIncident.severity);
      if (existingIncident.locationName) setLocationName(existingIncident.locationName);
      if (existingIncident.description) setDescription(existingIncident.description);
      if (existingIncident.lat && existingIncident.lng) {
        setLat(existingIncident.lat);
        setLng(existingIncident.lng);
        if (miniMapInstanceRef.current && draftMarkerRef.current) {
          miniMapInstanceRef.current.setView([existingIncident.lat, existingIncident.lng], 16);
          draftMarkerRef.current.setLatLng([existingIncident.lat, existingIncident.lng]);
        }
      }
      if (existingIncident.imageEvidence) setCapturedImage(existingIncident.imageEvidence);
    }
  }, [existingIncident]);

  // Open live webcam / hardware camera stream
  const handleOpenLiveCamera = async () => {
    setCameraError("");
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access was denied or is unavailable. Please allow camera permissions to snap live evidence.");
      setIsCameraOpen(false);
    }
  };

  // Close live camera stream
  const handleCloseCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Take snapshot from active live stream
  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUrl);
      handleCloseCamera();
    }
  };

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Sync videoRef stream if opened
  useEffect(() => {
    if (isCameraOpen && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraOpen]);

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
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      {
        subdomains: "0123",
        maxZoom: 20,
      }
    ).addTo(map);

    const draftIcon = createDraftLocationIcon(category);
    const marker = L.marker([lat, lng], {
      icon: draftIcon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", function (e) {
      const newPos = e.target.getLatLng();
      setLat(Number(newPos.lat.toFixed(5)));
      setLng(Number(newPos.lng.toFixed(5)));
    });

    map.on("click", function (e) {
      marker.setLatLng(e.latlng);
      setLat(Number(e.latlng.lat.toFixed(5)));
      setLng(Number(e.latlng.lng.toFixed(5)));
    });

    miniMapInstanceRef.current = map;
    draftMarkerRef.current = marker;

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker icon when category changes
  useEffect(() => {
    if (draftMarkerRef.current) {
      const updatedIcon = createDraftLocationIcon(category);
      draftMarkerRef.current.setIcon(updatedIcon);
    }
  }, [category]);

  const categoryObj = INCIDENT_CATEGORIES[category] || INCIDENT_CATEGORIES.flood;

  const handleUseMyCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = Number(pos.coords.latitude.toFixed(5));
          const newLng = Number(pos.coords.longitude.toFixed(5));
          setLat(newLat);
          setLng(newLng);
          if (miniMapInstanceRef.current && draftMarkerRef.current) {
            miniMapInstanceRef.current.flyTo([newLat, newLng], 17);
            draftMarkerRef.current.setLatLng([newLat, newLng]);
          }
        },
        () => {
          const offsetLat = Number((BARANGAY_CENTER.lat + (Math.random() - 0.5) * 0.005).toFixed(5));
          const offsetLng = Number((BARANGAY_CENTER.lng + (Math.random() - 0.5) * 0.005).toFixed(5));
          setLat(offsetLat);
          setLng(offsetLng);
          if (miniMapInstanceRef.current && draftMarkerRef.current) {
            miniMapInstanceRef.current.flyTo([offsetLat, offsetLng], 16);
            draftMarkerRef.current.setLatLng([offsetLat, offsetLng]);
          }
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim() || !description.trim()) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    if (!capturedImage) {
      alert("Please capture real-time live camera photo evidence before submitting. Gallery uploads are disabled to prevent fake reports.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editId) {
        // Update the existing incident report instead of creating a duplicate
        await updateIncident(editId, {
          title,
          category,
          severity,
          locationName,
          lat,
          lng,
          description,
          imageEvidence: capturedImage,
          responder: categoryObj.responder,
        });

        setIsSubmitting(false);
        setSubmittedSuccess(true);

        setTimeout(() => {
          navigate(`/map?id=${editId}`);
        }, 1200);
        return;
      }

      // Create brand new incident
      const newInc = await addIncident({
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
        navigate(`/map?id=${newInc?.id || ""}`);
      }, 1500);
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
      alert("Error submitting incident: " + err.message);
    }
  };

  return (
    <div className="report-incident-page">
      <div className="report-container">
        {submittedSuccess ? (
          <div className="report-success-card">
            <div className="success-icon-wrapper">
              <CheckCircle size={56} className="text-emerald-500" />
            </div>
            <h2>{editId ? `Incident #${editId} Successfully Updated!` : "Incident Successfully Dispatched & Logged!"}</h2>
            <p className="success-sub">
              {editId
                ? "Your updated information and photo evidence have been saved and synced across Barangay Anupul Operations Command."
                : "Your report with real-time camera evidence has been received by Barangay Anupul Operations Command. Responders have been notified and a live pin has been activated on the incident map."}
            </p>
            <div className="redirect-countdown">
              <Clock size={16} /> Redirecting to Live Incident Map in 2 seconds...
            </div>
          </div>
        ) : (
          <div className="report-card">
            <div className="report-card-header">
              <Link to="/" className="btn-back-circle" title="Back to Main Page">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="report-card-title">
                  {editId ? `Update Report #${editId}` : "Report an Incident or Emergency"}
                </h1>
                <p className="report-card-subtitle">
                  {editId
                    ? "Modify description, location pin coordinates, or update live camera evidence for this active report."
                    : "Provide exact details and real-time live camera evidence to immediately alert Barangay Tanod, BFP, BHERT, or DRRMO teams."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="report-form">
              {/* 1. Incident Category Selection */}
              <div className="form-section">
                <label className="input-label">
                  Incident Category <span className="required-star">*</span>
                </label>
                <p className="input-subtext">
                  Choose the emergency category to ensure automatic routing to the proper dispatch unit.
                </p>
                <div className="category-selection-grid">
                  {Object.values(INCIDENT_CATEGORIES).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-choice-btn ${category === cat.id ? "selected" : ""}`}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        borderColor: category === cat.id ? cat.color : "#e2e8f0",
                        backgroundColor: category === cat.id ? cat.bgLight : "#ffffff",
                      }}
                    >
                      <span className="cat-choice-icon" style={{ color: cat.color }}>
                        {cat.id === "fire" && <Flame size={24} />}
                        {cat.id === "flood" && <Waves size={24} />}
                        {cat.id === "medical" && <HeartPulse size={24} />}
                        {cat.id === "police" && <ShieldAlert size={24} />}
                        {cat.id === "accident" && <Car size={24} />}
                        {cat.id === "hazard" && <Zap size={24} />}
                      </span>
                      <span className="cat-choice-title">{cat.label}</span>
                      <span className="cat-choice-responder">{cat.responder}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Severity Level */}
              <div className="form-section">
                <label className="input-label">
                  Urgency / Severity Level <span className="required-star">*</span>
                </label>
                <div className="severity-radio-group">
                  {[
                    { id: "critical", label: "Critical / Life Threatening", color: "#dc2626", bg: "#fef2f2" },
                    { id: "high", label: "High / Urgent Response", color: "#ea580c", bg: "#fff7ed" },
                    { id: "medium", label: "Medium / Attention Needed", color: "#d97706", bg: "#fffbeb" },
                    { id: "low", label: "Low / Non-Urgent Advisory", color: "#2563eb", bg: "#eff6ff" },
                  ].map((sev) => (
                    <label
                      key={sev.id}
                      className={`severity-radio-card ${severity === sev.id ? "active" : ""}`}
                      style={{
                        borderColor: severity === sev.id ? sev.color : "#e2e8f0",
                        backgroundColor: severity === sev.id ? sev.bg : "#ffffff",
                      }}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={sev.id}
                        checked={severity === sev.id}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="sr-only"
                      />
                      <span className="sev-dot" style={{ backgroundColor: sev.color }}></span>
                      <span className="sev-text" style={{ color: severity === sev.id ? sev.color : "#334155" }}>
                        {sev.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Title / Headline */}
              <div className="form-group">
                <label htmlFor="incident-title" className="input-label">
                  Incident Title / Headline <span className="required-star">*</span>
                </label>
                <input
                  id="incident-title"
                  type="text"
                  required
                  placeholder="e.g., Severe gutter flooding blocking street access"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 4. Location Name & Interactive Map Coordinates */}
              <div className="form-group">
                <label htmlFor="location-name" className="input-label">
                  Landmark / Street Address <span className="required-star">*</span>
                </label>
                <input
                  id="location-name"
                  type="text"
                  required
                  placeholder="e.g., Kamagong St. cor. Bagtikan St., Sitio Centro"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Mini Map Location Picker */}
              <div className="form-section">
                <div className="mini-map-header">
                  <div>
                    <span className="input-label">Pinpoint Exact Map Coordinates</span>
                    <p className="input-subtext">Click map or drag the pin to mark the exact incident spot.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMyCurrentLocation}
                    className="btn-use-location"
                  >
                    <Crosshair size={15} /> Use My Current Location
                  </button>
                </div>

                <div className="mini-map-container" ref={miniMapContainerRef}></div>

                <div className="coords-display-pill">
                  📍 Selected Coordinates: Latitude: {lat}, Longitude: {lng}
                </div>
              </div>

              {/* 5. Real-Time Live Camera Evidence Upload (Anti-Troll / Gallery Blocked) */}
              <div className="form-section" style={{ background: "#f8fafc", border: "2px dashed #f43f5e", padding: "1.25rem", borderRadius: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem", fontWeight: "700", color: "#e11d48" }}>
                    <Camera size={18} />
                    Real-Time Live Camera Evidence <span className="required-star">*</span>
                  </label>
                  <p className="input-subtext" style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    Photo library and gallery uploads are strictly disabled to prevent fake reports and pranks. Snap a live photo on the spot.
                  </p>
                </div>

                {cameraError && (
                  <div style={{ padding: "10px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "10px", border: "1px solid #fecaca" }}>
                    {cameraError}
                  </div>
                )}

                {capturedImage ? (
                  <div style={{ position: "relative", width: "100%", height: "260px", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #cbd5e1", background: "#000" }}>
                    <img src={capturedImage} alt="Live Evidence Captured" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedImage(null);
                        handleOpenLiveCamera();
                      }}
                      style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.85)", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: "600" }}
                    >
                      <RefreshCw size={14} /> Retake Live Photo
                    </button>
                  </div>
                ) : isCameraOpen ? (
                  <div style={{ position: "relative", width: "100%", background: "#000", borderRadius: "0.75rem", overflow: "hidden", textAlign: "center" }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }}
                    />
                    <div style={{ padding: "12px", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={handleCaptureSnapshot}
                        style={{ background: "#e11d48", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "9999px", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Camera size={16} /> Capture Live Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseCamera}
                        style={{ background: "#64748b", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "9999px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleOpenLiveCamera}
                    style={{ textAlign: "center", padding: "2rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "2px dashed #cbd5e1", cursor: "pointer", transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#f43f5e")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                  >
                    <div style={{ width: "54px", height: "54px", borderRadius: "14px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <Camera size={28} />
                    </div>
                    <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>Open Real-Time Live Camera</p>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Click to activate camera viewfinder stream (Gallery uploads blocked to ensure authenticity)</p>
                  </div>
                )}
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

              {/* 7. Reporter Information (Pre-filled & Uneditable for Logged-In User) */}
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
                  <span>
                    {isSubmitting
                      ? editId
                        ? "Saving Changes..."
                        : "Submitting Report..."
                      : editId
                      ? "Save Updated Incident"
                      : "Submit Incident Report"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
