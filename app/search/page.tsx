export default function SearchPage() {
  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold">Search</h1>
      <p className="mt-2 text-zinc-600">
        Dummy split-screen map + listing search page.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Filters / Listings</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Sorting/filtering will go here.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Map</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Map component will go here.
          </p>
        </div>
      </div>
    </div>
  );
}