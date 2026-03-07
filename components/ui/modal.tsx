"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  title?: React.ReactNode
  headerLeft?: React.ReactNode
  headerCenter?: React.ReactNode
  headerRight?: React.ReactNode

  children: React.ReactNode

  /** Optional sticky footer (buttons, etc.) */
  footer?: React.ReactNode

  /** Sizes */
  maxWidthClassName?: string // e.g. "sm:max-w-[980px]"
  heightClassName?: string // e.g. "h-[82vh]"

  /** Padding inside scrollable content */
  contentClassName?: string

  /** Show the top/bottom “fade shading” */
  fades?: boolean

  /** If your header/footer heights differ, tune these */
  fadeTopOffsetPx?: number
  fadeBottomOffsetPx?: number
  fadeTopHeightPx?: number
  fadeBottomHeightPx?: number

  /** If you want header shadow only after scrolling */
  headerShadowOnScroll?: boolean

  /** Default close button */
  showClose?: boolean
  onClose?: () => void
}

export function Modal({
  open,
  onOpenChange,

  title,
  headerLeft,
  headerCenter,
  headerRight,

  children,
  footer,

  maxWidthClassName = "sm:max-w-[960px]",
  heightClassName = "h-[82vh]",
  contentClassName = "px-10 sm:px-14 py-8",

  fades = true,
  fadeTopOffsetPx = 88,
  fadeBottomOffsetPx = 96,
  fadeTopHeightPx = 48,
  fadeBottomHeightPx = 56,

  headerShadowOnScroll = true,

  showClose = true,
  onClose,
}: ModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !headerShadowOnScroll) return

    const handleScroll = () => setScrolled(el.scrollTop > 0)
    handleScroll()
    el.addEventListener("scroll", handleScroll)
    return () => el.removeEventListener("scroll", handleScroll)
  }, [headerShadowOnScroll])

  const close = () => {
    onClose?.()
    onOpenChange(false)
  }

  const fadeTopStyle = useMemo(
    () => ({
      top: `${fadeTopOffsetPx}px`,
      height: `${fadeTopHeightPx}px`,
    }),
    [fadeTopOffsetPx, fadeTopHeightPx]
  )

  const fadeBottomStyle = useMemo(
    () => ({
      bottom: `${fadeBottomOffsetPx}px`,
      height: `${fadeBottomHeightPx}px`,
    }),
    [fadeBottomOffsetPx, fadeBottomHeightPx]
  )

  const a11yTitle = typeof title === "string" ? title : "Dialog"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent
  showCloseButton={false}
  className={cn(
    "!grid !gap-0 !p-0 !border-0",
    "!fixed !left-1/2 !top-1/2 !z-50",
    "!-translate-x-1/2 !-translate-y-1/2",

    // ✅ width rules (less wide)
    "w-[95vw] sm:w-full",
    "max-h-[calc(100vh-32px)]",

    "!flex !flex-col !overflow-hidden",
    "rounded-[28px]",
    "shadow-[0_20px_60px_rgba(0,0,0,0.18)]",

    maxWidthClassName,
    heightClassName
  )}
>
        {/* Accessibility title (required by Radix) */}
        {title ? null : <DialogTitle className="sr-only">{a11yTitle}</DialogTitle>}

        {/* ===== Header ===== */}
        <div
          className={cn(
            "sticky top-0 z-20 bg-background",
            headerShadowOnScroll && scrolled
              ? "shadow-[0_10px_22px_rgba(0,0,0,0.10)]"
              : ""
          )}
        >
          <div className="px-10 sm:px-14 py-5 flex items-center gap-4">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              {headerLeft}

              {title ? (
                <div className="min-w-0">
                  <DialogTitle asChild>
                    <div className="text-2xl font-semibold tracking-tight truncate">
                      {title}
                    </div>
                  </DialogTitle>
                  {headerCenter}
                </div>
              ) : (
                headerCenter
              )}
            </div>

            <div className="flex items-center gap-3">
              {headerRight}
              {showClose && (
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="p-1 text-muted-foreground hover:text-foreground transition"
                >
                  <X className="h-7 w-7" />
                </button>
              )}
            </div>
          </div>

          <Separator className="bg-muted-foreground/20" />
        </div>

        {/* ===== Scrollable Body ===== */}
        <div
          ref={scrollRef}
          className={cn("flex-1 overflow-y-auto", contentClassName)}
        >
          {children}
        </div>

        {/* ===== Fade overlays ===== */}
        {fades && (
          <>
            <div
              className="pointer-events-none absolute left-0 right-0 z-30 bg-gradient-to-b from-background to-transparent"
              style={fadeTopStyle}
            />
            <div
              className="pointer-events-none absolute left-0 right-0 z-30 bg-gradient-to-t from-background to-transparent"
              style={fadeBottomStyle}
            />
          </>
        )}

        {/* ===== Footer ===== */}
        {footer ? (
          <div className="sticky bottom-0 z-20 bg-background">
            <Separator className="bg-muted-foreground/20" />
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}