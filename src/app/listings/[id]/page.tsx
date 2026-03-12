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
import { useState, type ComponentType } from "react";
import {
  Bike,
  Building2,
  Bus,
  Car,
  ChevronDown,
  ClipboardList,
  Flower2,
  Footprints,
  Heart,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Pencil,
  Search,
  Share2,
  Star,
  User,
  WandSparkles,
  Waves,
  Wifi,
  Wind,
  Box,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  ReviewModal,
  type ReviewDraft,
} from "@/components/reviews/AddReviewModal";
import { ReviewSubmitSuccessPopup } from "@/components/reviews/ReviewSubmitSuccessPopup";

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
  review_stats: {
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

type DisplayReview = {
  id: string;
  initials: string;
  name: string;
  livedRange: string;
  text: string;
  fullText?: string;
  avatarColor: string;
  rating: number;
};

type RecommendedListing = {
  id: string;
  monthlyRent: number;
  rating: number;
  ratingCount: number;
  beds: number;
  baths: number;
  sqft: number | null;
  address: string;
  image: string | null;
};

const UCLA_BRUIN_BEAR = { lat: 34.0717, lng: -118.4441 };

const FALLBACK_HIGHLIGHTS = [
  { icon: Lock, label: "Security" },
  { icon: Box, label: "Hardwood flooring" },
  { icon: WandSparkles, label: "Curated art" },
  { icon: Waves, label: "In-unit washer & dryer" },
  { icon: Wifi, label: "Internet" },
  { icon: Wind, label: "AC" },
];

const AMENITY_ICON_BY_KEY: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  security: Lock,
  hardwood_flooring: Box,
  curated_art: WandSparkles,
  washer_dryer: Waves,
  in_unit_washer_dryer: Waves,
  internet: Wifi,
  wifi: Wifi,
  ac: Wind,
  air_conditioning: Wind,
  management: User,
  cleanliness: Flower2,
  noise_level: Megaphone,
  lease_flexibility: ClipboardList,
};

const AVATAR_COLORS = [
  "#D9297A",
  "#F59E0B",
  "#34D399",
  "#3EA6FC",
  "#8B5CF6",
  "#E11D48",
];

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "--";
  return `$${value.toLocaleString()}`;
}

function unitTypeToBeds(unitType: string): number {
  switch (unitType) {
    case "studio":
      return 0;
    case "1b1b":
      return 1;
    case "2b2b":
      return 2;
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
      return 2;
    default:
      return 1;
  }
}

function formatUnitType(unitType: string) {
  return unitType.replaceAll("_", " ").replace(/\b\w/g, (s) => s.toUpperCase());
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

function getInitials(value: string) {
  const tokens = value
    .split(/[\s_-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length >= 2) {
    return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
  }

  const compact = value.replace(/[^a-zA-Z0-9]/g, "");
  return compact.slice(0, 2).toUpperCase() || "BP";
}

function stableHash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function avatarColor(seed: string) {
  return AVATAR_COLORS[stableHash(seed) % AVATAR_COLORS.length];
}

function formatReviewDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Recent";
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function userDisplayName(userId: string) {
  if (!userId) return "BruinPlace User";
  return `User ${userId.slice(0, 8)}`;
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

function extractApiErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Could not submit review.";
  const detail = error.message.match(/"detail"\s*:\s*"([^"]+)"/)?.[1];
  if (detail) return detail;
  const fallback = error.message.match(/^API\s+\d+:\s*(.*)$/)?.[1];
  return fallback || error.message || "Could not submit review.";
}

function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`h-full w-full bg-gradient-to-br from-[#dfdfdf] to-[#cfcfcf] ${className ?? ""}`}
    />
  );
}

function ListingImage({
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

function StarRow({ size = 33, value = 0 }: { size?: number; value?: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <div className="flex items-center gap-[15.793px]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="text-[#F2B94B]"
          fill={index < filled ? "currentColor" : "none"}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

function ReviewBars({ ratings }: { ratings: number[] }) {
  const countByStars = ratings.reduce<Record<1 | 2 | 3 | 4 | 5, number>>(
    (acc, rating) => {
      const rounded = Math.max(1, Math.min(5, Math.round(rating))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      acc[rounded] += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );
  const total = ratings.length;

  return (
    <div className="w-full max-w-[361px] space-y-[21.5px]">
      {[5, 4, 3, 2, 1].map((starValue) => {
        const count = countByStars[starValue as 1 | 2 | 3 | 4 | 5];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div
            key={starValue}
            className="grid grid-cols-[53px_1fr] items-center gap-4"
          >
            <p className="text-[14px] leading-6 text-black">
              {starValue} stars
            </p>
            <div className="h-[19px] rounded-[40px] bg-[#E5E5E5]">
              <div
                className="h-[19px] rounded-[40px] bg-[#71C4FF]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: DisplayReview }) {
  const canExpand = Boolean(review.fullText);
  const [expanded, setExpanded] = useState(false);
  const textToRender =
    canExpand && expanded && review.fullText ? review.fullText : review.text;

  return (
    <article className="w-full rounded-[25px] bg-white p-[30px] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-[15px]">
          <div
            className="grid h-[57px] w-[57px] place-items-center rounded-full text-[22.8px] leading-[39.9px] text-white"
            style={{ backgroundColor: review.avatarColor }}
          >
            {review.initials}
          </div>
          <div>
            <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
              {review.name}
            </p>
            <p className="text-[14px] leading-6 text-[#919191]">
              {review.livedRange}
            </p>
          </div>
        </div>

        <StarRow size={28} value={review.rating} />
      </div>

      <div className="mt-[12px]">
        <p className="text-[14px] leading-6 text-black">{textToRender}</p>
        {canExpand ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-[5px] inline-flex items-center gap-[5px] text-[14px] font-bold leading-6 text-[#3EA6FC] underline"
          >
            {expanded ? "Read less" : "Read more"}
            <ChevronDown
              className={`h-6 w-6 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        ) : null}
      </div>
    </article>
  );
}

function RecommendedCard({ listing }: { listing: RecommendedListing }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <article className="h-[400px] rounded-[25px] bg-white p-5 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
        <div className="relative h-[227px] overflow-hidden rounded-[25px] bg-[#DADADA]">
          <ListingImage src={listing.image} alt="Recommended listing image" />
          <button
            type="button"
            aria-label="Save listing"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSaved((prev) => !prev);
            }}
            className="absolute right-[15px] top-[15.65px] inline-flex h-[35.35px] w-[35.35px] items-center justify-center rounded-full border border-white/70 bg-black/10 text-white"
          >
            <Heart
              className={`h-6 w-6 ${saved ? "fill-current text-[#71C4FF]" : ""}`}
            />
          </button>
        </div>

        <div className="mt-[25px] space-y-[5px]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[24px] font-semibold leading-7 text-[#0F172A]">
              {formatCurrency(listing.monthlyRent)} per month
            </p>

            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-[#BABABA] text-[#BABABA]" />
              <p className="text-[14px] font-bold leading-6 text-black">
                {listing.rating.toFixed(1)}
              </p>
              <p className="text-[14px] font-medium leading-6 text-[#BABABA]">
                ({listing.ratingCount})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[10px] text-[14px] leading-6 text-black">
            <span>
              <span className="font-bold">{listing.beds}</span> bd
            </span>
            <span className="text-[#919191]">|</span>
            <span>
              <span className="font-bold">{listing.baths}</span> ba
            </span>
            <span className="text-[#919191]">|</span>
            <span>
              <span className="font-bold">{listing.sqft ?? 0}</span> sq ft
            </span>
          </div>

          <p className="line-clamp-2 text-[16px] leading-6 text-[#919191]">
            {listing.address}
          </p>
        </div>
      </article>
    </Link>
  );
}

function AmenityItem({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-[10px]">
      <Icon className="h-8 w-8 text-[#71C4FF]" />
      <p className="text-[20px] leading-7 tracking-[-0.1px] text-black">
        {label}
      </p>
    </div>
  );
}

function ContactCard({
  userId,
  leaseType,
  availableFrom,
}: {
  userId: string;
  leaseType: string | null;
  availableFrom: string | null;
}) {
  return (
    <aside className="rounded-[25px] bg-white p-[30px] shadow-[0_4px_15px_rgba(0,0,0,0.25)]">
      <div className="h-px w-full bg-[#D4D4D4]" />

      <div className="mt-10 space-y-[30px]">
        <h3 className="text-center text-[24px] font-semibold leading-8 tracking-[-0.144px] text-black">
          Contact this lister
        </h3>

        <div className="flex items-center justify-center gap-[15px]">
          <div
            className="grid h-[67px] w-[67px] place-items-center rounded-full text-[37px] leading-[46.9px] text-white"
            style={{ backgroundColor: avatarColor(userId) }}
          >
            {getInitials(userId)}
          </div>
          <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
            {userDisplayName(userId)}
          </p>
        </div>

        <div className="space-y-[25px]">
          <div className="flex items-start gap-[15px]">
            <User className="h-6 w-6 text-[#71C4FF]" />
            <div>
              <p className="text-[14px] font-bold leading-6 text-black">
                User ID
              </p>
              <p className="break-all text-[14px] leading-6 text-black">
                {userId}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-[15px]">
            <Mail className="h-6 w-6 text-[#71C4FF]" />
            <div>
              <p className="text-[14px] font-bold leading-6 text-black">
                Contact
              </p>
              <p className="text-[14px] leading-6 text-black">
                In-app messaging coming soon
              </p>
            </div>
          </div>

          <div className="flex items-start gap-[15px]">
            <ClipboardList className="h-6 w-6 text-[#71C4FF]" />
            <div>
              <p className="text-[14px] font-bold leading-6 text-black">
                Lease details
              </p>
              <p className="text-[14px] leading-6 text-black">
                {leaseType ? formatUnitType(leaseType) : "Lease type not set"}
              </p>
              <p className="text-[14px] leading-6 text-black">
                Available from{" "}
                {availableFrom
                  ? new Date(availableFrom).toLocaleDateString()
                  : "unspecified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 h-px w-full bg-[#D4D4D4]" />
    </aside>
  );
}

export default function ListingPage() {
  const routeParams = useParams<{ id?: string | string[] }>();
  const listingId = Array.isArray(routeParams.id)
    ? routeParams.id[0]
    : (routeParams.id ?? "");
  const queryClient = useQueryClient();
  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [reviewSubmitSuccessOpen, setReviewSubmitSuccessOpen] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(
    null,
  );

  const listingQuery = useQuery({
    queryKey: ["listing_detail", listingId],
    queryFn: () => api.get<ApiListingResponse>(`/listings/${listingId}`),
    enabled: Boolean(listingId),
    retry: false,
  });

  const propertyId = listingQuery.data?.property_id ?? "";

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
          queryKey: ["property_reviews", propertyId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["property_detail", propertyId],
        }),
      ]);
    },
    onError: (error) => {
      setReviewSubmitError(extractApiErrorMessage(error));
    },
  });

  const propertyQuery = useQuery({
    queryKey: ["property_detail", propertyId],
    queryFn: () =>
      api.get<ApiPropertyDetailResponse>(`/properties/${propertyId}`),
    enabled: Boolean(propertyId),
    retry: false,
  });

  const propertyReviewsQuery = useQuery({
    queryKey: ["property_reviews", propertyId],
    queryFn: () =>
      api.get<ApiPropertyReviewsResponse>(
        `/properties/${propertyId}/reviews?limit=25&offset=0`,
      ),
    enabled: Boolean(propertyId),
    retry: false,
  });

  const propertyListingsQuery = useQuery({
    queryKey: ["property_listings", propertyId],
    queryFn: () =>
      api.get<ApiListingListResponse>(
        `/properties/${propertyId}/listings?limit=24&offset=0`,
      ),
    enabled: Boolean(propertyId),
    retry: false,
  });

  const listingImagesQuery = useQuery({
    queryKey: ["listing_images", listingId],
    queryFn: () => fetchImageUrls(`/listings/${listingId}/images`),
    enabled: Boolean(listingId),
  });

  const propertyImagesQuery = useQuery({
    queryKey: ["property_images", propertyId],
    queryFn: () => fetchImageUrls(`/properties/${propertyId}/images`),
    enabled: Boolean(propertyId),
  });

  const recommendedBaseItems = (propertyListingsQuery.data?.items ?? [])
    .filter((item) => item.id !== listingId)
    .slice(0, 6);

  const recommendedImageQueries = useQueries({
    queries: recommendedBaseItems.map((item) => ({
      queryKey: ["listing_images", item.id],
      queryFn: () => fetchImageUrls(`/listings/${item.id}/images`, "low_res"),
      staleTime: 60_000,
    })),
  });

  if (listingQuery.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#F5F5F5] px-4 text-center text-[20px] text-[#0F172A]">
        Loading listing details...
      </div>
    );
  }

  if (listingQuery.isError || !listingQuery.data) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#F5F5F5] px-4 text-center">
        <div className="space-y-3">
          <p className="text-[24px] font-semibold text-[#0F172A]">
            Could not load this listing
          </p>
          <p className="text-[16px] text-[#64748B]">
            Please check the listing link or try again.
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

  const listing = listingQuery.data;
  const property = propertyQuery.data;
  const reviewItems = propertyReviewsQuery.data?.items ?? [];
  const listingImages = listingImagesQuery.data ?? [];
  const propertyImages = propertyImagesQuery.data ?? [];
  const galleryImages = listingImages.length ? listingImages : propertyImages;
  const gallerySlots = Array.from({ length: 5 }, (_, index) => {
    return galleryImages[index] ?? null;
  });
  const galleryCount = galleryImages.length;

  const fullAddress = property
    ? `${property.address}, ${property.city}, ${property.state} ${property.postal_code}`
    : `Property ${listing.property_id}`;

  const ratingCount =
    property?.review_stats.review_count ??
    propertyReviewsQuery.data?.total ??
    0;
  const ratingValue = (() => {
    const avg = property?.review_stats.average_rating;
    if (avg != null) return avg;
    if (!reviewItems.length) return 0;
    const sum = reviewItems.reduce((total, review) => total + review.rating, 0);
    return Number((sum / reviewItems.length).toFixed(1));
  })();

  const reviews: DisplayReview[] = reviewItems.map((review) => {
    const normalized = review.comment?.trim() || "No written comment provided.";
    const needsReadMore = normalized.length > 220;
    return {
      id: review.id,
      initials: getInitials(review.user_id),
      name: userDisplayName(review.user_id),
      livedRange: formatReviewDate(review.created_at),
      text: needsReadMore ? `${normalized.slice(0, 220)}...` : normalized,
      fullText: needsReadMore ? normalized : undefined,
      avatarColor: avatarColor(review.user_id),
      rating: review.rating,
    };
  });

  const highlightItems =
    listing.amenities.length > 0
      ? listing.amenities.map((amenity) => ({
          icon: AMENITY_ICON_BY_KEY[amenity.key] ?? Box,
          label: amenity.label,
        }))
      : FALLBACK_HIGHLIGHTS;

  const distanceMiles = property
    ? haversineMiles(
        UCLA_BRUIN_BEAR.lat,
        UCLA_BRUIN_BEAR.lng,
        property.latitude,
        property.longitude,
      )
    : null;

  const recommendedListings: RecommendedListing[] = recommendedBaseItems.map(
    (item, index) => ({
      id: item.id,
      monthlyRent: item.monthly_rent,
      rating: ratingValue || 0,
      ratingCount,
      beds: unitTypeToBeds(item.unit_type),
      baths: unitTypeToBaths(item.unit_type),
      sqft: item.square_feet,
      address: fullAddress,
      image:
        recommendedImageQueries[index].data?.[0] ??
        propertyImages[0] ??
        gallerySlots[0] ??
        null,
    }),
  );

  return (
    <div className="w-full bg-[#F5F5F5]">
      <section className="mx-auto w-full max-w-[1441px] px-4 pb-[82px] pt-[60px] sm:px-8 xl:px-[120px]">
        <div className="space-y-[50px]">
          {galleryCount >= 5 ? (
            <div className="grid gap-[25px] lg:grid-cols-[595px_minmax(0,1fr)]">
              <div className="h-[475px] overflow-hidden rounded-bl-[25px] rounded-tl-[25px] bg-[#DADADA]">
                <ListingImage
                  src={gallerySlots[0]}
                  alt={`${listing.title} main image`}
                  priority
                />
              </div>

              <div className="grid h-[475px] grid-cols-2 gap-[25px]">
                <div className="overflow-hidden bg-[#DADADA]">
                  <ListingImage
                    src={gallerySlots[1]}
                    alt={`${listing.title} image 2`}
                  />
                </div>
                <div className="overflow-hidden rounded-tr-[25px] bg-[#DADADA]">
                  <ListingImage
                    src={gallerySlots[2]}
                    alt={`${listing.title} image 3`}
                  />
                </div>
                <div className="overflow-hidden bg-[#DADADA]">
                  <ListingImage
                    src={gallerySlots[3]}
                    alt={`${listing.title} image 4`}
                  />
                </div>

                <div className="relative overflow-hidden rounded-br-[25px] bg-[#DADADA]">
                  <ListingImage
                    src={gallerySlots[4]}
                    alt={`${listing.title} image 5`}
                  />
                  <button
                    type="button"
                    className="absolute bottom-5 right-3 inline-flex h-10 items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white"
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
                <div
                  key={`listing-gallery-4-${index}`}
                  className={`overflow-hidden bg-[#DADADA] ${
                    index === 0
                      ? "rounded-tl-[25px]"
                      : index === 1
                        ? "rounded-tr-[25px]"
                        : index === 2
                          ? "rounded-bl-[25px]"
                          : "rounded-br-[25px]"
                  }`}
                >
                  <ListingImage
                    src={src}
                    alt={`${listing.title} image ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          ) : galleryCount === 3 ? (
            <div className="grid h-[475px] gap-[25px] lg:grid-cols-[2fr_1fr]">
              <div className="overflow-hidden rounded-l-[25px] bg-[#DADADA]">
                <ListingImage
                  src={galleryImages[0]}
                  alt={`${listing.title} image 1`}
                  priority
                />
              </div>

              <div className="grid gap-[25px]">
                <div className="overflow-hidden rounded-tr-[25px] bg-[#DADADA]">
                  <ListingImage
                    src={galleryImages[1]}
                    alt={`${listing.title} image 2`}
                  />
                </div>
                <div className="overflow-hidden rounded-br-[25px] bg-[#DADADA]">
                  <ListingImage
                    src={galleryImages[2]}
                    alt={`${listing.title} image 3`}
                  />
                </div>
              </div>
            </div>
          ) : galleryCount === 2 ? (
            <div className="grid h-[475px] gap-[25px] lg:grid-cols-2">
              <div className="overflow-hidden rounded-l-[25px] bg-[#DADADA]">
                <ListingImage
                  src={galleryImages[0]}
                  alt={`${listing.title} image 1`}
                  priority
                />
              </div>
              <div className="overflow-hidden rounded-r-[25px] bg-[#DADADA]">
                <ListingImage
                  src={galleryImages[1]}
                  alt={`${listing.title} image 2`}
                />
              </div>
            </div>
          ) : galleryCount === 1 ? (
            <div className="h-[475px] overflow-hidden rounded-[25px] bg-[#DADADA]">
              <ListingImage
                src={galleryImages[0]}
                alt={`${listing.title} image 1`}
                priority
              />
            </div>
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

          <div className="grid gap-[30px] lg:grid-cols-[842px_299px] lg:gap-[60px]">
            <div className="space-y-[50px]">
              <section className="space-y-[15px]">
                <button
                  type="button"
                  className="flex items-end gap-[15px]"
                  aria-label="Jump to reviews"
                >
                  <StarRow size={33} value={ratingValue} />
                  <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
                    {ratingValue.toFixed(1)}{" "}
                    <span className="font-normal text-[#BABABA]">
                      ({ratingCount})
                    </span>
                  </p>
                </button>

                <div className="space-y-2">
                  <p className="text-[20px] leading-7 tracking-[-0.1px] text-[#64748B]">
                    {listing.title}
                  </p>
                  <div className="flex items-center gap-5">
                    <p className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                      {formatCurrency(listing.monthly_rent)} per month
                    </p>
                    <div className="flex items-center gap-2 text-[#71C4FF]">
                      <button type="button" aria-label="Save listing">
                        <Heart className="h-[34.56px] w-[34.56px]" />
                      </button>
                      <button type="button" aria-label="Share listing">
                        <Share2 className="h-9 w-9" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center text-[20px] leading-7 tracking-[-0.1px] text-black">
                  <p>
                    {unitTypeToBeds(listing.unit_type)}{" "}
                    <span className="font-normal">bd</span>
                  </p>
                  <span className="w-[43px] text-center text-[#BABABA]">|</span>
                  <p>
                    {unitTypeToBaths(listing.unit_type)}{" "}
                    <span className="font-normal">ba</span>
                  </p>
                  <span className="w-[43px] text-center text-[#BABABA]">|</span>
                  <p>
                    {(listing.square_feet ?? 0).toLocaleString()}{" "}
                    <span className="font-normal">sq ft</span>
                  </p>
                </div>

                <p className="text-[20px] leading-7 tracking-[-0.1px] text-[#919191]">
                  {fullAddress}
                </p>

                {propertyId ? (
                  <Link
                    href={`/building/${propertyId}`}
                    className="inline-flex h-10 items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white transition hover:bg-[#2398F2]"
                  >
                    <Building2 className="h-5 w-5" />
                    View building
                  </Link>
                ) : null}
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-[25px]">
                <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                  Highlights
                </h2>

                <div className="grid gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
                  {highlightItems.map((highlight) => (
                    <AmenityItem
                      key={`${highlight.label}-${highlight.icon}`}
                      icon={highlight.icon}
                      label={highlight.label}
                    />
                  ))}
                </div>

                <p className="text-[14px] leading-6 text-black">
                  {listing.description}
                </p>
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-5">
                <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                  Location
                </h2>

                <div className="h-[350px] overflow-hidden rounded-[25px] bg-[#DADADA]">
                  <LocationMap
                    lat={property?.latitude}
                    lng={property?.longitude}
                    address={fullAddress}
                  />
                </div>

                <div className="space-y-[15px]">
                  <div className="flex items-center gap-[10px]">
                    <MapPin className="h-[38px] w-[38px] text-[#3EA6FC]" />
                    <p className="text-[32px] font-semibold leading-[38px] tracking-[-0.16px] text-black">
                      Distance from Bruin Bear
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-5">
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Footprints className="h-6 w-6" />
                      {etaLabel(distanceMiles, 3)}
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Bike className="h-6 w-6" />
                      {etaLabel(distanceMiles, 10)}
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Car className="h-6 w-6" />
                      {etaLabel(distanceMiles, 20)}
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
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
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="text-[40px] font-semibold leading-[normal] tracking-[-0.2px] text-black">
                          Reviews{" "}
                          <span className="font-normal text-[#BABABA]">
                            ({ratingCount})
                          </span>
                        </h2>
                      </div>

                      <div className="space-y-[15px]">
                        <StarRow size={43} value={ratingValue} />
                        <p className="text-[28px] leading-7 tracking-[-0.1px] text-black">
                          {ratingValue.toFixed(1)} out of 5 stars
                        </p>
                      </div>
                    </div>

                    <ReviewBars
                      ratings={reviewItems.map((review) => review.rating)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-[15px]">
                      <label className="relative block h-10 w-[251px]">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#BABABA]" />
                        <input
                          type="text"
                          placeholder="Search reviews..."
                          className="h-full w-full rounded-[25px] border border-[#919191] bg-transparent pl-11 pr-4 text-[20px] leading-6 text-black outline-none placeholder:text-[#BABABA]"
                        />
                      </label>

                      <button
                        type="button"
                        className="inline-flex h-10 w-[105px] items-center gap-[5px] rounded-[25px] border border-[#919191] bg-transparent px-4 py-2 text-[14px] leading-6 text-black"
                      >
                        Sort by
                        <ChevronDown className="h-6 w-6 text-[#919191]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReviewSubmitError(null);
                        setAddReviewOpen(true);
                      }}
                      disabled={!propertyId}
                      className="inline-flex h-10 w-[142px] items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white"
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
                  {reviews.length ? (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <div className="rounded-[25px] bg-white p-[30px] text-[18px] text-[#64748B] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                      No reviews yet for this property.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="lg:relative">
              <div className="lg:sticky lg:top-[120px]">
                <ContactCard
                  userId={listing.user_id}
                  leaseType={listing.lease_type}
                  availableFrom={listing.available_from}
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
                href={`/search?listing=${listingId}`}
                className="inline-flex h-10 items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white"
              >
                <Search className="h-6 w-6" />
                See more
              </Link>
            </div>

            <div className="grid gap-[35px] md:grid-cols-2 xl:grid-cols-3">
              {recommendedListings.length ? (
                recommendedListings.map((recommended) => (
                  <RecommendedCard key={recommended.id} listing={recommended} />
                ))
              ) : (
                <div className="rounded-[25px] bg-white p-8 text-[18px] text-[#64748B] shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
                  No additional listings are available in this building yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
