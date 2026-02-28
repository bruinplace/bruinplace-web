"use client"

import { useState } from "react"
import { AddReviewModal } from "@/components/reviews/AddReviewDialog"

export default function CreateReviewPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold">Write a Review</h1>
      <p className="mt-2 text-zinc-600">For listing #{id}</p>

      <div className="mt-8 max-w-xl rounded-2xl border bg-white p-6">
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-sky-400 px-6 py-3 font-semibold text-white"
        >
          Open review modal
        </button>
      </div>

      <AddReviewModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => {
          console.log("Review submitted:", data)
        }}
      />
    </div>
  )
}