"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ReviewModal } from "@/components/reviews/AddReviewModal"
import { ReviewPopupModal } from "@/components/reviews/ReviewPopupModal"
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

type Building = {
  id: string
  name: string
  address: string
  rating: number
  reviewsCount: number
  unitsCount: number
  priceMin: number
  priceMax: number
}

type Review = {
  id: string
  name: string
  dateLabel: string
  rating: number
  text: string
  tags: string[]
}

const MOCK_BUILDING: Building = {
  id: "1",
  name: "The Plaza",
  address: "10580 Wilshire Blvd, Los Angeles, CA 90024",
  rating: 4.4,
  reviewsCount: 41,
  unitsCount: 28,
  priceMin: 1250,
  priceMax: 2100,
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Josie Bruin",
    dateLabel: "2024 · 3 months ago",
    rating: 4,
    text:
      "Nice building overall — good location and responsive management. Some noise in the evenings but common areas were clean.",
    tags: ["Management 5/5", "Cleanliness 4/5", "Noise level 3/5", "Amenities 4/5"],
  },
  {
    id: "r2",
    name: "Scotty Highlander",
    dateLabel: "2023 · 1 year ago",
    rating: 5,
    text: "Great amenities and the gym is decent. Parking can be tight.",
    tags: ["Management 4/5", "Cleanliness 5/5", "Noise level 3/5", "Amenities 5/5"],
  },
  {
    id: "r3",
    name: "King Triton",
    dateLabel: "2022 · 2 years ago",
    rating: 4,
    text:
      "Solid building overall. Maintenance was quick and the location is hard to beat.",
    tags: ["Management 4/5", "Cleanliness 4/5", "Noise level 4/5", "Amenities 4/5"],
  },
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

function Stars({ value, size = 22 }: { value: number; size?: number }) {
  const fullStars = Math.floor(value)
  const hasPartial = value % 1 !== 0
  const partialFill = value % 1
  const gradientPrefix = React.useId().replace(/:/g, "")

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className="text-[#F6C24A]"
              style={{ width: size, height: size }}
              fill="currentColor"
            />
          )
        }

        if (i === fullStars && hasPartial) {
          const gradientId = `${gradientPrefix}-star-grad-${i}`
          return (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24">
              <defs>
                <linearGradient id={gradientId}>
                  <stop offset={`${partialFill * 100}%`} stopColor="#F6C24A" />
                  <stop offset={`${partialFill * 100}%`} stopColor="rgba(0,0,0,0.2)" />
                </linearGradient>
              </defs>
              <Star fill={`url(#${gradientId})`} stroke="#F6C24A" />
            </svg>
          )
        }

        return (
          <Star
            key={i}
            className="text-muted-foreground/40"
            style={{ width: size, height: size }}
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
            <div
              className="h-2 rounded-full bg-[#71C4FF]"
              style={{ width: `${Math.round(r.pct * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ImagePlaceholder({ className }: { className?: string }) {
  return <div className={`h-full w-full bg-muted ${className ?? ""}`} />
}

function RecommendedBuildingCard() {
  return (
    <Card className="rounded-2xl p-3 shadow-lg">
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl bg-muted">
          <div className="aspect-[16/10]">
            <ImagePlaceholder />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-9 w-9 rounded-full bg-background/70 backdrop-blur hover:bg-background/80"
            aria-label="Save building"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-semibold leading-none">The Plaza</div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-current text-muted-foreground" />
              <span>4.2</span>
              <span className="text-muted-foreground">(17)</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-sm">From $1,342 – $2,140 / month</div>
            <div className="text-xs text-muted-foreground">
              10200 Westwood Blvd, Los Angeles, CA 90024
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function BuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const building = { ...MOCK_BUILDING, id }
  const onSeeMore = () => {}
  const [addReviewOpen, setAddReviewOpen] = React.useState(false)
  const [selectedReview, setSelectedReview] = React.useState<Review | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false)
  const [activeThumbIndex, setActiveThumbIndex] = React.useState(0)

  const openReviewModal = (review: Review) => {
    setSelectedReview(review)
    setActiveThumbIndex(0)
    setReviewModalOpen(true)
  }

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

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[1300px] px-6 py-8">
        {/* FULL-WIDTH GALLERY */}
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl bg-muted">
            <div className="aspect-[16/9] max-h-[520px] w-full">
              <ImagePlaceholder />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl bg-muted">
                <div className="aspect-[16/9]">
                  <ImagePlaceholder />
                </div>

                {i === 3 && (
                  <div className="absolute bottom-3 right-3">
                    <Button className="rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]/90">
                      See all photos
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* LEFT */}
          <section className="min-w-0">
            <div className="mt-6">
              {/* Row 1: stars + rating */}
              <div className="flex items-center gap-3">
                <Stars value={building.rating} size={32} />
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-semibold">{building.rating.toFixed(1)}</div>
                  <div className="text-xl text-muted-foreground">({building.reviewsCount})</div>
                </div>
              </div>

              {/* Row 2: name + actions */}
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <div className="text-4xl font-semibold tracking-tight">{building.name}</div>
                  <div className="mt-3 text-xl">
                    From{" "}
                    <span className="font-semibold">${building.priceMin.toLocaleString()}</span>{" "}
                    –{" "}
                    <span className="font-semibold">${building.priceMax.toLocaleString()}</span>{" "}
                    / month
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    aria-label="Save"
                    className="text-[#71C4FF] hover:opacity-80 transition"
                  >
                    <Heart className="h-9 w-9" />
                  </button>
                  <button
                    type="button"
                    aria-label="Share"
                    className="text-[#71C4FF] hover:opacity-80 transition"
                  >
                    <Share2 className="h-9 w-9" />
                  </button>
                </div>
              </div>

              {/* Row 3: building stats */}
              <div className="mt-5 flex flex-wrap items-center gap-6 text-2xl">
                <span>
                  <span className="font-semibold">{building.unitsCount}</span> units
                </span>

                <span className="text-muted-foreground">|</span>

                <span>
                  <span className="font-semibold">12</span> min walk
                </span>

                <span className="text-muted-foreground">|</span>

                <span>
                  <span className="font-semibold">Parking</span> available
                </span>
              </div>

              {/* Row 4: address */}
              <div className="mt-6 text-2xl text-muted-foreground">
                {building.address}
              </div>
            </div>

            {/* highlights */}
            <div className="mt-10">
              <div className="h-px w-full bg-border" />

              <h2 className="mt-10 text-3xl font-semibold tracking-tight">Highlights</h2>

              <div className="mt-10 grid gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-3">
                <HighlightPlain icon={<Shield className="h-10 w-10" />} label="Security" />
                <HighlightPlain icon={<Trees className="h-10 w-10" />} label="Hardwood flooring" />
                <HighlightPlain icon={<Sparkles className="h-10 w-10" />} label="Curated art" />
                <HighlightPlain icon={<Droplets className="h-10 w-10" />} label="Laundry room" />
                <HighlightPlain icon={<BoxIcon className="h-10 w-10" />} label="Internet" />
                <HighlightPlain icon={<Wind className="h-10 w-10" />} label="AC" />
              </div>

              <p className="mt-10 text-lg leading-8 text-muted-foreground">
                Placeholder description text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              </p>

              <div className="mt-12 h-px w-full bg-border" />
            </div>

            {/* location */}
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

            {/* reviews */}
            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Reviews ({MOCK_REVIEWS.length})</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => setAddReviewOpen(true)}
                  >
                    Add review
                  </Button>
                  <Button variant="secondary" className="rounded-full">
                    Sort by
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {MOCK_REVIEWS.map((r) => (
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
                </div>

                <Card className="h-fit rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-semibold">{building.rating.toFixed(1)}</div>
                    <div>
                      <Stars value={building.rating} />
                      <div className="text-xs text-muted-foreground">
                        {building.reviewsCount} reviews
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <RatingBars />
                  </div>
                  <div className="mt-4">
                    <Input placeholder="Search reviews…" className="rounded-full" />
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="block">
            <div className="sticky top-6">
              <Card className="rounded-2xl p-5">
                <div className="text-sm font-semibold">Contact this building</div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-semibold">
                    TP
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{building.name}</div>
                    <div className="text-xs text-muted-foreground">Verified</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    leasing@{building.name.toLowerCase().replace(/\s+/g, "")}.com
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    (323) 555-0199
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button className="w-full rounded-2xl bg-[#71C4FF] text-white hover:bg-[#71C4FF]/90">
                    Message
                  </Button>
                  <Button variant="secondary" className="w-full rounded-2xl">
                    Request tour
                  </Button>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      {/* RECOMMENDED BUILDINGS – FULL WIDTH SECTION */}
      <section className="mt-24 w-full bg-[#EAF6FF] py-16">
        <div className="mx-auto max-w-[1300px] px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recommended buildings</h2>

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

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecommendedBuildingCard key={i} />
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
