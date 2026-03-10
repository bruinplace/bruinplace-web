import ProfileTopBar from "@/components/profile/ProfileTopBar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <ProfileTopBar />
      <main>{children}</main>
    </div>
  );
}
