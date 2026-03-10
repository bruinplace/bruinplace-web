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
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  rating: number;
  reviewsCount: number;
  images?: string[];
  createdAt: number;
};

type ApiListing = {
  id: string;
  property_id: string;
  title: string;
  monthly_rent: number;
  square_feet: number | null;
  unit_type: string;
  created_at: string;
};

type ApiListingListResponse = {
  items: ApiListing[];
  total: number;
};

type ApiProperty = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
};

type ApiPropertyListResponse = {
  items: ApiProperty[];
  total: number;
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

type GoogleMapInstance = {
  fitBounds: (bounds: GoogleLatLngBoundsInstance, padding?: number) => void;
  getZoom: () => number | undefined;
  setZoom: (zoom: number) => void;
  getCenter: () => { lat: () => number; lng: () => number } | null;
  addListener: (eventName: string, handler: () => void) => void;
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
  addListener: (eventName: string, handler: () => void) => void;
  setIcon: (icon: unknown) => void;
  setZIndex: (zIndex: number) => void;
  getPosition: () => unknown;
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

type GoogleLatLngBoundsInstance = {
  extend: (latLng: unknown) => void;
};

type GoogleMapsGlobal = {
  maps: {
    Map: new (
      el: HTMLElement,
      opts: Record<string, unknown>,
    ) => GoogleMapInstance;
    Marker: new (opts: GoogleMarkerOptions) => GoogleMarkerInstance;
    InfoWindow: new (opts: { maxWidth?: number }) => GoogleInfoWindowInstance;
    LatLngBounds: new () => GoogleLatLngBoundsInstance;
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    event: {
      addListenerOnce: (
        instance: GoogleMapInstance,
        eventName: string,
        handler: () => void,
      ) => void;
    };
  };
};

const UCLA_CENTER = { lat: 34.0689, lng: -118.4452 };

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

function parseMonthlyPrice(priceLabel: string) {
  const match = priceLabel.match(/\$([\d,]+)/);
  if (!match) return 0;
  return Number(match[1].replace(/,/g, ""));
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

function pseudoPrice(seed: string) {
  return 1200 + (stableHash(seed) % 1600);
}

function makeMapCoordinates(seed: string, index: number) {
  const hash = stableHash(`${seed}-${index}`);
  const angle = ((hash % 360) * Math.PI) / 180;
  const radius = 0.0025 + (hash % 22) / 10000;

  return {
    lat: UCLA_CENTER.lat + Math.sin(angle) * radius,
    lng: UCLA_CENTER.lng + Math.cos(angle) * radius * 1.25,
  };
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

  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<GoogleMapInstance | null>(null);
  const googleRef = React.useRef<GoogleMapsGlobal | null>(null);
  const infoWindowRef = React.useRef<GoogleInfoWindowInstance | null>(null);
  const markerRefs = React.useRef<Record<string, GoogleMarkerInstance>>({});
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const listingsPath = React.useMemo(
    () =>
      buildPath("/listings", {
        search: query || undefined,
        min_rent: filters?.priceMin,
        max_rent: filters?.priceMax,
        limit: 80,
      }),
    [filters?.priceMax, filters?.priceMin, query],
  );

  const propertiesPath = React.useMemo(
    () =>
      buildPath("/properties", {
        q: query || undefined,
        limit: 100,
      }),
    [query],
  );

  const listingsQuery = useQuery({
    queryKey: ["search_listings", listingsPath],
    queryFn: () => api.get<ApiListingListResponse>(listingsPath),
  });

  const propertiesQuery = useQuery({
    queryKey: ["search_properties", propertiesPath],
    queryFn: () => api.get<ApiPropertyListResponse>(propertiesPath),
  });

  const propertyById = React.useMemo(
    () =>
      new Map(
        (propertiesQuery.data?.items ?? []).map((p) => [p.id, p] as const),
      ),
    [propertiesQuery.data?.items],
  );

  const listings: ListingCardModel[] = React.useMemo(
    () =>
      (listingsQuery.data?.items ?? []).map((item) => {
        const property = propertyById.get(item.property_id);
        const address = property
          ? `${property.address}, ${property.city}, ${property.state} ${property.postal_code}`
          : "Address unavailable";
        const hash = stableHash(item.id);

        return {
          id: item.id,
          priceLabel: `$${item.monthly_rent.toLocaleString()} per month`,
          beds: unitTypeToBeds(item.unit_type),
          baths: unitTypeToBaths(item.unit_type),
          sqft: item.square_feet ?? 0,
          address,
          rating: Number((4 + (hash % 10) * 0.1).toFixed(1)),
          reviewsCount: 1 + (hash % 17),
          images: [],
          createdAt: Date.parse(item.created_at) || 0,
        };
      }),
    [listingsQuery.data?.items, propertyById],
  );

  const buildings: Building[] = React.useMemo(
    () =>
      (propertiesQuery.data?.items ?? []).map((item) => {
        const seed = stableHash(item.id);
        return {
          id: item.id,
          name: item.name,
          address: `${item.address}, ${item.city}, ${item.state} ${item.postal_code}`,
          rating: Number((4 + (seed % 9) * 0.1).toFixed(1)),
          reviewsCount: 1 + (seed % 17),
          images: [],
        };
      }),
    [propertiesQuery.data?.items],
  );

  const sorted = React.useMemo(() => {
    const arr = [...listings];
    switch (sort) {
      case "price_desc":
        arr.sort(
          (a, b) =>
            parseMonthlyPrice(b.priceLabel) - parseMonthlyPrice(a.priceLabel),
        );
        return arr;
      case "price_asc":
        arr.sort(
          (a, b) =>
            parseMonthlyPrice(a.priceLabel) - parseMonthlyPrice(b.priceLabel),
        );
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

  const totalHomes =
    view === "unit"
      ? (listingsQuery.data?.total ?? 0)
      : (propertiesQuery.data?.total ?? 0);

  const isLoading =
    view === "unit" ? listingsQuery.isLoading : propertiesQuery.isLoading;
  const isError =
    view === "unit" ? listingsQuery.isError : propertiesQuery.isError;

  const unitMapItems = React.useMemo<MapItem[]>(() => {
    return sorted.slice(0, 8).map((listing) => {
      const markerPrice = parseMonthlyPrice(listing.priceLabel);
      return {
        id: listing.id,
        title: listing.priceLabel,
        subtitle: `${listing.beds} bd | ${listing.baths} ba | ${listing.sqft.toLocaleString()} sq ft`,
        address: listing.address,
        image: listing.images?.[0],
        rating: listing.rating,
        reviewsCount: listing.reviewsCount,
        markerLabel: `$${markerPrice.toLocaleString()}`,
        href: `/listings/${listing.id}`,
      };
    });
  }, [sorted]);

  const buildingMapItems = React.useMemo<MapItem[]>(() => {
    return buildings.slice(0, 8).map((building) => {
      const price = pseudoPrice(building.id);
      return {
        id: building.id,
        title: building.name,
        subtitle: `From $${price.toLocaleString()} per month`,
        address: building.address,
        image: building.images?.[0],
        rating: building.rating,
        reviewsCount: building.reviewsCount,
        markerLabel: `$${price.toLocaleString()}`,
        href: `/building/${building.id}`,
      };
    });
  }, [buildings]);

  const mapItems = view === "unit" ? unitMapItems : buildingMapItems;

  const mapPoints = React.useMemo<MapPoint[]>(() => {
    return mapItems.map((item, index) => ({
      ...item,
      ...makeMapCoordinates(item.id, index),
    }));
  }, [mapItems]);

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
    if (!mapReady || !mapRef.current || !googleRef.current) return;

    const google = googleRef.current;
    const map = mapRef.current;

    Object.values(markerRefs.current).forEach((marker) => marker.setMap(null));
    markerRefs.current = {};

    if (!mapPoints.length) {
      infoWindowRef.current?.close();
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    mapPoints.forEach((point) => {
      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map,
        icon: makePriceMarkerIcon(google, point.markerLabel, false),
        zIndex: 100,
        optimized: true,
        title: point.markerLabel,
      });

      marker.addListener("click", () => {
        setActiveMapId(point.id);

        const node = cardRefs.current[point.id];
        if (node) {
          node.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      markerRefs.current[point.id] = marker;
      bounds.extend(marker.getPosition());
    });

    map.fitBounds(bounds, 80);
    google.maps.event.addListenerOnce(map, "idle", () => {
      const zoom = map.getZoom() ?? 15;
      if (zoom > 15) {
        map.setZoom(15);
      }
    });
  }, [mapReady, mapPoints, view]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return;

    const google = googleRef.current;

    for (const point of mapPoints) {
      const marker = markerRefs.current[point.id];
      if (!marker) continue;

      const active = point.id === activeMapId;
      marker.setIcon(makePriceMarkerIcon(google, point.markerLabel, active));
      marker.setZIndex(active ? 200 : 100);
    }

    if (!activeMapId) {
      infoWindowRef.current?.close();
      return;
    }

    const point = mapPoints.find((item) => item.id === activeMapId);
    if (!point) {
      infoWindowRef.current?.close();
      return;
    }

    const marker = markerRefs.current[point.id];
    if (!marker) return;

    infoWindowRef.current?.setContent(mapPopupHtml(point));
    infoWindowRef.current?.open({
      map: mapRef.current,
      anchor: marker,
      shouldFocus: false,
    });
  }, [activeMapId, mapPoints, mapReady]);

  React.useEffect(() => {
    if (!mapItems.length) {
      setActiveMapId(null);
      return;
    }

    setActiveMapId((prev) =>
      prev && mapItems.some((item) => item.id === prev) ? prev : mapItems[0].id,
    );
  }, [mapItems]);

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
                sorted.length === 0 ? (
                  <div className="rounded-xl border border-[#D4D4D4] bg-white p-4 text-sm text-zinc-600">
                    No listings found.
                  </div>
                ) : null}

                {!isLoading &&
                !isError &&
                view === "building" &&
                buildings.length === 0 ? (
                  <div className="rounded-xl border border-[#D4D4D4] bg-white p-4 text-sm text-zinc-600">
                    No buildings found.
                  </div>
                ) : null}

                {!isLoading &&
                  !isError &&
                  (view === "unit"
                    ? sorted.map((listing) => {
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
                    : buildings.map((building) => {
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
