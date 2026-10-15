import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import L from "leaflet";
import {
  MapPin,
  Layers,
  Crosshair,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Activity,
  PlusCircle
} from "lucide-react";
import {
  useIncidents,
  INCIDENT_CATEGORIES,
  BARANGAY_CENTER,
  RESPONDER_ROLES
} from "../context/IncidentContext";
import { createIncidentMarkerIcon } from "../utils/mapIcons";
import { ensureHeatLayer } from "../utils/leafletHeat";

// Google Maps Road & Landmark Tiles (Standard)
const GOOGLE_MAPS_TILES = {
  url: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  attribution: "&copy; Google Maps",
  subdomains: "0123",
  maxZoom: 20,
};

const SEVERITY_WEIGHTS = {
  critical: 1.0,
  high: 0.8,
  medium: 0.5,
  low: 0.3,
};

// Fixed optimal/maximum heat radius for smooth gradient
const HEAT_INTENSITY = 48;

export default function IncidentMap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    filteredIncidents,
    activeCategory,
    setActiveCategory,
    activeRole,
    viewMode,
    setViewMode,
    focusedIncidentId,
    setFocusedIncidentId,
    clusteredCategories,
    categoryCounts,
    isHeatmapActive,
    clusterThreshold,
    updateIncidentStatus,
    canUserEditIncident,
  } = useIncidents();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markerRefs = useRef({});

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);

  const currentRoleObj =
    RESPONDER_ROLES.find((r) => r.id === activeRole) || RESPONDER_ROLES[0];

  // Only show filter chips for categories related to the active role
  const visibleCategoryKeys = useMemo(() => {
    if (activeRole === "all" || !currentRoleObj?.categories) {
      return Object.keys(INCIDENT_CATEGORIES);
    }
    return Object.keys(INCIDENT_CATEGORIES).filter((catKey) =>
      currentRoleObj.categories.includes(catKey)
    );
  }, [activeRole, currentRoleObj]);

  // If the active category is no longer valid for the current role, reset to 'all'
  useEffect(() => {
    if (activeCategory !== "all" && !visibleCategoryKeys.includes(activeCategory)) {
      setActiveCategory("all");
    }
  }, [activeRole, visibleCategoryKeys, activeCategory, setActiveCategory]);

  // Strictly filter incidents eligible to produce heatmap:
  // Incidents not currently filtered for (or lacking cluster threshold) are excluded from heatmap!
  const heatEligibleIncidents = useMemo(() => {
    // 1. If a specific category is filtered for:
    if (activeCategory !== "all") {
      // In auto mode, only show heatmap if this filtered category has enough reports (>= clusterThreshold)
      const count = categoryCounts[activeCategory] || 0;
      if (viewMode === "auto" && count < clusterThreshold) {
        return [];
      }
      // Strictly only incidents of this filtered category (hide all others)
      return filteredIncidents.filter((inc) => inc.category === activeCategory);
    }

    // 2. If 'all' categories are displayed:
    if (viewMode === "auto") {
      // In auto mode, only categories that have reached cluster threshold show a heatmap!
      // Incidents of categories with too few reports will NOT show a heatmap.
      const clusteredCatKeys = clusteredCategories.map((c) => c.category);
      return filteredIncidents.filter((inc) => clusteredCatKeys.includes(inc.category));
    }

    // 3. In forced 'heatmap' or 'hybrid' view mode when on 'all':
    return filteredIncidents;
  }, [filteredIncidents, activeCategory, categoryCounts, clusterThreshold, viewMode, clusteredCategories]);

  // Handle URL query parameters (e.g. ?id=INC-2026-001 or ?cat=flood)
  useEffect(() => {
    const idFromParam = searchParams.get("id");
    const catFromParam = searchParams.get("cat");
    if (catFromParam && INCIDENT_CATEGORIES[catFromParam]) {
      setActiveCategory(catFromParam);
    }
    if (idFromParam) {
      setFocusedIncidentId(idFromParam);
    }
  }, [searchParams]);

  // 1. Initialize Leaflet Map (Google Maps Road Style Only)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // React StrictMode safety: reset previous map instance & DOM leaflet id
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [BARANGAY_CENTER.lat, BARANGAY_CENTER.lng],
      zoom: 15,
      zoomControl: false,
      minZoom: 12,
      maxZoom: 19,
    });

    // Custom positioned zoom control
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    // Initial Google Maps Road tile layer
    L.tileLayer(GOOGLE_MAPS_TILES.url, {
      attribution: GOOGLE_MAPS_TILES.attribution,
      maxZoom: GOOGLE_MAPS_TILES.maxZoom,
      subdomains: GOOGLE_MAPS_TILES.subdomains,
    }).addTo(map);

    // Layer group for pin markers
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    mapInstanceRef.current = map;

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers & Heatmap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    let isCurrentEffect = true;

    // Clear existing markers
    markersGroup.clearLayers();
    markerRefs.current = {};

    // Immediately remove existing heat layer
    if (heatLayerRef.current) {
      try {
        map.removeLayer(heatLayerRef.current);
      } catch (e) {}
      heatLayerRef.current = null;
    }

    // Sweep any stray or previous HeatLayers off the map
    map.eachLayer((layer) => {
      if (
        layer._heat ||
        layer === heatLayerRef.current ||
        (typeof L.HeatLayer === "function" && layer instanceof L.HeatLayer)
      ) {
        try {
          map.removeLayer(layer);
        } catch (e) {}
      }
    });

    // Determine what to display based on viewMode & isHeatmapActive
    const showMarkers = viewMode !== "heatmap";
    const showHeat = isHeatmapActive && heatEligibleIncidents.length > 0;

    // A. Render Heatmap Layer (ONLY for incidents currently filtered for and eligible)
    if (showHeat) {
      ensureHeatLayer().then((heatLayerConstructor) => {
        if (!isCurrentEffect || !mapInstanceRef.current) return;

        // Double check removing any previous heat layer before adding new one
        if (heatLayerRef.current) {
          try {
            mapInstanceRef.current.removeLayer(heatLayerRef.current);
          } catch (e) {}
          heatLayerRef.current = null;
        }

        const heatPoints = heatEligibleIncidents.map((inc) => {
          const weight = SEVERITY_WEIGHTS[inc.severity] || 0.5;
          return [inc.lat, inc.lng, weight];
        });

        if (heatPoints.length > 0 && heatLayerConstructor) {
          try {
            const heat = heatLayerConstructor(heatPoints, {
              radius: HEAT_INTENSITY,
              blur: Math.round(HEAT_INTENSITY * 0.75),
              maxZoom: 18,
              minOpacity: 0.35,
              gradient: {
                0.2: "#3b82f6",
                0.4: "#06b6d4",
                0.6: "#10b981",
                0.75: "#f59e0b",
                0.9: "#f97316",
                1.0: "#ef4444",
              },
            }).addTo(mapInstanceRef.current);

            heatLayerRef.current = heat;
          } catch (err) {
            console.error("Heat layer creation error:", err);
          }
        }
      });
    }

    // B. Render Markers
    if (showMarkers) {
      filteredIncidents.forEach((incident) => {
        const isSelected = selectedIncident?.id === incident.id;
        const icon = createIncidentMarkerIcon(incident, isSelected);

        const marker = L.marker([incident.lat, incident.lng], {
          icon: icon,
          title: incident.title,
          riseOnHover: true,
        });

        const catInfo =
          INCIDENT_CATEGORIES[incident.category] || INCIDENT_CATEGORIES.hazard;

        const canEdit = canUserEditIncident ? canUserEditIncident(incident) : false;

        const popupContent = document.createElement("div");
        popupContent.className = "incident-popup-card";
        popupContent.innerHTML = `
          <div class="popup-header">
            <span class="popup-cat-badge" style="background-color: ${catInfo.bgLight}; color: ${catInfo.color}">
              ${catInfo.label}
            </span>
            <span class="popup-severity-badge severity-${incident.severity}">
              ${incident.severity.toUpperCase()}
            </span>
          </div>
          <h4 class="popup-title">${incident.title}</h4>
          <p class="popup-location">📍 ${incident.locationName}</p>
          <div class="popup-meta">
            <span title="${incident.exactTime}">⏱ ${incident.exactTime} <span class="popup-rel-time">(${incident.relativeTime})</span></span>
            <span class="popup-status status-${incident.status.toLowerCase().replace(" ", "-")}">${incident.status}</span>
          </div>
          <p class="popup-desc">${incident.description}</p>
          ${
            incident.imageEvidence
              ? `<div style="margin: 6px 0;">
                   <img src="${incident.imageEvidence}" alt="Live Camera Evidence" style="width: 100%; max-height: 125px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; display: block;" />
                 </div>`
              : ""
          }
          <div class="popup-actions" style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="popup-btn-select" id="btn-popup-select-${incident.id}" style="flex: 1;">
              Focus Details
            </button>
            ${
              canEdit
                ? `<button class="popup-btn-update" id="btn-popup-update-${incident.id}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 6px; padding: 6px 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease;">
                     ✏️ Update Info
                   </button>`
                : ""
            }
          </div>
        `;

        popupContent
          .querySelector(`#btn-popup-select-${incident.id}`)
          ?.addEventListener("click", () => {
            setSelectedIncident(incident);
            setSidebarOpen(true);
          });

        if (canEdit) {
          popupContent
            .querySelector(`#btn-popup-update-${incident.id}`)
            ?.addEventListener("click", () => {
              navigate(`/report-incident?edit=${incident.id}`);
            });
        }

        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: "custom-leaflet-popup",
        });

        marker.on("click", () => {
          setSelectedIncident(incident);
        });

        marker.addTo(markersGroup);
        markerRefs.current[incident.id] = marker;
      });
    }

    return () => {
      isCurrentEffect = false;
      if (heatLayerRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(heatLayerRef.current);
        } catch (e) {}
        heatLayerRef.current = null;
      }
    };
  }, [
    filteredIncidents,
    heatEligibleIncidents,
    viewMode,
    isHeatmapActive,
    selectedIncident?.id,
  ]);

  // 3. Focus on Incident when focusedIncidentId changes
  useEffect(() => {
    if (!focusedIncidentId || !mapInstanceRef.current) return;

    const target = filteredIncidents.find((i) => i.id === focusedIncidentId);
    if (target) {
      setSelectedIncident(target);
      mapInstanceRef.current.flyTo([target.lat, target.lng], 17, {
        duration: 1.2,
      });

      setTimeout(() => {
        const marker = markerRefs.current[target.id];
        if (marker) {
          marker.openPopup();
        }
      }, 800);
    }
  }, [focusedIncidentId, filteredIncidents]);

  // Recenter Map to Barangay Headquarters
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([BARANGAY_CENTER.lat, BARANGAY_CENTER.lng], 15, {
        duration: 1,
      });
    }
  };

  // Focus specific incident from sidebar list
  const handleSelectIncidentFromList = (incident) => {
    setSelectedIncident(incident);
    setFocusedIncidentId(incident.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([incident.lat, incident.lng], 17, {
        duration: 1,
      });
      setTimeout(() => {
        const marker = markerRefs.current[incident.id];
        if (marker) {
          marker.openPopup();
        }
      }, 700);
    }
  };

  // Filtered incidents for sidebar list based on search query
  const searchableIncidents = useMemo(() => {
    if (!searchQuery.trim()) return filteredIncidents;
    const query = searchQuery.toLowerCase();
    return filteredIncidents.filter(
      (inc) =>
        inc.title.toLowerCase().includes(query) ||
        inc.locationName.toLowerCase().includes(query) ||
        inc.description.toLowerCase().includes(query) ||
        inc.id.toLowerCase().includes(query)
    );
  }, [filteredIncidents, searchQuery]);

  // Counts summary
  const totalCount = filteredIncidents.length;
  const criticalCount = filteredIncidents.filter(
    (i) => i.severity === "critical" || i.severity === "high"
  ).length;
  const dispatchedCount = filteredIncidents.filter(
    (i) => i.status === "Dispatched" || i.status === "In Progress"
  ).length;

  return (
    <div className="incident-map-page-wrapper">
      {/* Top Map Control Bar */}
      <div className="map-top-control-bar">
        {/* Left: View Mode Toggle */}
        <div className="map-view-toggles-wrapper">
          <div className="view-mode-pill-group">
            <button
              className={`view-mode-pill ${viewMode === "auto" ? "active" : ""}`}
              onClick={() => setViewMode("auto")}
              title="Automatically activates heatmap when clusters form (3+ reports in an area)"
            >
              <Sparkles size={15} />
              <span>Auto Density</span>
            </button>

            <button
              className={`view-mode-pill ${viewMode === "pins" ? "active" : ""}`}
              onClick={() => setViewMode("pins")}
              title="Show individual markers only"
            >
              <MapPin size={15} />
              <span>Pins View</span>
            </button>

            <button
              className={`view-mode-pill ${viewMode === "heatmap" ? "active" : ""}`}
              onClick={() => setViewMode("heatmap")}
              title="Force heatmap layer to visualize incident density"
            >
              <Activity size={15} />
              <span>Heatmap View</span>
            </button>

            <button
              className={`view-mode-pill ${viewMode === "hybrid" ? "active" : ""}`}
              onClick={() => setViewMode("hybrid")}
              title="Overlay both heatmap density and interactive pins"
            >
              <Layers size={15} />
              <span>Hybrid View</span>
            </button>
          </div>
        </div>

        {/* Right: Recenter & Toggle Feed */}
        <div className="map-actions-group">
          {/* Recenter Button */}
          <button
            className="map-action-btn"
            onClick={handleRecenter}
            title="Recenter map to Barangay Anupul Center"
          >
            <Crosshair size={16} />
            <span className="hide-on-mobile">Brgy Center</span>
          </button>

          {/* Toggle Sidebar */}
          <button
            className="map-action-btn btn-toggle-feed"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Live Incident Feed"
          >
            <Filter size={16} />
            <span>Feed ({filteredIncidents.length})</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills Ribbon (Only shows chips related to active role) */}
      <div className="category-filter-ribbon">
        <button
          className={`cat-filter-chip ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          <span>All Incidents</span>
          <span className="cat-chip-count">{filteredIncidents.length}</span>
        </button>

        {visibleCategoryKeys.map((catKey) => {
          const cat = INCIDENT_CATEGORIES[catKey];
          const isSelected = activeCategory === catKey;
          return (
            <button
              key={catKey}
              className={`cat-filter-chip ${isSelected ? "active" : ""}`}
              style={{
                borderColor: isSelected ? cat.color : "transparent",
                color: isSelected ? cat.color : "inherit",
              }}
              onClick={() =>
                setActiveCategory(isSelected ? "all" : catKey)
              }
            >
              <span
                className="cat-chip-color-dot"
                style={{ backgroundColor: cat.color }}
              ></span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Map Main Canvas Area + Collapsible Sidebar */}
      <div className="map-view-body">
        {/* The Leaflet Map Canvas */}
        <div className="map-leaflet-viewport" ref={mapContainerRef}>
          {/* Legend Overlay at bottom-left */}
          <div className="map-floating-legend">
            <div className="legend-header">
              <span className="legend-title">Live Map Legend</span>
              <span className="legend-subtitle">Barangay Anupul Response Grid</span>
            </div>
            <div className="legend-items-grid">
              <div className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: "#ef4444" }}></span>
                <span>🔥 Fire</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: "#0284c7" }}></span>
                <span>🌊 Flood</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: "#10b981" }}></span>
                <span>🚑 Medical</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: "#8b5cf6" }}></span>
                <span>🛡️ Crime</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: "#f59e0b" }}></span>
                <span>🚗 Traffic</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: "#6b7280" }}></span>
                <span>⚡ Hazard</span>
              </div>
            </div>

            {isHeatmapActive && (
              <div className="legend-heatmap-gradient-row">
                <span className="heat-label">Low Heat</span>
                <div className="heat-gradient-bar"></div>
                <span className="heat-label">Dense Cluster</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Incident Feed Sidebar */}
        <aside
          className={`incident-feed-sidebar ${
            sidebarOpen ? "sidebar-open" : "sidebar-collapsed"
          }`}
        >
          {/* Sidebar Toggle Tab */}
          <button
            className="sidebar-edge-tab"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <div className="sidebar-inner-content">
            {/* Sidebar Header & Metrics */}
            <div className="sidebar-header">
              <div className="sidebar-title-row">
                <div>
                  <h3 className="sidebar-title">Barangay Incident Feed</h3>
                  <p className="sidebar-subtitle">
                    Live updates • {currentRoleObj.label}
                  </p>
                </div>
                <Link
                  to="/report-incident"
                  className="btn-quick-report-mini"
                  title="Submit a report"
                >
                  <PlusCircle size={16} />
                  <span>Report</span>
                </Link>
              </div>

              {/* Stats Counters */}
              <div className="sidebar-metrics-row">
                <div className="metric-chip total">
                  <span className="metric-val">{totalCount}</span>
                  <span className="metric-lbl">Total</span>
                </div>
                <div className="metric-chip critical">
                  <span className="metric-val">{criticalCount}</span>
                  <span className="metric-lbl">High Priority</span>
                </div>
                <div className="metric-chip dispatched">
                  <span className="metric-val">{dispatchedCount}</span>
                  <span className="metric-lbl">Dispatched</span>
                </div>
              </div>

              {/* Search Box */}
              <div className="incident-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search street, incident or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="search-clear-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* List of Incidents */}
            <div className="sidebar-incident-list">
              {searchableIncidents.length === 0 ? (
                <div className="empty-incidents-notice">
                  <AlertCircle size={32} className="empty-icon" />
                  <h4>No Incidents Found</h4>
                  <p>Try clearing filters or search query.</p>
                  <button
                    className="btn-reset-filters"
                    onClick={() => {
                      setActiveCategory("all");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                searchableIncidents.map((incident) => {
                  const cat =
                    INCIDENT_CATEGORIES[incident.category] ||
                    INCIDENT_CATEGORIES.hazard;
                  const isSelected = selectedIncident?.id === incident.id;

                  return (
                    <div
                      key={incident.id}
                      className={`incident-list-card ${
                        isSelected ? "card-selected" : ""
                      } severity-${incident.severity}`}
                      onClick={() => handleSelectIncidentFromList(incident)}
                    >
                      <div className="card-top-row">
                        <span
                          className="card-category-badge"
                          style={{
                            backgroundColor: cat.bgLight,
                            color: cat.color,
                          }}
                        >
                          {cat.label}
                        </span>
                        <span
                          className={`card-status-badge status-${incident.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {incident.status}
                        </span>
                      </div>

                      <h4 className="card-incident-title">{incident.title}</h4>

                      <div className="card-location-row">
                        <MapPin size={14} className="card-loc-icon" />
                        <span className="card-loc-text">
                          {incident.locationName}
                        </span>
                      </div>

                      <p className="card-description-preview">
                        {incident.description}
                      </p>

                      {incident.imageEvidence && (
                        <div style={{ margin: "0.4rem 0" }}>
                          <img
                            src={incident.imageEvidence}
                            alt="Incident Evidence"
                            style={{
                              width: "100%",
                              maxHeight: "130px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              display: "block",
                            }}
                          />
                        </div>
                      )}

                      <div className="card-footer-row">
                        <span className="card-timestamp" title={incident.exactTime}>
                          <Clock size={12} />
                          <span>{incident.exactTime}</span>
                          <span className="relative-time-tag">({incident.relativeTime})</span>
                        </span>
                        <span className="card-responder-tag">
                          {incident.responder}
                        </span>
                      </div>

                      {/* Action row when card is selected */}
                      {isSelected && (
                        <div
                          className="card-expanded-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="action-buttons-group">
                            <button
                              className="btn-status-action"
                              onClick={() =>
                                updateIncidentStatus(
                                  incident.id,
                                  incident.status === "Resolved"
                                    ? "In Progress"
                                    : "Resolved"
                                )
                              }
                            >
                              <CheckCircle2 size={14} />
                              {incident.status === "Resolved"
                                ? "Reopen Report"
                                : "Mark as Resolved"}
                            </button>
                            {canUserEditIncident && canUserEditIncident(incident) && (
                              <Link
                                to={`/report-incident?edit=${incident.id}`}
                                className="btn-action-outline"
                              >
                                Update Info
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
