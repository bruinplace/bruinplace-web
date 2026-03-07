"use client";

import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
} from "lucide-react";

type Listing = {
  id: string;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  rating: number;
  reviewsCount: number;
};

type Review = {
  id: string;
  name: string;
  dateLabel: string;
  rating: number;
  text: string;
  tags: string[];
};

const MOCK_LISTING: Listing = {
  id: "1",
  priceLabel: "$1,450 per month",
  beds: 3,
  baths: 2,
  sqft: 1347,
  address: "10580 Wilshire Blvd, Los Angeles, CA 90024",
  rating: 4.4,
  reviewsCount: 3,
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Josie Bruin",
    dateLabel: "2024 · 3 months ago",
    rating: 4,
    text: "Nice place, commute was easier and there are plenty of food spots nearby. The unit was clean and management was responsive.",
    tags: [
      "Management 5/5",
      "Cleanliness 4/5",
      "Noise level 3/5",
      "Lease flexibility 4/5",
    ],
  },
  {
    id: "r2",
    name: "Scotty Highlander",
    dateLabel: "2023 · 1 year ago",
    rating: 5,
    text: "Great spot. The pool area is nice and the gym is decent. A bit of street noise during rush hour.",
    tags: [
      "Management 4/5",
      "Cleanliness 5/5",
      "Noise level 3/5",
      "Lease flexibility 5/5",
    ],
  },
  {
    id: "r3",
    name: "King Triton",
    dateLabel: "2022 · 2 years ago",
    rating: 4,
    text: "Solid apartment overall. Maintenance was quick and the location is hard to beat. Parking can be tight.",
    tags: [
      "Management 4/5",
      "Cleanliness 4/5",
      "Noise level 4/5",
      "Lease flexibility 4/5",
    ],
  },
];

/**
 * Lucide-based stars with decimal support (e.g., 4.4).
 * Uses an overlay fill clipped to a percentage width for partial stars.
 */

function Stars({ value, size = 22 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const frac = value - full;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full;
        const isPartial = i === full && frac > 0;

        if (isFull) {
          return (
            <Star
              key={i}
              className="text-[#F6C24A]"
              style={{ width: size, height: size }}
              fill="currentColor"
            />
          );
        }

        if (isPartial) {
          const pct = Math.round(frac * 100);

          return (
            <span
              key={i}
              className="relative inline-block"
              style={{ width: size, height: size }}
            >
              {/* empty base */}
              <Star
                className="text-muted-foreground/40"
                style={{ width: size, height: size }}
                fill="none"
              />

              {/* filled overlay clipped */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pct}%` }}
              >
                <Star
                  className="text-[#F6C24A]"
                  style={{ width: size, height: size }}
                  fill="currentColor"
                />
              </span>
            </span>
          );
        }

        return (
          <Star
            key={i}
            className="text-muted-foreground/40"
            style={{ width: size, height: size }}
            fill="none"
          />
        );
      })}
    </div>
  );
}

function RatingBars() {
  const rows = [
    { label: "5 stars", pct: 0.72 },
    { label: "4 stars", pct: 0.55 },
    { label: "3 stars", pct: 0.18 },
    { label: "2 stars", pct: 0.08 },
    { label: "1 star", pct: 0.12 },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-[64px_1fr] items-center gap-3"
        >
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
  );
}

function ImagePlaceholder({ className }: { className?: string }) {
  return <div className={`h-full w-full bg-muted ${className ?? ""}`} />;
}

function RecommendedCard() {
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
            aria-label="Save listing"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-semibold leading-none">
              $1,342 per month
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Star
                className="h-4 w-4 text-muted-foreground"
                fill="currentColor"
              />
              <span>4.2</span>
              <span className="text-muted-foreground">(17)</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-sm">2 bd | 2 ba | 1,460 sq ft</div>
            <div className="text-xs text-muted-foreground">
              10200 Westwood Blvd, Los Angeles, CA 90024
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Optional helper (you weren’t using showContact, but keeping hook since you had it) */
function useShowAfterScrollPast() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, show };
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const listing = { ...MOCK_LISTING, id };

  // If you want to use this later, keep it:
  const { ref: galleryEndRef } = useShowAfterScrollPast();

  const onSeeMore = () => {};

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[1300px] px-6 py-8">
        {/* FULL-WIDTH GALLERY */}
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          {/* Left: hero */}
          <div className="relative overflow-hidden rounded-2xl bg-muted">
            <div className="aspect-[16/9] max-h-[520px] w-full">
              <ImagePlaceholder />
            </div>
          </div>

          {/* Right: 2x2 tiles */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl bg-muted"
              >
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

        {/* Sentinel if you decide to use it */}
        <div ref={galleryEndRef} />

        {/* PAGE CONTENT */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* LEFT */}
          <section className="min-w-0">
            {/* price / rating / actions */}
            <div className="mt-6">
              {/* Row 1: stars + rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Stars value={listing.rating} size={32} />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-semibold">
                    {listing.rating.toFixed(1)}
                  </div>
                  <div className="text-xl text-muted-foreground">
                    ({listing.reviewsCount})
                  </div>
                </div>
              </div>

              {/* Row 2: price + actions */}
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="text-4xl font-semibold tracking-tight">
                  {listing.priceLabel}
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

              {/* Row 3: beds/baths/sqft with dividers */}
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
                  <span className="font-semibold">
                    {listing.sqft.toLocaleString()}
                  </span>{" "}
                  sq ft
                </span>
              </div>

              {/* Row 4: address */}
              <div className="mt-6 text-2xl text-muted-foreground">
                {listing.address}
              </div>
            </div>

            {/* highlights (plain) */}
            <div className="mt-10">
              <div className="h-px w-full bg-border" />

              <h2 className="mt-10 text-3xl font-semibold tracking-tight">
                Highlights
              </h2>

              <div className="mt-10 grid gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-3">
                <HighlightPlain
                  icon={<Shield className="h-10 w-10" />}
                  label="Security"
                />
                <HighlightPlain
                  icon={<Trees className="h-10 w-10" />}
                  label="Hardwood flooring"
                />
                <HighlightPlain
                  icon={<Sparkles className="h-10 w-10" />}
                  label="Curated art"
                />
                <HighlightPlain
                  icon={<Droplets className="h-10 w-10" />}
                  label="In-unit washer & dryer"
                />
                <HighlightPlain
                  icon={<BoxIcon className="h-10 w-10" />}
                  label="Internet"
                />
                <HighlightPlain
                  icon={<Wind className="h-10 w-10" />}
                  label="AC"
                />
              </div>

              <p className="mt-10 text-lg leading-8 text-muted-foreground">
                Placeholder description text. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Donec
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
                <h2 className="text-lg font-semibold">
                  Reviews ({MOCK_REVIEWS.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="rounded-full">
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
                    <Card key={r.id} className="rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.dateLabel}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} size={22} />
                          <span className="ml-2 text-sm font-medium">
                            {r.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {r.text}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="h-fit rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-semibold">
                      {listing.rating.toFixed(1)}
                    </div>
                    <div>
                      <Stars value={listing.rating} />
                      <div className="text-xs text-muted-foreground">
                        {listing.reviewsCount} reviews
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <RatingBars />
                  </div>
                  <div className="mt-4">
                    <Input
                      placeholder="Search reviews…"
                      className="rounded-full"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="block">
            <div className="sticky top-6">
              <Card className="rounded-2xl p-5">
                <div className="text-sm font-semibold">Contact this lister</div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-semibold">
                    JB
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Joe Bruin</div>
                    <div className="text-xs text-muted-foreground">
                      Verified
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    joe.bruin@email.com
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

      {/* RECOMMENDED LISTINGS – FULL WIDTH SECTION */}
      <section className="mt-24 w-full bg-[#EAF6FF] py-16">
        <div className="mx-auto max-w-[1300px] px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recommended listings</h2>

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
              <RecommendedCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HighlightPlain({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[#71C4FF]">{icon}</div>
      <div className="text-xl font-medium">{label}</div>
    </div>
  );
}
