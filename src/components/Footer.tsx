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
      <div className="relative mx-auto w-full max-w-[1441px] overflow-hidden px-6 py-12 sm:px-10 lg:px-[80px] lg:py-[80px]">
        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-[75px]">
          <div className="w-full max-w-[173px] space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.01em]">
              BruinPlace
            </h2>
            <p className="text-sm leading-6 text-white/90">
              Built by Bruins, for Bruins looking for their next place.
            </p>
          </div>

          <div className="w-full max-w-[97px] space-y-[10px]">
            <h3 className="text-base font-bold leading-6">Features</h3>
            <div className="text-sm leading-6">
              <FooterLink href="/">Home</FooterLink>
            </div>
            <div className="text-sm leading-6">
              <FooterLink href="/search">Search listings</FooterLink>
            </div>
            <div className="text-sm leading-6">
              <FooterLink href="/listings/new">Add listing</FooterLink>
            </div>
          </div>

          <div className="w-full max-w-[220px] space-y-[11px]">
            <h3 className="text-base font-bold leading-6">Contact us</h3>
            <p className="flex items-center gap-[14px] text-sm leading-6 text-white/95">
              <Mail className="h-[15px] w-[15px]" />
              bruinplaceatucla@gmail.com
            </p>
            <p className="flex items-center gap-[14px] text-sm leading-6 text-white/95">
              <Linkedin className="h-[15px] w-[15px]" />
              BruinPlace
            </p>
            <p className="flex items-center gap-[14px] text-sm leading-6 text-white/95">
              <Instagram className="h-[15px] w-[15px]" />
              @bruinplace
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[25.8px] left-[787.5px] hidden h-[258.39px] w-[597.198px] rounded-[12px] border-2 border-white/80 bg-white/5 lg:block" />
      </div>
    </footer>
  );
}
