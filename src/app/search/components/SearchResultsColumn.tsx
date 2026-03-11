import * as React from "react";
import type { MutableRefObject } from "react";
import { ListingCard } from "@/components/listings/ListingCard";
import { BuildingCard } from "@/components/listings/BuildingCard";
import { cn } from "@/lib/utils";
import { topBarLabel } from "../map-utils";
import type {
  BuildingMapModel,
  ListingCardModel,
  SortKey,
  ViewMode,
} from "../types";

type SearchResultsColumnProps = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  totalHomes: number;
  isLoading: boolean;
  isError: boolean;
  sortedListings: ListingCardModel[];
  sortedBuildings: BuildingMapModel[];
  activeMapId: string | null;
  cardRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  unitFilterSelection: string | null;
};

export function SearchResultsColumn({
  view,
  onViewChange,
  sort,
  onSortChange,
  totalHomes,
  isLoading,
  isError,
  sortedListings,
  sortedBuildings,
  activeMapId,
  cardRefs,
  unitFilterSelection,
}: SearchResultsColumnProps) {
  const [unitFilterAnimating, setUnitFilterAnimating] = React.useState(false);

  React.useEffect(() => {
    if (view !== "unit") return;
    setUnitFilterAnimating(true);
    const timeoutId = window.setTimeout(() => {
      setUnitFilterAnimating(false);
    }, 220);
    return () => window.clearTimeout(timeoutId);
  }, [sortedListings.length, unitFilterSelection, view]);

  return (
    <section className="search-pane-results min-w-0">
      <div className="search-results-scroll h-[calc(100dvh-140px)] overflow-y-auto px-1">
        <div className="mb-[14px] flex items-center justify-between">
          <h1 className="text-[20px] font-bold leading-7 text-black">
            {topBarLabel(totalHomes, view)}
          </h1>

          <div className="flex items-center gap-[10px]">
            <label className="search-ui-control inline-flex h-10 items-center gap-1 rounded-[25px] border border-[#71C4FF] bg-white px-4 text-[14px] text-[#0F172A]">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortKey)}
                className="search-ui-control bg-transparent text-[14px] outline-none"
              >
                <option value="recent_desc">Newest</option>
                <option value="recent_asc">Oldest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>

            <div className="search-ui-control inline-flex h-10 rounded-[25px] border border-[#71C4FF] bg-white p-1">
              <button
                type="button"
                onClick={() => onViewChange("building")}
                className={cn(
                  "search-ui-button rounded-[25px] px-3 text-[14px] font-medium leading-5 transition-all",
                  view === "building"
                    ? "bg-[#3EA6FC] text-white"
                    : "text-black hover:bg-[#E8F5FF]",
                )}
              >
                Building
              </button>
              <button
                type="button"
                onClick={() => onViewChange("unit")}
                className={cn(
                  "search-ui-button rounded-[25px] px-3 text-[14px] font-medium leading-5 transition-all",
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

        <div
          className={cn(
            "search-results-grid grid gap-[22px] sm:grid-cols-2",
            view === "unit" &&
              unitFilterAnimating &&
              "translate-y-0.5 opacity-80",
          )}
        >
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
                  const isActive =
                    activeMapId === listing.id ||
                    (!!unitFilterSelection &&
                      listing.propertyId === unitFilterSelection);
                  return (
                    <div
                      key={listing.id}
                      ref={(node) => {
                        cardRefs.current[listing.id] = node;
                      }}
                      className={cn(
                        "search-result-card w-full transition-all duration-200",
                        isActive && "-translate-y-0.5",
                      )}
                    >
                      <ListingCard
                        listing={listing}
                        className={cn(
                          "w-full",
                          isActive && "ring-2 ring-inset ring-[#3EA6FC]",
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
                        "search-result-card w-full transition-all duration-200",
                        isActive && "-translate-y-0.5",
                      )}
                    >
                      <BuildingCard
                        building={building}
                        className={cn(
                          "w-full",
                          isActive && "ring-2 ring-inset ring-[#3EA6FC]",
                        )}
                      />
                    </div>
                  );
                }))}
        </div>
      </div>
    </section>
  );
}
