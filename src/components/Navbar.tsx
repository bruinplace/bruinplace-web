"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthMe } from "@/hooks/use-auth-me";

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { data: authUser } = useAuthMe();

  const displaySource = authUser?.name || authUser?.email || "BruinPlace";
  const initials = getInitials(displaySource);

  return (
    <header className="w-full bg-[#71C4FF]">
      <div className="mx-auto flex h-[83px] w-full max-w-[1441px] items-center justify-between gap-4 px-4 sm:px-8 lg:pl-[80px] lg:pr-[70px]">
        <Link href="/" className="flex items-center gap-[15px] text-white">
          <span className="grid h-[49.823px] w-[50.318px] place-items-center rounded-xl border-2 border-white/80 bg-white/10">
            <span className="h-[24px] w-[24px] rounded-md border border-white/80" />
          </span>
          <span className="text-[24px] font-bold leading-8 tracking-[-0.144px]">
            BruinPlace
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-[20px]">
          <Link
            href="/listings/new"
            className="inline-flex h-[40px] items-center justify-center gap-[5px] rounded-[25px] bg-white px-[16px] text-[14px] font-medium leading-6 text-[#71C4FF] transition-colors hover:bg-white/90"
          >
            <Plus className="h-[20px] w-[20px]" />
            <span>Add listing</span>
          </Link>

          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-[39.362px] w-[43.243px] items-center justify-center rounded-[25px] bg-white text-[#71C4FF] transition-colors hover:bg-white/90"
          >
            <Bell className="h-[22px] w-[22px]" />
            <span className="absolute right-[13px] top-[8px] h-[6.865px] w-[6.865px] rounded-full bg-[#FFCB64]" />
          </button>

          {authUser ? (
            <Link href="/profile" aria-label="Go to profile">
              <Avatar className="h-[47.896px] w-[47.896px] border-[3.63px] border-white bg-[#3EA6FC]">
                {authUser.profile_picture ? (
                  <AvatarImage
                    src={authUser.profile_picture}
                    alt={authUser.name || authUser.email}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-[#3EA6FC] text-[16.94px] font-normal leading-[29.04px] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link
              href="/auth/sign-in"
              className="inline-flex h-[39.362px] items-center justify-center rounded-[25px] border border-white bg-[#3EA6FC] px-4 text-[14px] text-white transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
