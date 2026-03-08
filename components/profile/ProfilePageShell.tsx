import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type ProfileTab = "favorites" | "reviews" | "settings"

const TABS: Array<{ key: ProfileTab; label: string; href: string }> = [
  { key: "favorites", label: "Favorited Listings", href: "/profile/saved" },
  { key: "reviews", label: "Reviews", href: "/profile/reviews" },
  { key: "settings", label: "Settings", href: "/profile" },
]

export function ProfilePageShell({
  activeTab,
  children,
}: {
  activeTab: ProfileTab
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-[1039px] px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar className="h-[96px] w-[96px] border-2 border-white sm:h-[104px] sm:w-[104px]">
          <AvatarFallback className="bg-[#71C4FF] text-[42px] font-normal text-white">
            JB
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-[30px] font-semibold leading-[36px] tracking-[-0.025em] text-black">
            joe_bruin
          </p>
          <div className="mt-2 flex items-center gap-8 text-[20px] font-semibold leading-[28px] tracking-[-0.025em] text-black">
            <span>3 listings</span>
            <span>9 reviews</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-b border-[#c9c9c9]">
        <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-black">
          {TABS.map((tab) =>
            tab.key === activeTab ? (
              <span
                key={tab.key}
                className="rounded-full border border-[#d8d8d8] bg-white px-3 py-1 shadow-[0px_2px_4px_rgba(30,41,59,0.2)]"
              >
                {tab.label}
              </span>
            ) : (
              <Link key={tab.key} href={tab.href} className="hover:text-black/70">
                {tab.label}
              </Link>
            )
          )}
        </div>
      </div>

      <div className="space-y-6 py-6 sm:py-8">{children}</div>
    </div>
  )
}
