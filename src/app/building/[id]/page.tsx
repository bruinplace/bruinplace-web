"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Activity,
  Archive,
  Armchair,
  Bike,
  Bus,
  CalendarDays,
  Car,
  ChevronDown,
  ClipboardList,
  Heart,
  Image as ImageIcon,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  Share2,
  SquareArrowOutUpRight,
  Star,
  Tag,
  Zap,
} from "lucide-react";
import Footer from "@/components/Footer";
import { BuildingGalleryPopup } from "@/components/buildings/BuildingGalleryPopup";
import {
  ReviewModal,
  type ReviewDraft,
} from "@/components/reviews/AddReviewModal";
import { ReviewSubmitSuccessPopup } from "@/components/reviews/ReviewSubmitSuccessPopup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type ApiAmenity = {
  id: string;
  key: string;
  label: string;
};

type ApiListingResponse = {
  id: string;
  property_id: string;
  user_id: string;
  title: string;
  description: string;
  monthly_rent: number;
  deposit_amount: number | null;
  available_from: string | null;
  lease_term_months: number | null;
  lease_type: string | null;
  unit_type: string;
  square_feet: number | null;
  max_occupants: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  amenities: ApiAmenity[];
};

type ApiListingListResponse = {
  items: ApiListingResponse[];
  total: number;
};

type ApiPropertyDetailResponse = {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  management_company: string | null;
  created_at: string;
  updated_at: string;
  review_stats?: {
    review_count: number;
    average_rating: number | null;
  };
};

type ApiPropertyReview = {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  management_rating: number;
  cleanliness_rating: number;
  noise_level_rating: number;
  lease_flexibility_rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

type ApiPropertyReviewsResponse = {
  items: ApiPropertyReview[];
  total: number;
};

type ApiImageItem = {
  url: string;
  low_res_url?: string | null;
  display_order: number;
};

type ApiImageListResponse = {
  items: ApiImageItem[];
  total: number;
};

type ApiMapListing = {
  id: string;
  property_id: string;
  property_name: string;
  monthly_rent: number;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
};

type ApiMapListingResponse = {
  items: ApiMapListing[];
  total: number;
  has_more: boolean;
};

type ListingTypeKey = "all" | "sublet" | "lease" | "other";

type DisplayUnit = {
  id: string;
  title: string;
  description: string;
  beds: number;
  baths: number;
  sqft: number;
  monthlyRent: number;
  listingType: Exclude<ListingTypeKey, "all">;
  listingTypeLabel: string;
  durationLabel: string;
  unitLabel: string;
  availabilityLabel: string;
  availabilityTone: "green" | "red" | "amber";
  linkHref: string;
  amenities: ApiAmenity[];
};

type DisplayReview = {
  id: string;
  initials: string;
  userLabel: string;
  livedRange: string;
  rating: number;
  text: string;
  fullText?: string;
  createdAtTs: number;
  categoryRatings: Array<{
    key: string;
    label: string;
    value: number;
    icon: ReactNode;
  }>;
};

type HighlightItem = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type RecommendedBuilding = {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewsCount: number;
};

const EMPTY_LISTINGS: ApiListingResponse[] = [];
const EMPTY_REVIEWS: ApiPropertyReview[] = [];
const EMPTY_IMAGE_URLS: string[] = [];

const UCLA_BRUIN_BEAR = { lat: 34.0717, lng: -118.4441 };

const AVATAR_COLORS = [
  "#FB923C",
  "#3EA6FC",
  "#D9297A",
  "#22C55E",
  "#A855F7",
  "#E11D48",
];

const FALLBACK_DESCRIPTION =
  "Nestled in the historic Westwood district of Los Angeles, this building offers a premier location near UCLA, Beverly Hills, and Santa Monica. Life here means easy access to everything you need while still being close to a walkable, student-friendly neighborhood. Amenities are designed around convenience and comfort, with practical shared spaces and modern essentials for day-to-day living.";

const FALLBACK_HIGHLIGHTS: HighlightItem[] = [
  { key: "gym", label: "Gym", icon: Activity },
  { key: "business_center", label: "Business center", icon: Armchair },
  { key: "ev_charging", label: "EV charging", icon: Zap },
  { key: "bike_storage", label: "Bike storage", icon: Bike },
  { key: "parking", label: "Parking", icon: Car },
  { key: "lockers", label: "Lockers", icon: Archive },
];

const AMENITY_ICON_BY_KEY: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  gym: Activity,
  fitness_center: Activity,
  activity: Activity,
  business_center: Armchair,
  coworking: Armchair,
  lounge: Armchair,
  ev_charging: Zap,
  bike_storage: Bike,
  parking: Car,
  lockers: Archive,
  locker: Archive,
};

const REVIEW_CATEGORY_ICON: Record<string, ReactNode> = {
  management: <ClipboardList className="h-5 w-5" />,
  cleanliness: <Activity className="h-5 w-5" />,
  noise_level: <Bus className="h-5 w-5" />,
  lease_flexibility: <CalendarDays className="h-5 w-5" />,
};

function buildPath(
  base: string,
  params: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

type ImageUrlPreference = "full" | "low_res";

function selectImageUrl(
  item: ApiImageItem,
  preference: ImageUrlPreference,
): string | null {
  if (preference === "low_res") {
    return item.low_res_url ?? item.url ?? null;
  }
  return item.url ?? item.low_res_url ?? null;
}

function sortImageUrls(
  items: ApiImageItem[] | undefined,
  preference: ImageUrlPreference,
): string[] {
  return (items ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => selectImageUrl(item, preference))
    .filter((url): url is string => Boolean(url));
}

async function fetchImageUrls(
  path: string,
  preference: ImageUrlPreference = "full",
): Promise<string[]> {
  try {
    const response = await api.get<ApiImageListResponse>(path);
    return sortImageUrls(response.items, preference);
  } catch {
    return [];
  }
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "--";
  return `$${value.toLocaleString()}`;
}

function stableHash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(value: string) {
  const parts = value
    .split(/[\s_-]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  const compact = value.replace(/[^a-zA-Z0-9]/g, "");
  return compact.slice(0, 2).toUpperCase() || "BP";
}

function avatarColor(seed: string) {
  return AVATAR_COLORS[stableHash(seed) % AVATAR_COLORS.length];
}

function userDisplayName(userId: string) {
  if (!userId) return "BruinPlace User";
  return `User ${userId.slice(0, 8)}`;
}

function formatReviewDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Recent";
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function unitTypeToBeds(unitType: string): number {
  switch (unitType) {
    case "studio":
      return 0;
    case "1b1b":
      return 1;
    case "2b2b":
      return 2;
    case "3b2b":
      return 3;
    case "4b2b":
      return 4;
    case "shared_room":
      return 1;
    case "private_room":
      return 1;
    default:
      return 1;
  }
}

function unitTypeToBaths(unitType: string): number {
  switch (unitType) {
    case "2b2b":
    case "3b2b":
    case "4b2b":
      return 2;
    default:
      return 1;
  }
}

function normalizeListingType(
  value: string | null | undefined,
): Exclude<ListingTypeKey, "all"> {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized.includes("sublet")) return "sublet";
  if (normalized.includes("lease")) return "lease";
  return "other";
}

function listingTypeLabel(value: Exclude<ListingTypeKey, "all">) {
  switch (value) {
    case "sublet":
      return "Sublet";
    case "lease":
      return "Lease";
    default:
      return "Listing";
  }
}

function listingDurationLabel(
  months: number | null,
  type: Exclude<ListingTypeKey, "all">,
) {
  const suffix = listingTypeLabel(type).toLowerCase();
  if (months == null || months <= 0) return suffix;
  return `${months} mo ${suffix}`;
}

function extractUnitLabel(title: string, fallbackIndex: number) {
  const hit = title.match(/unit[\s#-]*([A-Za-z0-9-]+)/i);
  if (hit?.[1]) return `Unit ${hit[1]}`;
  return `Unit ${fallbackIndex + 1}`;
}

function availabilityFromStatus(status: string): {
  label: string;
  tone: "green" | "red" | "amber";
} {
  const normalized = status.trim().toLowerCase();
  if (
    normalized.includes("available") ||
    normalized === "active" ||
    normalized === "open"
  ) {
    return { label: "Available", tone: "green" };
  }

  if (
    normalized.includes("unavailable") ||
    normalized.includes("inactive") ||
    normalized.includes("closed") ||
    normalized.includes("occupied") ||
    normalized.includes("leased") ||
    normalized.includes("rented") ||
    normalized.includes("sold")
  ) {
    return { label: "Not available", tone: "red" };
  }

  if (normalized.includes("draft") || normalized.includes("pending")) {
    return { label: "Pending", tone: "amber" };
  }

  return { label: "Available", tone: "green" };
}

function extractApiErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Could not submit review.";
  const detail = error.message.match(/"detail"\s*:\s*"([^"]+)"/)?.[1];
  if (detail) return detail;
  const fallback = error.message.match(/^API\s+\d+:\s*(.*)$/)?.[1];
  return fallback || error.message || "Could not submit review.";
}

function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthMiles * c;
}

function etaLabel(distanceMiles: number | null, speedMph: number) {
  if (distanceMiles == null) return "-- min";
  const minutes = Math.max(1, Math.round((distanceMiles / speedMph) * 60));
  return `${minutes} min`;
}

function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-gradient-to-br from-[#dfdfdf] to-[#cfcfcf]",
        className,
      )}
    />
  );
}

function BuildingImage({
  src,
  alt,
  priority = false,
}: {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
}) {
  if (!src) return <PhotoPlaceholder />;
  return (
    <Image
      src={src}
      alt={alt}
      width={1400}
      height={900}
      priority={priority}
      className="h-full w-full object-cover"
      sizes="(max-width: 1024px) 100vw, 50vw"
    />
  );
}

function RatingStars({
  size = 33,
  value = 0,
}: {
  size?: number;
  value?: number;
}) {
  const full = Math.max(0, Math.min(5, Math.floor(value)));
  const hasHalf = value - full >= 0.5;

  return (
    <div className="flex items-center gap-[15px]">
      {Array.from({ length: 5 }).map((_, index) => {
        const isFull = index < full;
        const isHalf = index === full && hasHalf;
        return (
          <Star
            key={index}
            className="text-[#F2B94B]"
            fill={isFull || isHalf ? "currentColor" : "none"}
            style={{ width: size, height: size }}
          />
        );
      })}
    </div>
  );
}

function ReviewBars({ ratings }: { ratings: number[] }) {
  const bins = ratings.reduce<Record<1 | 2 | 3 | 4 | 5, number>>(
    (acc, rating) => {
      const key = Math.max(1, Math.min(5, Math.round(rating))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      acc[key] += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );
  const total = ratings.length;

  return (
    <div className="w-full max-w-[430px] space-y-[15px]">
      {[5, 4, 3, 2, 1].map((starValue) => {
        const count = bins[starValue as 1 | 2 | 3 | 4 | 5];
        const pct = total > 0 ? (count / total) * 100 : 0;

        return (
          <div
            key={starValue}
            className="grid grid-cols-[53px_1fr] items-center gap-[16px]"
          >
            <p className="text-[14px] leading-6 text-black">
              {starValue} stars
            </p>
            <div className="h-[19px] rounded-[25px] bg-[rgba(186,186,186,0.2)]">
              <div
                className="h-[19px] rounded-[25px] bg-[#71C4FF]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UnitCard({
  unit,
  onSelect,
  selected = false,
}: {
  unit: DisplayUnit;
  onSelect: (unit: DisplayUnit) => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(unit)}
      className="block w-full text-left"
      aria-label={`Open listing preview for ${unit.unitLabel}`}
    >
      <article
        className={cn(
          "rounded-[25px] bg-white p-[25px] shadow-[0_4px_8px_rgba(0,0,0,0.25)] transition hover:shadow-[0_6px_16px_rgba(0,0,0,0.22)]",
          selected && "ring-2 ring-[#3EA6FC]",
        )}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#0F172A]">
              {unit.beds} bd {unit.baths} ba
            </p>
            <p className="text-[18px] font-semibold leading-7 text-[#0F172A]">
              {formatCurrency(unit.monthlyRent)} per month
            </p>
          </div>

          <div className="h-px bg-[#D4D4D4]" />

          <div className="grid grid-cols-2 gap-x-[15px] gap-y-[15px]">
            <div className="inline-flex items-center gap-[10px] text-[14px] leading-6 text-black">
              <ClipboardList className="h-6 w-6 text-[#3EA6FC]" />
              <span>{unit.listingTypeLabel}</span>
            </div>

            <div className="inline-flex items-center justify-end gap-[10px] text-[14px] leading-6 text-black">
              <KeyRound className="h-6 w-6 text-[#3EA6FC]" />
              <span>{unit.unitLabel}</span>
            </div>

            <div className="inline-flex items-center gap-[10px] text-[14px] leading-6 text-black">
              <CalendarDays className="h-6 w-6 text-[#3EA6FC]" />
              <span>{unit.durationLabel}</span>
            </div>

            <div
              className={cn(
                "inline-flex w-fit items-center justify-end gap-[10px] rounded-[25px] px-4 py-2 text-[14px] font-medium leading-6 text-white",
                unit.availabilityTone === "green" && "bg-[#16A34A]",
                unit.availabilityTone === "red" && "bg-[#EF4444]",
                unit.availabilityTone === "amber" && "bg-[#F59E0B]",
              )}
            >
              <Tag className="h-6 w-6" />
              <span>{unit.availabilityLabel}</span>
            </div>
          </div>
        </div>
      </article>
    </button>
  );
}

function UnitPreviewModal({
  open,
  onOpenChange,
  unit,
  propertyName,
  address,
  imageUrl,
  isFavorited,
  onToggleFavorite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: DisplayUnit | null;
  propertyName: string;
  address: string;
  imageUrl: string | null;
  isFavorited: boolean;
  onToggleFavorite: (unitId: string) => void;
}) {
  if (!unit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[96vw] !max-w-[980px] overflow-hidden rounded-[25px] border-0 p-0 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {unit.title || unit.unitLabel}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Unit listing preview for {propertyName}
        </DialogDescription>

        <div className="grid gap-0 md:grid-cols-[minmax(0,56%)_minmax(0,44%)] md:min-h-[620px]">
          <div className="h-[280px] bg-[#DADADA] md:h-full">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${unit.unitLabel} preview`}
                width={900}
                height={700}
                className="h-full w-full object-cover"
              />
            ) : (
              <PhotoPlaceholder />
            )}
          </div>

          <div className="flex min-h-[280px] max-h-[620px] flex-col gap-5 overflow-y-auto p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[22px] font-semibold leading-7 text-[#0F172A]">
                  {formatCurrency(unit.monthlyRent)} per month
                </p>
                <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
                  {unit.beds} bd | {unit.baths} ba |{" "}
                  {unit.sqft.toLocaleString()} sq ft
                </p>
                <p className="mt-1 text-[14px] leading-6 text-[#919191]">
                  {propertyName}
                </p>
                <p className="line-clamp-3 text-[14px] leading-6 text-[#919191]">
                  {address}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(unit.id)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-[#71C4FF] transition hover:bg-[#F0F8FF] hover:text-[#3EA6FC]"
                  aria-label={
                    isFavorited ? "Unfavorite listing" : "Favorite listing"
                  }
                  aria-pressed={isFavorited}
                  title={isFavorited ? "Unfavorite" : "Favorite"}
                >
                  <Heart
                    className={cn(
                      "h-9 w-9",
                      isFavorited && "fill-current text-[#3EA6FC]",
                    )}
                  />
                </button>
                <a
                  href={unit.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-[#71C4FF] transition hover:bg-[#F0F8FF] hover:text-[#3EA6FC]"
                  aria-label="Open listing in new tab"
                  title="Open in new tab"
                >
                  <SquareArrowOutUpRight className="h-8 w-8" />
                </a>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#D4D4D4] bg-white text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  aria-label="Close preview"
                >
                  X
                </button>
              </div>
            </div>

            <div className="h-px bg-[#E2E8F0]" />

            <div className="grid gap-2 sm:grid-cols-2">
              <InfoPill
                icon={<ClipboardList className="h-5 w-5" />}
                label={unit.listingTypeLabel}
              />
              <InfoPill
                icon={<KeyRound className="h-5 w-5" />}
                label={unit.unitLabel}
              />
              <InfoPill
                icon={<CalendarDays className="h-5 w-5" />}
                label={unit.durationLabel}
              />
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-[25px] px-4 py-2 text-[14px] font-medium text-white",
                  unit.availabilityTone === "green" && "bg-[#16A34A]",
                  unit.availabilityTone === "red" && "bg-[#EF4444]",
                  unit.availabilityTone === "amber" && "bg-[#F59E0B]",
                )}
              >
                <Tag className="h-5 w-5" />
                {unit.availabilityLabel}
              </span>
            </div>

            {unit.description ? (
              <p className="line-clamp-4 text-[14px] leading-6 text-[#334155]">
                {unit.description}
              </p>
            ) : null}

            {unit.amenities.length ? (
              <div className="flex flex-wrap gap-2">
                {unit.amenities.slice(0, 6).map((amenity) => (
                  <span
                    key={`${unit.id}-${amenity.id}`}
                    className="rounded-[25px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-[13px] leading-5 text-[#1D4ED8]"
                  >
                    {amenity.label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-auto flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-10 items-center rounded-[25px] border border-[#CBD5E1] px-4 text-[14px] font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
              >
                Close
              </button>
              <Link
                href={unit.linkHref}
                className="inline-flex h-10 items-center rounded-[25px] bg-[#3EA6FC] px-4 text-[14px] font-medium text-white transition hover:bg-[#2196F3]"
              >
                View full listing
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[25px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2 text-[14px] text-[#1D4ED8]">
      {icon}
      {label}
    </span>
  );
}

function ReviewCard({ review }: { review: DisplayReview }) {
  const canExpand = Boolean(review.fullText);
  const [expanded, setExpanded] = useState(false);
  const text =
    canExpand && expanded && review.fullText ? review.fullText : review.text;

  return (
    <article className="rounded-[25px] bg-white p-[30px] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-[15px]">
          <div
            className="grid h-[57px] w-[57px] place-items-center rounded-full text-[22.8px] leading-[39.9px] text-white"
            style={{ backgroundColor: avatarColor(review.userLabel) }}
          >
            {review.initials}
          </div>

          <div>
            <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
              {review.userLabel}
            </p>
            <p className="text-[14px] leading-6 text-[#919191]">
              {review.livedRange}
            </p>
          </div>
        </div>

        <RatingStars size={33} value={review.rating} />
      </div>

      <div className="mt-[10px] space-y-[10px]">
        <p className="text-[14px] leading-6 text-black">{text}</p>

        {canExpand ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-[5px] text-[14px] font-bold leading-6 text-[#3EA6FC] underline"
          >
            {expanded ? "Read less" : "Read more"}
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        ) : null}

        <div className="flex flex-wrap gap-[10px]">
          {review.categoryRatings.map((item) => (
            <span
              key={`${review.id}-${item.key}`}
              className="inline-flex items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]"
            >
              {item.icon}
              {item.label}: {item.value}/5
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ContactCard({
  propertyName,
  managementCompany,
}: {
  propertyName: string;
  managementCompany: string | null;
}) {
  const companyToken = managementCompany?.trim() || propertyName;
  const email = `${companyToken.toLowerCase().replace(/[^a-z0-9]/g, "") || "leasing"}@gmail.com`;

  return (
    <aside className="rounded-[25px] bg-white p-[30px] shadow-[0_4px_15px_rgba(0,0,0,0.25)]">
      <div className="space-y-10">
        <div className="h-px bg-[#D4D4D4]" />

        <div className="space-y-[30px] text-center">
          <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.144px] text-black">
            Contact this building
          </h3>

          <div className="flex items-center justify-center gap-[15px]">
            <div className="grid h-[67px] w-[67px] place-items-center rounded-full bg-[#71C4FF] text-[26.8px] leading-[46.9px] text-white">
              {getInitials(propertyName)}
            </div>
            <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
              {propertyName}
            </p>
          </div>
        </div>

        <div className="space-y-[25px]">
          <div className="flex items-start gap-[15px]">
            <Mail className="h-6 w-6 text-[#71C4FF]" />
            <div className="text-[14px] leading-6 text-black">
              <p className="font-bold">Email</p>
              <p>{email}</p>
            </div>
          </div>

          <div className="flex items-start gap-[15px]">
            <Phone className="h-6 w-6 text-[#71C4FF]" />
            <div className="text-[14px] leading-6 text-black">
              <p className="font-bold">Phone</p>
              <p>(424) 622-4771</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#D4D4D4]" />
      </div>
    </aside>
  );
}

function RecommendedBuildingCard({
  building,
  image,
}: {
  building: RecommendedBuilding;
  image: string | null;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <Link href={`/building/${building.id}`} className="block">
      <article className="h-[400px] rounded-[25px] bg-white p-5 shadow-[0_4px_8px_rgba(0,0,0,0.25)] transition hover:shadow-[0_6px_16px_rgba(0,0,0,0.22)]">
        <div className="relative h-[240px] overflow-hidden rounded-[25px] bg-[#DADADA]">
          <BuildingImage src={image} alt={`${building.name} image`} />

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSaved((prev) => !prev);
            }}
            aria-label="Save building"
            className="absolute right-[15px] top-[15.65px] inline-flex h-[35.35px] w-[35.35px] items-center justify-center rounded-full border border-white/80 bg-black/20 text-white"
          >
            <Heart
              className={cn("h-6 w-6", saved && "fill-current text-[#71C4FF]")}
            />
          </button>
        </div>

        <div className="mt-[20px] space-y-[5px]">
          <div className="flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-[24px] font-semibold leading-7 text-[#0F172A]">
              {building.name}
            </p>
            <div className="flex items-center gap-2 text-[14px] leading-6">
              <Star className="h-5 w-5 fill-[#BABABA] text-[#BABABA]" />
              <span className="font-bold text-black">
                {building.rating.toFixed(1)}
              </span>
              <span className="text-[#BABABA]">({building.reviewsCount})</span>
            </div>
          </div>

          <p className="line-clamp-2 text-[16px] leading-6 text-[#919191]">
            {building.address}
          </p>
        </div>
      </article>
    </Link>
  );
}

function LocationMap({
  lat,
  lng,
  address,
}: {
  lat: number | null | undefined;
  lng: number | null | undefined;
  address: string;
}) {
  if (lat == null || lng == null) return <PhotoPlaceholder />;

  const src = `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed`;

  return (
    <iframe
      title={`Map of ${address}`}
      src={src}
      loading="lazy"
      className="h-full w-full border-0"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export default function BuildingListingPage() {
  const routeParams = useParams<{ id?: string | string[] }>();
  const propertyId = Array.isArray(routeParams.id)
    ? routeParams.id[0]
    : (routeParams.id ?? "");

  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">(
    "idle",
  );
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [listingTypeFilter, setListingTypeFilter] =
    useState<ListingTypeKey>("all");
  const [showAllListings, setShowAllListings] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewSort, setReviewSort] = useState<"newest" | "oldest">("newest");
  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [reviewSubmitSuccessOpen, setReviewSubmitSuccessOpen] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(
    null,
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [favoritedUnitIds, setFavoritedUnitIds] = useState<
    Record<string, boolean>
  >({});

  const propertyQuery = useQuery({
    queryKey: ["building_property", propertyId],
    queryFn: () =>
      api.get<ApiPropertyDetailResponse>(`/properties/${propertyId}`),
    enabled: Boolean(propertyId),
    retry: false,
  });

  const propertyListingsQuery = useQuery({
    queryKey: ["building_property_listings", propertyId],
    queryFn: () =>
      api.get<ApiListingListResponse>(
        `/properties/${propertyId}/listings?limit=100&offset=0`,
      ),
    enabled: Boolean(propertyId),
    retry: false,
  });

  const propertyReviewsQuery = useQuery({
    queryKey: ["building_property_reviews", propertyId],
    queryFn: () =>
      api.get<ApiPropertyReviewsResponse>(
        `/properties/${propertyId}/reviews?limit=100&offset=0`,
      ),
    enabled: Boolean(propertyId),
    retry: false,
  });

  const propertyImagesQuery = useQuery({
    queryKey: ["building_property_images", propertyId],
    queryFn: () => fetchImageUrls(`/properties/${propertyId}/images`),
    enabled: Boolean(propertyId),
  });

  const listings = propertyListingsQuery.data?.items ?? EMPTY_LISTINGS;
  const reviews = propertyReviewsQuery.data?.items ?? EMPTY_REVIEWS;
  const propertyImages = propertyImagesQuery.data ?? EMPTY_IMAGE_URLS;

  const listingIdsForGallery = useMemo(
    () => listings.slice(0, 6).map((item) => item.id),
    [listings],
  );

  const listingImageQueries = useQueries({
    queries: listingIdsForGallery.map((listingId) => ({
      queryKey: ["building_listing_images_for_gallery", listingId],
      queryFn: () => fetchImageUrls(`/listings/${listingId}/images`),
      staleTime: 60_000,
    })),
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (draft: ReviewDraft) => {
      if (!propertyId) {
        throw new Error("Property is unavailable for this listing.");
      }

      const allRatings = Object.values(draft.ratings);
      if (allRatings.some((value) => value < 1 || value > 5)) {
        throw new Error("Please rate all 4 categories.");
      }

      return api.post<ApiPropertyReview>(`/properties/${propertyId}/reviews`, {
        management_rating: draft.ratings.management,
        cleanliness_rating: draft.ratings.cleanliness,
        noise_level_rating: draft.ratings.noiseLevel,
        lease_flexibility_rating: draft.ratings.leaseFlexibility,
        comment: draft.reviewText.trim() || null,
      });
    },
    onSuccess: async () => {
      setReviewSubmitError(null);
      setReviewSubmitSuccessOpen(true);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["building_property_reviews", propertyId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["building_property", propertyId],
        }),
      ]);
    },
    onError: (error) => {
      setReviewSubmitError(extractApiErrorMessage(error));
    },
  });

  const property = propertyQuery.data;

  const recommendedMapPath = useMemo(() => {
    if (property?.latitude == null || property?.longitude == null) return null;
    return buildPath("/listings/map", {
      north: property.latitude + 0.03,
      south: property.latitude - 0.03,
      east: property.longitude + 0.03,
      west: property.longitude - 0.03,
      pad_ratio: 0,
    });
  }, [property]);

  const recommendedMapQuery = useQuery({
    queryKey: ["building_recommended_map", recommendedMapPath],
    queryFn: () => api.get<ApiMapListingResponse>(recommendedMapPath as string),
    enabled: Boolean(recommendedMapPath),
  });

  const recommendedBuildings = useMemo<RecommendedBuilding[]>(() => {
    const byProperty = new Map<string, RecommendedBuilding>();
    const rows = recommendedMapQuery.data?.items ?? [];

    for (const row of rows) {
      if (!row.property_id || row.property_id === propertyId) continue;
      if (byProperty.has(row.property_id)) continue;
      const seed = stableHash(row.property_id);

      byProperty.set(row.property_id, {
        id: row.property_id,
        name: row.property_name,
        address: `${row.address}, ${row.city}, ${row.state} ${row.postal_code}`,
        rating: Number((4 + (seed % 10) * 0.1).toFixed(1)),
        reviewsCount: 1 + (seed % 17),
      });

      if (byProperty.size >= 6) break;
    }

    return Array.from(byProperty.values()).slice(0, 6);
  }, [recommendedMapQuery.data?.items, propertyId]);

  const recommendedImageQueries = useQueries({
    queries: recommendedBuildings.map((item) => ({
      queryKey: ["building_recommended_property_images", item.id],
      queryFn: () => fetchImageUrls(`/properties/${item.id}/images`, "low_res"),
      staleTime: 60_000,
    })),
  });

  const fullAddress = property
    ? `${property.address}, ${property.city}, ${property.state} ${property.postal_code}`
    : "";

  const galleryImages = useMemo(() => {
    const listingSeed = listingImageQueries.flatMap(
      (query) => query.data?.slice(0, 1) ?? [],
    );
    const merged = [...propertyImages, ...listingSeed];
    return Array.from(new Set(merged)).slice(0, 10);
  }, [listingImageQueries, propertyImages]);

  const gallerySlots = useMemo(
    () => Array.from({ length: 5 }, (_, index) => galleryImages[index] ?? null),
    [galleryImages],
  );

  const listingTypeOptions = useMemo(() => {
    const set = new Set<Exclude<ListingTypeKey, "all">>();
    for (const item of listings) {
      set.add(normalizeListingType(item.lease_type));
    }
    return ["all", ...Array.from(set)] as ListingTypeKey[];
  }, [listings]);
  const activeListingTypeFilter: ListingTypeKey = listingTypeOptions.includes(
    listingTypeFilter,
  )
    ? listingTypeFilter
    : "all";

  const displayUnits = useMemo<DisplayUnit[]>(() => {
    return listings.map((item, index) => {
      const listingType = normalizeListingType(item.lease_type);
      const availability = availabilityFromStatus(item.status);
      return {
        id: item.id,
        title: item.title?.trim() || extractUnitLabel(item.title, index),
        description: item.description?.trim() || "",
        beds: unitTypeToBeds(item.unit_type),
        baths: unitTypeToBaths(item.unit_type),
        sqft: item.square_feet ?? 0,
        monthlyRent: item.monthly_rent,
        listingType,
        listingTypeLabel: listingTypeLabel(listingType),
        durationLabel: listingDurationLabel(
          item.lease_term_months,
          listingType,
        ),
        unitLabel: extractUnitLabel(item.title, index),
        availabilityLabel: availability.label,
        availabilityTone: availability.tone,
        linkHref: `/listings/${item.id}`,
        amenities: item.amenities ?? [],
      };
    });
  }, [listings]);

  const filteredUnits = useMemo(() => {
    if (activeListingTypeFilter === "all") return displayUnits;
    return displayUnits.filter(
      (unit) => unit.listingType === activeListingTypeFilter,
    );
  }, [activeListingTypeFilter, displayUnits]);

  const visibleUnits = showAllListings
    ? filteredUnits
    : filteredUnits.slice(0, 4);
  const selectedUnit = useMemo(
    () => displayUnits.find((unit) => unit.id === selectedUnitId) ?? null,
    [displayUnits, selectedUnitId],
  );
  const selectedUnitListingId = selectedUnit?.id ?? null;
  const selectedListingImageQuery = useQuery({
    queryKey: ["building_selected_listing_images", selectedUnitListingId],
    queryFn: () =>
      fetchImageUrls(`/listings/${selectedUnitListingId as string}/images`),
    enabled: Boolean(selectedUnitListingId),
    staleTime: 60_000,
  });
  const selectedUnitImage =
    selectedListingImageQuery.data?.[0] ?? gallerySlots[0] ?? null;

  const highlightItems = useMemo<HighlightItem[]>(() => {
    const byKey = new Map<string, HighlightItem>();

    for (const listing of listings) {
      for (const amenity of listing.amenities ?? []) {
        const key =
          amenity.key || amenity.label.toLowerCase().replace(/\s+/g, "_");
        if (byKey.has(key)) continue;

        const normalizedKey = key.toLowerCase();
        const icon =
          AMENITY_ICON_BY_KEY[normalizedKey] ||
          AMENITY_ICON_BY_KEY[normalizedKey.replace(/[^a-z0-9_]/g, "")] ||
          Activity;

        byKey.set(key, {
          key,
          label: amenity.label,
          icon,
        });
      }
    }

    if (!byKey.size) return FALLBACK_HIGHLIGHTS;
    return Array.from(byKey.values()).slice(0, 6);
  }, [listings]);

  const descriptionText =
    listings.find((item) => item.description?.trim())?.description?.trim() ||
    FALLBACK_DESCRIPTION;

  const ratingCount =
    property?.review_stats?.review_count ??
    propertyReviewsQuery.data?.total ??
    reviews.length;

  const ratingValue = (() => {
    const fromProperty = property?.review_stats?.average_rating;
    if (fromProperty != null) return Number(fromProperty.toFixed(1));
    if (!reviews.length) return 0;
    const avg =
      reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
    return Number(avg.toFixed(1));
  })();

  const displayReviews = useMemo<DisplayReview[]>(() => {
    return reviews.map((review) => {
      const normalizedText =
        review.comment?.trim() || "No written comment provided.";
      const canExpand = normalizedText.length > 230;
      const categoryRatings = [
        {
          key: "management",
          label: "Management",
          value: review.management_rating,
          icon: REVIEW_CATEGORY_ICON.management,
        },
        {
          key: "cleanliness",
          label: "Cleanliness",
          value: review.cleanliness_rating,
          icon: REVIEW_CATEGORY_ICON.cleanliness,
        },
        {
          key: "noise_level",
          label: "Noise Level",
          value: review.noise_level_rating,
          icon: REVIEW_CATEGORY_ICON.noise_level,
        },
        {
          key: "lease_flexibility",
          label: "Lease Flexibility",
          value: review.lease_flexibility_rating,
          icon: REVIEW_CATEGORY_ICON.lease_flexibility,
        },
      ];

      return {
        id: review.id,
        initials: getInitials(review.user_id),
        userLabel: userDisplayName(review.user_id),
        livedRange: formatReviewDate(review.created_at),
        rating: review.rating,
        text: canExpand ? `${normalizedText.slice(0, 230)}...` : normalizedText,
        fullText: canExpand ? normalizedText : undefined,
        createdAtTs: Date.parse(review.created_at) || 0,
        categoryRatings,
      };
    });
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = reviewSearch.trim().toLowerCase();
    const base = q
      ? displayReviews.filter((review) => {
          const haystack =
            `${review.userLabel} ${review.text} ${review.fullText ?? ""}`.toLowerCase();
          return haystack.includes(q);
        })
      : displayReviews;

    return [...base].sort((a, b) =>
      reviewSort === "newest"
        ? b.createdAtTs - a.createdAtTs
        : a.createdAtTs - b.createdAtTs,
    );
  }, [displayReviews, reviewSearch, reviewSort]);

  const distanceMiles =
    property?.latitude != null && property?.longitude != null
      ? haversineMiles(
          UCLA_BRUIN_BEAR.lat,
          UCLA_BRUIN_BEAR.lng,
          property.latitude,
          property.longitude,
        )
      : null;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const payload = {
      title: `${property?.name || "Building"} on BruinPlace`,
      text: `Check out this building: ${fullAddress}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 1800);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 1800);
      }
    } catch {
      setShareState("idle");
    }
  };

  const galleryCount = galleryImages.length;

  const openGalleryAt = (index: number) => {
    if (!galleryImages.length) return;
    const safeIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
    setGalleryIndex(safeIndex);
    setGalleryOpen(true);
  };

  if (propertyQuery.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#F5F5F5] px-4 text-center text-[20px] text-[#0F172A]">
        Loading building details...
      </div>
    );
  }

  if (propertyQuery.isError || !property) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#F5F5F5] px-4 text-center">
        <div className="space-y-3">
          <p className="text-[24px] font-semibold text-[#0F172A]">
            Could not load this building
          </p>
          <p className="text-[16px] text-[#64748B]">
            Please check the building link or try again.
          </p>
          <Link
            href="/search"
            className="inline-flex h-10 items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white"
          >
            <Search className="h-5 w-5" />
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F5F5]">
      <section className="mx-auto w-full max-w-[1441px] px-4 pb-[82px] pt-[58px] sm:px-8 xl:px-[120px]">
        <div className="space-y-[50px]">
          {galleryCount >= 5 ? (
            <div className="grid gap-[25px] lg:grid-cols-[595px_minmax(0,1fr)]">
              <button
                type="button"
                onClick={() => openGalleryAt(0)}
                className="h-[475px] overflow-hidden rounded-bl-[25px] rounded-tl-[25px] bg-[#DADADA] text-left"
                aria-label="Open building gallery"
              >
                <BuildingImage
                  src={gallerySlots[0]}
                  alt={`${property.name} main image`}
                  priority
                />
              </button>

              <div className="grid h-[475px] grid-cols-2 gap-[25px]">
                <button
                  type="button"
                  onClick={() => openGalleryAt(1)}
                  className="overflow-hidden bg-[#DADADA] text-left"
                  aria-label="Open building photo 2"
                >
                  <BuildingImage
                    src={gallerySlots[1]}
                    alt={`${property.name} image 2`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => openGalleryAt(2)}
                  className="overflow-hidden rounded-tr-[25px] bg-[#DADADA] text-left"
                  aria-label="Open building photo 3"
                >
                  <BuildingImage
                    src={gallerySlots[2]}
                    alt={`${property.name} image 3`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => openGalleryAt(3)}
                  className="overflow-hidden bg-[#DADADA] text-left"
                  aria-label="Open building photo 4"
                >
                  <BuildingImage
                    src={gallerySlots[3]}
                    alt={`${property.name} image 4`}
                  />
                </button>

                <div className="relative overflow-hidden rounded-br-[25px] bg-[#DADADA]">
                  <button
                    type="button"
                    onClick={() => openGalleryAt(4)}
                    className="h-full w-full text-left"
                    aria-label="Open building photo 5"
                  >
                    <BuildingImage
                      src={gallerySlots[4]}
                      alt={`${property.name} image 5`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => openGalleryAt(0)}
                    className={cn(
                      "absolute bottom-5 right-3 inline-flex h-10 items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white",
                      !galleryImages.length && "cursor-not-allowed opacity-60",
                    )}
                    disabled={!galleryImages.length}
                  >
                    <ImageIcon className="h-6 w-6" />
                    <span>See all photos</span>
                  </button>
                </div>
              </div>
            </div>
          ) : galleryCount === 4 ? (
            <div className="grid h-[475px] grid-cols-2 gap-[25px]">
              {galleryImages.slice(0, 4).map((src, index) => (
                <button
                  key={`gallery-4-${index}`}
                  type="button"
                  onClick={() => openGalleryAt(index)}
                  className={cn(
                    "overflow-hidden bg-[#DADADA] text-left",
                    index === 0 && "rounded-tl-[25px]",
                    index === 1 && "rounded-tr-[25px]",
                    index === 2 && "rounded-bl-[25px]",
                    index === 3 && "rounded-br-[25px]",
                  )}
                  aria-label={`Open building photo ${index + 1}`}
                >
                  <BuildingImage
                    src={src}
                    alt={`${property.name} image ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          ) : galleryCount === 3 ? (
            <div className="grid h-[475px] gap-[25px] lg:grid-cols-[2fr_1fr]">
              <button
                type="button"
                onClick={() => openGalleryAt(0)}
                className="overflow-hidden rounded-l-[25px] bg-[#DADADA] text-left"
                aria-label="Open building photo 1"
              >
                <BuildingImage
                  src={galleryImages[0]}
                  alt={`${property.name} image 1`}
                  priority
                />
              </button>

              <div className="grid gap-[25px]">
                <button
                  type="button"
                  onClick={() => openGalleryAt(1)}
                  className="overflow-hidden rounded-tr-[25px] bg-[#DADADA] text-left"
                  aria-label="Open building photo 2"
                >
                  <BuildingImage
                    src={galleryImages[1]}
                    alt={`${property.name} image 2`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => openGalleryAt(2)}
                  className="overflow-hidden rounded-br-[25px] bg-[#DADADA] text-left"
                  aria-label="Open building photo 3"
                >
                  <BuildingImage
                    src={galleryImages[2]}
                    alt={`${property.name} image 3`}
                  />
                </button>
              </div>
            </div>
          ) : galleryCount === 2 ? (
            <div className="grid h-[475px] gap-[25px] lg:grid-cols-2">
              <button
                type="button"
                onClick={() => openGalleryAt(0)}
                className="overflow-hidden rounded-l-[25px] bg-[#DADADA] text-left"
                aria-label="Open building photo 1"
              >
                <BuildingImage
                  src={galleryImages[0]}
                  alt={`${property.name} image 1`}
                  priority
                />
              </button>
              <button
                type="button"
                onClick={() => openGalleryAt(1)}
                className="overflow-hidden rounded-r-[25px] bg-[#DADADA] text-left"
                aria-label="Open building photo 2"
              >
                <BuildingImage
                  src={galleryImages[1]}
                  alt={`${property.name} image 2`}
                />
              </button>
            </div>
          ) : galleryCount === 1 ? (
            <button
              type="button"
              onClick={() => openGalleryAt(0)}
              className="h-[475px] overflow-hidden rounded-[25px] bg-[#DADADA] text-left"
              aria-label="Open building photo 1"
            >
              <BuildingImage
                src={galleryImages[0]}
                alt={`${property.name} image 1`}
                priority
              />
            </button>
          ) : (
            <div className="grid h-[475px] place-items-center rounded-[25px] bg-[#DADADA] px-6 text-center">
              <div className="space-y-2 text-[#64748B]">
                <ImageIcon className="mx-auto h-10 w-10 text-[#919191]" />
                <p className="text-[18px] font-medium">
                  No photos available yet
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-[60px] lg:grid-cols-[842px_299px]">
            <div className="space-y-[50px]">
              <section className="space-y-[15px]">
                <button
                  type="button"
                  className="flex items-end gap-[15px]"
                  onClick={() => {
                    const target = document.getElementById("reviews");
                    if (target)
                      target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                  aria-label="Jump to reviews"
                >
                  <RatingStars size={33} value={ratingValue} />
                  <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
                    {ratingValue.toFixed(1)}{" "}
                    <span className="font-normal text-[#BABABA]">
                      ({ratingCount})
                    </span>
                  </p>
                </button>

                <div className="flex items-center gap-[20px]">
                  <p className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                    {property.name}
                  </p>

                  <div className="flex items-center gap-2 text-[#71C4FF]">
                    <button
                      type="button"
                      aria-label="Save building"
                      onClick={() => setSaved((prev) => !prev)}
                    >
                      <Heart
                        className={cn(
                          "h-[34.56px] w-[34.56px]",
                          saved && "fill-current text-[#71C4FF]",
                        )}
                      />
                    </button>

                    <button
                      type="button"
                      aria-label="Share building"
                      onClick={handleShare}
                    >
                      <Share2 className="h-9 w-9" />
                    </button>
                  </div>
                </div>

                <p className="text-[20px] leading-7 tracking-[-0.1px] text-[#919191]">
                  {fullAddress}
                </p>

                {shareState !== "idle" ? (
                  <p className="text-[14px] text-[#3EA6FC]">
                    {shareState === "copied"
                      ? "Building link copied."
                      : "Share flow opened."}
                  </p>
                ) : null}
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-[25px]">
                <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                  Highlights
                </h2>

                <div className="grid gap-x-[15px] gap-y-[15px] sm:grid-cols-2 lg:grid-cols-3">
                  {highlightItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-[10px]"
                    >
                      <item.icon className="h-7 w-7 text-[#71C4FF]" />
                      <p className="text-[20px] leading-7 tracking-[-0.1px] text-black">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-[14px] leading-6 text-black">
                  {descriptionText}
                </p>
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-[25px]">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                    Listings
                  </h2>

                  <label className="relative inline-flex h-10 items-center">
                    <select
                      className="h-10 appearance-none rounded-[25px] border border-[#919191] bg-white px-4 pr-10 text-[14px] font-medium leading-5 text-black outline-none"
                      value={activeListingTypeFilter}
                      onChange={(event) => {
                        setListingTypeFilter(
                          event.target.value as ListingTypeKey,
                        );
                        setShowAllListings(false);
                      }}
                    >
                      {listingTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === "all"
                            ? "Listing type"
                            : listingTypeLabel(
                                option as Exclude<ListingTypeKey, "all">,
                              )}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 h-5 w-5 text-[#919191]" />
                  </label>
                </div>

                {propertyListingsQuery.isLoading ? (
                  <div className="rounded-[25px] bg-white p-[30px] text-[16px] leading-6 text-[#64748B] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                    Loading listings...
                  </div>
                ) : propertyListingsQuery.isError ? (
                  <div className="rounded-[25px] bg-white p-[30px] text-[16px] leading-6 text-[#DC2626] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                    Could not load listings for this building.
                  </div>
                ) : visibleUnits.length ? (
                  <div className="grid gap-[35px] md:grid-cols-2">
                    {visibleUnits.map((unit) => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        selected={selectedUnit?.id === unit.id}
                        onSelect={(nextUnit) => {
                          setSelectedUnitId(nextUnit.id);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[25px] bg-white p-[30px] text-[16px] leading-6 text-[#64748B] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                    No units match this listing type.
                  </div>
                )}

                {!showAllListings && filteredUnits.length > 4 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllListings(true)}
                    className="inline-flex items-center gap-[5px] text-[16px] font-bold leading-6 text-[#3EA6FC] underline"
                  >
                    Show more
                    <ChevronDown className="h-6 w-6" />
                  </button>
                ) : null}
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-5">
                <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                  Location
                </h2>

                <div className="h-[350px] overflow-hidden rounded-[25px] bg-[#DADADA]">
                  <LocationMap
                    lat={property.latitude}
                    lng={property.longitude}
                    address={fullAddress}
                  />
                </div>

                <div className="space-y-[15px]">
                  <div className="flex items-center gap-[10px]">
                    <MapPin className="h-[38px] w-[38px] text-[#71C4FF]" />
                    <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
                      Distance from Bruin Bear
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-5">
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(62,166,252,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Activity className="h-6 w-6" />
                      {etaLabel(distanceMiles, 3)}
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(62,166,252,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Bike className="h-6 w-6" />
                      {etaLabel(distanceMiles, 10)}
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(62,166,252,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Car className="h-6 w-6" />
                      {etaLabel(distanceMiles, 20)}
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(62,166,252,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Bus className="h-6 w-6" />
                      {etaLabel(distanceMiles, 12)}
                    </span>
                  </div>
                </div>
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-[45px]" id="reviews">
                <div className="space-y-[25px]">
                  <div className="grid gap-6 lg:grid-cols-[367px_430px] lg:items-start lg:justify-between">
                    <div className="space-y-[30px]">
                      <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                        Reviews{" "}
                        <span className="font-normal text-[#BABABA]">
                          ({ratingCount})
                        </span>
                      </h2>

                      <div className="space-y-[15px]">
                        <RatingStars size={43} value={ratingValue} />
                        <p className="text-[20px] leading-7 tracking-[-0.1px] text-black">
                          {ratingValue.toFixed(1)} out of 5 stars
                        </p>
                      </div>
                    </div>

                    <ReviewBars ratings={reviews.map((item) => item.rating)} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-[15px]">
                      <label className="relative block h-10 w-[251px]">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#BABABA]" />
                        <input
                          type="text"
                          value={reviewSearch}
                          onChange={(event) =>
                            setReviewSearch(event.target.value)
                          }
                          placeholder="Search reviews..."
                          className="h-full w-full rounded-[25px] border border-[#919191] bg-white pl-11 pr-4 text-[14px] leading-5 text-black outline-none placeholder:text-[#919191]"
                        />
                      </label>

                      <label className="relative inline-flex h-10">
                        <select
                          value={reviewSort}
                          onChange={(event) =>
                            setReviewSort(
                              event.target.value as "newest" | "oldest",
                            )
                          }
                          className="h-10 appearance-none rounded-[25px] border border-[#919191] bg-white px-4 pr-10 text-[14px] font-medium leading-5 text-[#0F172A] outline-none"
                        >
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#919191]" />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReviewSubmitError(null);
                        setAddReviewOpen(true);
                      }}
                      className="inline-flex h-10 items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white"
                    >
                      <Pencil className="h-6 w-6" />
                      Add review
                    </button>
                  </div>

                  {reviewSubmitError ? (
                    <p className="text-[14px] text-red-600">
                      {reviewSubmitError}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-[45px]">
                  {filteredReviews.length ? (
                    filteredReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <div className="rounded-[25px] bg-white p-[30px] text-[18px] text-[#64748B] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                      No reviews match your search.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="lg:relative">
              <div className="lg:sticky lg:top-[120px]">
                <ContactCard
                  propertyName={property.name}
                  managementCompany={property.management_company}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[rgba(180,223,255,0.3)] py-[49px]">
        <div className="mx-auto w-full max-w-[1441px] px-4 sm:px-8 xl:px-[120px]">
          <div className="space-y-[45px]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[26px] font-bold leading-[normal] text-black">
                Recommended listings
              </h2>

              <Link
                href="/search"
                className="inline-flex h-10 items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white"
              >
                <Search className="h-6 w-6" />
                See more
              </Link>
            </div>

            <div className="grid gap-[35px] md:grid-cols-2 xl:grid-cols-3">
              {recommendedBuildings.length ? (
                recommendedBuildings.map((building, index) => (
                  <RecommendedBuildingCard
                    key={building.id}
                    building={building}
                    image={recommendedImageQueries[index].data?.[0] ?? null}
                  />
                ))
              ) : (
                <div className="rounded-[25px] bg-white p-8 text-[18px] text-[#64748B] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                  No recommended listings available right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <BuildingGalleryPopup
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        images={galleryImages.map((src, index) => ({
          src,
          alt: `${property.name} photo ${index + 1}`,
        }))}
        initialIndex={galleryIndex}
        onIndexChange={setGalleryIndex}
        buildingName={property.name}
        addressText={fullAddress}
      />

      <UnitPreviewModal
        open={Boolean(selectedUnit)}
        onOpenChange={(open) => {
          if (!open) setSelectedUnitId(null);
        }}
        unit={selectedUnit}
        propertyName={property.name}
        address={fullAddress}
        imageUrl={selectedUnitImage}
        isFavorited={Boolean(selectedUnit && favoritedUnitIds[selectedUnit.id])}
        onToggleFavorite={(unitId) => {
          setFavoritedUnitIds((prev) => ({
            ...prev,
            [unitId]: !prev[unitId],
          }));
        }}
      />

      <ReviewModal
        open={addReviewOpen}
        onOpenChange={(open) => {
          setAddReviewOpen(open);
          if (!open) setReviewSubmitError(null);
        }}
        title="Add review"
        submitting={submitReviewMutation.isPending}
        submitError={reviewSubmitError}
        onSubmit={async (draft) => {
          setReviewSubmitError(null);
          await submitReviewMutation.mutateAsync(draft);
        }}
      />

      <ReviewSubmitSuccessPopup
        open={reviewSubmitSuccessOpen}
        onOpenChange={setReviewSubmitSuccessOpen}
      />
    </div>
  );
}
