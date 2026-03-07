"use client";

import * as React from "react";
import SearchHeader from "@/components/SearchHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  BuildingCard,
  type Building,
} from "@/components/listings/BuildingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchFilters } from "@/components/search/FiltersDialog";
import { cn } from "@/lib/utils";

type SortKey = "price_desc" | "price_asc" | "recent_desc" | "recent_asc";
type ViewMode = "unit" | "building";

type Listing = {
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

function parseMonthlyPrice(priceLabel: string) {
  const match = priceLabel.match(/\$([\d,]+)/);
  if (!match) return 0;
  return Number(match[1].replace(/,/g, ""));
}

export default function SearchPage() {
  const [sort, _setSort] = React.useState<SortKey>("recent_desc");
  const [query, setQuery] = React.useState("");
  const [_filters, setFilters] = React.useState<SearchFilters | null>(null);
  const [view, setView] = React.useState<ViewMode>("unit");

  const listings: Listing[] = React.useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: String(i + 1),
        priceLabel: "$1,300 per month",
        beds: 4,
        baths: 4,
        sqft: 1238,
        address: "330 De Neve Dr, Los Angeles, CA 90024",
        rating: 4.7,
        reviewsCount: 17,
        images: [],
        // eslint-disable-next-line
        createdAt: Date.now() - i * 1000 * 60 * 60,
      })),
    [],
  );

  const buildings: Building[] = React.useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: String(i + 1),
        name: `Building ${i + 1}`,
        address: "330 De Neve Dr, Los Angeles, CA 90024",
        rating: 4.7,
        reviewsCount: 17,
        images: [],
      })),
    [],
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
                <h1 className="text-lg font-semibold">Over 100 homes</h1>

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
                  {view === "unit"
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
                      ))}
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
