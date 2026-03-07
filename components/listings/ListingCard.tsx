"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type UnitListing = {
  id: string
  priceLabel: string
  beds: number
  baths: number
  sqft: number
  address: string
  rating: number
  reviewsCount: number
  images?: string[]
}

export function ListingCard({
  listing,
  className,
}: {
  listing: UnitListing
  className?: string
}) {
  const images = listing.images?.length ? listing.images : []
  const [active, setActive] = React.useState(0)

  function prev() {
    if (!images.length) return
    setActive((i) => (i - 1 + images.length) % images.length)
  }
  function next() {
    if (!images.length) return
    setActive((i) => (i + 1) % images.length)
  }

  function stopLink(e: React.SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <Card
        className={cn(
          "w-full rounded-2xl p-3 shadow-lg transition hover:shadow-xl",
          className
        )}
      >
        <div className="space-y-3">
          {/* Image */}
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <AspectRatio ratio={16 / 10}>
              {images.length ? (
                <Image
                  src={images[active]}
                  alt={listing.address}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 360px, 100vw"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </AspectRatio>

            {/* Like */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                stopLink(e)
              }}
              className="absolute right-3 top-3 h-9 w-9 rounded-full bg-background/70 backdrop-blur hover:bg-background/80"
              aria-label="Save listing"
            >
              <Heart className="h-5 w-5" />
            </Button>

            {/* Carousel arrows */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                stopLink(e)
                prev()
              }}
              className={cn(
                "absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur hover:bg-background/80",
                !images.length && "pointer-events-none opacity-0"
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                stopLink(e)
                next()
              }}
              className={cn(
                "absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur hover:bg-background/80",
                !images.length && "pointer-events-none opacity-0"
              )}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.slice(0, 6).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      i === active ? "bg-foreground/80" : "bg-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm font-semibold leading-none">
                {listing.priceLabel}
              </div>

              <div className="flex items-center gap-1 text-xs font-medium">
                <Star className="h-3 w-3 fill-current text-muted-foreground" />
                <span>{listing.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({listing.reviewsCount})
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs">
                {listing.beds} bd &nbsp;|&nbsp; {listing.baths} ba &nbsp;|&nbsp;{" "}
                {listing.sqft.toLocaleString()} sq ft
              </div>
              <div className="text-xs text-muted-foreground">{listing.address}</div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}