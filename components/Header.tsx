"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Plus, UserCog, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// UCLA SSO LOGIN HANDLER
const UCLA_SSO_URL = "/api/auth/sign-in"

export default function Header() {
  const [signInOpen, setSignInOpen] = useState(false)

  return (
    <>
      <header className="relative h-[74px] w-[1441px] bg-[#71C4FF]">
        <Link
          href="/"
          className="absolute text-xl font-semibold text-white"
          style={{ left: "31px", top: "23px", width: "112px", height: "27px" }}
        >
          BruinPlace
        </Link>

        <Button
          asChild
          className="
            absolute h-[37px] w-[130px] rounded-full
            bg-white text-sky-600 hover:bg-white hover:text-sky-600
            flex items-center justify-center gap-2
          "
          style={{ left: "1020px", top: "18px" }}
        >
          <Link href="/sublets/new">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add sublet</span>
          </Link>
        </Button>

        <Button
          asChild
          className="
            absolute h-[37px] w-[130px] rounded-full
            bg-white text-sky-600 hover:bg-white hover:text-sky-600
            flex items-center justify-center gap-2
          "
          style={{ left: "1160px", top: "18px" }}
        >
          <Link href="/listings/new">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add listing</span>
          </Link>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setSignInOpen(true)}
          className="
            absolute h-[37px] w-[106px] rounded-full
            bg-white border border-sky-600 text-sky-600
            hover:bg-white hover:text-sky-600
            flex items-center justify-center gap-2
          "
          style={{ left: "1310px", top: "18px" }}
        >
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Sign in</span>
        </Button>
      </header>

      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent
          className="
            w-[411px] max-w-none rounded-[25px] p-[50px]
            shadow-[0_4px_15px_rgba(0,0,0,0.25)] border-0
          "
        >
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in with UCLA SSO.
          </DialogDescription>

          <div className="flex flex-col items-center gap-[20px] text-center">
            <div className="mt-1">
              <UserCog className="h-16 w-16 text-[#71C4FF]" />
            </div>

            <div className="text-2xl font-semibold text-[#71C4FF]">
              BruinPlace
            </div>

            <div className="text-sm text-zinc-700">
              Sign in with your UCLA account to continue.
            </div>

            <Button
              className="h-[42px] w-[260px] rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF] flex items-center gap-2"
              onClick={() => {
                setSignInOpen(false)
                window.location.href = UCLA_SSO_URL
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Continue with UCLA SSO
            </Button>

            <div className="text-xs text-zinc-500 leading-snug">
              You’ll be redirected to UCLA’s sign-in page and then returned to
              BruinPlace.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}