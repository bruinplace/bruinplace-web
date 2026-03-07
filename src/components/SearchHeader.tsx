"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, SlidersHorizontal, User, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FiltersDialog,
  type SearchFilters,
} from "@/components/search/FiltersDialog";

export default function SearchHeader({
  query,
  onQueryChange,
  onFiltersSave,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onFiltersSave: (filters: SearchFilters) => void;
}) {
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#71C4FF]">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center gap-4 px-6">
          {/* Left: Brand */}
          <Link href="/" className="shrink-0 text-xl font-semibold text-white">
            BruinPlace
          </Link>

          {/* Center: Search + Filters */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex w-full max-w-[640px] items-center gap-3">
              {/* Search pill */}
              <div className="flex h-10 flex-1 items-center rounded-full bg-white/95 pl-4 pr-2 shadow-sm">
                <Input
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search for more listings..."
                  className="h-10 border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-slate-500" />
                </Button>
              </div>

              {/* Filters button (opens dialog) */}
              <FiltersDialog
                trigger={
                  <Button
                    type="button"
                    className="h-10 rounded-full bg-white/95 px-4 text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4 text-slate-600" />
                    Filters
                  </Button>
                }
                onSave={onFiltersSave}
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-3">
            <Button
              asChild
              className="h-[37px] rounded-full bg-white text-sky-600 hover:bg-white hover:text-sky-600"
            >
              <Link href="/sublets/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add sublet</span>
              </Link>
            </Button>

            <Button
              asChild
              className="h-[37px] rounded-full bg-white text-sky-600 hover:bg-white hover:text-sky-600"
            >
              <Link href="/listings/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add listing</span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSignInOpen(true)}
              className="h-[37px] rounded-full bg-white border border-sky-600 text-sky-600 hover:bg-white hover:text-sky-600"
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Sign in</span>
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sign in pop-up (same as your current one) */}
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="w-[411px] max-w-none rounded-[25px] p-[50px] shadow-[0_4px_15px_rgba(0,0,0,0.25)] border-0">
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <DialogDescription className="sr-only">
            You need an account to create a review.
          </DialogDescription>

          <div className="flex flex-col items-center gap-[20px] text-center">
            <div className="mt-1">
              <UserCog className="h-16 w-16 text-[#71C4FF]" />
            </div>

            <div className="text-2xl font-semibold text-[#71C4FF]">
              BruinPlace
            </div>

            <div className="text-sm text-zinc-700">
              You need an account to create a review.
            </div>

            <Button
              className="h-[42px] w-[220px] rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]"
              onClick={() => {
                setSignInOpen(false);
                window.location.href = "/signup";
              }}
            >
              Create account
            </Button>

            <div className="flex w-full items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />
              <div className="text-xs text-zinc-400">OR</div>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className="text-sm text-zinc-700">
              Already have an account?
            </div>

            <Button
              className="h-[42px] w-[220px] rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]"
              onClick={() => {
                setSignInOpen(false);
                window.location.href = "/signin";
              }}
            >
              Sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
