// Audit Logging Utility for Barangay Operations
const AUDIT_STORAGE_KEY = "alerto_audit_logs";

export const AUDIT_CATEGORIES = {
  DISPATCH: "Incident Dispatch",
  VERIFICATION: "Resident Verification",
  STAFF: "Staff Management",
  SECURITY: "Security & Auth",
  BROADCAST: "Broadcast Alert",
  SYSTEM: "System Activity",
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: "LOG-2026-001",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    formattedTime: "10 minutes ago",
    category: AUDIT_CATEGORIES.DISPATCH,
    action: "Incident Dispatched",
    actor: "Operations Desk",
    target: "INC-2026-001 (Residential Structure Fire)",
    details: "Dispatched BFP Firefighters Unit 1 to Kamagong St. cor. Bagtikan St.",
    severity: "critical",
  },
  {
    id: "LOG-2026-002",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    formattedTime: "45 minutes ago",
    category: AUDIT_CATEGORIES.BROADCAST,
    action: "Emergency Broadcast Published",
    actor: "Admin Officer",
    target: "ANN-001 (Rainfall Warning)",
    details: "Published urgent advisory regarding lowland drainage clearing operation.",
    severity: "warning",
  },
  {
    id: "LOG-2026-003",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    formattedTime: "2 hours ago",
    category: AUDIT_CATEGORIES.VERIFICATION,
    action: "Resident Approved",
    actor: "Barangay Official",
    target: "RES-DEMO-01 (Juan Dela Cruz)",
    details: "Government ID and Barangay Residency Certificate validated.",
    severity: "notice",
  },
  {
    id: "LOG-2026-004",
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    formattedTime: "4 hours ago",
    category: AUDIT_CATEGORIES.STAFF,
    action: "Shift Assigned",
    actor: "Chief Tanod",
    target: "Juan Dela Cruz (Chief Tanod)",
    details: "Assigned to Night Shift (8:00 PM - 8:00 AM) Patrol Sector A.",
    severity: "info",
  },
  {
    id: "LOG-2026-005",
    timestamp: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    formattedTime: "6 hours ago",
    category: AUDIT_CATEGORIES.DISPATCH,
    action: "Incident Status Updated",
    actor: "BHERT Medic",
    target: "INC-2026-009 (Motorcycle Fall Injury)",
    details: "Status marked as 'Resolved' after on-site first aid administration.",
    severity: "info",
  },
  {
    id: "LOG-2026-006",
    timestamp: new Date(Date.now() - 720 * 60 * 1000).toISOString(),
    formattedTime: "12 hours ago",
    category: AUDIT_CATEGORIES.SECURITY,
    action: "Admin Portal Authentication",
    actor: "Admin Officer",
    target: "Official Desk Login",
    details: "Authenticated via secure official portal credentials.",
    severity: "info",
  },
  {
    id: "LOG-2026-007",
    timestamp: new Date(Date.now() - 1440 * 60 * 1000).toISOString(),
    formattedTime: "1 day ago",
    category: AUDIT_CATEGORIES.VERIFICATION,
    action: "Residency Application Rejected",
    actor: "Barangay Official",
    target: "RES-9821 (Mark Cruz)",
    details: "Proof of residency was illegible or outside Barangay jurisdiction.",
    severity: "warning",
  },
];

export function getAuditLogs() {
  const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function logAuditEvent({ category, action, actor = "System", target = "N/A", details = "", severity = "info" }) {
  const currentLogs = getAuditLogs();
  const newEntry = {
    id: `LOG-2026-${String(Date.now()).slice(-6)}`,
    timestamp: new Date().toISOString(),
    formattedTime: "Just now",
    category: category || AUDIT_CATEGORIES.SYSTEM,
    action,
    actor,
    target,
    details,
    severity,
  };
  const updated = [newEntry, ...currentLogs];
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));

  // Dispatch storage event so active windows update in real time
  window.dispatchEvent(new Event("storage"));
  return newEntry;
}

export function clearAuditLogs() {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event("storage"));
}
