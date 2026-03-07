"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { X, ChevronRight } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Chip = {
  icon?: React.ReactNode;
  label: string;
};

type ReviewPopupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  chips: Chip[]; // should contain 4 items

  user: {
    initials: string;
    name: string;
    years: string;
  };

  rating: number;
  text: string;

  mainImageUrl: string;

  thumbnails: string[];
  activeThumbIndex: number;
  onSelectThumb: (index: number) => void;
  onNext?: () => void;
};

function Stars({ value }: { value: number }) {
  const full = Math.round(value);

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "text-3xl leading-none select-none",
            i < full ? "text-amber-400" : "text-amber-200",
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewPopupModal({
  open,
  onOpenChange,
  chips,
  user,
  rating,
  text,
  mainImageUrl,
  thumbnails,
  activeThumbIndex,
  onSelectThumb,
  onNext,
}: ReviewPopupModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 0);
    onScroll();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[95vw] sm:w-full sm:max-w-[980px]",
          "h-[82vh]",
          "p-0 overflow-hidden flex flex-col",
          "rounded-[28px] border-0",
          "shadow-[0_20px_60px_rgba(0,0,0,0.18)] bg-background",
        )}
      >
        <DialogTitle className="sr-only">Review pop-up</DialogTitle>

        {/* ===== Sticky Header with 4 Centered Pills ===== */}
        <div
          className={cn(
            "sticky top-0 z-20 bg-background",
            scrolled ? "shadow-[0_10px_22px_rgba(0,0,0,0.10)]" : "",
          )}
        >
          <div className="relative px-10 sm:px-14 py-5">
            {/* Centered chips */}
            <div className="flex items-center justify-center gap-6">
              {chips.slice(0, 4).map((c, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "inline-flex items-center gap-3",
                    "h-10 rounded-full px-5",
                    "border border-sky-300",
                    "text-sky-500",
                  )}
                >
                  {c.icon && (
                    <span className="[&_svg]:h-5 [&_svg]:w-5">{c.icon}</span>
                  )}
                  <span className="text-sm font-medium whitespace-nowrap">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Close button pinned right */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="absolute right-10 sm:right-14 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          <Separator className="bg-muted-foreground/20" />
        </div>

        {/* ===== Scrollable Body ===== */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-10 sm:px-14 py-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[560px_1fr] gap-10 lg:gap-14">
            {/* Left column */}
            <div>
              <div className="rounded-[28px] overflow-hidden">
                <img
                  src={mainImageUrl}
                  alt=""
                  className="w-full h-[420px] object-cover"
                />
              </div>

              <div className="mt-7 flex items-center gap-6">
                {thumbnails.slice(0, 3).map((url, idx) => {
                  const active = idx === activeThumbIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectThumb(idx)}
                      className={cn(
                        "rounded-2xl overflow-hidden border-[4px] transition",
                        active
                          ? "border-sky-400"
                          : "border-transparent hover:border-sky-200",
                      )}
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-[92px] w-[140px] object-cover"
                      />
                    </button>
                  );
                })}

                {thumbnails[activeThumbIndex + 1] && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="relative rounded-2xl overflow-hidden border border-muted-foreground/20"
                  >
                    <img
                      src={thumbnails[activeThumbIndex + 1]}
                      alt=""
                      className="h-[92px] w-[140px] object-cover opacity-90"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="h-12 w-12 rounded-full bg-sky-400 grid place-items-center shadow">
                        <ChevronRight className="h-6 w-6 text-white" />
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="pt-2">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-400 text-white grid place-items-center text-lg font-semibold">
                  {user.initials}
                </div>
                <div>
                  <div className="text-xl font-semibold">{user.name}</div>
                  <div className="text-muted-foreground text-sm mt-1">
                    {user.years}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Stars value={rating} />
              </div>

              <p className="mt-6 text-base leading-7 text-foreground/90 max-w-[44ch]">
                {text}
              </p>
            </div>
          </div>
        </div>

        {/* ===== Fade shading overlays ===== */}
        <div
          className="pointer-events-none absolute left-0 right-0 z-30 h-12 bg-gradient-to-b from-background to-transparent"
          style={{ top: 96 }}
        />
        <div
          className="pointer-events-none absolute left-0 right-0 z-30 h-14 bg-gradient-to-t from-background to-transparent"
          style={{ bottom: 18 }}
        />
      </DialogContent>
    </Dialog>
  );
}
