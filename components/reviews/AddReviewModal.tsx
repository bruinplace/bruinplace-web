"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Camera, Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingKey = "management" | "cleanliness" | "noiseLevel" | "leaseFlexibility"

export type ReviewDraft = {
  leaseStart?: string // "YYYY-MM"
  leaseEnd?: string // "YYYY-MM"
  reviewText: string
  ratings: Record<RatingKey, number> // 1..5
  photos: File[]
}

type ReviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  initialValue?: Partial<ReviewDraft>
  onSubmit: (draft: ReviewDraft) => void | Promise<void>
  submitting?: boolean
  maxPhotos?: number
}

const DEFAULT_RATINGS: Record<RatingKey, number> = {
  management: 0,
  cleanliness: 0,
  noiseLevel: 0,
  leaseFlexibility: 0,
}

const RATING_LABELS: Record<RatingKey, string> = {
  management: "Management",
  cleanliness: "Cleanliness",
  noiseLevel: "Noise Level",
  leaseFlexibility: "Lease Flexibility",
}

function clampRating(n: number) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(5, Math.round(n)))
}

function Star({
  filled,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(className, "rotate-180")}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.75.75 0 0 1 1.04 0c.18.18.26.43.22.67l-.7 4.05a.75.75 0 0 0 .22.66l2.94 2.86a.75.75 0 0 1-.42 1.28l-4.06.59a.75.75 0 0 0-.56.41l-1.82 3.68a.75.75 0 0 1-1.35 0l-1.82-3.68a.75.75 0 0 0-.56-.41l-4.06-.59a.75.75 0 0 1-.42-1.28l2.94-2.86a.75.75 0 0 0 .22-.66l-.7-4.05a.75.75 0 0 1 1.26-.67l2.9 3.05a.75.75 0 0 0 1.08 0l2.9-3.05Z"
      />
    </svg>
  )
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const shown = hover ?? value

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="text-lg">{label}</div>

      <div className="flex items-center gap-3">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1
          const filled = n <= shown
          return (
            <button
              key={n}
              type="button"
              className="p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${label}: ${n} star${n === 1 ? "" : "s"}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(n)}
            >
              <Star
                filled={filled}
                className={cn(
                  "h-7 w-7 transition",
                  filled ? "text-amber-400" : "text-amber-300/70"
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-sky-50 grid place-items-center text-sky-600">
        {icon}
      </div>
      <div className="text-2xl font-semibold tracking-tight">{title}</div>
    </div>
  )
}

function PhotosPicker({
  files,
  onChange,
  maxPhotos,
}: {
  files: File[]
  onChange: (files: File[]) => void
  maxPhotos: number
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const remaining = Math.max(0, maxPhotos - files.length)

  const handlePick = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return
    const incoming = Array.from(picked)
    const merged = [...files, ...incoming].slice(0, maxPhotos)
    onChange(merged)
  }

  const removeAt = (idx: number) => onChange(files.filter((_, i) => i !== idx))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-sky-50 grid place-items-center text-sky-600">
            <Camera className="h-5 w-5" />
          </div>

          <div className="text-2xl font-semibold tracking-tight">
            Add Photos{" "}
            <span className="text-muted-foreground font-normal">
              ({files.length}/{maxPhotos})
            </span>
          </div>
        </div>

        <button
          type="button"
          className="text-lg font-medium text-foreground/70 hover:text-foreground transition disabled:opacity-40"
          disabled={remaining === 0}
          onClick={() => inputRef.current?.click()}
        >
          Add
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handlePick(e.target.files)}
        />
      </div>

      <button
        type="button"
        className={cn(
          "w-full rounded-[22px] border-2 border-dashed",
          "border-muted-foreground/40 bg-muted/10",
          "h-[260px] sm:h-[290px]",
          "grid place-items-center text-center",
          "hover:bg-muted/20 transition",
          "disabled:opacity-40 disabled:hover:bg-muted/10"
        )}
        onClick={() => inputRef.current?.click()}
        disabled={remaining === 0}
        aria-disabled={remaining === 0}
      >
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="h-14 w-14 rounded-full bg-sky-50 grid place-items-center text-sky-500">
            <Plus className="h-7 w-7" />
          </div>
          <div className="text-lg font-medium">Upload your photos here</div>
        </div>
      </button>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((f, idx) => (
            <div
              key={`${f.name}-${idx}`}
              className="rounded-xl border px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {(f.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => removeAt(idx)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ReviewModal({
  open,
  onOpenChange,
  title = "Add review",
  initialValue,
  onSubmit,
  submitting = false,
  maxPhotos = 5,
}: ReviewModalProps) {
  const [leaseStart, setLeaseStart] = React.useState(initialValue?.leaseStart ?? "")
  const [leaseEnd, setLeaseEnd] = React.useState(initialValue?.leaseEnd ?? "")
  const [reviewText, setReviewText] = React.useState(initialValue?.reviewText ?? "")
  const [photos, setPhotos] = React.useState<File[]>(initialValue?.photos ?? [])
  const [ratings, setRatings] = React.useState<Record<RatingKey, number>>({
    ...DEFAULT_RATINGS,
    ...(initialValue?.ratings ?? {}),
  })

  React.useEffect(() => {
    if (!open) return
    setLeaseStart(initialValue?.leaseStart ?? "")
    setLeaseEnd(initialValue?.leaseEnd ?? "")
    setReviewText(initialValue?.reviewText ?? "")
    setPhotos(initialValue?.photos ?? [])
    setRatings({ ...DEFAULT_RATINGS, ...(initialValue?.ratings ?? {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const setRating = (key: RatingKey, next: number) => {
    setRatings((prev) => ({ ...prev, [key]: clampRating(next) }))
  }

  const canSubmit = reviewText.trim().length > 0 && Object.values(ratings).some((v) => v > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: ReviewDraft = {
      leaseStart: leaseStart || undefined,
      leaseEnd: leaseEnd || undefined,
      reviewText: reviewText.trim(),
      ratings: {
        management: clampRating(ratings.management),
        cleanliness: clampRating(ratings.cleanliness),
        noiseLevel: clampRating(ratings.noiseLevel),
        leaseFlexibility: clampRating(ratings.leaseFlexibility),
      },
      photos,
    }
    await onSubmit(payload)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      maxWidthClassName="sm:max-w-[820px]"
      heightClassName="h-[84vh]"
      contentClassName="px-8 sm:px-10 py-10"
      fades={false}
      footer={
        <div className="px-8 sm:px-10 py-6 bg-background">
          <div className="flex items-center justify-end gap-8">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-lg font-medium text-foreground/70 hover:text-foreground transition disabled:opacity-40"
            >
              Cancel
            </button>

            <Button
              type="submit"
              form="review-modal-form"
              disabled={!canSubmit || submitting}
              className={cn(
                "h-14 px-10 rounded-full text-lg font-semibold",
                "bg-sky-400 hover:bg-sky-500 text-white",
                "shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              )}
            >
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
          </div>

          {/* mobile full-width CTA */}
          <div className="mt-4 sm:hidden">
            <Button
              type="submit"
              form="review-modal-form"
              disabled={!canSubmit || submitting}
              className="w-full h-14 rounded-full text-lg font-semibold bg-sky-400 hover:bg-sky-500 text-white"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
          </div>
        </div>
      }
    >
      <form id="review-modal-form" onSubmit={handleSubmit} className="space-y-10">
        <PhotosPicker files={photos} onChange={setPhotos} maxPhotos={maxPhotos} />

        <div className="border-t pt-10 space-y-6">
          <SectionHeader icon={<Check className="h-6 w-6" />} title="Ratings" />
          <div className="space-y-6">
            {(Object.keys(RATING_LABELS) as RatingKey[]).map((key) => (
              <StarRating
                key={key}
                label={RATING_LABELS[key]}
                value={ratings[key]}
                onChange={(n) => setRating(key, n)}
              />
            ))}
          </div>
        </div>

        <div className="border-t pt-10 space-y-6">
          <SectionHeader icon={<Check className="h-6 w-6" />} title="Lease Length" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="lease-start" className="text-base">
                Start (Month / Year)
              </Label>
              <Input
                id="lease-start"
                type="month"
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lease-end" className="text-base">
                End (Month / Year)
              </Label>
              <Input
                id="lease-end"
                type="month"
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-10 space-y-6">
          <SectionHeader icon={<Check className="h-6 w-6" />} title="Review" />

          <Textarea
            id="review-text"
            placeholder="Type your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="rounded-xl min-h-[200px] text-base"
            required
          />

          <div className="text-sm text-muted-foreground">
            Tip: at least rate one category + write a short comment.
          </div>
        </div>

        <div className="h-2" />
      </form>
    </Modal>
  )
}
