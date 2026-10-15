import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { incidentReportSchema } from "../schemas";

export default function ReportIncident() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit") || searchParams.get("id");
  const { addIncident, updateIncident, incidents, currentUser, canUserEditIncident } = useIncidents();

  const existingIncident = editId
    ? incidents?.find(
        (i) => String(i.id) === String(editId) || String(i._id) === String(editId)
      )
    : null;

  const isUnauthorizedEdit = existingIncident && canUserEditIncident && !canUserEditIncident(existingIncident);

  const reportedBy = currentUser?.name || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : "Juan Dela Cruz");
  const phone = currentUser?.phone || currentUser?.contactNumber || "0917-123-4567";

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

  // React Hook Form + Zod Resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: {
      category: "flood",
      severity: "high",
      title: "",
      locationName: "",
      lat: BARANGAY_CENTER.lat + 0.002,
      lng: BARANGAY_CENTER.lng + 0.001,
      description: "",
      reportedBy,
      reporterContact: phone,
      imageEvidence: "",
    },
  });

  const category = watch("category");
  const severity = watch("severity");
  const lat = watch("lat");
  const lng = watch("lng");

  // Pre-fill form when editing an existing incident
  useEffect(() => {
    if (existingIncident) {
      reset({
        category: existingIncident.category || "flood",
        severity: existingIncident.severity || "high",
        title: existingIncident.title || "",
        locationName: existingIncident.locationName || "",
        lat: existingIncident.lat || (BARANGAY_CENTER.lat + 0.002),
        lng: existingIncident.lng || (BARANGAY_CENTER.lng + 0.001),
        description: existingIncident.description || "",
        reportedBy: existingIncident.reportedBy || reportedBy,
        reporterContact: existingIncident.reporterContact || phone,
        imageEvidence: existingIncident.imageEvidence || "",
      });

      if (existingIncident.imageEvidence) {
        setCapturedImage(existingIncident.imageEvidence);
      }

      if (existingIncident.lat && existingIncident.lng && miniMapInstanceRef.current && draftMarkerRef.current) {
        miniMapInstanceRef.current.setView([existingIncident.lat, existingIncident.lng], 16);
        draftMarkerRef.current.setLatLng([existingIncident.lat, existingIncident.lng]);
      }
    }
  }, [existingIncident, reset, reportedBy, phone]);

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

  const handleCloseCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Watermark with timestamp and Barangay location to prove authenticity
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(
      `ALERTO LIVE VERIFIED SNAPSHOT • ${new Date().toLocaleString()} • BRGY. ANUPUL`,
      12,
      canvas.height - 15
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    setValue("imageEvidence", dataUrl, { shouldValidate: true });
    handleCloseCamera();
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize interactive Leaflet mini-map picker
  useEffect(() => {
    if (!miniMapContainerRef.current) return;
    if (miniMapInstanceRef.current) return;

    const initialLat = existingIncident?.lat || (BARANGAY_CENTER.lat + 0.002);
    const initialLng = existingIncident?.lng || (BARANGAY_CENTER.lng + 0.001);

    const map = L.map(miniMapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const draftIcon = createDraftLocationIcon();
    const marker = L.marker([initialLat, initialLng], {
      icon: draftIcon,
      draggable: true,
    }).addTo(map);

    marker.bindPopup("<b>Selected Incident Spot</b><br/>Drag pin or click map to move.").openPopup();

    marker.on("dragend", (e) => {
      const position = e.target.getLatLng();
      const newLat = parseFloat(position.lat.toFixed(5));
      const newLng = parseFloat(position.lng.toFixed(5));
      setValue("lat", newLat, { shouldValidate: true });
      setValue("lng", newLng, { shouldValidate: true });
    });

    map.on("click", (e) => {
      const newLat = parseFloat(e.latlng.lat.toFixed(5));
      const newLng = parseFloat(e.latlng.lng.toFixed(5));
      setValue("lat", newLat, { shouldValidate: true });
      setValue("lng", newLng, { shouldValidate: true });
      marker.setLatLng([newLat, newLng]);
      marker.openPopup();
    });

    miniMapInstanceRef.current = map;
    draftMarkerRef.current = marker;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      miniMapInstanceRef.current = null;
      draftMarkerRef.current = null;
    };
  }, [existingIncident, setValue]);

  // Handle "Use My Current Location" button
  const handleUseMyCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = parseFloat(pos.coords.latitude.toFixed(5));
        const userLng = parseFloat(pos.coords.longitude.toFixed(5));

        setValue("lat", userLat, { shouldValidate: true });
        setValue("lng", userLng, { shouldValidate: true });

        if (miniMapInstanceRef.current && draftMarkerRef.current) {
          miniMapInstanceRef.current.setView([userLat, userLng], 17);
          draftMarkerRef.current.setLatLng([userLat, userLng]);
          draftMarkerRef.current.setPopupContent("<b>Your Device GPS Location</b>").openPopup();
        }
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        alert("Could not retrieve GPS coordinates. Defaulting to Barangay Anupul center.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Form submit handler with React Hook Form + Zod
  const onFormSubmit = async (formData) => {
    if (!capturedImage) {
      alert("Please capture real-time live camera photo evidence before submitting. Gallery uploads are disabled to prevent fake reports.");
      return;
    }

    setIsSubmitting(true);
    const categoryObj = INCIDENT_CATEGORIES[formData.category] || INCIDENT_CATEGORIES.flood;

    try {
      if (editId) {
        await updateIncident(editId, {
          title: formData.title,
          category: formData.category,
          severity: formData.severity,
          locationName: formData.locationName,
          lat: formData.lat,
          lng: formData.lng,
          description: formData.description,
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

      const newInc = await addIncident({
        title: formData.title,
        category: formData.category,
        severity: formData.severity,
        locationName: formData.locationName,
        lat: formData.lat,
        lng: formData.lng,
        reportedBy,
        description: formData.description,
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

  if (isUnauthorizedEdit) {
    return (
      <div className="report-incident-page" style={{ padding: "3rem 1.5rem" }}>
        <div className="report-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="report-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem"
            }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              Cannot Edit This Report
            </h2>
            <p style={{ color: "#64748b", maxWidth: "460px", margin: "0 auto 1.5rem", fontSize: "0.92rem", lineHeight: 1.5 }}>
              This incident report ({existingIncident.id}) was submitted by <strong>{existingIncident.reportedBy || "another resident"}</strong>. You only have permission to edit reports you created yourself.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/map" className="btn-go-to-map" style={{ textDecoration: "none" }}>
                Return to Live Map
              </Link>
              <Link
                to="/report-incident"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  textDecoration: "none"
                }}
              >
                File New Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            <form onSubmit={handleSubmit(onFormSubmit)} className="report-form">
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
                      onClick={() => setValue("category", cat.id, { shouldValidate: true })}
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
                {errors.category && (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                    {errors.category.message}
                  </span>
                )}
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
                        value={sev.id}
                        {...register("severity")}
                        className="sr-only"
                      />
                      <span className="sev-dot" style={{ backgroundColor: sev.color }}></span>
                      <span className="sev-text" style={{ color: severity === sev.id ? sev.color : "#334155" }}>
                        {sev.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.severity && (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                    {errors.severity.message}
                  </span>
                )}
              </div>

              {/* 3. Title / Headline */}
              <div className="form-group">
                <label htmlFor="incident-title" className="input-label">
                  Incident Title / Headline <span className="required-star">*</span>
                </label>
                <input
                  id="incident-title"
                  type="text"
                  placeholder="e.g., Severe gutter flooding blocking street access"
                  {...register("title")}
                  className="form-input"
                />
                {errors.title && (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                    {errors.title.message}
                  </span>
                )}
              </div>

              {/* 4. Location Name & Interactive Map Coordinates */}
              <div className="form-group">
                <label htmlFor="location-name" className="input-label">
                  Landmark / Street Address <span className="required-star">*</span>
                </label>
                <input
                  id="location-name"
                  type="text"
                  placeholder="e.g., Kamagong St. cor. Bagtikan St., Sitio Centro"
                  {...register("locationName")}
                  className="form-input"
                />
                {errors.locationName && (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                    {errors.locationName.message}
                  </span>
                )}
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

              {/* 5. Real-Time Live Camera Evidence Upload */}
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
                        setValue("imageEvidence", "");
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
                  placeholder="Describe what happened, any persons involved or injured, visible hazards, or instructions for responding units..."
                  {...register("description")}
                  className="form-textarea"
                />
                {errors.description && (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                    {errors.description.message}
                  </span>
                )}
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
