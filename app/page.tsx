import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Search } from "lucide-react"
import { ListingRow } from "@/components/ui/listings/ListingRow"

export default function Home() {
  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold">BruinPlace</h1>
      <p className="mt-2 text-zinc-600">Dummy landing page.</p>

      <div className="mt-6 space-y-2">
        <a className="underline" href="/search">Go to Search</a><br />
        <a className="underline" href="/listings/1">Go to Listing #1</a><br />
        <a className="underline" href="/profile">Go to Profile</a>
      </div>
    </div>
  );
}

export function HomePage() {
  // mock data
  const listings = Array.from({ length: 10 }).map((_, i) => ({
    id: String(i),
    priceLabel: "$1,300 per month",
    beds: 4,
    baths: 3,
    sqft: 1328,
    address: "330 De Neve Dr, Los Angeles, CA 90024",
    rating: 4.7,
    reviewsCount: 17,
    tags: ["For rent", "Parking available", "Unfurnished", "Pet friendly"],
    images: [], // plug in urls later
  }))

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b bg-[#B4B4B4] backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center px-6 py-3">
          <div className="text-sm font-semibold">BruinPlace</div>
          <Button className="ml-auto rounded-full" variant="secondary">
            Add listing
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#D9D9D9]">
        <div className="mx-auto max-w-9xl px-6 py-14 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Lorem ipsum dolor sit amet
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Sit amet consectetur adipiscing elit quisque ex. Adipiscing elit
            quisque faucibus ex sapien vitae.
          </p>

          <div className="mx-auto mt-6 w-full max-w-xl">
            <div className="relative">
              <Input
                placeholder="Search by address, neighborhood, zip code"
                className="
                  h-14 rounded-full bg-background
                  pl-6 pr-16 text-base
                  placeholder:text-muted-foreground/70
                  shadow-sm
                "
              />

              <Button
                type="submit"
                size="icon"
                className="
                  absolute right-2 top-1/2 -translate-y-1/2
                  h-10 w-10 rounded-full
                  bg-[#757575] hover:bg-[#757575]/80
                "
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Rows */}
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <ListingRow title="Recommended Listings" listings={listings} />
        <Separator className="my-6" />
        <ListingRow title="Recommended Listings" listings={listings} />
        <Separator className="my-6" />
        <ListingRow title="Recommended Listings" listings={listings} />
      </main>

      {/* Bottom CTA*/}
      <div className="border-t bg-[#B4B4B4]">
        <div className="mx-auto flex max-w-7xl justify-end px-6 py-6">
          <Button className="rounded-full" variant="secondary">
            Add listing
          </Button>
        </div>
      </div>
    </div>
  )
}