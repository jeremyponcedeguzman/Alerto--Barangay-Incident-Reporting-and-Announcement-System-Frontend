import L from 'leaflet';

let heatLoaded = false;

export async function ensureHeatLayer() {
  if (typeof window === 'undefined') return null;
  if (!window.L) {
    window.L = L;
  }
  if (!L.heatLayer && !heatLoaded) {
    try {
      await import('leaflet.heat');
      heatLoaded = true;
    } catch (err) {
      console.warn('Failed to load leaflet.heat, fallback will be used:', err);
    }
  }
  return L.heatLayer;
}

