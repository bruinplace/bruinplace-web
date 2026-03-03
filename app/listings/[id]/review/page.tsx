"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ReviewModal } from "@/components/reviews/AddReviewModal" // adjust path if needed

export default function Page() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Button
        onClick={() => setOpen(true)}
        className="rounded-2xl"
      >
        Add review
      </Button>

      <ReviewModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (draft) => {
          console.log(draft)
        }}
      />
    </div>
  )
}