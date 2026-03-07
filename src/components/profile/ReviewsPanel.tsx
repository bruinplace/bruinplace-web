"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type ReviewTag = { label: string; score: string };
type Review = {
  id: string;
  name: string;
  initials: string;
  addressLine: string; // e.g. "330 De Neve Dr, Los Angeles, CA 90024"
  rating: number; // 0..5 (supports halves)
  text: string;
  tags: ReviewTag[];
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Joe Bruin",
    initials: "JB",
    addressLine: "330 De Neve Dr, Los Angeles, CA 90024",
    rating: 4.5,
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    tags: [
      { label: "Management", score: "5/5" },
      { label: "Cleanliness", score: "4/5" },
      { label: "Noise Level", score: "5/5" },
      { label: "Lease Flexibility", score: "5/5" },
    ],
  },
  { id: "r2", name: "Joe Bruin", initials: "JB", addressLine: "330 De Neve Dr, Los Angeles, CA 90024", rating: 4.0, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", tags: [{ label: "Management", score: "5/5" }, { label: "Cleanliness", score: "4/5" }, { label: "Noise Level", score: "5/5" }, { label: "Lease Flexibility", score: "5/5" }] },
  { id: "r3", name: "Joe Bruin", initials: "JB", addressLine: "330 De Neve Dr, Los Angeles, CA 90024", rating: 4.5, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", tags: [{ label: "Management", score: "5/5" }, { label: "Cleanliness", score: "4/5" }, { label: "Noise Level", score: "5/5" }, { label: "Lease Flexibility", score: "5/5" }] },
];

type SortKey = "newest" | "highest" | "lowest";

export default function ReviewsPanel() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const reviews = useMemo(() => {
    let arr = MOCK_REVIEWS.filter((r) => {
      const hay = `${r.name} ${r.addressLine} ${r.text}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

    // We don’t have dates in mock data; “newest” keeps order.
    if (sort === "highest") arr = [...arr].sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") arr = [...arr].sort((a, b) => a.rating - b.rating);

    return arr;
  }, [q, sort]);

  // Summary stats
  const avg = useMemo(() => {
    if (!MOCK_REVIEWS.length) return 0;
    const s = MOCK_REVIEWS.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((s / MOCK_REVIEWS.length) * 10) / 10;
  }, []);

  const distribution = useMemo(() => {
    // Buckets: 5..1 (round rating to nearest int for this UI)
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
    for (const r of MOCK_REVIEWS) {
      const k = Math.max(1, Math.min(5, Math.round(r.rating)));
      buckets[k] += 1;
    }
    const total = MOCK_REVIEWS.length || 1;
    return ([
      { stars: 5, count: buckets[5], pct: (buckets[5] / total) * 100 },
      { stars: 4, count: buckets[4], pct: (buckets[4] / total) * 100 },
      { stars: 3, count: buckets[3], pct: (buckets[3] / total) * 100 },
      { stars: 2, count: buckets[2], pct: (buckets[2] / total) * 100 },
      { stars: 1, count: buckets[1], pct: (buckets[1] / total) * 100 },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-zinc-900">Average user rating</div>
          <StarRow rating={avg} size={18} />
          <div className="text-sm text-zinc-700">
            <span className="font-semibold">{avg}</span> out of 5 stars{" "}
            <span className="text-zinc-500">({MOCK_REVIEWS.length})</span>
          </div>
        </div>

        <div className="space-y-2">
          {distribution.map((d) => (
            <RatingBar key={d.stars} stars={d.stars} pct={d.pct} />
          ))}
        </div>
      </div>

      {/* Reviews list card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Reviews ({MOCK_REVIEWS.length})</CardTitle>

            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <div className="w-full md:w-[260px]">
                <Input
                  placeholder="Search reviews"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by</SelectItem>
                  <SelectItem value="highest">Highest rating</SelectItem>
                  <SelectItem value="lowest">Lowest rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4 py-5">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}

          {!reviews.length && (
            <div className="rounded-lg border p-6 text-sm text-zinc-600">
              No reviews match your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RatingBar({ stars, pct }: { stars: number; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-xs text-zinc-600">{stars} stars</div>
      <div className="relative h-2 flex-1 rounded-full bg-zinc-200">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-sky-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  // Simple: fill stars by halves using width overlay
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const isFull = idx <= full;
        const isHalf = idx === full + 1 && half;

        return (
          <span key={idx} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className={cn("h-full w-full", isFull ? "fill-amber-400 text-amber-400" : "text-amber-300")} />
            {isHalf && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                <Star className="h-full w-full fill-amber-400 text-amber-400" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-sky-500 text-white">
              {review.initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="text-sm font-semibold">{review.name}</div>
            <div className="text-xs text-zinc-500">{review.addressLine}</div>
          </div>
        </div>

        <StarRow rating={review.rating} size={16} />
      </div>

      <div className="mt-3 text-sm text-zinc-700">
        <p className={cn(!expanded && "line-clamp-2")}>{review.text}</p>
        <button
          className="mt-1 text-xs font-medium text-sky-600 hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {review.tags.map((t) => (
          <Badge
            key={t.label}
            variant="outline"
            className="rounded-full border-sky-200 bg-sky-50 text-sky-700"
          >
            {t.label}: {t.score}
          </Badge>
        ))}
      </div>
    </div>
  );
}