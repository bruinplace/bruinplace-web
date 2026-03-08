"use client";

import Link from "next/link";
import { type SyntheticEvent, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

type ListingType = "sublets" | "leases";

type FavoriteListing = {
  id: string;
  type: ListingType;
  priceText: string;
  metaLeft: string;   // e.g., "4 bd | 3 ba | 1,328 sq ft"
  metaRight: string;  // e.g., "4/7 ★"
  address: string;
};

const MOCK_FAVORITES: FavoriteListing[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `${i + 1}`,
  type: i % 2 === 0 ? "sublets" : "leases",
  priceText: "$1,300 per month",
  metaLeft: "4 bd | 3 ba | 1,328 sq ft",
  metaRight: "4.7 ★",
  address: "330 De Neve Dr, Los Angeles, CA 90024",
}));

export default function FavoritedListingsPanel() {
  const [activeType, setActiveType] = useState<ListingType>("sublets");
  const [favorites, setFavorites] = useState<FavoriteListing[]>(MOCK_FAVORITES);

  function unfavoriteListing(id: string) {
    setFavorites((prev) => prev.filter((listing) => listing.id !== id));
  }

  const listings = useMemo(
    () => favorites.filter((l) => l.type === activeType),
    [activeType, favorites]
  );

  return (
    <div className="mt-4 grid grid-cols-[140px_1fr] gap-8">
      {/* Left filter */}
      <div className="relative">
        <div className="text-xs text-zinc-500"> </div>

        <div className="mt-2 space-y-1 text-sm">
          <button
            onClick={() => setActiveType("sublets")}
            className={cn(
              "relative w-full rounded-md px-3 py-2 text-left",
              activeType === "sublets" ? "bg-sky-50 text-zinc-900" : "text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {activeType === "sublets" && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-sky-500" />
            )}
            <span className="pl-2">Sublets</span>
          </button>

          <button
            onClick={() => setActiveType("leases")}
            className={cn(
              "relative w-full rounded-md px-3 py-2 text-left",
              activeType === "leases" ? "bg-sky-50 text-zinc-900" : "text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {activeType === "leases" && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-sky-500" />
            )}
            <span className="pl-2">Leases</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <FavoriteCard key={l.id} listing={l} onUnfavorite={unfavoriteListing} />
        ))}

        {!listings.length && (
          <div className="rounded-xl border border-dashed bg-white px-5 py-10 text-sm text-zinc-500 sm:col-span-2 lg:col-span-3">
            No favorited {activeType} yet.
          </div>
        )}
      </div>
    </div>
  );
}

function FavoriteCard({
  listing,
  onUnfavorite,
}: {
  listing: FavoriteListing;
  onUnfavorite: (id: string) => void;
}) {
  const [favorited, setFavorited] = useState(true);
  const [removing, setRemoving] = useState(false);

  function stopLink(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleUnfavorite(e: SyntheticEvent) {
    stopLink(e);
    if (removing) return;

    // Let the heart visibly toggle off before we animate/remove the card.
    setFavorited(false);
    window.setTimeout(() => setRemoving(true), 120);
    window.setTimeout(() => onUnfavorite(listing.id), 260);
  }

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "block rounded-xl border bg-white shadow-sm transition hover:shadow-md",
        "duration-200",
        removing && "scale-[0.98] opacity-0 pointer-events-none"
      )}
    >
      {/* image placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-zinc-100">
        <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">
          image
        </div>

        {/* heart icon */}
        <button
          type="button"
          onClick={handleUnfavorite}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow"
          aria-label="Unfavorite"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors duration-150",
              favorited ? "fill-[#71C4FF] text-[#71C4FF]" : "text-zinc-400"
            )}
          />
        </button>
      </div>

      {/* content */}
      <div className="p-4">
        <div className="text-xs font-semibold text-zinc-900">{listing.priceText}</div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
          <span>{listing.metaLeft}</span>
          <span>{listing.metaRight}</span>
        </div>

        <div className="mt-2 text-[10px] text-zinc-400">{listing.address}</div>
      </div>
    </Link>
  );
}
