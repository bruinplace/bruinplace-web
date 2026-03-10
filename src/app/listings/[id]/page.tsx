"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import {
  Bike,
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

type ReviewTag = {
  icon: "user" | "flower" | "megaphone" | "clipboard";
  label: string;
};

type Review = {
  id: string;
  initials: string;
  name: string;
  livedRange: string;
  text: string;
  fullText?: string;
  cardHeight: string;
  showReadMore?: boolean;
  avatarColor: string;
  tags: ReviewTag[];
};

type RecommendedListing = {
  id: string;
  price: string;
  rating: string;
  ratingCount: string;
  beds: number;
  baths: number;
  sqft: string;
  address: string;
};

const REVIEWS: Review[] = [
  {
    id: "josie",
    initials: "JB",
    name: "Josie Bruin",
    livedRange: "2020 - 2019",
    avatarColor: "#D9297A",
    cardHeight: "h-[225px]",
    text: "The location makes my commute way easier and there are plenty of food spots nearby. Noise from the street is minimal once you're inside which surprised me.",
    tags: [
      { icon: "user", label: "Management: 5/5" },
      { icon: "flower", label: "Cleanliness: 4/5" },
      { icon: "megaphone", label: "Noise Level: 5/5" },
      { icon: "clipboard", label: "Lease Flexibility: 5/5" },
    ],
  },
  {
    id: "scotty",
    initials: "SH",
    name: "Scotty Highlander",
    livedRange: "2023 - 2024",
    avatarColor: "#F59E0B",
    cardHeight: "h-[254px]",
    text: "I was impressed with how modern the interior finishes looked compared to other places I toured. The pool area is also a great place to relax on weekends. I also like that the maintenance team follows up after completing requests. Also...",
    fullText:
      "I was impressed with how modern the interior finishes looked compared to other places I toured. The pool area is also a great place to relax on weekends. I also like that the maintenance team follows up after completing requests. The leasing team was responsive and made the move-in process straightforward.",
    showReadMore: true,
    tags: [
      { icon: "user", label: "Management: 5/5" },
      { icon: "flower", label: "Cleanliness: 5/5" },
      { icon: "megaphone", label: "Noise Level: 5/5" },
      { icon: "clipboard", label: "Lease Flexibility: 5/5" },
    ],
  },
  {
    id: "king",
    initials: "KT",
    name: "King Triton",
    livedRange: "2020 - 2019",
    avatarColor: "#34D399",
    cardHeight: "h-[254px]",
    text: "I've had a great experience living here so far and would definitely recommend it to others. The leasing team has been incredibly helpful and made the move-in process seamless from start to finish. The apartment itself is beautiful and...",
    fullText:
      "I've had a great experience living here so far and would definitely recommend it to others. The leasing team has been incredibly helpful and made the move-in process seamless from start to finish. The apartment itself is beautiful and well-maintained, and the location makes daily life near campus much easier.",
    showReadMore: true,
    tags: [
      { icon: "user", label: "Management: 5/5" },
      { icon: "flower", label: "Cleanliness: 4/5" },
      { icon: "megaphone", label: "Noise Level: 5/5" },
      { icon: "clipboard", label: "Lease Flexibility: 5/5" },
    ],
  },
];

const RECOMMENDED_LISTINGS: RecommendedListing[] = [
  {
    id: "r1",
    price: "$2,845 per month",
    rating: "4.7",
    ratingCount: "12",
    beds: 3,
    baths: 2,
    sqft: "1,328",
    address: "1033 Hilgard Ave, Los Angeles, CA 90024",
  },
  {
    id: "r2",
    price: "$1,342 per month",
    rating: "3.7",
    ratingCount: "5",
    beds: 2,
    baths: 2,
    sqft: "1,463",
    address: "1620 S Bentley Ave, Los Angeles, CA 90025",
  },
  {
    id: "r3",
    price: "$1,256 per month",
    rating: "4.9",
    ratingCount: "6",
    beds: 1,
    baths: 1,
    sqft: "1,288",
    address: "1040 Glendon Ave, Los Angeles, CA 90024",
  },
  {
    id: "r4",
    price: "$1,423 per month",
    rating: "4.7",
    ratingCount: "13",
    beds: 2,
    baths: 1,
    sqft: "1,625",
    address: "10700 Wilshire Blvd, Los Angeles, CA 90024",
  },
  {
    id: "r5",
    price: "$1,899 per month",
    rating: "4.7",
    ratingCount: "8",
    beds: 4,
    baths: 3,
    sqft: "1,528",
    address: "10824 Lindbrook Dr, Los Angeles, CA 90024",
  },
  {
    id: "r6",
    price: "$1,572 per month",
    rating: "4.7",
    ratingCount: "7",
    beds: 1,
    baths: 1,
    sqft: "1,302",
    address: "10636 Wilshire Blvd, Los Angeles, CA 90024",
  },
];

const HIGHLIGHTS = [
  { icon: Lock, label: "Security" },
  { icon: Box, label: "Hardwood flooring" },
  { icon: WandSparkles, label: "Curated art" },
  { icon: Waves, label: "In-unit washer & dryer" },
  { icon: Wifi, label: "Internet" },
  { icon: Wind, label: "AC" },
];

function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`h-full w-full bg-gradient-to-br from-[#dfdfdf] to-[#cfcfcf] ${className ?? ""}`}
    />
  );
}

function StarRow({ size = 33 }: { size?: number }) {
  return (
    <div className="flex items-center gap-[15.793px]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="text-[#F2B94B]"
          fill={index < 4 ? "currentColor" : "none"}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

function ReviewBars() {
  const rows = [
    { label: "5 stars", width: 92 },
    { label: "4 stars", width: 72 },
    { label: "3 stars", width: 32 },
    { label: "2 stars", width: 21 },
    { label: "1 stars", width: 13 },
  ];

  return (
    <div className="w-full max-w-[361px] space-y-[21.5px]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[53px_1fr] items-center gap-4"
        >
          <p className="text-[14px] leading-6 text-black">{row.label}</p>
          <div className="h-[19px] rounded-[40px] bg-[#E5E5E5]">
            <div
              className="h-[19px] rounded-[40px] bg-[#71C4FF]"
              style={{ width: `${row.width}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewTagChip({ tag }: { tag: ReviewTag }) {
  const iconClass = "h-[20px] w-[20px] text-[#3EA6FC]";

  return (
    <span className="inline-flex h-[40px] items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
      {tag.icon === "user" ? <User className={iconClass} /> : null}
      {tag.icon === "flower" ? <Flower2 className={iconClass} /> : null}
      {tag.icon === "megaphone" ? <Megaphone className={iconClass} /> : null}
      {tag.icon === "clipboard" ? (
        <ClipboardList className={iconClass} />
      ) : null}
      <span>{tag.label}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const canExpand = Boolean(review.showReadMore && review.fullText);
  const [expanded, setExpanded] = useState(false);
  const textToRender =
    canExpand && expanded && review.fullText ? review.fullText : review.text;

  return (
    <article
      className={`w-full rounded-[25px] bg-white p-[30px] shadow-[0_4px_8px_rgba(0,0,0,0.25)] ${expanded ? "h-auto" : review.cardHeight}`}
    >
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

        <StarRow size={33} />
      </div>

      <div className="mt-[10px] space-y-[10px]">
        <div>
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

        <div className="flex flex-wrap gap-[10px]">
          {review.tags.map((tag) => (
            <ReviewTagChip key={tag.label} tag={tag} />
          ))}
        </div>
      </div>
    </article>
  );
}

function RecommendedCard({ listing }: { listing: RecommendedListing }) {
  return (
    <article className="h-[400px] rounded-[25px] bg-white p-5 shadow-[0_4px_8px_rgba(0,0,0,0.25)]">
      <div className="relative h-[227px] overflow-hidden rounded-[25px] bg-[#DADADA]">
        <PhotoPlaceholder />
        <button
          type="button"
          aria-label="Save listing"
          className="absolute right-[15px] top-[15.65px] inline-flex h-[35.35px] w-[35.35px] items-center justify-center rounded-full border border-white/70 bg-black/10 text-white"
        >
          <Heart className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-[25px] space-y-[5px]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[24px] font-semibold leading-7 text-[#0F172A]">
            {listing.price}
          </p>

          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-[#BABABA] text-[#BABABA]" />
            <p className="text-[14px] font-bold leading-6 text-black">
              {listing.rating}
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
            <span className="font-bold">{listing.sqft}</span> sq ft
          </span>
        </div>

        <p className="text-[16px] leading-6 text-[#919191]">
          {listing.address}
        </p>
      </div>
    </article>
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

function ContactCard() {
  return (
    <aside className="rounded-[25px] bg-white p-[30px] shadow-[0_4px_15px_rgba(0,0,0,0.25)]">
      <div className="h-px w-full bg-[#D4D4D4]" />

      <div className="mt-10 space-y-[30px]">
        <h3 className="text-center text-[24px] font-semibold leading-8 tracking-[-0.144px] text-black">
          Contact this lister
        </h3>

        <div className="flex items-center justify-center gap-[15px]">
          <div className="grid h-[67px] w-[67px] place-items-center rounded-full bg-[#71C4FF] text-[37px] leading-[46.9px] text-white">
            JB
          </div>
          <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
            Joe Bruin
          </p>
        </div>

        <div className="space-y-[25px]">
          <div className="flex items-start gap-[15px]">
            <Mail className="h-6 w-6 text-[#71C4FF]" />
            <div>
              <p className="text-[14px] font-bold leading-6 text-black">
                Email
              </p>
              <p className="text-[14px] leading-6 text-black">
                joebruin33@gmail.com
              </p>
            </div>
          </div>

          <div className="flex items-start gap-[15px]">
            <svg
              className="h-6 w-6 text-[#71C4FF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div>
              <p className="text-[14px] font-bold leading-6 text-black">
                Phone
              </p>
              <p className="text-[14px] leading-6 text-black">(123) 456-789</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 h-px w-full bg-[#D4D4D4]" />
    </aside>
  );
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const listingId = id;

  return (
    <div className="w-full bg-[#F5F5F5]">
      <section className="mx-auto w-full max-w-[1441px] px-4 pb-[82px] pt-[60px] sm:px-8 xl:px-[120px]">
        <div className="space-y-[50px]">
          <div className="grid gap-[25px] lg:grid-cols-[595px_minmax(0,1fr)]">
            <div className="h-[475px] overflow-hidden rounded-bl-[25px] rounded-tl-[25px] bg-[#DADADA]">
              <PhotoPlaceholder />
            </div>

            <div className="grid h-[475px] grid-cols-2 gap-[25px]">
              <div className="overflow-hidden bg-[#DADADA]">
                <PhotoPlaceholder />
              </div>
              <div className="overflow-hidden rounded-tr-[25px] bg-[#DADADA]">
                <PhotoPlaceholder />
              </div>
              <div className="overflow-hidden bg-[#DADADA]">
                <PhotoPlaceholder />
              </div>

              <div className="relative overflow-hidden rounded-br-[25px] bg-[#DADADA]">
                <PhotoPlaceholder />
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

          <div className="grid gap-[30px] lg:grid-cols-[842px_299px] lg:gap-[60px]">
            <div className="space-y-[50px]">
              <section className="space-y-[15px]">
                <button
                  type="button"
                  className="flex items-end gap-[15px]"
                  aria-label="Jump to reviews"
                >
                  <StarRow size={33} />
                  <p className="text-[20px] font-semibold leading-7 tracking-[-0.1px] text-black">
                    4.4 <span className="font-normal text-[#BABABA]">(3)</span>
                  </p>
                </button>

                <div className="flex items-center gap-5">
                  <p className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                    $1,450 per month
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

                <div className="flex flex-wrap items-center text-[20px] leading-7 tracking-[-0.1px] text-black">
                  <p>
                    3 <span className="font-normal">bd</span>
                  </p>
                  <span className="w-[43px] text-center text-[#BABABA]">|</span>
                  <p>
                    2 <span className="font-normal">ba</span>
                  </p>
                  <span className="w-[43px] text-center text-[#BABABA]">|</span>
                  <p>
                    1,347 <span className="font-normal">sq ft</span>
                  </p>
                </div>

                <p className="text-[20px] leading-7 tracking-[-0.1px] text-[#919191]">
                  10599 Wilshire Blvd, Los Angeles, CA 90024
                </p>
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-[25px]">
                <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                  Highlights
                </h2>

                <div className="grid gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
                  {HIGHLIGHTS.map((highlight) => (
                    <AmenityItem
                      key={highlight.label}
                      icon={highlight.icon}
                      label={highlight.label}
                    />
                  ))}
                </div>

                <p className="text-[14px] leading-6 text-black">
                  Wilshire Margot introduces you to a life of luxury,
                  relaxation, and comfort. Explore resort-inspired amenities,
                  sweeping city views, and modern interiors in our Wilshire
                  Blvd. apartment community. Disclaimer: Some images may be
                  digitally altered or virtually staged. Original, unaltered
                  photos are available on this property&apos;s website. Our
                  apartments capture the essence of everything you love about
                  Los Angeles, from its vibrant ambiance to its everyday urban
                  conveniences.
                </p>
              </section>

              <div className="h-px w-full bg-[#D4D4D4]" />

              <section className="space-y-5">
                <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.225px] text-black">
                  Location
                </h2>

                <div className="h-[350px] overflow-hidden rounded-[25px] bg-[#DADADA]">
                  <PhotoPlaceholder />
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
                      12 min
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Bike className="h-6 w-6" />8 min
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Car className="h-6 w-6" />7 min
                    </span>
                    <span className="inline-flex h-10 items-center gap-[10px] rounded-[25px] border border-[#3EA6FC] bg-[rgba(113,196,255,0.1)] px-4 py-2 text-[14px] font-medium leading-6 text-[#3EA6FC]">
                      <Bus className="h-6 w-6" />
                      10 min
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
                            (3)
                          </span>
                        </h2>
                      </div>

                      <div className="space-y-[15px]">
                        <StarRow size={43} />
                        <p className="text-[28px] leading-7 tracking-[-0.1px] text-black">
                          4.4 out of 5 stars
                        </p>
                      </div>
                    </div>

                    <ReviewBars />
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
                      className="inline-flex h-10 w-[142px] items-center gap-[10px] rounded-[25px] bg-[#3EA6FC] px-4 py-2 text-[14px] font-medium leading-6 text-white"
                    >
                      <Pencil className="h-6 w-6" />
                      Add review
                    </button>
                  </div>
                </div>

                <div className="space-y-[45px]">
                  {REVIEWS.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:relative">
              <div className="lg:sticky lg:top-[120px]">
                <ContactCard />
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
              {RECOMMENDED_LISTINGS.map((listing) => (
                <RecommendedCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
