import Link from "next/link";
import { Instagram, Linkedin, Mail } from "lucide-react";

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="underline transition-opacity hover:opacity-80">
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#71C4FF] text-white">
      <div className="mx-auto grid w-full max-w-[1441px] gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_1fr_auto] md:items-start md:px-10 lg:px-16 lg:py-16">
        <div className="max-w-[230px] space-y-2">
          <h2 className="text-3xl font-semibold tracking-[-0.01em]">
            BruinPlace
          </h2>
          <p className="text-sm leading-6 text-white/90">
            Built by Bruins, for Bruins looking for their next place.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <h3 className="text-base font-bold">Features</h3>
          <div>
            <FooterLink href="/">Home</FooterLink>
          </div>
          <div>
            <FooterLink href="/search">Search listings</FooterLink>
          </div>
          <div>
            <FooterLink href="/listings/new">Add listing</FooterLink>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <h3 className="text-base font-bold">Contact us</h3>
          <p className="flex items-center gap-2 text-white/95">
            <Mail className="h-3.5 w-3.5" />
            bruinplaceatucla@gmail.com
          </p>
          <p className="flex items-center gap-2 text-white/95">
            <Linkedin className="h-3.5 w-3.5" />
            BruinPlace
          </p>
          <p className="flex items-center gap-2 text-white/95">
            <Instagram className="h-3.5 w-3.5" />
            @bruinplace
          </p>
        </div>

        <div className="hidden h-[170px] w-[360px] justify-self-end md:block lg:w-[420px]">
          <svg viewBox="0 0 420 170" className="h-full w-full">
            <g fill="none" stroke="white" strokeWidth="2">
              <path d="M16 150h388" />
              <path d="M126 45h228l6-8H120z" />
              <path d="M140 52v84" />
              <path d="M334 52v84" />
              <path d="M226 150h70v-10h-70z" />
              <path d="M235 140h52" />
              <path d="M250 70c16 0 29 13 29 29v40h-58v-40c0-16 13-29 29-29z" />
              <path d="M94 145c0-10 8-18 18-18 3 0 6 1 8 2 1-11 10-20 22-20 13 0 23 10 23 23v1c2-2 5-3 9-3 7 0 13 6 13 13 0 1 0 2-1 2" />
              <path d="M266 95c4-8 12-14 22-14 15 0 27 12 27 27 0 6-2 12-6 16" />
              <path d="M228 108c4-6 10-9 17-9" />
              <path d="M257 111c2-3 6-5 10-5" />
            </g>
          </svg>
        </div>
      </div>
    </footer>
  );
}
