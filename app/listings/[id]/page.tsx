// app/listings/[id]/page.tsx
export default async function ListingPage({ params, }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="min-h-screen p-10">
        <h1 className="text-3xl font-semibold">Listing #{id}</h1>
        <p className="mt-2 text-zinc-600">Dummy individual listing page.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6">
            <h2 className="font-semibold">Information</h2>
            <p className="mt-2 text-sm text-zinc-600">
                Price, address, description, etc.
            </p>
            </div>

            <div className="rounded-2xl border bg-white p-6">
            <h2 className="font-semibold">Distance from Bruin Bear</h2>
            <p className="mt-2 text-sm text-zinc-600">
                Walk vs bike vs drive estimate.
            </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 md:col-span-2">
            <h2 className="font-semibold">Gallery</h2>
            <p className="mt-2 text-sm text-zinc-600">Photos go here.</p>
            </div>

            <div className="rounded-2xl border bg-white p-6 md:col-span-2">
            <h2 className="font-semibold">Reviews</h2>
            <p className="mt-2 text-sm text-zinc-600">Reviews go here.</p>
            <a className="mt-4 inline-block underline" href={`/listings/${id}/review`}>
                Write a review
            </a>
            </div>
        </div>
        </div>
    );
}