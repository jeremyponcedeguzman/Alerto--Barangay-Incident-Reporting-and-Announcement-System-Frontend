import L from "leaflet";
import { INCIDENT_CATEGORIES } from "../context/IncidentContext";

// SVG icons encoded as strings
const SVG_ICONS = {
  fire: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  flood: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  medical: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 9v4"/><path d="M10 11h4"/></svg>`,
  police: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="1"/></svg>`,
  accident: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  hazard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
};

export function createIncidentMarkerIcon(incident, isSelected = false) {
  const cat = INCIDENT_CATEGORIES[incident.category] || INCIDENT_CATEGORIES.hazard;
  const color = cat.color;
  const iconSvg = SVG_ICONS[incident.category] || SVG_ICONS.hazard;
  const isCritical = incident.severity === "critical";

  const pulseHtml = isCritical
    ? `<span class="marker-pulse-ring" style="border-color: ${color};"></span>`
    : "";

  const selectedClass = isSelected ? "marker-selected" : "";

  const html = `
    <div class="custom-incident-marker ${selectedClass} severity-${incident.severity}">
      ${pulseHtml}
      <div class="marker-pin-body" style="background-color: ${color};">
        <span class="marker-icon-inner">${iconSvg}</span>
      </div>
      <div class="marker-pin-tip" style="border-top-color: ${color};"></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-incident-marker-container",
    html: html,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42],
  });
}

// User location or draft report location pin
export function createDraftLocationIcon() {
  const html = `
    <div class="custom-draft-marker">
      <span class="marker-pulse-ring" style="border-color: #3b82f6;"></span>
      <div class="marker-pin-body" style="background-color: #2563eb;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
      </div>
      <div class="marker-pin-tip" style="border-top-color: #2563eb;"></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-incident-marker-container",
    html: html,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42],
  });
}

