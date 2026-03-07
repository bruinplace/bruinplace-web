import ProfileSettings from "@/components/profile/ProfileSettings";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page padding under header */}
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <ProfileSettings />
      </div>
    </div>
  );
}