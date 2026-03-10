import ReviewsPanel from "@/components/profile/ReviewsPanel";
import { ProfilePageShell } from "@/components/profile/ProfilePageShell";

export default function ProfileReviewsPage() {
  return (
    <ProfilePageShell activeTab="reviews">
      <ReviewsPanel />
    </ProfilePageShell>
  );
}
