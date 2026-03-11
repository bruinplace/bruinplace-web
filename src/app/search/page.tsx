"use client";

import * as React from "react";
import SearchHeader from "@/components/SearchHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  BuildingCard,
  type Building,
} from "@/components/listings/BuildingCard";
import type { SearchFilters } from "@/components/search/FiltersDialog";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ExternalLink, Maximize2, Minus, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type SortKey = "price_desc" | "price_asc" | "recent_desc" | "recent_asc";
type ViewMode = "unit" | "building";

type ListingCardModel = {
  id: string;
  propertyId: string;
  propertyName: string;
  monthlyRent: number;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  rating: number;
  reviewsCount: number;
  images?: string[];
  createdAt: number;
  lat: number;
  lng: number;
};

type ApiMapListing = {
  id: string;
  property_id: string;
  title: string;
  monthly_rent: number;
  square_feet: number | null;
  unit_type: string;
  status: string;
  created_at: string;
  property_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
};

type ApiMapListingResponse = {
  items: ApiMapListing[];
  total: number;
  has_more: boolean;
  applied_bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};

type MapItem = {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  image?: string;
  rating: number;
  reviewsCount: number;
  markerLabel: string;
  href: string;
};

type MapPoint = MapItem & {
  lat: number;
  lng: number;
};

type RenderMarkerPoint = {
  id: string;
  lat: number;
  lng: number;
  mode: "dot" | "price";
  markerLabel: string;
  count: number;
  activeKey?: string;
  popupItem?: MapPoint;
};

type BuildingMapModel = Building & {
  priceFrom: number;
  createdAt: number;
  lat: number;
  lng: number;
};

type MapViewport = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

type GoogleMapsListener = {
  remove: () => void;
};

type GoogleMapInstance = {
  getZoom: () => number | undefined;
  setZoom: (zoom: number) => void;
  setCenter: (center: { lat: number; lng: number }) => void;
  getCenter: () => GoogleLatLng | null;
  getBounds: () => GoogleLatLngBoundsReadable | null | undefined;
  addListener: (eventName: string, handler: () => void) => GoogleMapsListener;
};

type GoogleMarkerOptions = {
  position: { lat: number; lng: number };
  map: GoogleMapInstance;
  icon: unknown;
  zIndex: number;
  optimized: boolean;
  title: string;
};

type GoogleMarkerInstance = {
  setMap: (map: GoogleMapInstance | null) => void;
  addListener: (eventName: string, handler: () => void) => GoogleMapsListener;
  setIcon: (icon: unknown) => void;
  setZIndex: (zIndex: number) => void;
  getPosition: () => unknown;
};

type GoogleLatLngBoundsReadable = {
  getNorthEast: () => GoogleLatLng;
  getSouthWest: () => GoogleLatLng;
};

type GoogleInfoWindowInstance = {
  setContent: (content: string) => void;
  open: (opts: {
    map: GoogleMapInstance;
    anchor: GoogleMarkerInstance;
    shouldFocus: boolean;
  }) => void;
  close: () => void;
};

type GoogleMapsGlobal = {
  maps: {
    Map: new (
      el: HTMLElement,
      opts: Record<string, unknown>,
    ) => GoogleMapInstance;
    Marker: new (opts: GoogleMarkerOptions) => GoogleMarkerInstance;
    InfoWindow: new (opts: { maxWidth?: number }) => GoogleInfoWindowInstance;
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
  };
};

const UCLA_CENTER = { lat: 34.0689, lng: -118.4452 };
const PRICE_MARKER_ZOOM = 16;

let googleMapsLoaderPromise: Promise<GoogleMapsGlobal> | null = null;

function loadGoogleMapsApi(apiKey: string): Promise<GoogleMapsGlobal> {
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

function unitTypeToBeds(unitType: string): number {
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

function unitTypeToBaths(unitType: string): number {
  switch (unitType) {
    case "2b2b":
      return 2;
    default:
      return 1;
  }
}

function buildPath(
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

function stableHash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function normalizeViewport(viewport: MapViewport): MapViewport {
  const f = (v: number) => Number(v.toFixed(6));
  return {
    north: f(viewport.north),
    south: f(viewport.south),
    east: f(viewport.east),
    west: f(viewport.west),
  };
}

function mapViewportFromMap(map: GoogleMapInstance): MapViewport | null {
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

function isSameViewport(a: MapViewport | null, b: MapViewport): boolean {
  if (!a) return false;
  return (
    a.north === b.north &&
    a.south === b.south &&
    a.east === b.east &&
    a.west === b.west
  );
}

function longitudeInBounds(lng: number, west: number, east: number): boolean {
  if (west <= east) {
    return lng >= west && lng <= east;
  }
  return lng >= west || lng <= east;
}

function isPointInViewport(point: MapPoint, viewport: MapViewport): boolean {
  return (
    point.lat >= viewport.south &&
    point.lat <= viewport.north &&
    longitudeInBounds(point.lng, viewport.west, viewport.east)
  );
}

function makePriceMarkerIcon(
  google: GoogleMapsGlobal,
  label: string,
  active: boolean,
) {
  const width = Math.max(78, label.length * 10 + 18);
  const height = 38;
  const bg = active ? "#3EA6FC" : "#DCF0FF";
  const fg = active ? "#FFFFFF" : "#0F172A";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="19" ry="19" fill="${bg}" stroke="#3EA6FC" stroke-width="2"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="${fg}">${label}</text>
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(width / 2, height / 2),
  };
}

function makeDotMarkerIcon(
  google: GoogleMapsGlobal,
  count: number,
  active: boolean,
) {
  const hasCount = count > 1;
  const diameter = hasCount ? 38 : 20;
  const bg = active ? "#0EA5E9" : "#3EA6FC";
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
    scaledSize: new google.maps.Size(diameter, diameter),
    anchor: new google.maps.Point(diameter / 2, diameter / 2),
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

function mapPopupHtml(item: MapPoint) {
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

function topBarLabel(total: number, view: ViewMode) {
  const noun = view === "unit" ? "units" : "buildings";
  if (total >= 100) return `Over ${total} ${noun}`;
  return `${total} ${noun}`;
}

export default function SearchPage() {
  const [sort, setSort] = React.useState<SortKey>("recent_desc");
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<SearchFilters | null>(null);
  const [view, setView] = React.useState<ViewMode>("unit");
  const [mapExpanded, setMapExpanded] = React.useState(false);
  const [activeMapId, setActiveMapId] = React.useState<string | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [mapLoadError, setMapLoadError] = React.useState<string | null>(null);
  const [mapViewport, setMapViewport] = React.useState<MapViewport | null>(
    null,
  );
  const [mapZoom, setMapZoom] = React.useState(15);

  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<GoogleMapInstance | null>(null);
  const googleRef = React.useRef<GoogleMapsGlobal | null>(null);
  const infoWindowRef = React.useRef<GoogleInfoWindowInstance | null>(null);
  const markerRefs = React.useRef<Record<string, GoogleMarkerInstance>>({});
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const idleDebounceRef = React.useRef<number | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const mapListingsPath = React.useMemo(() => {
    if (!mapViewport) return null;
    return buildPath("/listings/map", {
      north: mapViewport.north,
      south: mapViewport.south,
      east: mapViewport.east,
      west: mapViewport.west,
      pad_ratio: 0.2,
      search: query || undefined,
      min_rent: filters?.priceMin,
      max_rent: filters?.priceMax,
      limit: 180,
    });
  }, [filters?.priceMax, filters?.priceMin, mapViewport, query]);

  const mapListingsQuery = useQuery({
    queryKey: ["search_map_listings", mapListingsPath],
    queryFn: () => api.get<ApiMapListingResponse>(mapListingsPath as string),
    enabled: Boolean(mapListingsPath),
    placeholderData: (previousData) => previousData,
  });

  const listings: ListingCardModel[] = React.useMemo(
    () =>
      (mapListingsQuery.data?.items ?? []).map((item) => {
        const address = `${item.address}, ${item.city}, ${item.state} ${item.postal_code}`;
        const hash = stableHash(item.id);

        return {
          id: item.id,
          propertyId: item.property_id,
          propertyName: item.property_name,
          monthlyRent: item.monthly_rent,
          priceLabel: `$${item.monthly_rent.toLocaleString()} per month`,
          beds: unitTypeToBeds(item.unit_type),
          baths: unitTypeToBaths(item.unit_type),
          sqft: item.square_feet ?? 0,
          address,
          rating: Number((4 + (hash % 10) * 0.1).toFixed(1)),
          reviewsCount: 1 + (hash % 17),
          images: [],
          createdAt: Date.parse(item.created_at) || 0,
          lat: item.latitude,
          lng: item.longitude,
        };
      }),
    [mapListingsQuery.data?.items],
  );

  const buildings = React.useMemo<BuildingMapModel[]>(() => {
    const byProperty = new Map<string, BuildingMapModel>();
    for (const listing of listings) {
      const existing = byProperty.get(listing.propertyId);
      if (existing) {
        existing.priceFrom = Math.min(existing.priceFrom, listing.monthlyRent);
        existing.createdAt = Math.max(existing.createdAt, listing.createdAt);
        continue;
      }
      const seed = stableHash(listing.propertyId);
      byProperty.set(listing.propertyId, {
        id: listing.propertyId,
        name: listing.propertyName,
        address: listing.address,
        rating: Number((4 + (seed % 9) * 0.1).toFixed(1)),
        reviewsCount: 1 + (seed % 17),
        images: [],
        priceFrom: listing.monthlyRent,
        createdAt: listing.createdAt,
        lat: listing.lat,
        lng: listing.lng,
      });
    }
    return Array.from(byProperty.values());
  }, [listings]);

  const sortedListings = React.useMemo(() => {
    const arr = [...listings];
    switch (sort) {
      case "price_desc":
        arr.sort((a, b) => b.monthlyRent - a.monthlyRent);
        return arr;
      case "price_asc":
        arr.sort((a, b) => a.monthlyRent - b.monthlyRent);
        return arr;
      case "recent_desc":
        arr.sort((a, b) => b.createdAt - a.createdAt);
        return arr;
      case "recent_asc":
        arr.sort((a, b) => a.createdAt - b.createdAt);
        return arr;
      default:
        return arr;
    }
  }, [listings, sort]);

  const sortedBuildings = React.useMemo(() => {
    const arr = [...buildings];
    switch (sort) {
      case "price_desc":
        arr.sort((a, b) => b.priceFrom - a.priceFrom);
        return arr;
      case "price_asc":
        arr.sort((a, b) => a.priceFrom - b.priceFrom);
        return arr;
      case "recent_desc":
        arr.sort((a, b) => b.createdAt - a.createdAt);
        return arr;
      case "recent_asc":
        arr.sort((a, b) => a.createdAt - b.createdAt);
        return arr;
      default:
        return arr;
    }
  }, [buildings, sort]);

  const totalHomes =
    view === "unit"
      ? (mapListingsQuery.data?.total ?? sortedListings.length)
      : sortedBuildings.length;

  const isLoading = !mapListingsPath || mapListingsQuery.isLoading;
  const isError = mapListingsQuery.isError;

  const unitMapItems = React.useMemo<MapPoint[]>(() => {
    return sortedListings.map((listing) => {
      return {
        id: listing.id,
        title: listing.priceLabel,
        subtitle: `${listing.beds} bd | ${listing.baths} ba | ${listing.sqft.toLocaleString()} sq ft`,
        address: listing.address,
        image: listing.images?.[0],
        rating: listing.rating,
        reviewsCount: listing.reviewsCount,
        markerLabel: `$${listing.monthlyRent.toLocaleString()}`,
        href: `/listings/${listing.id}`,
        lat: listing.lat,
        lng: listing.lng,
      };
    });
  }, [sortedListings]);

  const buildingMapItems = React.useMemo<MapPoint[]>(() => {
    return sortedBuildings.map((building) => {
      return {
        id: building.id,
        title: building.name,
        subtitle: `From $${building.priceFrom.toLocaleString()} per month`,
        address: building.address,
        image: building.images?.[0],
        rating: building.rating,
        reviewsCount: building.reviewsCount,
        markerLabel: `$${building.priceFrom.toLocaleString()}`,
        href: `/building/${building.id}`,
        lat: building.lat,
        lng: building.lng,
      };
    });
  }, [sortedBuildings]);

  const mapPoints = view === "unit" ? unitMapItems : buildingMapItems;

  const visibleMapPoints = React.useMemo(() => {
    if (!mapViewport) return mapPoints;
    return mapPoints.filter((point) => isPointInViewport(point, mapViewport));
  }, [mapPoints, mapViewport]);

  const renderedMarkerPoints = React.useMemo<RenderMarkerPoint[]>(() => {
    if (!visibleMapPoints.length) return [];

    if (mapZoom < PRICE_MARKER_ZOOM) {
      const bucketSize =
        mapZoom < 13
          ? 0.01
          : mapZoom < 14
            ? 0.006
            : mapZoom < 15
              ? 0.003
              : 0.0015;
      const clusters = new Map<string, MapPoint[]>();

      for (const point of visibleMapPoints) {
        const latBucket = Math.floor(point.lat / bucketSize);
        const lngBucket = Math.floor(point.lng / bucketSize);
        const key = `${latBucket}:${lngBucket}`;
        const cluster = clusters.get(key);
        if (cluster) {
          cluster.push(point);
        } else {
          clusters.set(key, [point]);
        }
      }

      return Array.from(clusters.entries()).map(([key, points]) => {
        const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
        const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
        return {
          id: `cluster:${key}`,
          lat,
          lng,
          mode: "dot",
          markerLabel: "",
          count: points.length,
        };
      });
    }

    const byCoordinate = new Map<string, MapPoint[]>();
    for (const point of visibleMapPoints) {
      const key = `${point.lat.toFixed(6)}:${point.lng.toFixed(6)}`;
      const group = byCoordinate.get(key);
      if (group) {
        group.push(point);
      } else {
        byCoordinate.set(key, [point]);
      }
    }

    const markers: RenderMarkerPoint[] = [];
    for (const [key, points] of byCoordinate.entries()) {
      if (points.length === 1) {
        const single = points[0];
        markers.push({
          id: single.id,
          lat: single.lat,
          lng: single.lng,
          mode: "price",
          markerLabel: single.markerLabel,
          count: 1,
          activeKey: single.id,
          popupItem: single,
        });
        continue;
      }

      const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
      const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
      markers.push({
        id: `overlap:${key}`,
        lat,
        lng,
        mode: "dot",
        markerLabel: "",
        count: points.length,
      });
    }
    return markers;
  }, [mapZoom, visibleMapPoints]);

  React.useEffect(() => {
    let cancelled = false;

    if (!googleMapsApiKey) {
      setMapLoadError("Google Maps key missing.");
      return;
    }

    loadGoogleMapsApi(googleMapsApiKey)
      .then((google) => {
        if (cancelled || !mapContainerRef.current) return;

        googleRef.current = google;

        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(mapContainerRef.current, {
            center: UCLA_CENTER,
            zoom: 15,
            disableDefaultUI: true,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            clickableIcons: false,
            gestureHandling: "greedy",
          });

          infoWindowRef.current = new google.maps.InfoWindow({ maxWidth: 320 });

          mapRef.current.addListener("click", () => {
            infoWindowRef.current?.close();
          });
        }

        setMapLoadError(null);
        setMapReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setMapLoadError("Failed to load Google Maps.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [googleMapsApiKey]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;

    const updateViewport = () => {
      const rawViewport = mapViewportFromMap(map);
      if (!rawViewport) return;
      const normalized = normalizeViewport(rawViewport);
      setMapViewport((prev) =>
        isSameViewport(prev, normalized) ? prev : normalized,
      );
      setMapZoom(map.getZoom() ?? 15);
    };

    const scheduleViewportUpdate = () => {
      if (idleDebounceRef.current !== null) {
        window.clearTimeout(idleDebounceRef.current);
      }
      idleDebounceRef.current = window.setTimeout(updateViewport, 180);
    };

    scheduleViewportUpdate();
    const idleListener = map.addListener("idle", scheduleViewportUpdate);

    return () => {
      idleListener.remove();
      if (idleDebounceRef.current !== null) {
        window.clearTimeout(idleDebounceRef.current);
        idleDebounceRef.current = null;
      }
    };
  }, [mapReady]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return;

    const google = googleRef.current;
    const map = mapRef.current;

    Object.values(markerRefs.current).forEach((marker) => marker.setMap(null));
    markerRefs.current = {};

    if (!renderedMarkerPoints.length) {
      infoWindowRef.current?.close();
      return;
    }

    renderedMarkerPoints.forEach((point) => {
      const icon =
        point.mode === "price"
          ? makePriceMarkerIcon(google, point.markerLabel, false)
          : makeDotMarkerIcon(google, point.count, false);

      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map,
        icon,
        zIndex: point.mode === "price" ? 100 : 90,
        optimized: true,
        title:
          point.mode === "price"
            ? point.markerLabel
            : point.count > 1
              ? `${point.count} listings`
              : "Listing",
      });

      marker.addListener("click", () => {
        if (point.activeKey) {
          setActiveMapId(point.activeKey);

          const node = cardRefs.current[point.activeKey];
          if (node) {
            node.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        const nextZoom = Math.min(20, (map.getZoom() ?? 15) + 1);
        map.setCenter({ lat: point.lat, lng: point.lng });
        map.setZoom(nextZoom);
      });

      markerRefs.current[point.id] = marker;
    });
  }, [mapReady, renderedMarkerPoints]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return;

    const google = googleRef.current;

    for (const point of renderedMarkerPoints) {
      const marker = markerRefs.current[point.id];
      if (!marker) continue;

      const active = point.activeKey != null && point.activeKey === activeMapId;
      const icon =
        point.mode === "price"
          ? makePriceMarkerIcon(google, point.markerLabel, active)
          : makeDotMarkerIcon(google, point.count, active);
      marker.setIcon(icon);
      marker.setZIndex(active ? 210 : point.mode === "price" ? 100 : 90);
    }

    if (!activeMapId) {
      infoWindowRef.current?.close();
      return;
    }

    const point = renderedMarkerPoints.find(
      (item) => item.activeKey === activeMapId,
    );
    if (!point) {
      infoWindowRef.current?.close();
      return;
    }
    if (!point.popupItem) {
      infoWindowRef.current?.close();
      return;
    }

    const marker = markerRefs.current[point.id];
    if (!marker) return;

    infoWindowRef.current?.setContent(mapPopupHtml(point.popupItem));
    infoWindowRef.current?.open({
      map: mapRef.current,
      anchor: marker,
      shouldFocus: false,
    });
  }, [activeMapId, mapReady, renderedMarkerPoints]);

  React.useEffect(() => {
    if (!visibleMapPoints.length) {
      setActiveMapId(null);
      return;
    }

    setActiveMapId((prev) =>
      prev && visibleMapPoints.some((item) => item.id === prev)
        ? prev
        : visibleMapPoints[0].id,
    );
  }, [visibleMapPoints]);

  function openExternalMap() {
    if (!mapRef.current) {
      window.open(
        "https://www.google.com/maps?q=UCLA%2C%20Los%20Angeles%2C%20CA",
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom() ?? 15;
    const lat = center?.lat?.() ?? UCLA_CENTER.lat;
    const lng = center?.lng?.() ?? UCLA_CENTER.lng;

    window.open(
      `https://www.google.com/maps/@${lat},${lng},${zoom}z`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function zoomBy(delta: number) {
    if (!mapRef.current) return;
    const current = mapRef.current.getZoom() ?? 15;
    mapRef.current.setZoom(Math.max(12, Math.min(20, current + delta)));
  }

  return (
    <div className="min-h-dvh bg-[#F5F5F5]">
      <SearchHeader
        query={query}
        onQueryChange={setQuery}
        onFiltersSave={(f) => setFilters(f)}
      />

      <main className="mx-auto max-w-[1441px] px-4 pb-10 pt-6 sm:px-8 xl:px-[39px]">
        <div className="grid gap-8 xl:grid-cols-[613px_689px] xl:gap-[50px]">
          <section className="min-w-0">
            <div className="h-[calc(100dvh-140px)] overflow-y-auto pr-1">
              <div className="mb-[14px] flex items-center justify-between">
                <h1 className="text-[20px] font-bold leading-7 text-black">
                  {topBarLabel(totalHomes, view)}
                </h1>

                <div className="flex items-center gap-[10px]">
                  <label className="inline-flex h-10 items-center gap-1 rounded-[25px] border border-[#71C4FF] bg-white px-4 text-[14px] text-[#0F172A]">
                    <span>Sort by</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="bg-transparent text-[14px] outline-none"
                    >
                      <option value="recent_desc">Newest</option>
                      <option value="recent_asc">Oldest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </label>

                  <div className="inline-flex h-10 rounded-[25px] border border-[#71C4FF] bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setView("building")}
                      className={cn(
                        "rounded-[25px] px-3 text-[14px] font-medium leading-5 transition-all",
                        view === "building"
                          ? "bg-[#3EA6FC] text-white"
                          : "text-black hover:bg-[#E8F5FF]",
                      )}
                    >
                      Building
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("unit")}
                      className={cn(
                        "rounded-[25px] px-3 text-[14px] font-medium leading-5 transition-all",
                        view === "unit"
                          ? "bg-[#3EA6FC] text-white"
                          : "text-black hover:bg-[#E8F5FF]",
                      )}
                    >
                      Unit
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-[22px] sm:grid-cols-2">
                {isLoading ? (
                  <div className="rounded-xl border border-[#D4D4D4] bg-white p-4 text-sm text-zinc-600">
                    Loading results...
                  </div>
                ) : null}

                {isError ? (
                  <div className="rounded-xl border border-[#D4D4D4] bg-white p-4 text-sm text-red-600">
                    Failed to load search results.
                  </div>
                ) : null}

                {!isLoading &&
                !isError &&
                view === "unit" &&
                sortedListings.length === 0 ? (
                  <div className="rounded-xl border border-[#D4D4D4] bg-white p-4 text-sm text-zinc-600">
                    No listings found.
                  </div>
                ) : null}

                {!isLoading &&
                !isError &&
                view === "building" &&
                sortedBuildings.length === 0 ? (
                  <div className="rounded-xl border border-[#D4D4D4] bg-white p-4 text-sm text-zinc-600">
                    No buildings found.
                  </div>
                ) : null}

                {!isLoading &&
                  !isError &&
                  (view === "unit"
                    ? sortedListings.map((listing) => {
                        const isActive = activeMapId === listing.id;
                        return (
                          <div
                            key={listing.id}
                            ref={(node) => {
                              cardRefs.current[listing.id] = node;
                            }}
                            className={cn(
                              "w-full transition-all duration-200",
                              isActive && "-translate-y-0.5",
                            )}
                          >
                            <ListingCard
                              listing={listing}
                              className={cn(
                                "w-full",
                                isActive &&
                                  "ring-2 ring-[#3EA6FC] ring-offset-1",
                              )}
                            />
                          </div>
                        );
                      })
                    : sortedBuildings.map((building) => {
                        const isActive = activeMapId === building.id;
                        return (
                          <div
                            key={building.id}
                            ref={(node) => {
                              cardRefs.current[building.id] = node;
                            }}
                            className={cn(
                              "w-full transition-all duration-200",
                              isActive && "-translate-y-0.5",
                            )}
                          >
                            <BuildingCard
                              building={building}
                              className={cn(
                                "w-full",
                                isActive &&
                                  "ring-2 ring-[#3EA6FC] ring-offset-1",
                              )}
                            />
                          </div>
                        );
                      }))}
              </div>
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-[96px]">
              <div
                className={cn(
                  "relative overflow-hidden rounded-[20px] border border-[#D4D4D4] bg-white shadow-sm transition-all duration-300",
                  mapExpanded ? "h-[calc(100dvh-130px)]" : "h-[638px]",
                )}
              >
                <div ref={mapContainerRef} className="h-full w-full" />

                <div className="absolute right-6 top-6 z-20 space-y-[10px]">
                  <button
                    type="button"
                    onClick={() => setMapExpanded((v) => !v)}
                    className="grid h-[43px] w-[43px] place-items-center rounded-full bg-white text-[#3EA6FC] shadow-[1px_1px_5px_rgba(0,0,0,0.25)]"
                    aria-label="Toggle map size"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </button>

                  <div className="overflow-hidden rounded-[50px] bg-white shadow-[1px_1px_5px_rgba(0,0,0,0.25)]">
                    <button
                      type="button"
                      onClick={() => zoomBy(1)}
                      className="grid h-[45px] w-[43px] place-items-center text-[#3EA6FC]"
                      aria-label="Zoom in"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <div className="h-px bg-[#E5E5E5]" />
                    <button
                      type="button"
                      onClick={() => zoomBy(-1)}
                      className="grid h-[45px] w-[43px] place-items-center text-[#3EA6FC]"
                      aria-label="Zoom out"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={openExternalMap}
                    className="inline-flex h-[43px] items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-[#3EA6FC] shadow-[1px_1px_5px_rgba(0,0,0,0.25)]"
                  >
                    Open
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                {mapLoadError ? (
                  <div className="absolute inset-0 z-30 grid place-items-center bg-white/95 text-sm text-red-600">
                    {mapLoadError}
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
