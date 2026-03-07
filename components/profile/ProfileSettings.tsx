import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsPanel from "@/components/profile/SettingsPanel";
import FavoritedListingsPanel from "@/components/profile/FavoritedListingsPanel";
import ReviewsPanel from "@/components/profile/ReviewsPanel";


export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      {/* Header row (avatar + username + stats) */}
      <div className="flex items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-sky-500 text-white">JB</AvatarFallback>
        </Avatar>

        <div>
          <div className="text-lg font-semibold">joe_bruin</div>
          <div className="mt-1 flex gap-6 text-sm text-zinc-600">
            <span>
              <span className="font-medium text-zinc-900">3</span> listings
            </span>
            <span>
              <span className="font-medium text-zinc-900">9</span> reviews
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="bg-transparent p-0">
          <TabsTrigger value="favorites" className="data-[state=active]:bg-zinc-100">
            Favorited Listings
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-zinc-100">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-100">
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