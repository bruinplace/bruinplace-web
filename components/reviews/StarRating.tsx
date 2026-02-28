"use client"

import * as React from "react"
import { Star } from "lucide-react"

type StarRatingProps = {
  value: number // 0..5
  onChange: (value: number) => void
  size?: number
  className?: string
}

export default function StarRating({
  value,
  onChange,
  size = 34,
  className,
}: StarRatingProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const shown = hover ?? value

  return (
    <div
      className={["flex items-center gap-2", className].filter(Boolean).join(" ")}
      onMouseLeave={() => setHover(null)}
      role="radiogroup"
      aria-label="Star rating"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        const filled = starValue <= shown

        return (
          <button
            key={starValue}
            type="button"
            className="p-1"
            onMouseEnter={() => setHover(starValue)}
            onFocus={() => setHover(starValue)}
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            aria-checked={starValue === value}
            role="radio"
          >
            <Star
              width={size}
              height={size}
              className={filled ? "fill-amber-400 stroke-amber-400" : "stroke-amber-400"}
            />
          </button>
        )
      })}
    </div>
  )
}