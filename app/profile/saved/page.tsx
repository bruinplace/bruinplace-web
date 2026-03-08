import FavoritedListingsPanel from "@/components/profile/FavoritedListingsPanel"
import { ProfilePageShell } from "@/components/profile/ProfilePageShell"

export default function SavedListingsPage() {
  return (
    <ProfilePageShell activeTab="favorites">
      <FavoritedListingsPanel />
    </ProfilePageShell>
  )
}
