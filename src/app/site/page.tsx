import Image from "next/image";
import Link from "next/link";
import { Heart, Search, Star } from "lucide-react";

type LandingListing = {
  id: string;
  name: string;
  rating: string;
  ratingCount: string;
  address: string;
};

const LISTINGS: LandingListing[] = [
  {
    id: "atrium",
    name: "The Atrium",
    rating: "4.3",
    ratingCount: "4",
    address: "10965 Strathmore Dr, Los Angeles, CA",
  },
  {
    id: "el-greco",
    name: "El Greco Lofts",
    rating: "4.2",
    ratingCount: "11",
    address: "1030 Tiverton Avenue, Los Angeles, CA",
  },
  {
    id: "eight-70",
    name: "Eight 70",
    rating: "4.1",
    ratingCount: "1",
    address: "870 Hilgard Avenue, Los Angeles, CA",
  },
  {
    id: "rochester",
    name: "Rochester Parkside",
    rating: "4.6",
    ratingCount: "5",
    address: "10989 Rochester Ave, Los Angeles, CA",
  },
];

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
      href="/search"
      className="block h-[292.96px] w-full rounded-[25px] bg-white p-[15.546px] shadow-[0_3.109px_6.219px_rgba(0,0,0,0.25)]"
    >
      <div className="relative h-[182px] w-full overflow-hidden rounded-[20px] bg-[#E8E8E8]">
        <button
          type="button"
          aria-label="Save listing"
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
            <span className="font-bold text-black">{listing.rating}</span>
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

function RecommendedRow() {
  return (
    <section className="h-auto xl:h-[346.960px]">
      <div className="flex h-auto items-center justify-between pb-4 xl:h-[54px] xl:pb-0">
        <h2 className="text-[18px] font-semibold leading-7 text-black">
          Recommended Listings
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
        {LISTINGS.map((listing) => (
          <div key={listing.id} className="xl:w-[300.044px]">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
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
            <RecommendedRow />
            <div className="h-px w-full bg-[#D4D4D4]" />
            <RecommendedRow />
            <div className="h-px w-full bg-[#D4D4D4]" />
            <RecommendedRow />
          </div>
        </div>
      </section>
    </div>
  );
}
