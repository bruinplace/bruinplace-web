import type {
  GoogleMapInstance,
  GoogleMapsGlobal,
  MapPoint,
  MapViewport,
  ViewMode,
} from "./types";

export const UCLA_CENTER = { lat: 34.0689, lng: -118.4452 };
export const PRICE_MARKER_ZOOM = 16;
const ZERO_TOLERANCE = { lat: 0, lng: 0 } as const;

let googleMapsLoaderPromise: Promise<GoogleMapsGlobal> | null = null;

export function loadGoogleMapsApi(apiKey: string): Promise<GoogleMapsGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in browser."));
  }

  const w = window as Window & { google?: GoogleMapsGlobal };
  if (w.google?.maps) {
    return Promise.resolve(w.google);
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise;
  }

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-google-maps-loader="true"]',
    ) as HTMLScriptElement | null;

    const onLoad = () => {
      const windowWithGoogle = window as Window & { google?: GoogleMapsGlobal };
      if (windowWithGoogle.google?.maps) {
        resolve(windowWithGoogle.google);
      } else {
        reject(new Error("Google Maps loaded but API was unavailable."));
      }
    };

    const onError = () => {
      reject(new Error("Failed to load Google Maps script."));
    };

    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
}

export function unitTypeToBeds(unitType: string): number {
  switch (unitType) {
    case "studio":
      return 0;
    case "1b1b":
      return 1;
    case "2b2b":
      return 2;
    default:
      return 1;
  }
}

export function unitTypeToBaths(unitType: string): number {
  switch (unitType) {
    case "2b2b":
      return 2;
    default:
      return 1;
  }
}

export function buildPath(
  base: string,
  params: Record<string, string | number | undefined>,
) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    qs.set(k, String(v));
  }
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

export function stableHash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function normalizeViewport(viewport: MapViewport): MapViewport {
  const f = (v: number) => Number(v.toFixed(6));
  return {
    north: f(viewport.north),
    south: f(viewport.south),
    east: f(viewport.east),
    west: f(viewport.west),
  };
}

export function mapViewportFromMap(map: GoogleMapInstance): MapViewport | null {
  const bounds = map.getBounds();
  if (!bounds) return null;
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  return {
    north: ne.lat(),
    south: sw.lat(),
    east: ne.lng(),
    west: sw.lng(),
  };
}

export function isSameViewport(a: MapViewport | null, b: MapViewport): boolean {
  if (!a) return false;
  const epsilon = 1e-5;
  return (
    Math.abs(a.north - b.north) <= epsilon &&
    Math.abs(a.south - b.south) <= epsilon &&
    Math.abs(a.east - b.east) <= epsilon &&
    Math.abs(a.west - b.west) <= epsilon
  );
}

export function longitudeInBounds(
  lng: number,
  west: number,
  east: number,
): boolean {
  if (west <= east) {
    return lng >= west && lng <= east;
  }
  return lng >= west || lng <= east;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeLongitude(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

function longitudeSpanDegrees(west: number, east: number): number {
  let span = east - west;
  if (span < 0) span += 360;
  return span;
}

function longitudeOffsetFromWest(west: number, lng: number): number {
  let offset = normalizeLongitude(lng) - normalizeLongitude(west);
  if (offset < 0) offset += 360;
  return offset;
}

export function viewportEdgeTolerance(viewport: MapViewport, ratio = 0.0125) {
  const latSpan = Math.max(viewport.north - viewport.south, 1e-6);
  const lngSpan = Math.max(
    longitudeSpanDegrees(viewport.west, viewport.east),
    1e-6,
  );
  return {
    lat: Math.max(latSpan * ratio, 0.00008),
    lng: Math.max(lngSpan * ratio, 0.00008),
  };
}

export function isCoordinateInViewport(
  lat: number,
  lng: number,
  viewport: MapViewport,
  tolerance: { lat: number; lng: number } = ZERO_TOLERANCE,
): boolean {
  const south = clamp(viewport.south - tolerance.lat, -90, 90);
  const north = clamp(viewport.north + tolerance.lat, -90, 90);
  const west = normalizeLongitude(viewport.west - tolerance.lng);
  const east = normalizeLongitude(viewport.east + tolerance.lng);
  return lat >= south && lat <= north && longitudeInBounds(lng, west, east);
}

export function isPointInViewport(
  point: MapPoint,
  viewport: MapViewport,
  tolerance: { lat: number; lng: number } = ZERO_TOLERANCE,
): boolean {
  return isCoordinateInViewport(point.lat, point.lng, viewport, tolerance);
}

export function popupPixelOffsetForPoint(
  point: Pick<MapPoint, "lat" | "lng">,
  viewport: MapViewport,
  options?: {
    mapWidth?: number;
    mapHeight?: number;
    popupWidth?: number;
    popupHeight?: number;
    margin?: number;
  },
) {
  const popupWidth = options?.popupWidth ?? 320;
  const popupHeight = options?.popupHeight ?? 300;
  const margin = options?.margin ?? 12;
  const mapWidth = Math.max(options?.mapWidth ?? 0, popupWidth + margin * 2);
  const mapHeight = Math.max(options?.mapHeight ?? 0, popupHeight + margin * 2);

  const latSpan = Math.max(viewport.north - viewport.south, 1e-6);
  const lngSpan = Math.max(
    longitudeSpanDegrees(viewport.west, viewport.east),
    1e-6,
  );

  const xRatio = clamp(
    longitudeOffsetFromWest(viewport.west, point.lng) / lngSpan,
    0,
    1,
  );
  const yRatio = clamp((viewport.north - point.lat) / latSpan, 0, 1);
  const markerX = xRatio * mapWidth;
  const markerY = yRatio * mapHeight;

  const minCenterX = margin + popupWidth / 2;
  const maxCenterX = mapWidth - margin - popupWidth / 2;
  const targetCenterX = clamp(markerX, minCenterX, maxCenterX);
  const x = targetCenterX - markerX;

  const tailHeight = 16;
  const defaultTop = markerY - popupHeight - tailHeight;
  const minTop = margin;
  const maxTop = mapHeight - popupHeight - margin;
  const targetTop = clamp(defaultTop, minTop, maxTop);
  const y = targetTop - defaultTop;

  return { x, y };
}

export function makePriceMarkerIcon(
  google: GoogleMapsGlobal,
  label: string,
  active: boolean,
  hovered = false,
) {
  const width = Math.max(78, label.length * 10 + 18);
  const height = 38;
  const scale = hovered ? 1.08 : 1;
  const bg = active
    ? hovered
      ? "#1E92E8"
      : "#3EA6FC"
    : hovered
      ? "#C7E6FF"
      : "#DCF0FF";
  const fg = active ? "#FFFFFF" : "#0F172A";
  const stroke = hovered ? "#2F97EA" : "#3EA6FC";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="19" ry="19" fill="${bg}" stroke="${stroke}" stroke-width="2"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="${fg}">${label}</text>
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width * scale, height * scale),
    anchor: new google.maps.Point((width * scale) / 2, (height * scale) / 2),
  };
}

export function makeDotMarkerIcon(
  google: GoogleMapsGlobal,
  count: number,
  active: boolean,
  alwaysShowCount = false,
  hovered = false,
) {
  const hasCount = alwaysShowCount || count > 1;
  const diameter = hasCount ? 38 : 20;
  const scale = hovered ? 1.12 : 1;
  const bg = active
    ? hovered
      ? "#0284C7"
      : "#0EA5E9"
    : hovered
      ? "#1D90EF"
      : "#3EA6FC";
  const ring = active ? "#BEE8FF" : "#FFFFFF";

  const text = hasCount
    ? `<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">${count}</text>`
    : "";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}">
  <circle cx="${diameter / 2}" cy="${diameter / 2}" r="${diameter / 2 - 1}" fill="${bg}" stroke="${ring}" stroke-width="2" />
  ${text}
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(diameter * scale, diameter * scale),
    anchor: new google.maps.Point(
      (diameter * scale) / 2,
      (diameter * scale) / 2,
    ),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function mapPopupHtml(item: MapPoint) {
  const title = escapeHtml(item.title);
  const subtitle = escapeHtml(item.subtitle);
  const address = escapeHtml(item.address);
  const href = escapeHtml(item.href);
  const rating = item.rating.toFixed(1);
  const reviews = item.reviewsCount;

  const image = item.image
    ? `<img src="${escapeHtml(item.image)}" alt="${title}" style="width:100%;height:172px;object-fit:cover;border-radius:19px;display:block;" />`
    : '<div style="width:100%;height:172px;border-radius:19px;background:linear-gradient(135deg,#e6e6e6,#cfcfcf);"></div>';

  return `
<a href="${href}" style="display:block;width:295px;padding:15px;border-radius:19px;background:#fff;box-shadow:0 3px 6px rgba(0,0,0,0.25);text-decoration:none;color:inherit;">
  ${image}
  <div style="margin-top:10px;">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div style="font:600 19px/21px Inter,Arial,sans-serif;color:#0F172A;">${title}</div>
      <div style="font:700 14px/18px Inter,Arial,sans-serif;color:#0F172A;white-space:nowrap;">★ ${rating} <span style="color:#BABABA;font-weight:500;">(${reviews})</span></div>
    </div>
    <div style="margin-top:3px;font:400 15px/18px Inter,Arial,sans-serif;color:#111;">${subtitle}</div>
    <div style="margin-top:3px;font:400 12px/18px Inter,Arial,sans-serif;color:#919191;">${address}</div>
  </div>
</a>`;
}

export function topBarLabel(total: number, view: ViewMode) {
  const noun = view === "unit" ? "units" : "buildings";
  if (total >= 100) return `Over ${total} ${noun}`;
  return `${total} ${noun}`;
}
