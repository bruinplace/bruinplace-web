"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ListingCard } from "@/components/listings/ListingCard"

type ListingRowProps = {
  title: string
  listings: any[]
  onSeeMore?: () => void
}

export function ListingRow({ title, listings, onSeeMore }: ListingRowProps) {
  const visible = listings.slice(0, 4)

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>

        <div className="ml-auto">
          <Button
            asChild
            variant="secondary"
            className="h-8 rounded-full bg-[#3EA6FC] px-5 text-white hover:bg-[#3EA6FC]/80"
          >
            <Link
              href="/search"
              onClick={onSeeMore}
              className="inline-flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>See more</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((l) => (
          <ListingCard key={l.id} listing={l} className="w-full" />
        ))}
      </div>
    </section>
  )
}