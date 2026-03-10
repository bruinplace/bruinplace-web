"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { QueryKeys } from "@/lib/query-keys";
import { useSavedListings } from "@/hooks/use-saved-listings";

type ListingType = "sublets" | "leases";

type FavoriteListing = {
  id: string;
  type: ListingType;
  priceText: string;
  metaLeft: string;
  metaRight: string;
  address: string;
};

export default function FavoritedListingsPanel() {
  const [activeType, setActiveType] = useState<ListingType>("sublets");
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSavedListings();

  const unsaveMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await api.delete(`/me/saved-listings/${listingId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.SAVED_LISTINGS],
      });
    },
  });

  const allSavedListings = useMemo<FavoriteListing[]>(
    () =>
      (data?.items ?? []).map((item) => ({
        id: item.id,
        type: "leases",
        priceText: `$${item.monthly_rent.toLocaleString()} per month`,
        metaLeft: `${item.unit_type} | ${item.square_feet ?? "-"} sq ft`,
        metaRight: item.status,
        address: `Property ID: ${item.property_id}`,
      })),
    [data?.items],
  );

  const listings = useMemo(
    () => allSavedListings.filter((l) => l.type === activeType),
    [activeType, allSavedListings],
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
              activeType === "sublets"
                ? "bg-sky-50 text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-50",
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
              activeType === "leases"
                ? "bg-sky-50 text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-50",
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
        {activeType === "sublets" && (
          <div className="rounded-xl border p-4 text-sm text-zinc-600">
            Sublets are not connected yet.
          </div>
        )}

        {activeType === "leases" && isLoading && (
          <div className="rounded-xl border p-4 text-sm text-zinc-600">
            Loading saved listings...
          </div>
        )}

        {activeType === "leases" && isError && (
          <div className="rounded-xl border p-4 text-sm text-red-600">
            Could not load saved listings.
          </div>
        )}

        {activeType === "leases" &&
          !isLoading &&
          !isError &&
          !listings.length && (
            <div className="rounded-xl border p-4 text-sm text-zinc-600">
              No saved listings yet.
            </div>
          )}

        {activeType === "leases" &&
          listings.map((l) => (
            <FavoriteCard
              key={l.id}
              listing={l}
              onUnfavorite={() => unsaveMutation.mutate(l.id)}
              pending={unsaveMutation.isPending}
            />
          ))}
      </div>
    </div>
  );
}

function FavoriteCard({
  listing,
  onUnfavorite,
  pending,
}: {
  listing: FavoriteListing;
  onUnfavorite: () => void;
  pending: boolean;
}) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="rounded-xl border bg-white shadow-sm"
    >
      {/* image placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-zinc-100">
        <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">
          image
        </div>

        {/* heart icon */}
        <button
          type="button"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow"
          aria-label="Unfavorite"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUnfavorite();
          }}
        >
          <Heart className="h-4 w-4 text-zinc-600" />
        </button>
      </div>

      {/* content */}
      <div className="p-4">
        <div className="text-xs font-semibold text-zinc-900">
          {listing.priceText}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
          <span>{listing.metaLeft}</span>
          <span>{listing.metaRight}</span>
        </div>

        <div className="mt-2 text-[10px] text-zinc-400">{listing.address}</div>
      </div>
    </Link>
  );
}
