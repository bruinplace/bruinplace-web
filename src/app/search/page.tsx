"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import SearchHeader from "@/components/SearchHeader";
import type { SearchFilters } from "@/components/search/FiltersDialog";
import { api } from "@/lib/api";
import { SearchMapPane } from "./components/SearchMapPane";
import { SearchResultsColumn } from "./components/SearchResultsColumn";
import {
  buildPath,
  isCoordinateInViewport,
  isPointInViewport,
  isSameViewport,
  loadGoogleMapsApi,
  makeDotMarkerIcon,
  makePriceMarkerIcon,
  mapPopupHtml,
  mapViewportFromMap,
  normalizeViewport,
  PRICE_MARKER_ZOOM,
  stableHash,
  UCLA_CENTER,
  unitTypeToBaths,
  unitTypeToBeds,
  viewportEdgeTolerance,
} from "./map-utils";
import type {
  ApiMapListingResponse,
  BuildingMapModel,
  GoogleInfoWindowInstance,
  GoogleMapInstance,
  GoogleMapsGlobal,
  GoogleMarkerInstance,
  ListingCardModel,
  MapPoint,
  MapViewport,
  RenderMarkerPoint,
  SortKey,
  ViewMode,
} from "./types";

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

  const viewportListings = React.useMemo<ListingCardModel[]>(() => {
    if (!mapViewport) return listings;
    const tolerance = viewportEdgeTolerance(mapViewport);
    return listings.filter((listing) =>
      isCoordinateInViewport(listing.lat, listing.lng, mapViewport, tolerance),
    );
  }, [listings, mapViewport]);

  const buildings = React.useMemo<BuildingMapModel[]>(() => {
    const byProperty = new Map<string, BuildingMapModel>();
    for (const listing of viewportListings) {
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
  }, [viewportListings]);

  const sortedListings = React.useMemo(() => {
    const arr = [...viewportListings];
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
  }, [viewportListings, sort]);

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
    view === "unit" ? sortedListings.length : sortedBuildings.length;

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
    const tolerance = viewportEdgeTolerance(mapViewport);
    return mapPoints.filter((point) =>
      isPointInViewport(point, mapViewport, tolerance),
    );
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
          <SearchResultsColumn
            view={view}
            onViewChange={setView}
            sort={sort}
            onSortChange={setSort}
            totalHomes={totalHomes}
            isLoading={isLoading}
            isError={isError}
            sortedListings={sortedListings}
            sortedBuildings={sortedBuildings}
            activeMapId={activeMapId}
            cardRefs={cardRefs}
          />

          <SearchMapPane
            mapExpanded={mapExpanded}
            onToggleMapExpanded={() => setMapExpanded((v) => !v)}
            mapContainerRef={mapContainerRef}
            mapLoadError={mapLoadError}
            onZoomIn={() => zoomBy(1)}
            onZoomOut={() => zoomBy(-1)}
            onOpenExternalMap={openExternalMap}
          />
        </div>
      </main>
    </div>
  );
}
