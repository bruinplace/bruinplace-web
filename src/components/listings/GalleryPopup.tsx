"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Heart, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

// =====================
// Types
// =====================
export type GalleryImage = {
  src: string;
  alt?: string;
};

// =====================
// GalleryPopup (Modal Wrapper)
// =====================
type GalleryPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: GalleryImage[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  priceText: string;
  metaText: string;
  addressText: string;
  className?: string;
};

export function GalleryPopup({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  onIndexChange,
  priceText,
  metaText,
  addressText,
  className,
}: GalleryPopupProps) {
  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">(
    "idle",
  );

  useEffect(() => {
    if (!open) return;
    onIndexChange?.(initialIndex);
  }, [open, initialIndex, onIndexChange]);

  useEffect(() => {
    if (shareState === "idle") return;
    const timeout = window.setTimeout(() => setShareState("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [shareState]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const payload = {
      title: "BruinPlace listing",
      text: `Check out this listing: ${addressText}`,
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
          {/* Row 1: Price + actions */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-baseline gap-3 min-w-0">
              <div className="text-3xl font-semibold tracking-tight truncate">
                {priceText}
              </div>
              <div className="text-3xl font-semibold tracking-tight">
                per month
              </div>
            </div>

            <div className="ml-2 flex items-center gap-3 shrink-0">
              <ActionIconButton
                ariaLabel="Save listing"
                onClick={() => setSaved((prev) => !prev)}
              >
                <Heart className={cn("h-7 w-7", saved && "fill-current")} />
              </ActionIconButton>
              <ActionIconButton ariaLabel="Share listing" onClick={handleShare}>
                <Share2 className="h-7 w-7" />
              </ActionIconButton>
            </div>
          </div>

          {/* Row 2: Meta */}
          <div className="mt-3 text-base text-muted-foreground">
            {renderMetaLikeScreenshot(metaText)}
          </div>

          {/* Row 3: Address */}
          <div className="mt-2 text-base text-muted-foreground/70">
            {addressText}
          </div>

          {shareState !== "idle" ? (
            <div className="mt-1 text-sm text-[#3EA6FC]">
              {shareState === "copied"
                ? "Listing link copied."
                : "Share flow opened."}
            </div>
          ) : null}
        </div>
      }
      headerRight={null}
    >
      <ListingGallery
        images={images}
        heroRow
        className="mt-2"
        onOpenIndex={onIndexChange}
      />
    </Modal>
  );
}

function ActionIconButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="text-sky-500 hover:text-sky-600 transition focus:outline-none"
    >
      {children}
    </button>
  );
}

function renderMetaLikeScreenshot(metaText: string) {
  const parts = metaText
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {parts.map((part, idx) => {
        const m = part.match(/^([\d,\.]+)\s+(.*)$/);
        const num = m?.[1];
        const rest = m?.[2] ?? part;

        return (
          <React.Fragment key={part + idx}>
            <span className="flex items-baseline gap-2">
              {num ? (
                <span className="font-semibold text-foreground">{num}</span>
              ) : null}
              <span>{rest}</span>
            </span>

            {idx !== parts.length - 1 && (
              <span className="h-5 w-px bg-muted-foreground/25" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// =====================
// ListingGallery (Grid + Lightbox)
// =====================
type ListingGalleryProps = {
  images: GalleryImage[];
  tileRadiusClassName?: string;
  gapClassName?: string;
  heroRow?: boolean;
  className?: string;
  onOpenIndex?: (index: number) => void;
};

export function ListingGallery({
  images,
  tileRadiusClassName = "rounded-2xl",
  gapClassName = "gap-6",
  heroRow = true,
  className,
  onOpenIndex,
}: ListingGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeImages = useMemo(() => images?.filter(Boolean) ?? [], [images]);

  const openAt = useCallback(
    (idx: number) => {
      setActiveIndex(idx);
      onOpenIndex?.(idx);
      setLightboxOpen(true);
    },
    [onOpenIndex],
  );

  const close = useCallback(() => setLightboxOpen(false), []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % safeImages.length);
  }, [safeImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, close, prev, next]);

  if (!safeImages.length) return null;

  const hero = heroRow ? safeImages.slice(0, 2) : [];
  const rest = heroRow ? safeImages.slice(2) : safeImages;

  return (
    <>
      <div className={cn("w-full", className)}>
        {heroRow && hero.length > 0 && (
          <div className={cn("grid grid-cols-1 md:grid-cols-2", gapClassName)}>
            {hero.map((img, idx) => (
              <GalleryTile
                key={img.src + idx}
                img={img}
                radius={tileRadiusClassName}
                aspectClassName="aspect-[16/10]"
                onClick={() => openAt(idx)}
              />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div
            className={cn("mt-6 grid grid-cols-1 md:grid-cols-2", gapClassName)}
          >
            {rest.map((img, idx) => {
              const realIndex = heroRow ? idx + 2 : idx;
              return (
                <GalleryTile
                  key={img.src + idx}
                  img={img}
                  radius={tileRadiusClassName}
                  aspectClassName="aspect-[16/10]"
                  onClick={() => openAt(realIndex)}
                />
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "!border-0 !p-0 !gap-0 !grid",
            "!w-[calc(100vw-24px)] !max-w-[1100px]",
            "!h-[calc(100vh-24px)] md:!h-[calc(100vh-40px)]",
            "overflow-hidden rounded-2xl bg-black",
          )}
        >
          <DialogTitle className="sr-only">Image preview</DialogTitle>

          <div className="relative w-full h-full">
            <div className="absolute inset-0">
              <img
                src={safeImages[activeIndex]?.src}
                alt={safeImages[activeIndex]?.alt ?? `Image ${activeIndex + 1}`}
                className="absolute inset-0 h-full w-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            >
              <X className="h-6 w-6" />
            </button>

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {activeIndex + 1} / {safeImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GalleryTile({
  img,
  onClick,
  radius,
  aspectClassName,
}: {
  img: GalleryImage;
  onClick: () => void;
  radius: string;
  aspectClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden bg-muted",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        radius,
      )}
    >
      <div className={cn("relative w-full", aspectClassName)}>
        <img
          src={img.src}
          alt={img.alt ?? "Gallery image"}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute inset-0 bg-black/5" />
      </div>
    </button>
  );
}
