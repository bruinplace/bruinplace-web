export type SortKey = "price_desc" | "price_asc" | "recent_desc" | "recent_asc";
export type ViewMode = "unit" | "building";

export type ListingCardModel = {
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

export type ApiMapListing = {
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

export type ApiMapListingResponse = {
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

export type ApiSearchListing = {
  id: string;
  property_id: string;
  title: string;
  description: string;
  monthly_rent: number;
  unit_type: string;
  square_feet: number | null;
  status: string;
  created_at: string;
  property_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  relevance_score: number;
};

export type ApiSearchListingResponse = {
  items: ApiSearchListing[];
  total: number;
};

export type MapItem = {
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

export type MapPoint = MapItem & {
  lat: number;
  lng: number;
  unitCount?: number;
};

export type RenderMarkerPoint = {
  id: string;
  lat: number;
  lng: number;
  mode: "dot" | "price";
  markerLabel: string;
  count: number;
  alwaysShowCount?: boolean;
  activeKey?: string;
  navigateHref?: string;
  popupItem?: MapPoint;
};

export type BuildingMapModel = {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewsCount: number;
  images?: string[];
  priceFrom: number;
  createdAt: number;
  lat: number;
  lng: number;
};

export type MapViewport = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

export type GoogleMapsListener = {
  remove: () => void;
};

export type GoogleMapInstance = {
  getZoom: () => number | undefined;
  setZoom: (zoom: number) => void;
  setCenter: (center: { lat: number; lng: number }) => void;
  fitBounds: (bounds: GoogleLatLngBoundsWritable, padding?: number) => void;
  getCenter: () => GoogleLatLng | null;
  getBounds: () => GoogleLatLngBoundsReadable | null | undefined;
  addListener: (eventName: string, handler: () => void) => GoogleMapsListener;
};

export type GoogleMarkerOptions = {
  position: { lat: number; lng: number };
  map: GoogleMapInstance;
  icon: unknown;
  zIndex: number;
  optimized: boolean;
  title: string;
};

export type GoogleMarkerInstance = {
  setMap: (map: GoogleMapInstance | null) => void;
  addListener: (eventName: string, handler: () => void) => GoogleMapsListener;
  setIcon: (icon: unknown) => void;
  setZIndex: (zIndex: number) => void;
  getPosition: () => unknown;
};

export type GoogleLatLngBoundsReadable = {
  getNorthEast: () => GoogleLatLng;
  getSouthWest: () => GoogleLatLng;
};

export type GoogleLatLngBoundsWritable = {
  extend: (point: { lat: number; lng: number }) => void;
};

export type GoogleInfoWindowInstance = {
  setContent: (content: string) => void;
  setOptions: (opts: {
    disableAutoPan?: boolean;
    pixelOffset?: unknown;
  }) => void;
  open: (opts: {
    map: GoogleMapInstance;
    anchor: GoogleMarkerInstance;
    shouldFocus: boolean;
  }) => void;
  close: () => void;
};

export type GoogleMapsGlobal = {
  maps: {
    Map: new (
      el: HTMLElement,
      opts: Record<string, unknown>,
    ) => GoogleMapInstance;
    Marker: new (opts: GoogleMarkerOptions) => GoogleMarkerInstance;
    InfoWindow: new (opts: {
      maxWidth?: number;
      disableAutoPan?: boolean;
      pixelOffset?: unknown;
    }) => GoogleInfoWindowInstance;
    LatLngBounds: new () => GoogleLatLngBoundsWritable;
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
  };
};
