"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsPanel from "@/components/profile/SettingsPanel";
import FavoritedListingsPanel from "@/components/profile/FavoritedListingsPanel";
import ReviewsPanel from "@/components/profile/ReviewsPanel";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useSavedListings } from "@/hooks/use-saved-listings";

function initialsFromName(name?: string | null, email?: string | null) {
  const source = (name && name.trim()) || (email && email.trim()) || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function ProfileSettings() {
  const { data: authUser } = useAuthMe();
  const { data: savedListings } = useSavedListings();

  const displayName = authUser?.name || authUser?.email || "Guest";
  const initials = initialsFromName(authUser?.name, authUser?.email);
  const savedCount = savedListings?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header row (avatar + username + stats) */}
      <div className="flex items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-sky-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="text-lg font-semibold">{displayName}</div>
          <div className="mt-1 flex gap-6 text-sm text-zinc-600">
            <span>
              <span className="font-medium text-zinc-900">{savedCount}</span>{" "}
              saved
            </span>
            <span>
              <span className="font-medium text-zinc-900">-</span> reviews
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="bg-transparent p-0">
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-zinc-100"
          >
            Favorited Listings
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:bg-zinc-100"
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-zinc-100"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <TabsContent value="favorites">
            <FavoritedListingsPanel />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsPanel />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
