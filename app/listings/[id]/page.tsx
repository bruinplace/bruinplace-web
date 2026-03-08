"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ReviewModal } from "@/components/reviews/AddReviewModal"
import { ReviewPopupModal } from "@/components/reviews/ReviewPopupModal"
import { GalleryPopup } from "@/components/listings/GalleryPopup"
import { cn } from "@/lib/utils"
import {
  Heart,
  Share2,
  Star,
  Shield,
  Wind,
  Droplets,
  Sparkles,
  Trees,
  Mail,
  Phone,
  BoxIcon,
  Search,
  Building2,
  Volume2,
  CalendarClock,
} from "lucide-react"

type Listing = {
  id: string
  priceLabel: string
  beds: number
  baths: number
  sqft: number
  address: string
  rating: number
  reviewsCount: number
}

type Review = {
  id: string
  name: string
  dateLabel: string
  rating: number
  text: string
  tags: string[]
}

type SortKey = "newest" | "highest" | "lowest"

const MOCK_LISTING: Listing = {
  id: "1",
  priceLabel: "$1,450 per month",
  beds: 3,
  baths: 2,
  sqft: 1347,
  address: "10580 Wilshire Blvd, Los Angeles, CA 90024",
  rating: 4.4,
  reviewsCount: 3,
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Josie Bruin",
    dateLabel: "2024 · 3 months ago",
    rating: 4,
    text:
      "Nice place, commute was easier and there are plenty of food spots nearby. The unit was clean and management was responsive.",
    tags: ["Management 5/5", "Cleanliness 4/5", "Noise level 3/5", "Lease flexibility 4/5"],
  },
  {
    id: "r2",
    name: "Scotty Highlander",
    dateLabel: "2023 · 1 year ago",
    rating: 5,
    text: "Great spot. The pool area is nice and the gym is decent. A bit of street noise during rush hour.",
    tags: ["Management 4/5", "Cleanliness 5/5", "Noise level 3/5", "Lease flexibility 5/5"],
  },
  {
    id: "r3",
    name: "King Triton",
    dateLabel: "2022 · 2 years ago",
    rating: 4,
    text: "Solid apartment overall. Maintenance was quick and the location is hard to beat. Parking can be tight.",
    tags: ["Management 4/5", "Cleanliness 4/5", "Noise level 4/5", "Lease flexibility 4/5"],
  },
]

const LISTING_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1800&q=70",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=70",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1800&q=70",
  "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d82?auto=format&fit=crop&w=1800&q=70",
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1800&q=70",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=70",
]

const REVIEW_MODAL_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d82?auto=format&fit=crop&w=1400&q=60",
]

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function yearFromDateLabel(label: string) {
  const match = label.match(/\d{4}/)
  return match ? Number(match[0]) : 0
}

function Stars({ value, size = 22 }: { value: number; size?: number }) {
  const full = Math.floor(value)
  const frac = value - full

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full
        const isPartial = i === full && frac > 0

        if (isFull) {
          return (
            <Star
              key={i}
              className="text-[#F6C24A]"
              style={{ width: size, height: size }}
              fill="currentColor"
            />
          )
        }

        if (isPartial) {
          const pct = Math.round(frac * 100)

          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                className="text-muted-foreground/40"
                style={{ width: size, height: size }}
                fill="none"
              />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
                <Star
                  className="text-[#F6C24A]"
                  style={{ width: size, height: size }}
                  fill="currentColor"
                />
              </span>
            </span>
          )
        }

        return (
          <Star
            key={i}
            className="text-muted-foreground/40"
            style={{ width: size, height: size }}
            fill="none"
          />
        )
      })}
    </div>
  )
}

function RatingBars() {
  const rows = [
    { label: "5 stars", pct: 0.72 },
    { label: "4 stars", pct: 0.55 },
    { label: "3 stars", pct: 0.18 },
    { label: "2 stars", pct: 0.08 },
    { label: "1 star", pct: 0.12 },
  ]

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[64px_1fr] items-center gap-3">
          <div className="text-xs text-muted-foreground">{r.label}</div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-[#71C4FF]" style={{ width: `${Math.round(r.pct * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function RecommendedCard({ id }: { id: string }) {
  const [saved, setSaved] = React.useState(false)

  function stopLink(e: React.SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link href={`/listings/${id}`} className="block">
      <Card className="rounded-2xl p-3 shadow-lg transition hover:shadow-xl">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <div className="aspect-[16/10]">
              <img
                src={LISTING_GALLERY_IMAGES[Number(id) % LISTING_GALLERY_IMAGES.length]}
                alt="Recommended listing"
                className="h-full w-full object-cover"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                stopLink(e)
                setSaved((prev) => !prev)
              }}
              className="absolute right-3 top-3 h-9 w-9 rounded-full bg-background/70 backdrop-blur hover:bg-background/80"
              aria-label="Save listing"
            >
              <Heart className={cn("h-5 w-5", saved && "fill-[#71C4FF] text-[#71C4FF]")} />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-semibold leading-none">$1,342 per month</div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="h-4 w-4 text-muted-foreground" fill="currentColor" />
                <span>4.2</span>
                <span className="text-muted-foreground">(17)</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm">2 bd | 2 ba | 1,460 sq ft</div>
              <div className="text-xs text-muted-foreground">10200 Westwood Blvd, Los Angeles, CA 90024</div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const { id } = params
  const listing = { ...MOCK_LISTING, id }
  const [saved, setSaved] = React.useState(false)
  const [shareState, setShareState] = React.useState<"idle" | "copied" | "shared">("idle")
  const [galleryOpen, setGalleryOpen] = React.useState(false)
  const [galleryIndex, setGalleryIndex] = React.useState(0)
  const [addReviewOpen, setAddReviewOpen] = React.useState(false)
  const [selectedReview, setSelectedReview] = React.useState<Review | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false)
  const [activeThumbIndex, setActiveThumbIndex] = React.useState(0)
  const [reviewQuery, setReviewQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortKey>("newest")

  const listerEmail = "joe.bruin@email.com"
  const listerPhone = "(323) 555-0199"

  const sortLabel = sortBy === "newest" ? "Newest" : sortBy === "highest" ? "Highest rating" : "Lowest rating"

  const visibleReviews = React.useMemo(() => {
    const query = reviewQuery.trim().toLowerCase()
    const filtered = MOCK_REVIEWS.filter((review) => {
      if (!query) return true
      const haystack = `${review.name} ${review.dateLabel} ${review.text} ${review.tags.join(" ")}`.toLowerCase()
      return haystack.includes(query)
    })

    const sorted = [...filtered]
    if (sortBy === "newest") {
      sorted.sort((a, b) => yearFromDateLabel(b.dateLabel) - yearFromDateLabel(a.dateLabel))
    } else if (sortBy === "highest") {
      sorted.sort((a, b) => b.rating - a.rating)
    } else {
      sorted.sort((a, b) => a.rating - b.rating)
    }

    return sorted
  }, [reviewQuery, sortBy])

  const reviewChips = selectedReview
    ? selectedReview.tags.slice(0, 4).map((label, idx) => {
        const icons = [
          <Building2 key="management" className="h-4 w-4" />,
          <Sparkles key="cleanliness" className="h-4 w-4" />,
          <Volume2 key="noise" className="h-4 w-4" />,
          <CalendarClock key="lease" className="h-4 w-4" />,
        ]
        return { icon: icons[idx], label }
      })
    : []

  const galleryPrice = listing.priceLabel.match(/\$[\d,]+/)?.[0] ?? listing.priceLabel

  React.useEffect(() => {
    if (shareState === "idle") return
    const timeout = window.setTimeout(() => setShareState("idle"), 2000)
    return () => window.clearTimeout(timeout)
  }, [shareState])

  const onSeeMore = () => {}

  const openReviewModal = (review: Review) => {
    setSelectedReview(review)
    setActiveThumbIndex(0)
    setReviewModalOpen(true)
  }

  const openGalleryAt = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const cycleSort = () => {
    setSortBy((prev) => {
      if (prev === "newest") return "highest"
      if (prev === "highest") return "lowest"
      return "newest"
    })
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const payload = {
      title: "BruinPlace listing",
      text: `Check out this listing: ${listing.address}`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(payload)
        setShareState("shared")
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setShareState("copied")
      }
    } catch {
      setShareState("idle")
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[1300px] px-6 py-8">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <button
            type="button"
            onClick={() => openGalleryAt(0)}
            className="relative overflow-hidden rounded-2xl bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="aspect-[16/9] max-h-[520px] w-full">
              <img src={LISTING_GALLERY_IMAGES[0]} alt={listing.address} className="h-full w-full object-cover" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {LISTING_GALLERY_IMAGES.slice(1, 5).map((image, i) => (
              <div
                key={image}
                role="button"
                tabIndex={0}
                onClick={() => openGalleryAt(i + 1)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    openGalleryAt(i + 1)
                  }
                }}
                className="relative overflow-hidden rounded-2xl bg-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="aspect-[16/9]">
                  <img src={image} alt={`Listing photo ${i + 2}`} className="h-full w-full object-cover" />
                </div>

                {i === 3 && (
                  <div className="absolute bottom-3 right-3">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openGalleryAt(0)
                      }}
                      className="rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]/90"
                    >
                      See all photos
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="min-w-0">
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <Stars value={listing.rating} size={32} />
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-semibold">{listing.rating.toFixed(1)}</div>
                  <div className="text-xl text-muted-foreground">({listing.reviewsCount})</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="text-4xl font-semibold tracking-tight">{listing.priceLabel}</div>

                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    aria-label="Save listing"
                    onClick={() => setSaved((prev) => !prev)}
                    className="text-[#71C4FF] hover:opacity-80 transition"
                  >
                    <Heart className={cn("h-9 w-9", saved && "fill-current")} />
                  </button>
                  <button
                    type="button"
                    aria-label="Share listing"
                    onClick={handleShare}
                    className="text-[#71C4FF] hover:opacity-80 transition"
                  >
                    <Share2 className="h-9 w-9" />
                  </button>
                </div>
              </div>

              {shareState !== "idle" ? (
                <div className="mt-2 text-sm text-[#3EA6FC]">
                  {shareState === "copied" ? "Listing link copied." : "Share flow opened."}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-6 text-2xl">
                <span>
                  <span className="font-semibold">{listing.beds}</span> bd
                </span>
                <span className="text-muted-foreground">|</span>
                <span>
                  <span className="font-semibold">{listing.baths}</span> ba
                </span>
                <span className="text-muted-foreground">|</span>
                <span>
                  <span className="font-semibold">{listing.sqft.toLocaleString()}</span> sq ft
                </span>
              </div>

              <div className="mt-6 text-2xl text-muted-foreground">{listing.address}</div>
            </div>

            <div className="mt-10">
              <div className="h-px w-full bg-border" />

              <h2 className="mt-10 text-3xl font-semibold tracking-tight">Highlights</h2>

              <div className="mt-10 grid gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-3">
                <HighlightPlain icon={<Shield className="h-10 w-10" />} label="Security" />
                <HighlightPlain icon={<Trees className="h-10 w-10" />} label="Hardwood flooring" />
                <HighlightPlain icon={<Sparkles className="h-10 w-10" />} label="Curated art" />
                <HighlightPlain icon={<Droplets className="h-10 w-10" />} label="In-unit washer & dryer" />
                <HighlightPlain icon={<BoxIcon className="h-10 w-10" />} label="Internet" />
                <HighlightPlain icon={<Wind className="h-10 w-10" />} label="AC" />
              </div>

              <p className="mt-10 text-lg leading-8 text-muted-foreground">
                Placeholder description text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              </p>

              <div className="mt-12 h-px w-full bg-border" />
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-semibold">Location</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
                <div className="aspect-[16/7] w-full bg-muted">
                  <iframe
                    title="Map"
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=UCLA&z=14&output=embed"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 p-4">
                  <Badge variant="secondary" className="rounded-full">
                    Distance from Bruin Bear
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    12 min walk
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    5 min drive
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    7 min scooter
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Reviews ({visibleReviews.length})</h2>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="rounded-full" onClick={() => setAddReviewOpen(true)}>
                    Add review
                  </Button>
                  <Button variant="secondary" className="rounded-full" onClick={cycleSort}>
                    Sort: {sortLabel}
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {visibleReviews.map((r) => (
                    <Card
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openReviewModal(r)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openReviewModal(r)
                        }
                      }}
                      className="rounded-2xl p-4 cursor-pointer transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.dateLabel}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} size={22} />
                          <span className="ml-2 text-sm font-medium">{r.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{r.text}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="rounded-full">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}

                  {!visibleReviews.length ? (
                    <Card className="rounded-2xl p-4 text-sm text-muted-foreground">
                      No reviews match your search.
                    </Card>
                  ) : null}
                </div>

                <Card className="h-fit rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-semibold">{listing.rating.toFixed(1)}</div>
                    <div>
                      <Stars value={listing.rating} />
                      <div className="text-xs text-muted-foreground">{listing.reviewsCount} reviews</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <RatingBars />
                  </div>
                  <div className="mt-4">
                    <Input
                      value={reviewQuery}
                      onChange={(e) => setReviewQuery(e.target.value)}
                      placeholder="Search reviews…"
                      className="rounded-full"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </section>

          <aside className="block">
            <div className="sticky top-6">
              <Card className="rounded-2xl p-5">
                <div className="text-sm font-semibold">Contact this lister</div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-semibold">JB</div>
                  <div>
                    <div className="text-sm font-semibold">Joe Bruin</div>
                    <div className="text-xs text-muted-foreground">Verified</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <a href={`mailto:${listerEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Mail className="h-4 w-4" />
                    {listerEmail}
                  </a>
                  <a href={`tel:${listerPhone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Phone className="h-4 w-4" />
                    {listerPhone}
                  </a>
                </div>

                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full rounded-2xl bg-[#71C4FF] text-white hover:bg-[#71C4FF]/90">
                    <a
                      href={`mailto:${listerEmail}?subject=${encodeURIComponent(`BruinPlace listing ${listing.id}`)}&body=${encodeURIComponent(`Hi, I am interested in ${listing.address}.`)}`}
                    >
                      Message
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="w-full rounded-2xl">
                    <a
                      href={`mailto:${listerEmail}?subject=${encodeURIComponent(`Tour request for listing ${listing.id}`)}&body=${encodeURIComponent(`Hi, I'd like to request a tour for ${listing.address}.`)}`}
                    >
                      Request tour
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      <section className="mt-24 w-full bg-[#EAF6FF] py-16">
        <div className="mx-auto max-w-[1300px] px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recommended listings</h2>

            <Button
              asChild
              variant="secondary"
              className="h-8 rounded-full bg-[#3EA6FC] px-5 text-white hover:bg-[#3EA6FC]/80"
            >
              <Link href="/search" onClick={onSeeMore} className="inline-flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>See more</span>
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecommendedCard key={i} id={String(i + 10)} />
            ))}
          </div>
        </div>
      </section>

      <ReviewPopupModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        chips={reviewChips}
        user={{
          initials: getInitials(selectedReview?.name ?? ""),
          name: selectedReview?.name ?? "",
          years: `Posted ${selectedReview?.dateLabel ?? ""}`,
        }}
        rating={selectedReview?.rating ?? 0}
        text={selectedReview?.text ?? ""}
        mainImageUrl={REVIEW_MODAL_IMAGES[activeThumbIndex] ?? REVIEW_MODAL_IMAGES[0]}
        thumbnails={REVIEW_MODAL_IMAGES}
        activeThumbIndex={activeThumbIndex}
        onSelectThumb={setActiveThumbIndex}
        onNext={() =>
          setActiveThumbIndex((idx) =>
            Math.min(idx + 1, REVIEW_MODAL_IMAGES.length - 1)
          )
        }
      />

      <ReviewModal
        open={addReviewOpen}
        onOpenChange={setAddReviewOpen}
        onSubmit={async (draft) => {
          console.log("submitted review draft:", draft)
        }}
      />

      <GalleryPopup
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        images={LISTING_GALLERY_IMAGES.map((src) => ({ src }))}
        initialIndex={galleryIndex}
        onIndexChange={setGalleryIndex}
        priceText={galleryPrice}
        metaText={`${listing.beds} bd | ${listing.baths} ba | ${listing.sqft.toLocaleString()} sq ft`}
        addressText={listing.address}
      />
    </div>
  )
}

function HighlightPlain({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[#71C4FF]">{icon}</div>
      <div className="text-xl font-medium">{label}</div>
    </div>
  )
}
