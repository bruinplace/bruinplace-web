export default function ProfilePage() {
  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <p className="mt-2 text-zinc-600">
        Dummy profile page (pfp, username, password, notifications, contact info).
      </p>

      <div className="mt-6 space-y-2">
        <a className="underline" href="/profile/saved">Saved listings</a><br />
        <a className="underline" href="/profile/reviews">My reviews</a>
      </div>
    </div>
  );
}