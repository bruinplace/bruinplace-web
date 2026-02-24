import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"

export default function Header() {
  return (
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
          left: "1020px", // 👈 slightly left of Add listing
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

      {/* Sign In Button */}
      <Button
        variant="outline"
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
  )
}