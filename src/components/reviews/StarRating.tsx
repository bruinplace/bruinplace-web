"use client";

import * as React from "react";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
};

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className="transition"
      fill={filled ? "#fbbf24" : "none"}
      stroke="#fbbf24"
      strokeWidth="1.5"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.968a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.377 2.454a1 1 0 00-.364 1.118l1.287 3.968c.3.921-.755 1.688-1.54 1.118l-3.377-2.454a1 1 0 00-1.176 0l-3.377 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.968a1 1 0 00-.364-1.118L2.462 9.395c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.968z" />
    </svg>
  );
}

export default function StarRating({
  value,
  onChange,
  size = 28,
  className,
}: StarRatingProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div
      className={["flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
      onMouseLeave={() => setHover(null)}
      role="radiogroup"
      aria-label="Star rating"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= shown;

        return (
          <button
            key={starValue}
            type="button"
            className="p-1 hover:scale-110 transition"
            onMouseEnter={() => setHover(starValue)}
            onFocus={() => setHover(starValue)}
            onClick={() => onChange(starValue)}
            role="radio"
            aria-checked={starValue === value}
          >
            <Star filled={filled} size={size} />
          </button>
        );
      })}
    </div>
  );
}
