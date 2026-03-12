import * as React from "react";
import { api } from "@/lib/api";

type ListingImageTarget = {
  listingId: string;
  propertyId: string;
};

type ApiImageItem = {
  url: string;
  low_res_url?: string | null;
  display_order: number;
};

type ApiImageListResponse = {
  items: ApiImageItem[];
  total: number;
};

const FETCH_CHUNK_SIZE = 10;

function sortImageUrls(items: ApiImageItem[] | undefined): string[] {
  return (items ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => item.low_res_url ?? item.url)
    .filter(Boolean);
}

export function useListingImageMap(targets: ListingImageTarget[]) {
  const [imagesByListingId, setImagesByListingId] = React.useState<
    Record<string, string[]>
  >({});

  const inFlightListingIdsRef = React.useRef<Set<string>>(new Set());
  const propertyImagesCacheRef = React.useRef<Record<string, string[]>>({});
  const propertyRequestsRef = React.useRef<Map<string, Promise<string[]>>>(
    new Map(),
  );

  const uniqueTargets = React.useMemo(() => {
    const byListingId = new Map<string, ListingImageTarget>();
    for (const target of targets) {
      if (!target.listingId) continue;
      byListingId.set(target.listingId, target);
    }
    return Array.from(byListingId.values());
  }, [targets]);

  React.useEffect(() => {
    const pendingTargets = uniqueTargets.filter(
      (target) =>
        imagesByListingId[target.listingId] === undefined &&
        !inFlightListingIdsRef.current.has(target.listingId),
    );

    if (!pendingTargets.length) return;

    let cancelled = false;

    async function getPropertyImages(propertyId: string): Promise<string[]> {
      const cached = propertyImagesCacheRef.current[propertyId];
      if (cached) return cached;

      const existingRequest = propertyRequestsRef.current.get(propertyId);
      if (existingRequest) return existingRequest;

      const request = api
        .get<ApiImageListResponse>(`/properties/${propertyId}/images`)
        .then((response) => sortImageUrls(response.items))
        .catch(() => [])
        .finally(() => {
          propertyRequestsRef.current.delete(propertyId);
        });

      propertyRequestsRef.current.set(propertyId, request);
      const urls = await request;
      propertyImagesCacheRef.current[propertyId] = urls;
      return urls;
    }

    async function fetchListingImages(
      listingId: string,
      propertyId: string,
    ): Promise<string[]> {
      const listingUrls = await api
        .get<ApiImageListResponse>(`/listings/${listingId}/images`)
        .then((response) => sortImageUrls(response.items))
        .catch(() => []);

      if (listingUrls.length) return listingUrls;
      if (!propertyId) return [];

      return getPropertyImages(propertyId);
    }

    async function run() {
      for (let i = 0; i < pendingTargets.length; i += FETCH_CHUNK_SIZE) {
        const chunk = pendingTargets.slice(i, i + FETCH_CHUNK_SIZE);
        chunk.forEach((target) =>
          inFlightListingIdsRef.current.add(target.listingId),
        );

        const results = await Promise.allSettled(
          chunk.map((target) =>
            fetchListingImages(target.listingId, target.propertyId),
          ),
        );

        if (cancelled) return;

        const update: Record<string, string[]> = {};
        results.forEach((result, index) => {
          const listingId = chunk[index].listingId;
          inFlightListingIdsRef.current.delete(listingId);
          update[listingId] = result.status === "fulfilled" ? result.value : [];
        });

        setImagesByListingId((prev) => ({ ...prev, ...update }));
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [uniqueTargets, imagesByListingId]);

  return imagesByListingId;
}

export type { ListingImageTarget };
