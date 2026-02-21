import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function Header() {
  return (
    <header className="relative w-[1441px] h-[74px] bg-sky-500">
      
      {/* BruinPlace text */}
      <Link
        href="/"
        className="absolute text-white font-semibold text-xl"
        style={{
          left: "31px",
          top: "23px",
          width: "112px",
          height: "27px",
        }}
      >
        BruinPlace
      </Link>

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
          flex items-center justify-center
          gap-[20px]
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
  );
}