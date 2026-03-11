"use client";

import Image from "next/image";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Heart, Search, Star } from "lucide-react";
import { api } from "@/lib/api";

type LandingListing = {
  id: string;
  name: string;
  rating: number;
  ratingCount: number;
  address: string;
  image: string;
  href: string;
};

type ApiListingResponse = {
  id: string;
  property_id: string;
  title: string;
  monthly_rent: number;
  unit_type: string;
  square_feet: number | null;
  status: string;
  created_at: string;
};

type ApiPropertyDetailResponse = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
};

type ApiImageItem = {
  url: string;
  display_order: number;
};

type ApiImageListResponse = {
  items: ApiImageItem[];
  total: number;
};

const ROW_TITLES = [
  "Trending Near UCLA",
  "Fresh This Week",
  "Popular Right Now",
] as const;
const HARD_CODED_LISTING_IDS = [
  "06617491-7c51-480d-a96f-11827b8c6cbc",
  "751a6965-7385-4cb0-8366-e1191ab28808",
  "d0586684-524a-4aeb-a69b-d660efce0ca3",
  "b9b645cb-beaf-4c9a-88d7-cb30f0af8890",
  "a7a84a47-62bf-41f2-9073-34cc8ed6a8d2",
  "c577f7a4-1ca3-44c9-9313-3518c31a2653",
  "a965cf99-f699-47d8-9579-2b341494a9f4",
  "d444b18e-53aa-4e43-88ee-37443837974b",
  "90260207-a998-4469-bfd8-2dae805f7ac8",
  "893bcead-f678-4160-81ef-0f8fc740a118",
  "54a2fbc3-eec0-485f-9708-4e2dbed73ae3",
  "507d8f24-4516-44df-88f9-5ecafac8bf92",
] as const;

function stableHash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function firstImageUrl(items: ApiImageItem[]): string | null {
  const first = items
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .find((item) => item.url);
  return first?.url ?? null;
}

async function fetchListingImage(
  listingId: string,
  propertyId: string,
): Promise<string | null> {
  try {
    const listingImages = await api.get<ApiImageListResponse>(
      `/listings/${listingId}/images`,
    );
    const listingImage = firstImageUrl(listingImages.items);
    if (listingImage) return listingImage;
  } catch {
    // fall through to property image fallback
  }

  try {
    const propertyImages = await api.get<ApiImageListResponse>(
      `/properties/${propertyId}/images`,
    );
    return firstImageUrl(propertyImages.items);
  } catch {
    return null;
  }
}

function HeroArtwork({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <div className={`absolute hidden overflow-hidden md:block ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}

function BrickCluster({
  className,
  reverse = false,
  triple = false,
}: {
  className: string;
  reverse?: boolean;
  triple?: boolean;
}) {
  const brickClass =
    "h-[15.5px] w-[42.6px] rounded-[2.88px] border-2 border-[#3EA6FC] bg-[rgba(113,196,255,0.5)]";
  const flowClass = reverse ? "items-end" : "items-start";

  return (
    <div
      className={`absolute hidden md:flex md:flex-col ${flowClass} ${className}`}
    >
      <div className={brickClass} />
      <div
        className={`${brickClass} mt-[2px] ${reverse ? "mr-[16px]" : "ml-[16px]"}`}
      />
      {triple ? <div className={`${brickClass} mt-[2px]`} /> : null}
    </div>
  );
}

function ListingCard({ listing }: { listing: LandingListing }) {
  return (
    <Link
      href={listing.href}
      className="block h-[292.96px] w-full rounded-[25px] bg-white p-[15.546px] shadow-[0_3.109px_6.219px_rgba(0,0,0,0.25)]"
    >
      <div className="relative h-[182px] w-full overflow-hidden rounded-[20px] bg-[#E8E8E8]">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={listing.name}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 45vw, 100vw"
          />
        ) : null}
        <button
          type="button"
          aria-label="Save listing"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="absolute right-[11.66px] top-[12.165px] inline-flex h-[27.478px] w-[27.478px] items-center justify-center rounded-full bg-white/70 text-white"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-[19.433px] space-y-[3.887px]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[18.66px] font-semibold leading-[21.765px] text-[#0F172A]">
            {listing.name}
          </p>
          <div className="flex items-center gap-[6.219px] text-[14px] leading-6">
            <Star className="h-[15.546px] w-[15.546px] fill-[#C8C8C8] text-[#C8C8C8]" />
            <span className="font-bold text-black">
              {listing.rating.toFixed(1)}
            </span>
            <span className="font-medium text-[#BABABA]">
              ({listing.ratingCount})
            </span>
          </div>
        </div>
        <p className="text-[10.88px] leading-[18.656px] text-[#919191]">
          {listing.address}
        </p>
      </div>
    </Link>
  );
}

function RecommendedRow({
  title,
  listings,
  isLoading,
}: {
  title: string;
  listings: LandingListing[];
  isLoading: boolean;
}) {
  return (
    <section className="h-auto xl:h-[346.960px]">
      <div className="flex h-auto items-center justify-between pb-4 xl:h-[54px] xl:pb-0">
        <h2 className="text-[18px] font-semibold leading-7 text-black">
          {title}
        </h2>

        <Link
          href="/search"
          className="inline-flex h-[41px] items-center gap-[10.5px] rounded-[70px] bg-[#3EA6FC] px-[21px] text-white shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
        >
          <Search className="h-[21.6px] w-[21.6px]" />
          <span className="text-[16px] leading-7">See more</span>
        </Link>
      </div>

      <div className="grid gap-x-[27px] gap-y-4 md:grid-cols-2 xl:mt-0 xl:grid-cols-4 xl:gap-x-[27.206px] xl:gap-y-[13.214px]">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`landing-skeleton-${title}-${index}`}
                className="h-[292.96px] w-full rounded-[25px] bg-[#ECECEC] xl:w-[300.044px]"
              />
            ))
          : listings.map((listing) => (
              <div key={listing.id} className="xl:w-[300.044px]">
                <ListingCard listing={listing} />
              </div>
            ))}
        {!isLoading && listings.length === 0 ? (
          <div className="col-span-full rounded-[25px] bg-white px-6 py-8 text-center text-[14px] text-[#64748B] shadow-[0_3.109px_6.219px_rgba(0,0,0,0.12)]">
            No listings available yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function Home() {
  const listingQueries = useQueries({
    queries: HARD_CODED_LISTING_IDS.map((listingId) => ({
      queryKey: ["landing_listing_detail", listingId],
      queryFn: () => api.get<ApiListingResponse>(`/listings/${listingId}`),
      staleTime: 120_000,
      retry: false,
    })),
  });

  const selectedListings: ApiListingResponse[] = [];
  for (const query of listingQueries) {
    if (query.data) selectedListings.push(query.data);
  }

  const propertyIds = Array.from(
    new Set(selectedListings.map((listing) => listing.property_id)),
  );

  const propertyQueries = useQueries({
    queries: propertyIds.map((propertyId) => ({
      queryKey: ["landing_property_detail", propertyId],
      queryFn: () =>
        api.get<ApiPropertyDetailResponse>(`/properties/${propertyId}`),
      staleTime: 120_000,
      retry: false,
    })),
  });

  const propertyById = new Map<string, ApiPropertyDetailResponse>();
  for (let index = 0; index < propertyIds.length; index += 1) {
    const property = propertyQueries[index]?.data;
    if (property) propertyById.set(propertyIds[index], property);
  }

  const imageQueries = useQueries({
    queries: selectedListings.map((listing) => ({
      queryKey: ["landing_listing_card_image", listing.id, listing.property_id],
      queryFn: () => fetchListingImage(listing.id, listing.property_id),
      staleTime: 120_000,
      retry: false,
    })),
  });

  const landingListings: LandingListing[] = [];
  for (let index = 0; index < selectedListings.length; index += 1) {
    const listing = selectedListings[index];
    const property = propertyById.get(listing.property_id);
    const image = imageQueries[index]?.data ?? null;
    if (!property || !image) continue;

    const seed = stableHash(listing.id);
    landingListings.push({
      id: listing.id,
      name: property.name,
      rating: Number((4 + (seed % 9) * 0.1).toFixed(1)),
      ratingCount: 1 + (seed % 20),
      address: `${property.address}, ${property.city}, ${property.state}`,
      image,
      href: `/listings/${listing.id}`,
    });
  }

  const landingRowsLoading =
    listingQueries.some((query) => query.isLoading) ||
    propertyQueries.some((query) => query.isLoading) ||
    imageQueries.some((query) => query.isLoading);

  const listingRows = [
    landingListings.slice(0, 4),
    landingListings.slice(4, 8),
    landingListings.slice(8, 12),
  ];

  return (
    <div className="w-full bg-white">
      <section className="relative h-[374px] overflow-hidden bg-[#DFF1FF]">
        <HeroArtwork
          src="/assets/untitled-artwork-1-1.svg"
          alt="Untitled Artwork 1 1"
          className="left-[21px] top-[9px] h-[123px] w-[182px]"
        />
        <HeroArtwork
          src="/assets/untitled-artwork-3-1.svg"
          alt="Untitled Artwork 3 1"
          className="left-[112px] top-[130px] h-[233px] w-[276px]"
        />
        <HeroArtwork
          src="/assets/untitled-artwork-2-1.svg"
          alt="Untitled Artwork 2 1"
          className="right-[0px] top-[8px] h-[202px] w-[316px]"
        />
        <HeroArtwork
          src="/assets/untitled-artwork-4.svg"
          alt="Untitled Artwork 4"
          className="right-[202px] top-[221px] h-[153px] w-[169px]"
        />

        <BrickCluster className="left-[243px] top-[58px]" />
        <BrickCluster className="right-[280px] top-[132px]" reverse />
        <BrickCluster className="right-[-10px] top-[275px]" reverse triple />
        <BrickCluster className="left-[-8px] top-[308px]" reverse triple />

        <div className="relative mx-auto h-full w-full max-w-[1441px] text-center">
          <h1 className="absolute left-1/2 top-[79.5px] w-[586.264px] -translate-x-1/2 text-[43.2px] font-extrabold leading-[43.2px] tracking-[-0.5184px] text-black">
            Off-campus housing, built around you.
          </h1>

          <p className="absolute left-1/2 top-[186.8px] w-[553.040px] -translate-x-1/2 text-[18px] font-semibold leading-7 text-[#757575]">
            Built by Bruins, for every Bruin looking for their next place.
          </p>

          <div className="absolute left-1/2 top-[249px] w-[556px] -translate-x-1/2">
            <input
              readOnly
              value=""
              placeholder="Search by address, neighborhood, zip code"
              className="h-[57px] w-full rounded-[90px] bg-white pl-[30px] pr-[76px] text-[20px] leading-7 text-[#919191] outline-none placeholder:text-[#919191]"
            />
            <Link
              href="/search"
              aria-label="Search"
              className="absolute right-[11px] top-1/2 inline-flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-[#3EA6FC] text-white"
            >
              <Search className="h-[22px] w-[22px]" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5]">
        <div className="mx-auto w-full max-w-[1441px] px-4 pb-[98px] pt-[23px] sm:px-8 xl:px-[76px]">
          <div className="space-y-[37px]">
            <RecommendedRow
              title={ROW_TITLES[0]}
              listings={listingRows[0] ?? []}
              isLoading={landingRowsLoading}
            />
            <div className="h-px w-full bg-[#D4D4D4]" />
            <RecommendedRow
              title={ROW_TITLES[1]}
              listings={listingRows[1] ?? []}
              isLoading={landingRowsLoading}
            />
            <div className="h-px w-full bg-[#D4D4D4]" />
            <RecommendedRow
              title={ROW_TITLES[2]}
              listings={listingRows[2] ?? []}
              isLoading={landingRowsLoading}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
