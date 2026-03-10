"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import SearchHeader from "@/components/SearchHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  BuildingCard,
  type Building,
} from "@/components/listings/BuildingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchFilters } from "@/components/search/FiltersDialog";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

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

export default function SearchPage() {
  const [sort] = React.useState<SortKey>("recent_desc");
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<SearchFilters | null>(null);
  const [view, setView] = React.useState<ViewMode>("unit");

  const listingsPath = React.useMemo(
    () =>
      buildPath("/listings", {
        search: query || undefined,
        min_rent: filters?.priceMin,
        max_rent: filters?.priceMax,
        limit: 50,
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
        return {
          id: item.id,
          priceLabel: `$${item.monthly_rent.toLocaleString()} per month`,
          beds: unitTypeToBeds(item.unit_type),
          baths: unitTypeToBaths(item.unit_type),
          sqft: item.square_feet ?? 0,
          address,
          rating: 0,
          reviewsCount: 0,
          images: [],
          createdAt: Date.parse(item.created_at) || 0,
        };
      }),
    [listingsQuery.data?.items, propertyById],
  );

  const buildings: Building[] = React.useMemo(
    () =>
      (propertiesQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        address: `${item.address}, ${item.city}, ${item.state} ${item.postal_code}`,
        rating: 0,
        reviewsCount: 0,
        images: [],
      })),
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

  return (
    <div className="min-h-dvh bg-background">
      {/* New header for this page */}
      <SearchHeader
        query={query}
        onQueryChange={setQuery}
        onFiltersSave={(f) => setFilters(f)}
      />

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_680px]">
          {/* LEFT: listings */}
          <section className="min-w-0">
            <div className="h-[calc(100dvh-170px)] overflow-y-auto pr-1">
              {/* FULL-WIDTH HEADER */}
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-lg font-semibold">{totalHomes} homes</h1>

                <div className="inline-flex rounded-full border border-[#71C4FF] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setView("building")}
                    className={cn(
                      "h-8 rounded-full px-4 text-sm font-medium transition",
                      view === "building"
                        ? "bg-[#71C4FF] text-white"
                        : "bg-transparent text-black hover:bg-[#71C4FF]",
                    )}
                  >
                    Building
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("unit")}
                    className={cn(
                      "h-8 rounded-full px-4 text-sm font-medium transition",
                      view === "unit"
                        ? "bg-[#71C4FF] text-white"
                        : "bg-transparent text-black hover:bg-[#71C4FF]",
                    )}
                  >
                    Unit
                  </button>
                </div>
              </div>

              <div className="mx-auto max-w-[860px]">
                <div className="grid gap-6 justify-center sm:grid-cols-[repeat(2,minmax(0,360px))]">
                  {isLoading && (
                    <div className="rounded-xl border p-4 text-sm text-zinc-600">
                      Loading results...
                    </div>
                  )}
                  {isError && (
                    <div className="rounded-xl border p-4 text-sm text-red-600">
                      Failed to load search results.
                    </div>
                  )}
                  {!isLoading &&
                    !isError &&
                    view === "unit" &&
                    sorted.length === 0 && (
                      <div className="rounded-xl border p-4 text-sm text-zinc-600">
                        No listings found.
                      </div>
                    )}
                  {!isLoading &&
                    !isError &&
                    view === "building" &&
                    buildings.length === 0 && (
                      <div className="rounded-xl border p-4 text-sm text-zinc-600">
                        No buildings found.
                      </div>
                    )}
                  {!isLoading &&
                    !isError &&
                    (view === "unit"
                      ? sorted.map((l) => (
                          <ListingCard
                            key={l.id}
                            listing={l}
                            className="w-full"
                          />
                        ))
                      : buildings.map((b) => (
                          <BuildingCard
                            key={b.id}
                            building={b}
                            className="w-full"
                          />
                        )))}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: map */}
          <aside className="hidden lg:block">
            <div className="sticky top-[110px]">
              <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="absolute left-3 top-3 z-10 flex w-[260px] items-center gap-2 rounded-full bg-background/90 p-1 shadow-sm backdrop-blur">
                  <Input
                    placeholder="Search"
                    className="h-8 border-0 bg-transparent px-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    aria-label="Search map"
                  >
                    <span className="text-xs font-semibold">Go</span>
                  </Button>
                </div>

                <div className="aspect-[4/3] w-full bg-muted">
                  <iframe
                    title="Map"
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=UCLA&z=15&output=embed"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
