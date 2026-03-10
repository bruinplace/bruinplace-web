"use client";

import * as React from "react";
import { Heart, Share2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  ListingGallery,
  type GalleryImage,
} from "@/components/listings/GalleryPopup";
import { cn } from "@/lib/utils";

type BuildingGalleryPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: GalleryImage[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  buildingName: string;
  addressText: string;
  className?: string;
};

export function BuildingGalleryPopup({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  onIndexChange,
  buildingName,
  addressText,
  className,
}: BuildingGalleryPopupProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [saved, setSaved] = React.useState(false);
  const [shareState, setShareState] = React.useState<
    "idle" | "copied" | "shared"
  >("idle");

  React.useEffect(() => {
    if (!open) return;
    setCurrentIndex(initialIndex);
  }, [open, initialIndex]);

  React.useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  React.useEffect(() => {
    if (shareState === "idle") return;
    const timeout = window.setTimeout(() => setShareState("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [shareState]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const payload = {
      title: `${buildingName} gallery`,
      text: `Check out ${buildingName} on BruinPlace.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        setShareState("shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareState("copied");
      }
    } catch {
      setShareState("idle");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={null}
      maxWidthClassName="sm:max-w-[1100px]"
      heightClassName="h-[82vh]"
      contentClassName={cn("px-10 sm:px-14 py-8", className)}
      fades={false}
      headerLeft={
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-3">
            <h2 className="truncate text-3xl font-semibold tracking-tight">
              {buildingName}
            </h2>

            <button
              type="button"
              aria-label="Save building"
              onClick={() => setSaved((prev) => !prev)}
              className="text-sky-500 hover:text-sky-600 transition"
            >
              <Heart className={cn("h-7 w-7", saved && "fill-current")} />
            </button>
            <button
              type="button"
              aria-label="Share building"
              onClick={handleShare}
              className="text-sky-500 hover:text-sky-600 transition"
            >
              <Share2 className="h-7 w-7" />
            </button>
          </div>

          <p className="mt-2 text-base text-muted-foreground/80">
            {addressText}
          </p>
          {shareState !== "idle" ? (
            <p className="mt-1 text-sm text-[#3EA6FC]">
              {shareState === "copied"
                ? "Building link copied."
                : "Share flow opened."}
            </p>
          ) : null}
        </div>
      }
      headerRight={null}
    >
      <ListingGallery
        images={images}
        heroRow
        gapClassName="gap-3"
        className="mt-2"
        onOpenIndex={(idx) => setCurrentIndex(idx)}
      />
    </Modal>
  );
}
