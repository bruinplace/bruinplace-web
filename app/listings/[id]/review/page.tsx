"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ReviewModal } from "@/components/reviews/AddReviewModal"
import { ReviewPopupModal } from "@/components/reviews/ReviewPopupModal"
import { GalleryPopup } from "@/components/listings/GalleryPopup"

import { Building2, Sparkles, Volume2, CalendarClock } from "lucide-react"

export default function Page() {
  const [openAdd, setOpenAdd] = React.useState(false)
  const [openView, setOpenView] = React.useState(false)
  const [openGallery, setOpenGallery] = React.useState(false)
  const [galleryIndex, setGalleryIndex] = React.useState(0)
  const [activeThumbIndex, setActiveThumbIndex] = React.useState(0)

  const thumbnails = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=60",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=60",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=60",
    "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d82?auto=format&fit=crop&w=1400&q=60",
  ]

  const chips = [
    { icon: <Building2 className="h-4 w-4" />, label: "Management: 4/5" },
    { icon: <Sparkles className="h-4 w-4" />, label: "Cleanliness: 5/5" },
    { icon: <Volume2 className="h-4 w-4" />, label: "Noise: 3/5" },
    { icon: <CalendarClock className="h-4 w-4" />, label: "Lease: 2025–2026" },
  ]

  const mainImageUrl = thumbnails[activeThumbIndex]

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={() => setOpenAdd(true)} className="rounded-2xl">
          Add review
        </Button>

        <Button
          variant="outline"
          onClick={() => setOpenView(true)}
          className="rounded-2xl"
        >
          View review
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            setGalleryIndex(0)
            setOpenGallery(true)
          }}
          className="rounded-2xl"
        >
          Open gallery
        </Button>
      </div>

      {/* Add Review Modal */}
      <ReviewModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSubmit={async (draft) => {
          console.log("submitted review draft:", draft)
        }}
      />

      {/* Review Viewer Modal */}
      <ReviewPopupModal
        open={openView}
        onOpenChange={setOpenView}
        chips={chips}
        user={{
          initials: "EK",
          name: "Ellia Kim",
          years: "Lived here: 2025–2026",
        }}
        rating={4.2}
        text="Really modern finishes and responsive management. Noise can be noticeable on weekends, but overall it felt safe and convenient."
        mainImageUrl={mainImageUrl}
        thumbnails={thumbnails}
        activeThumbIndex={activeThumbIndex}
        onSelectThumb={setActiveThumbIndex}
        onNext={() =>
          setActiveThumbIndex((i) =>
            Math.min(i + 1, thumbnails.length - 1)
          )
        }
      />

      {/* Gallery Modal */}
      <GalleryPopup
        open={openGallery}
        onOpenChange={setOpenGallery}
        images={thumbnails.map((src) => ({ src }))}
        initialIndex={galleryIndex}
        onIndexChange={setGalleryIndex}
        priceText="$1,450"
        metaText="3 bd  |  2 ba  |  1,347 sq ft"
        addressText="10599 Wilshire Blvd, Los Angeles, CA 90024"
      />
    </div>
  )
}