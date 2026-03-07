import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Search } from "lucide-react"
import { ListingRow } from "@/components/listings/ListingRow"

export default function Home() {
  const listings = Array.from({ length: 10 }).map((_, i) => ({
    id: String(i),
    priceLabel: "$1,300 per month",
    beds: 4,
    baths: 3,
    sqft: 1328,
    address: "330 De Neve Dr, Los Angeles, CA 90024",
    name: "The Atrium",
    rating: 4.7,
    reviewsCount: 17,
    images: [],
  }))

  return (
    <div className="min-h-dvh bg-background">
      {/* Hero */}
      <section className="bg-[#DFF1FF]">
        <div className="mx-auto max-w-[720px] px-6 py-14 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Lorem ipsum dolor sit amet
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Sit amet consectetur adipiscing elit quisque ex. Adipiscing elit
            quisque faucibus ex sapien vitae.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-6 w-full max-w-md">
            <div className="relative">
              <Input
                placeholder="Search by address, neighborhood, zip code"
                className="
                  h-11 rounded-full bg-background
                  pl-4 pr-12 text-sm
                  placeholder:text-muted-foreground/70
                  shadow-sm
                "
              />

              <Button
                asChild
                size="icon"
                className="
                  absolute right-1.5 top-1/2 -translate-y-1/2
                  h-8 w-8 rounded-full
                  bg-[#71C4FF] hover:bg-[#71C4FF]/80
                "
                aria-label="Search"
              >
                <Link href="/search">
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Rows */}
      <main className="mx-auto max-w-[1440px] space-y-10 px-6 py-10">
        <ListingRow title="Recommended Listings" listings={listings} />
        <Separator className="my-6" />
        <ListingRow title="Recommended Listings" listings={listings} />
        <Separator className="my-6" />
        <ListingRow title="Recommended Listings" listings={listings} />
      </main>
    </div>
  )
}