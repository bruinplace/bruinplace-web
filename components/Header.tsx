"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Plus, UserCog } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function Header() {
  const [signInOpen, setSignInOpen] = useState(false)

  return (
    <>
      <header className="relative h-[74px] w-[1441px] bg-[#71C4FF]">
        {/* BruinPlace text */}
        <Link
          href="/"
          className="absolute text-xl font-semibold text-white"
          style={{
            left: "31px",
            top: "23px",
            width: "112px",
            height: "27px",
          }}
        >
          BruinPlace
        </Link>

        {/* Add Sublet Button */}
        <Button
          asChild
          className="
            absolute
            h-[37px] w-[130px]
            rounded-full
            bg-white
            text-sky-600
            hover:bg-white hover:text-sky-600
            flex items-center justify-center gap-2
          "
          style={{
            left: "1020px",
            top: "18px",
          }}
        >
          <Link href="/sublets/new">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add sublet</span>
          </Link>
        </Button>

        {/* Add Listing Button */}
        <Button
          asChild
          className="
            absolute
            h-[37px] w-[130px]
            rounded-full
            bg-white
            text-sky-600
            hover:bg-white hover:text-sky-600
            flex items-center justify-center gap-2
          "
          style={{
            left: "1160px",
            top: "18px",
          }}
        >
          <Link href="/listings/new">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add listing</span>
          </Link>
        </Button>

        {/* Sign In Button (opens modal) */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setSignInOpen(true)}
          className="
            absolute
            h-[37px] w-[106px]
            rounded-full
            bg-white
            border border-sky-600
            text-sky-600
            hover:bg-white hover:text-sky-600
            flex items-center justify-center gap-2
          "
          style={{
            left: "1310px",
            top: "18px",
          }}
        >
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Sign in</span>
        </Button>
      </header>

      {/* Sign in pop-up */}
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent
          className="
            w-[411px]
            max-w-none
            rounded-[25px]
            p-[50px]
            shadow-[0_4px_15px_rgba(0,0,0,0.25)]
            border-0
          "
        >
          {/* keep these for a11y, but visually hidden */}
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <DialogDescription className="sr-only">
            You need an account to create a review.
          </DialogDescription>

          <div className="flex flex-col items-center gap-[20px] text-center">
            {/* icon */}
            <div className="mt-1">
              <UserCog className="h-16 w-16 text-[#71C4FF]" />
            </div>

            {/* title */}
            <div className="text-2xl font-semibold text-[#71C4FF]">
              BruinPlace
            </div>

            {/* subtitle */}
            <div className="text-sm text-zinc-700">
              You need an account to create a review.
            </div>

            {/* Create account button */}
            <Button
              className="h-[42px] w-[220px] rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]"
              onClick={() => {
                setSignInOpen(false)
                // route to your sign up page
                window.location.href = "/auth/sign-up"
              }}
            >
              Create account
            </Button>

            {/* divider OR */}
            <div className="flex w-full items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />
              <div className="text-xs text-zinc-400">OR</div>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className="text-sm text-zinc-700">Already have an account?</div>

            {/* Sign in button */}
            <Button
              className="h-[42px] w-[220px] rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]"
              onClick={() => {
                setSignInOpen(false)
                // route to your sign in page
                window.location.href = "/auth/sign-in"
              }}
            >
              Sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}