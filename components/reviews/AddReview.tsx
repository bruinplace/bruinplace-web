"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { X, Camera } from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import StarRating from "@/components/reviews/StarRating"

type RatingKey = "management" | "cleanliness" | "noise" | "leaseFlexibility"

export type AddReviewPayload = {
  photos: File[]
  ratings: Record<RatingKey, number>
  leaseStart?: string
  leaseEnd?: string
  reviewText: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddReviewPayload) => void
}

const ratingRows: Array<{ key: RatingKey; label: string }> = [
  { key: "management", label: "Management" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "noise", label: "Noise" },
  { key: "leaseFlexibility", label: "Lease Flexibility" },
]

export function AddReviewModal({ open, onOpenChange, onSubmit }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [scrolled, setScrolled] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    management: 0,
    cleanliness: 0,
    noise: 0,
    leaseFlexibility: 0,
  })

  const [leaseStart, setLeaseStart] = useState("")
  const [leaseEnd, setLeaseEnd] = useState("")
  const [reviewText, setReviewText] = useState("")

  // Shadow only when scrolled
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      setScrolled(el.scrollTop > 0)
    }

    handleScroll()
    el.addEventListener("scroll", handleScroll)
    return () => el.removeEventListener("scroll", handleScroll)
  }, [])

  function handlePickPhotos(files: FileList | null) {
    if (!files) return
    const next = Array.from(files)
    setPhotos((prev) => [...prev, ...next].slice(0, 5))
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    onSubmit({
      photos,
      ratings,
      leaseStart: leaseStart || undefined,
      leaseEnd: leaseEnd || undefined,
      reviewText: reviewText.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ Added `relative` so the gradient overlays can be absolutely positioned */}
      <DialogContent className="relative p-0 sm:max-w-[900px] h-[85vh] flex flex-col overflow-hidden">
        {/* ================= HEADER ================= */}
        <div
          className={`sticky top-0 z-20 bg-background transition-shadow ${
            scrolled ? "shadow-sm" : ""
          }`}
        >
          <div className="px-10 pt-8 pb-5 flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Add review</h2>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <Separator />
        </div>

        {/* ================= SCROLLABLE BODY ================= */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-10 py-8 space-y-12"
        >
          {/* ---- Add Photos ---- */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-2xl font-semibold">
                Add Photos{" "}
                <span className="text-muted-foreground font-normal">
                  ({photos.length}/5)
                </span>
              </h3>
            </div>

            <div
              className="rounded-2xl border border-dashed p-10 text-center cursor-pointer hover:bg-muted/30 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-background">
                <span className="text-4xl leading-none text-muted-foreground">
                  +
                </span>
              </div>
              <p className="mt-4 text-muted-foreground text-lg">
                Add your photos here
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePickPhotos(e.target.files)}
              />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {photos.map((file, idx) => {
                  const url = URL.createObjectURL(file)
                  return (
                    <div key={idx} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-24 w-full rounded-xl object-cover border"
                        onLoad={() => URL.revokeObjectURL(url)}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-2 -right-2 rounded-full bg-background border shadow p-1 hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <Separator />

          {/* ---- Ratings ---- */}
          <section className="space-y-6">
            <h3 className="text-2xl font-semibold">Ratings</h3>

            {ratingRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-8"
              >
                <div className="text-lg font-medium">{row.label}</div>

                <StarRating
                  value={ratings[row.key]}
                  onChange={(value: number) =>
                    setRatings((prev) => ({ ...prev, [row.key]: value }))
                  }
                />
              </div>
            ))}
          </section>

          <Separator />

          {/* ---- Lease Length ---- */}
          <section className="space-y-5">
            <h3 className="text-2xl font-semibold">Lease Length</h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Input
                type="month"
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                className="h-12 rounded-full px-5 w-full sm:w-[260px]"
              />
              <span className="text-muted-foreground px-2">to</span>
              <Input
                type="month"
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
                className="h-12 rounded-full px-5 w-full sm:w-[260px]"
                min={leaseStart || undefined}
              />
            </div>
          </section>

          <Separator />

          {/* ---- Review ---- */}
          <section className="space-y-4 pb-10">
            <h3 className="text-2xl font-semibold">Review</h3>
            <Textarea
              placeholder="Type your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[180px] rounded-2xl text-base"
            />
          </section>
        </div>

        {/* ✅ NEW: Scroll fade overlays (this is the “B” shading) */}
        {/* Top fade: starts right under your header */}
        <div className="pointer-events-none absolute left-0 right-0 top-[96px] z-30 h-12 bg-gradient-to-b from-background to-transparent" />
        {/* Bottom fade: sits right above your footer */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-[96px] z-30 h-14 bg-gradient-to-t from-background to-transparent" />

        {/* ================= FOOTER ================= */}
        <div className="sticky bottom-0 z-20 bg-background border-t">
          <div className="px-10 py-6">
            <Button
              onClick={handleSubmit}
              className="w-full h-16 rounded-full text-xl font-semibold leading-none flex items-center justify-center"
            >
              Submit review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}