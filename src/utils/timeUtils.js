/**
 * Utility functions for dynamic timestamps and relative time formatting.
 */

// Formats a date into a clean, human-readable date & time (e.g. "Oct 9, 2026, 4:32 AM")
export function formatDateTime(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Formats just the time (e.g. "4:32 AM")
export function formatTimeOnly(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Computes dynamic relative time from right now (e.g. "Just now", "2m ago", "14m ago", "2h ago")
export function getRelativeTime(dateInput, now = Date.now()) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const diffMs = now - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 15) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Full dynamic timestamp display: shows exact timestamp + dynamic relative duration
// Example: "Oct 9, 2026, 4:32 AM (12m ago)" or "4:32 AM • 12m ago"
export function formatDynamicTimestamp(dateInput, now = Date.now()) {
  if (!dateInput) return { exact: "", relative: "", full: "", short: "" };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return { exact: String(dateInput), relative: "", full: String(dateInput), short: String(dateInput) };
  }

  const rel = getRelativeTime(d, now);
  const exact = formatDateTime(d);
  const timeOnly = formatTimeOnly(d);

  return {
    exact,
    relative: rel,
    full: `${exact} (${rel})`,
    short: `${timeOnly} • ${rel}`,
  };
}
