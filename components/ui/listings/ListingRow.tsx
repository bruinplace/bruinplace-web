"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ListingCard } from "@/components/ui/listings/ListingCard"

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
            type="button"
            onClick={onSeeMore}
            className="h-8 rounded-full px-5 text-white bg-[#3EA6FC] hover:bg-[#3EA6FC]/80"
            variant="secondary"
          >
            <Search className="mr-2 h-2 w-4" />
            See more
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