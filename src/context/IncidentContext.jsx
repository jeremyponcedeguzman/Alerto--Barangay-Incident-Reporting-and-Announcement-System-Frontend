import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  formatDateTime,
  formatTimeOnly,
  getRelativeTime,
  formatDynamicTimestamp,
} from "../utils/timeUtils";

const IncidentContext = createContext(null);

export const INCIDENT_CATEGORIES = {
  fire: {
    id: "fire",
    label: "Fire Incident",
    iconName: "Flame",
    color: "#ef4444",
    bgLight: "#fee2e2",
    responder: "BFP (Bureau of Fire Protection) ????",
  },
  flood: {
    id: "flood",
    label: "Flood & Weather Hazard",
    iconName: "Waves",
    color: "#0284c7",
    bgLight: "#e0f2fe",
    responder: "DRRMO (Disaster Risk Reduction) ????",
  },
  medical: {
    id: "medical",
    label: "Medical Emergency",
    iconName: "HeartPulse",
    color: "#10b981",
    bgLight: "#d1fae5",
    responder: "BHERT (Barangay Health / Ambulance) ????",
  },
  police: {
    id: "police",
    label: "Crime",
    iconName: "ShieldAlert",
    color: "#8b5cf6",
    bgLight: "#ede9fe",
    responder: "Barangay Tanod & PNP ????",
  },
  accident: {
    id: "accident",
    label: "Vehicular & Road Accident",
    iconName: "CarAlert",
    color: "#f59e0b",
    bgLight: "#fef3c7",
    responder: "Traffic Enforcement & Tanod ????",
  },
  hazard: {
    id: "hazard",
    label: "Power & Infrastructure",
    iconName: "ZapOff",
    color: "#6b7280",
    bgLight: "#f3f4f6",
    responder: "Barangay Engineering & Meralco ????",
  },
};

export const RESPONDER_ROLES = [
  { id: "all", label: "All Incidents (Public View)", categories: ["fire", "flood", "medical", "police", "accident", "hazard"] },
  { id: "tanod", label: "Barangay Tanod / Police", categories: ["police", "accident"] },
  { id: "bfp", label: "Bureau of Fire Protection (BFP)", categories: ["fire"] },
  { id: "bhert", label: "Health / BHERT Responder", categories: ["medical"] },
  { id: "drrmo", label: "Disaster Risk / DRRMO", categories: ["flood", "hazard"] },
];

// Current logged in user (un-editable, verified resident identity)
export const CURRENT_USER = {
  name: "[Logged-In Resident Full Name]",
  phone: "[insert the real number here]",
  residentId: "BRGY-[BARANGAYNAME]-2026-0042",
  address: "[Street Address], Barangay [Barangay Name]",
};

// Default Barangay Poblacion / [Barangay Name] Center Coordinates
export const BARANGAY_CENTER = {
  lat: 14.5605,
  lng: 121.0182,
  name: "Barangay [Barangay Name] Center",
};

// Initial realistic incident data with dynamic createdAt timestamps
const INITIAL_INCIDENTS = [
  {
    id: "INC-2026-001",
    title: "Residential Structure Fire (Alert Level 1)",
    category: "fire",
    severity: "critical",
    status: "Dispatched",
    locationName: "Kamagong St. cor. Bagtikan St.",
    lat: 14.5632,
    lng: 121.0155,
    reportedBy: "Resident Maria Santos",
    isUserReport: true,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    description: "Thick black smoke coming from a two-story residential house. BFP truck en route.",
    responder: "BFP Firefighters ????",
    votes: 8,
  },
  {
    id: "INC-2026-002",
    title: "Electrical Transformer Spark / Small Fire",
    category: "fire",
    severity: "high",
    status: "In Progress",
    locationName: "Mayapis St. near Yakal",
    lat: 14.5645,
    lng: 121.0168,
    reportedBy: "Store Owner Arthur V.",
    isUserReport: false,
    createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    description: "Sparks flying from overhead transformer near convenience store.",
    responder: "BFP & Meralco ????",
    votes: 5,
  },
  {
    id: "INC-2026-003",
    title: "Trash Fire Threatening Nearby Fence",
    category: "fire",
    severity: "medium",
    status: "Pending",
    locationName: "Chino Roces Ave. vacant lot",
    lat: 14.5621,
    lng: 121.0142,
    reportedBy: "Barangay Tanod Patrol",
    isUserReport: false,
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    description: "Illegal burning of refuse spreading near dry wooden perimeter fence.",
    responder: "BFP & Tanod ????",
    votes: 3,
  },
  // Flood cluster in lowland riverside sector
  {
    id: "INC-2026-004",
    title: "Knee-Deep Gutter Flood / Clogged Drainage",
    category: "flood",
    severity: "high",
    status: "In Progress",
    locationName: "St. Paul St. lowland corner",
    lat: 14.5575,
    lng: 121.0205,
    reportedBy: "[Logged-In Resident Full Name]",
    isUserReport: true,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    description: "Water has reached knee level, impassable to light vehicles. Trash blocking drainage grates.",
    responder: "DRRMO & Engineering ????",
    votes: 14,
  },
  {
    id: "INC-2026-005",
    title: "Rising Floodwater Near Creek Boundary",
    category: "flood",
    severity: "critical",
    status: "In Progress",
    locationName: "Estero de Tripa de Gallina Bank",
    lat: 14.5568,
    lng: 121.0215,
    reportedBy: "Tanod Watch Post 4",
    isUserReport: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    description: "Creek water level warning: reached Orange Alert threshold. Evacuation standby.",
    responder: "DRRMO Rescue Unit ????",
    votes: 21,
  },
  {
    id: "INC-2026-006",
    title: "Submerged Alleyway - Stranded Senior Residents",
    category: "flood",
    severity: "critical",
    status: "Dispatched",
    locationName: "Urban Ave. Interior Alley",
    lat: 14.5582,
    lng: 121.0195,
    reportedBy: "Resident Cora Diaz",
    isUserReport: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    description: "Two elderly residents unable to exit home due to 2-foot floodwater.",
    responder: "DRRMO & Barangay Ambulance ????",
    votes: 9,
  },
  {
    id: "INC-2026-007",
    title: "Drainage Backflow into Driveways",
    category: "flood",
    severity: "medium",
    status: "Pending",
    locationName: "Washington St. cor. Dela Rosa",
    lat: 14.5591,
    lng: 121.0219,
    reportedBy: "Resident Ben Perez",
    isUserReport: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    description: "Water bubbling up through manhole covers during heavy rain shower.",
    responder: "Engineering Team ????",
    votes: 4,
  },
  // Medical
  {
    id: "INC-2026-008",
    title: "Elderly Citizen Severe Breathing Distress",
    category: "medical",
    severity: "critical",
    status: "Dispatched",
    locationName: "Guijo St. Unit 302",
    lat: 14.5615,
    lng: 121.0232,
    reportedBy: "Family Member Ana G.",
    isUserReport: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    description: "72yo patient experiencing shortness of breath. Oxygen tank requested.",
    responder: "BHERT & Barangay Ambulance ????",
    votes: 2,
  },
  {
    id: "INC-2026-009",
    title: "Motorcycle Fall Injury - First Aid Needed",
    category: "medical",
    severity: "medium",
    status: "Resolved",
    locationName: "Buendia Ave. (Gil Puyat) service lane",
    lat: 14.5562,
    lng: 121.0135,
    reportedBy: "Traffic Marshall",
    isUserReport: false,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    description: "Rider slipped on wet road markings. Minor lacerations on knees, treated on site.",
    responder: "BHERT Medic ????",
    votes: 6,
  },
  // Police / Tanod (Crime)
  {
    id: "INC-2026-010",
    title: "Store Burglary & Shoplifting",
    category: "police",
    severity: "low",
    status: "In Progress",
    locationName: "Tindalo St. Convenience Store",
    lat: 14.5651,
    lng: 121.0198,
    reportedBy: "[Logged-In Resident Full Name]",
    isUserReport: true,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    description: "Commercial store break-in attempt and property theft reported. Tanod / Police investigation requested.",
    responder: "Barangay Tanod Patrol ????",
    votes: 7,
  },
  // Vehicular Accident
  {
    id: "INC-2026-011",
    title: "Two-Vehicle Collision Blocking Intersection",
    category: "accident",
    severity: "high",
    status: "Dispatched",
    locationName: "Malugay St. cor. Ayala Ave. Ext.",
    lat: 14.5641,
    lng: 121.0125,
    reportedBy: "Motorist Carlo R.",
    isUserReport: false,
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    description: "Sedan and delivery van sideswiped. Road partially blocked, traffic backing up.",
    responder: "Traffic Tanod & Tow Unit ????",
    votes: 11,
  },
  // Infrastructure / Power Hazard
  {
    id: "INC-2026-012",
    title: "Downed Acacia Tree Branch Leaning on Cables",
    category: "hazard",
    severity: "medium",
    status: "Pending",
    locationName: "Dao St. near Community Park",
    lat: 14.5618,
    lng: 121.0261,
    reportedBy: "Homeowner Association",
    isUserReport: false,
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    description: "Large tree limb snapped during gusty wind, resting dangerously on telecomm wires.",
    responder: "Barangay Maintenance ????",
    votes: 5,
  },
];

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
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
        timestamp: timeInfo.short, // e.g. "4:32 AM • 12m ago"
        fullTimestamp: timeInfo.full, // e.g. "Oct 9, 2026, 4:32 AM (12m ago)"
      };
    });
  }, [incidents, now]);

  // Add a new incident report with real-time ISO createdAt
  const addIncident = (newIncident) => {
    const formatted = {
      ...newIncident,
      id: `INC-2026-${String(incidents.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      reportedBy: CURRENT_USER.name,
      status: "Pending",
      votes: 1,
      isUserReport: true,
    };
    setIncidents((prev) => [formatted, ...prev]);
    setFocusedIncidentId(formatted.id);
    return formatted;
  };

  // Update status (e.g., mark resolved or dispatched)
  const updateIncidentStatus = (id, newStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
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
  // If viewMode === 'heatmap' or 'hybrid', heatmap is always on
  // If viewMode === 'auto', heatmap only activates for filtered category if it reaches clusterThreshold,
  // or if viewing 'all', when at least one category is clustered
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
    return enrichedIncidents.filter((inc) => inc.isUserReport);
  }, [enrichedIncidents]);

  return (
    <IncidentContext.Provider
      value={{
        currentUser: CURRENT_USER,
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
        updateIncidentStatus,
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
