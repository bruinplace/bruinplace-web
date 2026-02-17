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