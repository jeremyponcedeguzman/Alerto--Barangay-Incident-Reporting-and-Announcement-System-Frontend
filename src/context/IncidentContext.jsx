import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import {
  formatDateTime,
  formatTimeOnly,
  getRelativeTime,
  formatDynamicTimestamp,
} from "../utils/timeUtils";
import { logAuditEvent, AUDIT_CATEGORIES } from "../utils/auditLogger";
import { incidentsApi, alertsApi, healthApi } from "../api";
import { useAuth } from "./AuthContext";

const IncidentContext = createContext(null);

export function isUserJuanDelaCruz(user) {
  if (!user) return true; // defaults to Juan Dela Cruz for demo
  if (user.id === "RES-DEMO-01") return true;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim().toLowerCase();
  if (fullName === "juan dela cruz" || user.name?.toLowerCase() === "juan dela cruz") return true;
  if (user.email === "resident@gmail.com") return true;
  return false;
}

export function canUserEditIncident(incident, user) {
  if (!incident) return false;

  // If user is null, they're using the default Juan Dela Cruz demo session
  if (!user) {
    const rName = (incident.reportedBy || incident.reporterName || "").trim().toLowerCase();
    return rName === "juan dela cruz" || incident.isUserReport;
  }

  // Admin can edit all incidents
  if (user.role === "admin" || user.email === "admin@anupul.gov") {
    return true;
  }

  const isJuan = isUserJuanDelaCruz(user);
  const reporterName = (incident.reportedBy || incident.reporterName || "").trim().toLowerCase();
  const reporterId = incident.reporterId || incident.userId;

  // Incident created by Juan Dela Cruz:
  const belongsToJuan = reporterName === "juan dela cruz" || reporterId === "RES-DEMO-01";

  if (belongsToJuan) {
    // ONLY Juan Dela Cruz can edit his own reports!
    return isJuan;
  }

  // If another user is logged in:
  if (!isJuan) {
    if (reporterId && user.id && String(reporterId) === String(user.id)) return true;
    const userFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim().toLowerCase();
    if (reporterName && userFullName && reporterName === userFullName) return true;
    if (incident.reporterContact && user.contactNumber && incident.reporterContact === user.contactNumber) return true;
    if (incident.reporterEmail && user.email && incident.reporterEmail === user.email) return true;
  }

  return false;
}

export const INCIDENT_CATEGORIES = {
  fire: {
    id: "fire",
    label: "Fire Incident",
    iconName: "Flame",
    color: "#ef4444",
    bgLight: "#fee2e2",
    responder: "BFP (Bureau of Fire Protection) 🚒",
  },
  flood: {
    id: "flood",
    label: "Flood & Weather Hazard",
    iconName: "Waves",
    color: "#0284c7",
    bgLight: "#e0f2fe",
    responder: "DRRMO (Disaster Risk Reduction) 🌊",
  },
  medical: {
    id: "medical",
    label: "Medical Emergency",
    iconName: "HeartPulse",
    color: "#10b981",
    bgLight: "#d1fae5",
    responder: "BHERT (Barangay Health / Ambulance) 🚑",
  },
  police: {
    id: "police",
    label: "Crime",
    iconName: "ShieldAlert",
    color: "#8b5cf6",
    bgLight: "#ede9fe",
    responder: "Barangay Tanod & PNP 👮",
  },
  accident: {
    id: "accident",
    label: "Vehicular & Road Accident",
    iconName: "CarAlert",
    color: "#f59e0b",
    bgLight: "#fef3c7",
    responder: "Traffic Enforcement & Tanod ⚠️",
  },
  hazard: {
    id: "hazard",
    label: "Power & Infrastructure",
    iconName: "ZapOff",
    color: "#6b7280",
    bgLight: "#f3f4f6",
    responder: "Barangay Engineering & Meralco ⚡",
  },
};

export const RESPONDER_ROLES = [
  { id: "all", label: "All Incidents (Public View)", categories: ["fire", "flood", "medical", "police", "accident", "hazard"] },
  { id: "tanod", label: "Barangay Tanod / Police", categories: ["police", "accident"] },
  { id: "bfp", label: "Bureau of Fire Protection (BFP)", categories: ["fire"] },
  { id: "bhert", label: "Health / BHERT Responder", categories: ["medical"] },
  { id: "drrmo", label: "Disaster Risk / DRRMO", categories: ["flood", "hazard"] },
];

// Current logged in user (verified resident identity)
export const CURRENT_USER = {
  name: "Juan Dela Cruz",
  phone: "0917-123-4567",
  residentId: "BRGY-ANUPUL-2026-0042",
  address: "Sitio Centro, Barangay Anupul, Bamban, Tarlac",
};

// Default Barangay Poblacion / Anupul Center Coordinates
export const BARANGAY_CENTER = {
  lat: 15.2894,
  lng: 120.5718,
  name: "Barangay Anupul Operations Center, Bamban, Tarlac",
};

// Initial realistic incident data located in Barangay Anupul, Bamban, Tarlac
const INITIAL_INCIDENTS = [
  {
    id: "INC-2026-001",
    title: "Residential Structure Fire (Alert Level 1)",
    category: "fire",
    severity: "critical",
    status: "Dispatched",
    locationName: "Sitio Centro near Barangay Hall, Anupul",
    lat: 15.2898,
    lng: 120.5721,
    reportedBy: "Resident Maria Santos",
    isUserReport: true,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    description: "Thick black smoke emitting from two-story residential house near Barangay Hall. BFP Bamban fire truck en route.",
    responder: "BFP Firefighters 🚒",
    votes: 8,
  },
  {
    id: "INC-2026-002",
    title: "Electrical Transformer Spark / Cable Line Fire",
    category: "fire",
    severity: "high",
    status: "In Progress",
    locationName: "MacArthur Highway cor. Sitio Manga, Anupul",
    lat: 15.2912,
    lng: 120.5735,
    reportedBy: "Store Owner Arthur V.",
    isUserReport: false,
    createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    description: "Sparks flying from overhead electric transformer along MacArthur Highway near convenience mart.",
    responder: "BFP & Meralco ⚡",
    votes: 5,
  },
  {
    id: "INC-2026-003",
    title: "Trash & Brush Fire Threatening Perimeter Fence",
    category: "fire",
    severity: "medium",
    status: "Pending Review",
    locationName: "Sitio Priority Vacant Lot, Anupul",
    lat: 15.2940,
    lng: 120.5762,
    reportedBy: "Barangay Tanod Patrol",
    isUserReport: false,
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    description: "Illegal burning of dry cogon grass spreading dangerously near residential wooden fence.",
    responder: "BFP & Tanod 🚒",
    votes: 3,
  },
  {
    id: "INC-2026-004",
    title: "Knee-Deep Gutter Flood / Clogged Drainage Culvert",
    category: "flood",
    severity: "high",
    status: "In Progress",
    locationName: "Sitio Binitagan Interior Access Road, Anupul",
    lat: 15.2881,
    lng: 120.5708,
    reportedBy: "Juan Dela Cruz",
    isUserReport: true,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    description: "Water has reached knee level, impassable to light tricycles. Trash and silt blocking drainage grates.",
    responder: "DRRMO & Engineering 🌊",
    votes: 14,
  },
  {
    id: "INC-2026-005",
    title: "Rising Creek Overflow Near Lowland Boundary",
    category: "flood",
    severity: "critical",
    status: "In Progress",
    locationName: "Sitio Baguingit Creek Bank, Anupul",
    lat: 15.2872,
    lng: 120.5695,
    reportedBy: "Tanod Watch Post 4",
    isUserReport: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    description: "Creek water level reached Orange Alert threshold. Low-lying riverside homes placed on evacuation standby.",
    responder: "DRRMO Rescue Unit 🌊",
    votes: 21,
  },
  {
    id: "INC-2026-006",
    title: "Submerged Alleyway - Stranded Senior Residents",
    category: "flood",
    severity: "critical",
    status: "Dispatched",
    locationName: "Sitio Mape Lowland Compound, Anupul",
    lat: 15.2858,
    lng: 120.5684,
    reportedBy: "Resident Cora Diaz",
    isUserReport: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    description: "Two elderly residents unable to exit home due to 2-foot stormwater pooling inside interior alley.",
    responder: "DRRMO & Barangay Ambulance 🚑",
    votes: 9,
  },
  {
    id: "INC-2026-007",
    title: "Drainage Backflow into Driveways",
    category: "flood",
    severity: "medium",
    status: "Pending Review",
    locationName: "Sitio Pag-asa Main Pathway, Anupul",
    lat: 15.2865,
    lng: 120.5711,
    reportedBy: "Resident Ben Perez",
    isUserReport: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    description: "Stormwater bubbling through drainage grates during heavy monsoon rains.",
    responder: "Engineering Team 🛠️",
    votes: 4,
  },
  {
    id: "INC-2026-008",
    title: "Elderly Citizen Severe Breathing Distress",
    category: "medical",
    severity: "critical",
    status: "Dispatched",
    locationName: "Sitio San Joseph, Anupul",
    lat: 15.2925,
    lng: 120.5742,
    reportedBy: "Family Member Ana G.",
    isUserReport: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    description: "72yo resident experiencing shortness of breath. Barangay ambulance and oxygen assistance requested.",
    responder: "BHERT & Barangay Ambulance 🚑",
    votes: 2,
  },
  {
    id: "INC-2026-009",
    title: "Motorcycle Fall Injury - First Aid Administered",
    category: "medical",
    severity: "medium",
    status: "Resolved",
    locationName: "MacArthur Highway near Anupul Elementary School",
    lat: 15.2905,
    lng: 120.5728,
    reportedBy: "Traffic Marshall",
    isUserReport: false,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    description: "Rider slipped on wet highway road markings. Minor lacerations on knees, treated on site by BHERT.",
    responder: "BHERT Medic 🚑",
    votes: 6,
  },
  {
    id: "INC-2026-010",
    title: "Commercial Store Break-In & Theft Attempt",
    category: "police",
    severity: "medium",
    status: "In Progress",
    locationName: "Sitio Centro Commercial Strip, Anupul",
    lat: 15.2891,
    lng: 120.5716,
    reportedBy: "Juan Dela Cruz",
    isUserReport: true,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    description: "Sari-sari store break-in attempt and property theft reported. Tanod / Police investigation requested.",
    responder: "Barangay Tanod Patrol 👮",
    votes: 7,
  },
  {
    id: "INC-2026-011",
    title: "Two-Vehicle Collision Blocking Highway Lane",
    category: "accident",
    severity: "high",
    status: "Dispatched",
    locationName: "MacArthur Highway cor. Bamban Boundary, Anupul",
    lat: 15.2850,
    lng: 120.5690,
    reportedBy: "Motorist Carlo R.",
    isUserReport: false,
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    description: "Delivery tricycle and utility van sideswiped. Southbound lane partially blocked, Tanod traffic control en route.",
    responder: "Traffic Tanod & Tow Unit ⚠️",
    votes: 11,
  },
  {
    id: "INC-2026-012",
    title: "Downed Acacia Tree Branch Leaning on Power Wires",
    category: "hazard",
    severity: "medium",
    status: "Pending Review",
    locationName: "Sitio San Roque Entry Road, Anupul",
    lat: 15.2931,
    lng: 120.5750,
    reportedBy: "Homeowners Association",
    isUserReport: false,
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    description: "Large tree limb snapped during gusty wind, resting dangerously on telecommunications lines.",
    responder: "Barangay Maintenance ⚡",
    votes: 5,
  },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ANN-001",
    title: "Advisory: Rainfall Warning & Lowland Drainage Clearing Operation",
    date: "October 9, 2026 • 03:00 AM",
    badge: "URGENT ADVISORY",
    badgeType: "warning",
    author: "Barangay DRRMO & Engineering Unit",
    summary: "Residents in low-lying riverside areas are advised to monitor creek water levels. Tanod and maintenance crews have deployed water pumps to assist drainage backflow.",
  },
  {
    id: "ANN-002",
    title: "Barangay Emergency Hotline Directory",
    date: "October 8, 2026",
    badge: "HOTLINES",
    badgeType: "info",
    author: "Barangay Council",
    summary: "For immediate emergency dispatch: Barangay Operations Center, Police Substation, BFP Fire Substation, Ambulance.",
  },
  {
    id: "ANN-003",
    title: "Community Fire Prevention & Gas Tank Inspection Drive",
    date: "October 7, 2026",
    badge: "PUBLIC NOTICE",
    badgeType: "notice",
    author: "BFP Fire Station",
    summary: "Barangay fire volunteers will conduct free LPG hose checks and electrical line inspections across residential areas this coming weekend.",
  },
];

export function IncidentProvider({ children }) {
  const auth = useAuth() || {};
  const currentUser = auth.currentUser;

  // Load from local storage or fallback to initial data
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem("barangay_incidents");
    if (!saved) return INITIAL_INCIDENTS;
    try {
      const parsed = JSON.parse(saved);
      // Automatically reset if old Makati coordinates (< 15.0 lat) are detected
      const hasOldMakatiCoords = Array.isArray(parsed) && parsed.some((i) => i.lat && i.lat < 15.0);
      if (hasOldMakatiCoords) {
        return INITIAL_INCIDENTS;
      }
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem("barangay_announcements");
    if (!saved) return INITIAL_ANNOUNCEMENTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem("barangay_incidents", JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem("barangay_announcements", JSON.stringify(announcements));
  }, [announcements]);

  const [now, setNow] = useState(Date.now());
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRole, setActiveRole] = useState("all");
  const [viewMode, setViewMode] = useState("auto"); // 'auto', 'pins', 'heatmap', 'hybrid'
  const [focusedIncidentId, setFocusedIncidentId] = useState(null);
  const [mapTileStyle, setMapTileStyle] = useState("googleRoads"); // 'googleRoads', 'googleSatellite', 'streets', 'dark', 'osm'
  const [clusterThreshold, setClusterThreshold] = useState(3);

  // Live dynamic clock timer: updates every 15s to keep relative timestamps dynamic & fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isMongoAvailable, setIsMongoAvailable] = useState(false);

  // Sync data with backend API (Express + MongoDB)
  const refreshFromBackend = useCallback(async () => {
    try {
      const health = await healthApi.check();
      const mongoOk = Boolean(
        health.success && (health.mongoConnected === undefined || health.mongoConnected === true)
      );

      setIsBackendOnline(Boolean(health.success));
      setIsMongoAvailable(mongoOk);

      if (health.success && mongoOk) {
        // Fetch live incidents from backend
        const incRes = await incidentsApi.getAll();
        if (incRes.success && Array.isArray(incRes.data) && incRes.data.length > 0) {
          const mappedIncidents = incRes.data.map((inc) => ({
            id: inc.customId || inc.id || inc._id,
            _id: inc._id,
            title: inc.title,
            category: (inc.category || inc.incidentType || 'flood').toLowerCase(),
            severity: (inc.severity || inc.urgency || 'medium').toLowerCase(),
            status: inc.status || 'Pending',
            locationName: inc.locationName || inc.exactLocation || inc.purok || 'Barangay Anupul',
            lat: inc.lat ?? 15.2894,
            lng: inc.lng ?? 120.5718,
            reportedBy: inc.reportedBy || inc.reporterName || 'Resident',
            reporterId: inc.reporterId || inc.userId || '',
            reporterContact: inc.reporterContact || '',
            reporterEmail: inc.reporterEmail || '',
            isUserReport: inc.isUserReport ?? true,
            createdAt: inc.createdAt || new Date().toISOString(),
            description: inc.description || '',
            responder: inc.responder || 'Barangay Operations Desk',
            votes: inc.votes || 1,
            imageEvidence: inc.imageEvidence || '',
          }));
          setIncidents(mappedIncidents);
        }

        // Fetch live emergency alerts / announcements from backend
        const alertRes = await alertsApi.getAll();
        if (alertRes.success && Array.isArray(alertRes.data) && alertRes.data.length > 0) {
          const mappedAlerts = alertRes.data.map((al) => ({
            id: al._id || al.id,
            _id: al._id,
            title: al.title,
            date: al.createdAt ? new Date(al.createdAt).toLocaleString() : 'Recent Advisory',
            badge: al.severity === 'Critical' ? 'EMERGENCY ALERT' : al.severity === 'High' ? 'WEATHER ADVISORY' : 'PUBLIC NOTICE',
            badgeType: (al.severity === 'Critical' || al.severity === 'High') ? 'warning' : 'notice',
            author: al.issuerName || 'Barangay Operations',
            summary: al.description || al.instructions || '',
          }));
          setAnnouncements(mappedAlerts);
        }
      } else {
        setIsBackendOnline(false);
        setIsMongoAvailable(false);
      }
    } catch (err) {
      console.warn('Backend sync notice:', err.message);
      setIsBackendOnline(false);
      setIsMongoAvailable(false);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
    const interval = setInterval(refreshFromBackend, 30000);
    return () => clearInterval(interval);
  }, [refreshFromBackend]);

  // Dynamically enrich incidents with exact timestamp and live elapsed relative time
  const enrichedIncidents = useMemo(() => {
    return incidents.map((inc) => {
      const createdDate = inc.createdAt || new Date(now).toISOString();
      const timeInfo = formatDynamicTimestamp(createdDate, now);
      return {
        ...inc,
        createdAt: createdDate,
        exactTime: timeInfo.exact,
        timeOnly: formatTimeOnly(createdDate),
        relativeTime: timeInfo.relative,
        timestamp: timeInfo.short,
        fullTimestamp: timeInfo.full,
      };
    });
  }, [incidents, now]);

  // Add a new incident report with real-time ISO createdAt and backend Cloudinary + MongoDB sync
  const addIncident = async (newIncident) => {
    const tempId = `INC-2026-${String(incidents.length + 1).padStart(3, "0")}`;
    const authorName = newIncident.reportedBy || currentUser?.name || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : "Juan Dela Cruz");
    const authorPhone = currentUser?.contactNumber || currentUser?.phone || "0917-123-4567";
    const authorId = currentUser?.id || (isUserJuanDelaCruz(currentUser) ? "RES-DEMO-01" : `RES-${Date.now()}`);

    const formatted = {
      ...newIncident,
      id: tempId,
      createdAt: new Date().toISOString(),
      reportedBy: authorName,
      reporterId: authorId,
      reporterContact: authorPhone,
      reporterEmail: currentUser?.email || "",
      status: "Pending Review",
      votes: 1,
      isUserReport: true,
    };
    setIncidents((prev) => [formatted, ...prev]);
    setFocusedIncidentId(formatted.id);

    logAuditEvent({
      category: AUDIT_CATEGORIES.DISPATCH,
      action: "New Incident Reported",
      actor: authorName,
      target: formatted.id,
      details: `Reported: ${formatted.title} at ${formatted.locationName}. Responder assigned: ${formatted.responder || "Unassigned"}.`,
      severity: formatted.severity === "critical" ? "critical" : "warning",
    });

    // Asynchronously push to backend (uploads live snapshot to Cloudinary & saves to MongoDB)
    try {
      const payload = {
        title: formatted.title,
        category: formatted.category,
        severity: formatted.severity,
        locationName: formatted.locationName,
        lat: formatted.lat,
        lng: formatted.lng,
        description: formatted.description,
        reportedBy: formatted.reportedBy,
        reporterContact: authorPhone,
        reporterEmail: currentUser?.email || "",
        reporterId: authorId,
        imageEvidence: formatted.imageEvidence || "",
        responder: formatted.responder,
        urgency: formatted.severity === "critical" ? "Critical" : formatted.severity === "high" ? "High" : "Medium",
      };

      const res = await incidentsApi.create(payload);
      if (res.success && res.data) {
        const saved = res.data;
        const realId = saved.customId || saved.id || saved._id;
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === tempId
              ? {
                  ...i,
                  id: realId,
                  _id: saved._id,
                  imageEvidence: saved.imageEvidence || i.imageEvidence,
                }
              : i
          )
        );
        setFocusedIncidentId(realId);
      }
    } catch (err) {
      console.warn("Backend incident submission note:", err.message);
    }

    return formatted;
  };

  // Update status (e.g., mark resolved or dispatched)
  const updateIncidentStatus = async (id, newStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id || inc._id === id ? { ...inc, status: newStatus } : inc))
    );

    logAuditEvent({
      category: AUDIT_CATEGORIES.DISPATCH,
      action: "Incident Status Changed",
      actor: "Operations Desk",
      target: id,
      details: `Status updated to '${newStatus}'.`,
      severity: newStatus === "Resolved" ? "info" : "notice",
    });

    try {
      await incidentsApi.update(id, { status: newStatus });
    } catch (err) {
      console.warn("Backend status update note:", err.message);
    }
  };

  const updateIncidentDetails = async (id, newStatus, newResponder) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        String(inc.id) === String(id) || String(inc._id) === String(id)
          ? { ...inc, status: newStatus, responder: newResponder }
          : inc
      )
    );

    logAuditEvent({
      category: AUDIT_CATEGORIES.DISPATCH,
      action: "Incident Dispatch Updated",
      actor: "Operations Desk",
      target: String(id),
      details: `Updated Incident #${id}: Status -> ${newStatus}, Assigned -> ${newResponder}.`,
      severity: "notice",
    });

    try {
      await incidentsApi.update(id, { status: newStatus, responder: newResponder });
    } catch (err) {
      console.warn("Backend dispatch update note:", err.message);
    }
  };

  // Full incident update (when resident or official updates details, location, severity, category, photo)
  const updateIncident = async (id, updatedFields) => {
    const target = incidents.find(
      (inc) => String(inc.id) === String(id) || String(inc._id) === String(id)
    );

    if (target && !canUserEditIncident(target, currentUser)) {
      alert("Permission Denied: You cannot edit reports submitted by other residents.");
      return { success: false, message: "Permission Denied: You cannot edit reports submitted by other residents." };
    }

    const editorName = currentUser?.name || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : "Resident");

    setIncidents((prev) =>
      prev.map((inc) =>
        String(inc.id) === String(id) || String(inc._id) === String(id)
          ? { ...inc, ...updatedFields }
          : inc
      )
    );

    logAuditEvent({
      category: AUDIT_CATEGORIES.DISPATCH,
      action: "Incident Information Updated",
      actor: editorName,
      target: String(id),
      details: `Updated details for Incident #${id}: ${updatedFields.title || "Information amended"}.`,
      severity: "notice",
    });

    try {
      await incidentsApi.update(id, updatedFields);
    } catch (err) {
      console.warn("Backend incident update note:", err.message);
    }
  };

  const addAnnouncement = async (title, message, priority) => {
    const tempId = `ANN-${Date.now()}`;
    const newAnn = {
      id: tempId,
      title,
      summary: message,
      badge: priority === "Emergency" ? "EMERGENCY ALERT" : priority === "Weather Advisory" ? "WEATHER ADVISORY" : "GENERAL INFO",
      badgeType: priority === "Emergency" ? "warning" : priority === "Weather Advisory" ? "notice" : "info",
      date: new Date().toLocaleString(),
      author: "Admin Officer",
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    logAuditEvent({
      category: AUDIT_CATEGORIES.BROADCAST,
      action: "Official Broadcast Issued",
      actor: "Admin Officer",
      target: newAnn.id,
      details: `Issued announcement: "${title}" (Priority: ${priority}).`,
      severity: priority === "Emergency" ? "critical" : "notice",
    });

    try {
      const typeMap = {
        Emergency: "Fire",
        "Weather Advisory": "Flood",
        General: "General Advisory",
      };
      const severityMap = {
        Emergency: "Critical",
        "Weather Advisory": "High",
        General: "Moderate",
      };

      const res = await alertsApi.create({
        title,
        description: message,
        type: typeMap[priority] || "General Advisory",
        severity: severityMap[priority] || "Moderate",
        instructions: "Follow barangay safety protocols and instructions.",
      });

      if (res.success && res.data) {
        const saved = res.data;
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: saved._id, _id: saved._id } : a))
        );
      }
    } catch (err) {
      console.warn("Backend announcement creation note:", err.message);
    }

    return newAnn;
  };

  // Filtered incidents based on activeCategory and activeRole (from enrichedIncidents)
  const filteredIncidents = useMemo(() => {
    return enrichedIncidents.filter((incident) => {
      // Role filter check
      if (activeRole !== "all") {
        const roleConfig = RESPONDER_ROLES.find((r) => r.id === activeRole);
        if (roleConfig && roleConfig.categories) {
          if (!roleConfig.categories.includes(incident.category)) {
            return false;
          }
        }
      }

      // Category filter check
      if (activeCategory !== "all" && incident.category !== activeCategory) {
        return false;
      }

      return true;
    });
  }, [enrichedIncidents, activeCategory, activeRole]);

  // Compute category density counts to detect clusters for heatmap
  const categoryCounts = useMemo(() => {
    const counts = {};
    filteredIncidents.forEach((inc) => {
      counts[inc.category] = (counts[inc.category] || 0) + 1;
    });
    return counts;
  }, [filteredIncidents]);

  // Check if any category has exceeded the cluster threshold
  const clusteredCategories = useMemo(() => {
    const result = [];
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count >= clusterThreshold) {
        result.push({
          category: cat,
          count,
          label: INCIDENT_CATEGORIES[cat]?.label || cat,
        });
      }
    });
    return result;
  }, [categoryCounts, clusterThreshold]);

  // Determine if heatmap should be active
  const isHeatmapActive = useMemo(() => {
    if (viewMode === "heatmap" || viewMode === "hybrid") return true;
    if (viewMode === "pins") return false;
    // Auto mode:
    if (activeCategory !== "all") {
      const count = categoryCounts[activeCategory] || 0;
      return count >= clusterThreshold;
    }
    return clusteredCategories.length > 0;
  }, [viewMode, activeCategory, categoryCounts, clusterThreshold, clusteredCategories.length]);

  // User's own reports with dynamic timestamps
  const userReports = useMemo(() => {
    const isJuan = isUserJuanDelaCruz(currentUser);

    return enrichedIncidents.filter((inc) => {
      const reporterName = (inc.reportedBy || inc.reporterName || "").trim().toLowerCase();
      const reporterId = inc.reporterId || inc.userId;
      const isJuanReport = reporterName === "juan dela cruz" || reporterId === "RES-DEMO-01";

      if (isJuan) {
        // Juan Dela Cruz sees his own reports and mock demo user reports
        return isJuanReport || inc.isUserReport;
      }

      // If another user is logged in, DO NOT show stuff assigned to/created by Juan Dela Cruz!
      if (isJuanReport) {
        return false;
      }

      // Show reports submitted by this logged-in user
      if (reporterId && currentUser?.id && String(reporterId) === String(currentUser.id)) {
        return true;
      }
      const userFullName = `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim().toLowerCase();
      if (reporterName && userFullName && reporterName === userFullName) {
        return true;
      }
      if (inc.reporterContact && currentUser?.contactNumber && inc.reporterContact === currentUser.contactNumber) {
        return true;
      }
      if (inc.reporterEmail && currentUser?.email && inc.reporterEmail === currentUser.email) {
        return true;
      }

      return false;
    });
  }, [enrichedIncidents, currentUser]);

  return (
    <IncidentContext.Provider
      value={{
        currentUser: currentUser || CURRENT_USER,
        incidents: enrichedIncidents,
        now,
        filteredIncidents,
        userReports,
        activeCategory,
        setActiveCategory,
        activeRole,
        setActiveRole,
        viewMode,
        setViewMode,
        focusedIncidentId,
        setFocusedIncidentId,
        mapTileStyle,
        setMapTileStyle,
        clusterThreshold,
        setClusterThreshold,
        categoryCounts,
        clusteredCategories,
        isHeatmapActive,
        addIncident,
        updateIncident,
        updateIncidentStatus,
        updateIncidentDetails,
        announcements,
        addAnnouncement,
        isBackendOnline,
        isMongoAvailable,
        canUserEditIncident: (inc) => canUserEditIncident(inc, currentUser),
        isUserJuanDelaCruz: () => isUserJuanDelaCruz(currentUser),
        refreshFromBackend,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
}
