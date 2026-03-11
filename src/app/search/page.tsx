"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  popupPixelOffsetForPoint,
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
  ApiSearchListingResponse,
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
import { useListingImageMap } from "./useListingImageMap";

export default function SearchPage() {
  const router = useRouter();
  const [sort, setSort] = React.useState<SortKey>("recent_desc");
  const [searchInput, setSearchInput] = React.useState("");
  const [activeSearchQuery, setActiveSearchQuery] = React.useState("");
  const [searchSubmitNonce, setSearchSubmitNonce] = React.useState(0);
  const [filters, setFilters] = React.useState<SearchFilters | null>(null);
  const [view, setView] = React.useState<ViewMode>("unit");
  const [mapExpanded, setMapExpanded] = React.useState(false);
  const [activeMapId, setActiveMapId] = React.useState<string | null>(null);
  const [selectedUnitPropertyId, setSelectedUnitPropertyId] = React.useState<
    string | null
  >(null);
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
  const suppressAutoSelectRef = React.useRef(false);
  const markerRenderSignatureRef = React.useRef("");
  const activeMapIdRef = React.useRef<string | null>(null);
  const hoveredMarkerIdRef = React.useRef<string | null>(null);
  const pendingSearchFitNonceRef = React.useRef<number | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const isSearchMode = activeSearchQuery.length > 0;

  const toListingCardModel = React.useCallback(
    (
      item:
        | ApiMapListingResponse["items"][number]
        | ApiSearchListingResponse["items"][number],
    ): ListingCardModel => {
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
    },
    [],
  );

  React.useEffect(() => {
    activeMapIdRef.current = activeMapId;
  }, [activeMapId]);

  const mapListingsPath = React.useMemo(() => {
    if (isSearchMode || !mapViewport) return null;
    return buildPath("/listings/map", {
      north: mapViewport.north,
      south: mapViewport.south,
      east: mapViewport.east,
      west: mapViewport.west,
      pad_ratio: 0.2,
      min_rent: filters?.priceMin,
      max_rent: filters?.priceMax,
    });
  }, [filters?.priceMax, filters?.priceMin, isSearchMode, mapViewport]);

  const searchListingsPath = React.useMemo(() => {
    if (!isSearchMode) return null;
    return buildPath("/listings/search", {
      q: activeSearchQuery,
      min_rent: filters?.priceMin,
      max_rent: filters?.priceMax,
    });
  }, [activeSearchQuery, filters?.priceMax, filters?.priceMin, isSearchMode]);

  const mapListingsQuery = useQuery({
    queryKey: ["search_map_listings", mapListingsPath],
    queryFn: () => api.get<ApiMapListingResponse>(mapListingsPath as string),
    enabled: Boolean(mapListingsPath),
    placeholderData: (previousData) => previousData,
  });

  const searchListingsQuery = useQuery({
    queryKey: ["search_ranked_listings", searchListingsPath],
    queryFn: () =>
      api.get<ApiSearchListingResponse>(searchListingsPath as string),
    enabled: Boolean(searchListingsPath),
  });

  const activeListingItems = React.useMemo(() => {
    if (isSearchMode) return searchListingsQuery.data?.items ?? [];
    return mapListingsQuery.data?.items ?? [];
  }, [
    isSearchMode,
    mapListingsQuery.data?.items,
    searchListingsQuery.data?.items,
  ]);

  const baseListings: ListingCardModel[] = React.useMemo(
    () => activeListingItems.map((item) => toListingCardModel(item)),
    [activeListingItems, toListingCardModel],
  );

  const viewportBaseListings = React.useMemo<ListingCardModel[]>(() => {
    if (isSearchMode) return baseListings;
    if (!mapViewport) return baseListings;
    const tolerance = viewportEdgeTolerance(mapViewport);
    return baseListings.filter((listing) =>
      isCoordinateInViewport(listing.lat, listing.lng, mapViewport, tolerance),
    );
  }, [baseListings, isSearchMode, mapViewport]);

  const listingImagesById = useListingImageMap(
    React.useMemo(
      () =>
        viewportBaseListings.map((listing) => ({
          listingId: listing.id,
          propertyId: listing.propertyId,
        })),
      [viewportBaseListings],
    ),
  );

  const viewportListings = React.useMemo<ListingCardModel[]>(
    () =>
      viewportBaseListings.map((listing) => ({
        ...listing,
        images: listingImagesById[listing.id] ?? [],
      })),
    [listingImagesById, viewportBaseListings],
  );

  const buildings = React.useMemo<BuildingMapModel[]>(() => {
    const byProperty = new Map<string, BuildingMapModel>();
    for (const listing of viewportListings) {
      const existing = byProperty.get(listing.propertyId);
      if (existing) {
        existing.priceFrom = Math.min(existing.priceFrom, listing.monthlyRent);
        existing.createdAt = Math.max(existing.createdAt, listing.createdAt);
        if (
          (!existing.images || existing.images.length === 0) &&
          listing.images
        ) {
          existing.images = listing.images;
        }
        continue;
      }
      const seed = stableHash(listing.propertyId);
      byProperty.set(listing.propertyId, {
        id: listing.propertyId,
        name: listing.propertyName,
        address: listing.address,
        rating: Number((4 + (seed % 9) * 0.1).toFixed(1)),
        reviewsCount: 1 + (seed % 17),
        images: listing.images,
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

  const displayedUnitListings = React.useMemo(() => {
    if (!selectedUnitPropertyId) {
      return sortedListings;
    }
    return sortedListings.filter(
      (listing) => listing.propertyId === selectedUnitPropertyId,
    );
  }, [selectedUnitPropertyId, sortedListings]);

  const totalHomes =
    view === "unit" ? displayedUnitListings.length : sortedBuildings.length;

  const isLoading = isSearchMode
    ? searchListingsQuery.isLoading
    : !mapListingsPath || mapListingsQuery.isLoading;
  const isError = isSearchMode
    ? searchListingsQuery.isError
    : mapListingsQuery.isError;

  const unitCountByPropertyId = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const listing of viewportListings) {
      counts.set(listing.propertyId, (counts.get(listing.propertyId) ?? 0) + 1);
    }
    return counts;
  }, [viewportListings]);

  const unitMapItems = React.useMemo<MapPoint[]>(() => {
    return sortedBuildings.map((building) => {
      const unitCount = unitCountByPropertyId.get(building.id) ?? 0;
      const markerLabel =
        unitCount > 1
          ? `${unitCount} units`
          : `$${building.priceFrom.toLocaleString()}`;
      return {
        id: building.id,
        title: building.name,
        subtitle: `${unitCount} ${unitCount === 1 ? "unit" : "units"} available`,
        address: building.address,
        image: building.images?.[0],
        rating: building.rating,
        reviewsCount: building.reviewsCount,
        markerLabel,
        href: `/building/${building.id}`,
        lat: building.lat,
        lng: building.lng,
        unitCount,
      };
    });
  }, [sortedBuildings, unitCountByPropertyId]);

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

    if (view === "unit") {
      return visibleMapPoints.map((point) => ({
        id: `unit-building:${point.id}`,
        lat: point.lat,
        lng: point.lng,
        mode: "price",
        markerLabel: point.markerLabel,
        count: Math.max(point.unitCount ?? 0, 1),
        activeKey: point.id,
      }));
    }

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

      const sorted = [...points].sort((a, b) => a.id.localeCompare(b.id));
      const baseRotation = (stableHash(key) % 360) * (Math.PI / 180);
      const radiusDegrees = Math.max(
        0.00003,
        0.00018 * Math.pow(0.65, Math.max(0, mapZoom - PRICE_MARKER_ZOOM)),
      );

      sorted.forEach((point, index) => {
        const angle = baseRotation + (index * Math.PI * 2) / sorted.length;
        const lngScale = Math.max(Math.cos((point.lat * Math.PI) / 180), 0.25);
        markers.push({
          id: `overlap:${key}:${point.id}`,
          lat: point.lat + radiusDegrees * Math.sin(angle),
          lng: point.lng + (radiusDegrees * Math.cos(angle)) / lngScale,
          mode: "price",
          markerLabel: point.markerLabel,
          count: 1,
          activeKey: point.id,
          popupItem: point,
        });
      });
    }
    return markers;
  }, [mapZoom, view, visibleMapPoints]);

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

          infoWindowRef.current = new google.maps.InfoWindow({
            maxWidth: 320,
            disableAutoPan: true,
          });

          mapRef.current.addListener("click", () => {
            infoWindowRef.current?.close();
            suppressAutoSelectRef.current = true;
            hoveredMarkerIdRef.current = null;
            activeMapIdRef.current = null;
            setSelectedUnitPropertyId(null);
            setActiveMapId(null);
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
    const markerSignature = renderedMarkerPoints
      .map(
        (point) =>
          `${point.id}|${point.lat.toFixed(6)}|${point.lng.toFixed(6)}|${point.mode}|${point.markerLabel}|${point.count}|${point.activeKey ?? ""}|${point.navigateHref ?? ""}|${point.alwaysShowCount ? 1 : 0}`,
      )
      .join(";");

    if (markerSignature === markerRenderSignatureRef.current) {
      return;
    }
    markerRenderSignatureRef.current = markerSignature;
    hoveredMarkerIdRef.current = null;

    Object.values(markerRefs.current).forEach((marker) => marker.setMap(null));
    markerRefs.current = {};

    if (!renderedMarkerPoints.length) {
      infoWindowRef.current?.close();
      return;
    }

    renderedMarkerPoints.forEach((point) => {
      const iconForState = (active: boolean, hovered: boolean) =>
        point.mode === "price"
          ? makePriceMarkerIcon(google, point.markerLabel, active, hovered)
          : makeDotMarkerIcon(
              google,
              point.count,
              active,
              point.alwaysShowCount ?? false,
              hovered,
            );
      const zIndexForState = (active: boolean, hovered: boolean) =>
        hovered ? 280 : active ? 210 : point.mode === "price" ? 100 : 90;

      const icon =
        point.mode === "price"
          ? makePriceMarkerIcon(google, point.markerLabel, false, false)
          : makeDotMarkerIcon(
              google,
              point.count,
              false,
              point.alwaysShowCount ?? false,
              false,
            );

      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map,
        icon,
        zIndex: zIndexForState(false, false),
        optimized: true,
        title:
          point.mode === "price"
            ? point.markerLabel
            : point.alwaysShowCount
              ? `${point.count} ${point.count === 1 ? "unit" : "units"}`
              : point.count > 1
                ? `${point.count} listings`
                : "Listing",
      });

      marker.addListener("click", () => {
        if (point.navigateHref) {
          router.push(point.navigateHref);
          return;
        }

        if (point.activeKey) {
          if (view === "unit") {
            const nextPropertyId =
              selectedUnitPropertyId === point.activeKey
                ? null
                : point.activeKey;
            activeMapIdRef.current = nextPropertyId;
            setActiveMapId(nextPropertyId);
            setSelectedUnitPropertyId(nextPropertyId);

            if (nextPropertyId) {
              const firstListing = sortedListings.find(
                (listing) => listing.propertyId === nextPropertyId,
              );
              if (firstListing) {
                const node = cardRefs.current[firstListing.id];
                if (node) {
                  node.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }
            }
            return;
          }

          suppressAutoSelectRef.current = false;
          activeMapIdRef.current = point.activeKey;
          setActiveMapId(point.activeKey);

          const node = cardRefs.current[point.activeKey];
          if (node) {
            node.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        const nextZoom = Math.min(20, (map.getZoom() ?? 15) + 1);
        const isClusterPoint =
          point.mode === "dot" && !point.activeKey && !point.navigateHref;
        if (isClusterPoint) {
          const currentZoom = map.getZoom() ?? 15;
          const clusterZoom = Math.min(
            20,
            Math.max(PRICE_MARKER_ZOOM, currentZoom + 1),
          );
          map.setCenter({ lat: point.lat, lng: point.lng });
          map.setZoom(clusterZoom);
          return;
        }

        if (view !== "building" || (!point.activeKey && !point.navigateHref)) {
          map.setCenter({ lat: point.lat, lng: point.lng });
        }
        map.setZoom(nextZoom);
      });

      marker.addListener("mouseover", () => {
        const previouslyHoveredId = hoveredMarkerIdRef.current;
        if (previouslyHoveredId && previouslyHoveredId !== point.id) {
          const previousPoint = renderedMarkerPoints.find(
            (item) => item.id === previouslyHoveredId,
          );
          const previousMarker = markerRefs.current[previouslyHoveredId];
          if (previousPoint && previousMarker) {
            const previousActive =
              previousPoint.activeKey != null &&
              previousPoint.activeKey === activeMapIdRef.current;
            const previousIcon =
              previousPoint.mode === "price"
                ? makePriceMarkerIcon(
                    google,
                    previousPoint.markerLabel,
                    previousActive,
                    false,
                  )
                : makeDotMarkerIcon(
                    google,
                    previousPoint.count,
                    previousActive,
                    previousPoint.alwaysShowCount ?? false,
                    false,
                  );
            previousMarker.setIcon(previousIcon);
            previousMarker.setZIndex(
              previousActive ? 210 : previousPoint.mode === "price" ? 100 : 90,
            );
          }
        }

        hoveredMarkerIdRef.current = point.id;
        const active =
          point.activeKey != null && point.activeKey === activeMapIdRef.current;
        marker.setIcon(iconForState(active, true));
        marker.setZIndex(zIndexForState(active, true));
      });

      marker.addListener("mouseout", () => {
        if (hoveredMarkerIdRef.current === point.id) {
          hoveredMarkerIdRef.current = null;
        }
        const active =
          point.activeKey != null && point.activeKey === activeMapIdRef.current;
        marker.setIcon(iconForState(active, false));
        marker.setZIndex(zIndexForState(active, false));
      });

      markerRefs.current[point.id] = marker;
    });
  }, [
    mapReady,
    renderedMarkerPoints,
    router,
    selectedUnitPropertyId,
    sortedListings,
    view,
  ]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return;

    const google = googleRef.current;

    for (const point of renderedMarkerPoints) {
      const marker = markerRefs.current[point.id];
      if (!marker) continue;

      const hovered = hoveredMarkerIdRef.current === point.id;
      const active = point.activeKey != null && point.activeKey === activeMapId;
      const icon =
        point.mode === "price"
          ? makePriceMarkerIcon(google, point.markerLabel, active, hovered)
          : makeDotMarkerIcon(
              google,
              point.count,
              active,
              point.alwaysShowCount ?? false,
              hovered,
            );
      marker.setIcon(icon);
      marker.setZIndex(
        hovered ? 280 : active ? 210 : point.mode === "price" ? 100 : 90,
      );
    }

    if (view === "building" || !activeMapId) {
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

    const rawViewport = mapViewportFromMap(mapRef.current);
    const mapWidth = mapContainerRef.current?.clientWidth;
    const mapHeight = mapContainerRef.current?.clientHeight;
    const offset =
      rawViewport != null
        ? popupPixelOffsetForPoint(point.popupItem, rawViewport, {
            mapWidth,
            mapHeight,
            popupWidth: 320,
            popupHeight: 300,
            margin: 12,
          })
        : { x: 0, y: -22 };
    infoWindowRef.current?.setOptions({
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(offset.x, offset.y),
    });
    infoWindowRef.current?.setContent(mapPopupHtml(point.popupItem));
    infoWindowRef.current?.open({
      map: mapRef.current,
      anchor: marker,
      shouldFocus: false,
    });
  }, [activeMapId, mapReady, renderedMarkerPoints, view]);

  React.useEffect(() => {
    if (view === "unit") {
      activeMapIdRef.current = selectedUnitPropertyId;
      setActiveMapId(selectedUnitPropertyId);
      return;
    }

    if (!visibleMapPoints.length) {
      activeMapIdRef.current = null;
      setActiveMapId(null);
      return;
    }

    if (suppressAutoSelectRef.current) {
      setActiveMapId((prev) =>
        prev && visibleMapPoints.some((item) => item.id === prev) ? prev : null,
      );
      return;
    }

    setActiveMapId((prev) =>
      prev && visibleMapPoints.some((item) => item.id === prev)
        ? prev
        : visibleMapPoints[0].id,
    );
  }, [selectedUnitPropertyId, view, visibleMapPoints]);

  React.useEffect(() => {
    if (view !== "unit" || !selectedUnitPropertyId) {
      return;
    }
    const stillVisible = sortedListings.some(
      (listing) => listing.propertyId === selectedUnitPropertyId,
    );
    if (!stillVisible) {
      activeMapIdRef.current = null;
      setActiveMapId(null);
      setSelectedUnitPropertyId(null);
    }
  }, [selectedUnitPropertyId, sortedListings, view]);

  React.useEffect(() => {
    if (view === "unit") return;
    if (!selectedUnitPropertyId) return;
    setSelectedUnitPropertyId(null);
  }, [selectedUnitPropertyId, view]);

  React.useEffect(() => {
    if (searchInput.trim() !== "") return;
    if (!activeSearchQuery) return;
    pendingSearchFitNonceRef.current = null;
    setActiveSearchQuery("");
  }, [activeSearchQuery, searchInput]);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return;
    if (!activeSearchQuery || !searchListingsQuery.data) return;
    if (pendingSearchFitNonceRef.current !== searchSubmitNonce) return;

    pendingSearchFitNonceRef.current = null;
    if (!searchListingsQuery.data.items.length) return;

    const bounds = new googleRef.current.maps.LatLngBounds();
    for (const item of searchListingsQuery.data.items) {
      bounds.extend({ lat: item.latitude, lng: item.longitude });
    }
    mapRef.current.fitBounds(bounds, 64);
  }, [
    activeSearchQuery,
    mapReady,
    searchListingsQuery.data,
    searchSubmitNonce,
  ]);

  function handleSearchSubmit() {
    const normalized = searchInput.trim();
    if (!normalized) {
      pendingSearchFitNonceRef.current = null;
      setActiveSearchQuery("");
      return;
    }

    setSelectedUnitPropertyId(null);
    setActiveMapId(null);
    suppressAutoSelectRef.current = false;
    activeMapIdRef.current = null;
    hoveredMarkerIdRef.current = null;
    setActiveSearchQuery(normalized);
    setSearchSubmitNonce((prev) => {
      const next = prev + 1;
      pendingSearchFitNonceRef.current = next;
      return next;
    });
  }

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
    <div className="search-page-motion min-h-dvh bg-[#F5F5F5]">
      <SearchHeader
        query={searchInput}
        onQueryChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onFiltersSave={(f) => setFilters(f)}
      />

      <main className="search-main mx-auto max-w-[1441px] px-4 pb-10 pt-6 sm:px-8 xl:px-[39px]">
        <div className="search-main-grid grid gap-8 xl:grid-cols-[613px_689px] xl:gap-[50px]">
          <SearchResultsColumn
            view={view}
            onViewChange={setView}
            sort={sort}
            onSortChange={setSort}
            totalHomes={totalHomes}
            isLoading={isLoading}
            isError={isError}
            sortedListings={displayedUnitListings}
            sortedBuildings={sortedBuildings}
            activeMapId={activeMapId}
            cardRefs={cardRefs}
            unitFilterSelection={selectedUnitPropertyId}
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

      <style jsx global>{`
        .search-page-motion {
          --search-ease: cubic-bezier(0.22, 1, 0.36, 1);
          --search-dur: 280ms;
        }

        .search-main-grid {
          animation: searchFadeUp 380ms var(--search-ease) both;
        }

        .search-pane-results {
          animation: searchFadeUp 420ms var(--search-ease) 40ms both;
        }

        .search-pane-map {
          animation: searchFadeUp 460ms var(--search-ease) 90ms both;
        }

        .search-results-scroll {
          scroll-behavior: smooth;
        }

        .search-results-grid {
          transition:
            transform var(--search-dur) var(--search-ease),
            opacity var(--search-dur) var(--search-ease);
        }

        .search-ui-control,
        .search-ui-button,
        .search-map-control-btn,
        .search-result-card,
        .search-map-frame {
          transition:
            transform var(--search-dur) var(--search-ease),
            box-shadow var(--search-dur) var(--search-ease),
            background-color var(--search-dur) var(--search-ease),
            border-color var(--search-dur) var(--search-ease),
            color var(--search-dur) var(--search-ease),
            opacity var(--search-dur) var(--search-ease);
        }

        .search-result-card:hover {
          transform: translateY(-2px);
        }

        .search-map-control-btn:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
        }

        .search-map-frame:hover {
          box-shadow: 0 12px 26px rgba(15, 23, 42, 0.12);
        }

        .search-map-canvas .gm-style .gm-style-iw-tc,
        .search-map-canvas .gm-style .gm-style-iw-t::after,
        .search-map-canvas .gm-style .gm-style-iw-t::before {
          display: none !important;
        }

        .search-map-canvas .gm-style .gm-style-iw-c {
          padding-bottom: 0 !important;
        }

        @keyframes searchFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .search-main-grid,
          .search-pane-results,
          .search-pane-map {
            animation: none !important;
          }
          .search-ui-control,
          .search-ui-button,
          .search-map-control-btn,
          .search-result-card,
          .search-map-frame {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
