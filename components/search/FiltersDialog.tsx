"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Minus, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type Availability = "rental" | "sublease" | "sale"
export type RoomType = "apartment" | "house" | "townhouse"
export type CommuteMode = "walking" | "driving" | "scooter_bike" | "public_transport"

export type SearchFilters = {
  ratingMin: number
  availability: Availability
  roomType: RoomType

  priceMin: number
  priceMax: number

  beds: number
  baths: number

  commuteMode: CommuteMode
  commuteMin: number
  commuteMax: number 
}

const DEFAULT_FILTERS: SearchFilters = {
  ratingMin: 0,
  availability: "rental",
  roomType: "apartment",

  priceMin: 0,
  priceMax: 10000,

  beds: 0,
  baths: 0,

  commuteMode: "walking",
  commuteMin: 0,
  commuteMax: 60,
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ? "true" : "false"}
      className={cx(
        "h-11 min-w-[120px] rounded-full px-5 text-sm font-medium transition",
        "border-2",
        active
          ? "bg-[#71C4FF] text-white border-[#71C4FF]"
          : "bg-white text-muted-foreground border-[#71C4FF] hover:bg-[#71C4FF]/10"
      )}
    >
      {children}
    </button>
  )
}

function StarRow({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const star = i + 1
          const filled = star <= value
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star minimum`}
              onClick={() => onChange(star)}
              className="rounded-md p-1"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill={filled ? "#F5C35B" : "none"}
                stroke="#F5C35B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15 8.5 22 9.3 17 14 18.4 21 12 17.7 5.6 21 7 14 2 9.3 9 8.5 12 2" />
              </svg>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange(0)}
        className="text-sm text-muted-foreground hover:underline"
      >
        Clear
      </button>
    </div>
  )
}

function Stepper({
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1, min, max))}
        className="grid h-12 w-12 place-items-center rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]/80"
        aria-label="Decrease"
      >
        <Minus className="h-5 w-5" />
      </button>

      <div className="grid h-12 min-w-[72px] place-items-center rounded-full border-4 border-[#71C4FF] bg-[#71C4FF]/10 text-base font-semibold text-[#71C4FF]">
        {value}
      </div>

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1, min, max))}
        className="grid h-12 w-12 place-items-center rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]/80"
        aria-label="Increase"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}

function RangeSlider({
  label,
  min,
  max,
  absMin,
  absMax,
  step,
  unit,
  formatValue,
  onChange,
}: {
  label: string
  min: number
  max: number
  absMin: number
  absMax: number
  step: number
  unit?: string
  formatValue?: (n: number) => string
  onChange: (next: { min: number; max: number }) => void
}) {
  const value: [number, number] = [min, max]

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="px-1">
        <Slider
          value={value}
          min={absMin}
          max={absMax}
          step={step}
          minStepsBetweenThumbs={1}
          onValueChange={(v) => {
            onChange({ min: v[0], max: v[1] })
          }}
          className="
            py-4
            [&_[data-orientation=horizontal]_span]:bg-[#71C4FF]
            [&_[role=slider]]:border-[#71C4FF]
            [&_[role=slider]]:bg-white
          "
        />
      </div>

      {/* min/max boxes */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="mb-2 text-sm font-medium">min</div>
          <div className="inline-flex h-11 items-center rounded-full border-2 border-[#71C4FF] px-5 text-sm text-muted-foreground">
            {min === absMin
              ? `0 ${unit ?? ""}`.trim()
              : formatValue
              ? formatValue(min)
              : min}
          </div>
        </div>

        <div className="text-right">
          <div className="mb-2 text-sm font-medium">max</div>
          <div className="inline-flex h-11 items-center rounded-full border-2 border-[#71C4FF] px-5 text-sm text-muted-foreground">
            {max === absMin
              ? `0 ${unit ?? ""}`.trim()
              : formatValue
              ? formatValue(max)
              : max}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FiltersDialog({
  trigger,
  onSave,
  initialFilters,
}: {
  trigger: React.ReactNode
  onSave: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}) {
  const [open, setOpen] = React.useState(false)

  const [filters, setFilters] = React.useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    ...(initialFilters ?? {}),
  })

  // When dialog opens, re-seed from initial (optional) so it feels consistent
  React.useEffect(() => {
    if (!open) return
    setFilters({ ...DEFAULT_FILTERS, ...(initialFilters ?? {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className={cx(
          "w-[92vw] max-w-[640px]",
          "max-h-[82dvh] overflow-y-auto",
          "rounded-3xl p-0",
          "gap-0"
        )}
      >
        <div className="p-8 pb-32">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-semibold">Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-10">
            {/* Rating */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Rating</h3>
              <StarRow
                value={filters.ratingMin}
                onChange={(ratingMin) => setFilters((p) => ({ ...p, ratingMin }))}
              />
            </section>

            {/* Availability */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Availability</h3>
              <div className="flex flex-wrap gap-4">
                <Pill
                  active={filters.availability === "rental"}
                  onClick={() => setFilters((p) => ({ ...p, availability: "rental" }))}
                >
                  Rental
                </Pill>
                <Pill
                  active={filters.availability === "sublease"}
                  onClick={() => setFilters((p) => ({ ...p, availability: "sublease" }))}
                >
                  Sublease
                </Pill>
                <Pill
                  active={filters.availability === "sale"}
                  onClick={() => setFilters((p) => ({ ...p, availability: "sale" }))}
                >
                  For sale
                </Pill>
              </div>
            </section>

            {/* Room type */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Room type</h3>
              <div className="flex flex-wrap gap-4">
                <Pill
                  active={filters.roomType === "apartment"}
                  onClick={() => setFilters((p) => ({ ...p, roomType: "apartment" }))}
                >
                  Apartment
                </Pill>
                <Pill
                  active={filters.roomType === "house"}
                  onClick={() => setFilters((p) => ({ ...p, roomType: "house" }))}
                >
                  House
                </Pill>
                <Pill
                  active={filters.roomType === "townhouse"}
                  onClick={() => setFilters((p) => ({ ...p, roomType: "townhouse" }))}
                >
                  Townhouse
                </Pill>
              </div>
            </section>

            {/* Rent range */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Rent range</h3>
              <RangeSlider
                label="Price"
                absMin={0}
                absMax={10000}
                step={50}
                min={filters.priceMin}
                max={filters.priceMax}
                formatValue={formatCurrency}
                onChange={({ min, max }) =>
                  setFilters((p) => ({ ...p, priceMin: min, priceMax: max }))
                }
              />
            </section>

            {/* Bed and Bath */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold">Bed and Bath</h3>

              <div className="grid grid-cols-[1fr_auto] items-center gap-y-6">
                <div className="text-lg">Bedrooms</div>
                <Stepper
                  value={filters.beds}
                  onChange={(beds) => setFilters((p) => ({ ...p, beds }))}
                  min={0}
                  max={10}
                />

                <div className="text-lg">Bathrooms</div>
                <Stepper
                  value={filters.baths}
                  onChange={(baths) => setFilters((p) => ({ ...p, baths }))}
                  min={0}
                  max={10}
                />
              </div>
            </section>

            {/* Distance */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Distance</h3>

              <RangeSlider
                label="Travel time"
                absMin={0}
                absMax={60}
                step={5}
                min={filters.commuteMin}
                max={filters.commuteMax}
                unit="min"
                formatValue={(n) => `${n} min`}
                onChange={({ min, max }) =>
                  setFilters((p) => ({
                    ...p,
                    commuteMin: min,
                    commuteMax: max,
                  }))
                }
              />
            </section>

            {/* Reset */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                className="text-sm text-muted-foreground hover:underline"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>

        {/* Sticky footer*/}
        <DialogFooter className="sticky bottom-0 border-t bg-background px-8 py-6">
          <Button
            className="h-12 w-full rounded-2xl text-base font-semibold bg-[#71C4FF] hover:bg-[#71C4FF]/60"
            onClick={() => {
              onSave(filters)
              setOpen(false)
            }}
          >
            SAVE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}