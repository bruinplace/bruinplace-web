"use client"

import * as React from "react"
import Header from "@/components/Header"
import { ListingCard } from "@/components/listings/ListingCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FiltersDialog, type SearchFilters } from "@/components/search/FiltersDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, SlidersHorizontal } from "lucide-react"

type SortKey = "price_desc" | "price_asc" | "recent_desc" | "recent_asc"

type Listing = {
  id: string
  priceLabel: string 
  beds: number
  baths: number
  sqft: number
  address: string
  rating: number
  reviewsCount: number
  images?: string[]
  createdAt: number
}

function parseMonthlyPrice(priceLabel: string) {
  const match = priceLabel.match(/\$([\d,]+)/)
  if (!match) return 0
  return Number(match[1].replace(/,/g, ""))
}

export default function SearchPage() {
  const [sort, setSort] = React.useState<SortKey>("recent_desc")

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
        createdAt: Date.now() - i * 1000 * 60 * 60, // mock "recency"
      })),
    []
  )

  const sorted = React.useMemo(() => {
    const arr = [...listings]
    switch (sort) {
      case "price_desc":
        arr.sort((a, b) => parseMonthlyPrice(b.priceLabel) - parseMonthlyPrice(a.priceLabel))
        return arr
      case "price_asc":
        arr.sort((a, b) => parseMonthlyPrice(a.priceLabel) - parseMonthlyPrice(b.priceLabel))
        return arr
      case "recent_desc":
        arr.sort((a, b) => b.createdAt - a.createdAt)
        return arr
      case "recent_asc":
        arr.sort((a, b) => a.createdAt - b.createdAt)
        return arr
      default:
        return arr
    }
  }, [listings, sort])

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px]">
          {/* LEFT: listings */}
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h1 className="text-sm font-medium text-muted-foreground">
                Explore 2000 listings near UCLA
              </h1>

              <div className="flex items-center gap-3">
                {/* Yellow square (hamburger) */}
                <SortDropdown value={sort} onChange={setSort} />

                {/* Blue square (filters icon) - optional */}
                <FiltersDialog
                  trigger={
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-12 w-12 rounded-2xl bg-[#71C4FF] text-white hover:bg-[#71C4FF]/90"
                      aria-label="Filters"
                    >
                      <SlidersHorizontal className="h-6 w-6" />
                    </Button>
                  }
                  onSave={(filters: SearchFilters) => {
                    console.log("filters saved:", filters)
                  }}
                />
              </div>
            </div>

            {/* Scroll area for left column */}
            <div className="h-[calc(100dvh-170px)] overflow-y-auto pr-1">
              <div className="grid gap-6 sm:grid-cols-2">
                {sorted.map((l) => (
                  <ListingCard key={l.id} listing={l} className="w-full" />
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT: map */}
          <aside className="hidden lg:block">
            <div className="sticky top-[110px]">
              <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
                {/* map search overlay */}
                <div className="absolute left-3 top-3 z-10 flex w-[260px] items-center gap-2 rounded-full bg-background/90 p-1 shadow-sm backdrop-blur">
                  <Input
                    placeholder="Search"
                    className="h-8 border-0 bg-transparent px-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button size="icon" className="h-8 w-8 rounded-full" aria-label="Search map">
                    {/* Just a decorative button for now */}
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
  )
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (v: SortKey) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-2xl bg-[#71C4FF] text-white hover:bg-[#F5C35B]"
          aria-label="Sort"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={10}
        className="w-64 rounded-2xl border-2 p-2 shadow-none"
      >
        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2 text-base"
          onSelect={() => onChange("price_desc")}
        >
          Price (high to low)
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2 text-base"
          onSelect={() => onChange("price_asc")}
        >
          Price (low to high)
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2 text-base"
          onSelect={() => onChange("recent_desc")}
        >
          Most recent
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2 text-base"
          onSelect={() => onChange("recent_asc")}
        >
          Least recent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}