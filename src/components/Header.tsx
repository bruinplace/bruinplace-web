"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuthLoginUrl } from "@/lib/api";
import { User, Plus, UserCog, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const UCLA_SSO_URL = getAuthLoginUrl();

export default function Header() {
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-[#71C4FF]">
        <div className="mx-auto flex min-h-[74px] max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0 text-xl font-semibold text-white">
            BruinPlace
          </Link>

          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <Button
              asChild
              className="h-[37px] min-w-[130px] rounded-full bg-white text-sky-600 hover:bg-white hover:text-sky-600"
            >
              <Link
                href="/sublets/new"
                className="flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add sublet</span>
              </Link>
            </Button>

            <Button
              asChild
              className="h-[37px] min-w-[130px] rounded-full bg-white text-sky-600 hover:bg-white hover:text-sky-600"
            >
              <Link
                href="/listings/new"
                className="flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add listing</span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSignInOpen(true)}
              className="h-[37px] min-w-[106px] rounded-full border border-sky-600 bg-white text-sky-600 hover:bg-white hover:text-sky-600"
            >
              <span className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Sign in</span>
              </span>
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent
          className="
            w-[411px] max-w-none rounded-[25px] p-[50px]
            shadow-[0_4px_15px_rgba(0,0,0,0.25)] border-0
          "
        >
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in with UCLA SSO.
          </DialogDescription>

          <div className="flex flex-col items-center gap-[20px] text-center">
            <div className="mt-1">
              <UserCog className="h-16 w-16 text-[#71C4FF]" />
            </div>

            <div className="text-2xl font-semibold text-[#71C4FF]">
              BruinPlace
            </div>

            <div className="text-sm text-zinc-700">
              Sign in with your UCLA account to continue.
            </div>

            <Button
              className="h-[42px] w-[260px] rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF] flex items-center gap-2"
              onClick={() => {
                setSignInOpen(false);
                window.location.href = UCLA_SSO_URL;
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Continue with UCLA SSO
            </Button>

            <div className="text-xs text-zinc-500 leading-snug">
              You’ll be redirected to UCLA’s sign-in page and then returned to
              BruinPlace.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
