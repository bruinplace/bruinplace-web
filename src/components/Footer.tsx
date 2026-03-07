import Link from "next/link";
import { Phone, Mail, Instagram } from "lucide-react";

function ContactChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm">
      <span className="text-sky-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#71C4FF]">
      {/* Match Figma height */}
      <div className="relative mx-auto h-[312px] w-[1441px] overflow-hidden">
        {/* Left content */}
        <div className="absolute left-[60px] top-[40px] w-[520px] text-white">
          <div className="text-xl font-semibold">BruinPlace</div>

          <p className="mt-4 max-w-[360px] text-sm leading-5 opacity-90">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit
            amet consectetur.
          </p>

          <p className="mt-4 max-w-[360px] text-sm leading-5 opacity-90">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Dol
            consectetur.
          </p>

          <div className="mt-6 space-y-1 text-sm underline underline-offset-4">
            <Link href="/">Home</Link>
            <div>
              <Link href="/search">Search listings</Link>
            </div>
            <div>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>

        {/* Center "Need help?" pill */}
        <div className="absolute left-1/2 top-[165px] w-[820px] -translate-x-1/2">
          <div className="flex items-center gap-6 rounded-full bg-sky-100/80 px-8 py-5">
            <div className="min-w-[110px] text-sm font-semibold text-zinc-700">
              Need help?
            </div>

            <div className="flex flex-1 items-center justify-between gap-4">
              <ContactChip
                icon={<Phone className="h-4 w-4" />}
                text="(123) 456-789"
              />
              <ContactChip
                icon={<Mail className="h-4 w-4" />}
                text="bruinplacegmail.com"
              />
              <ContactChip
                icon={<Instagram className="h-4 w-4" />}
                text="@bruinplace"
              />
            </div>
          </div>
        </div>

        {/* Right illustration placeholder */}
        <div className="absolute right-[70px] top-[35px] h-[240px] w-[520px] opacity-70">
          {/* Replace this with your exported SVG/PNG later */}
          <svg viewBox="0 0 520 240" className="h-full w-full">
            <path
              d="M20 210 C120 140, 220 220, 320 150 C380 110, 440 120, 500 90"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              cx="420"
              cy="95"
              r="55"
              fill="none"
              stroke="white"
              strokeWidth="3"
            />
            <rect
              x="380"
              y="130"
              width="90"
              height="70"
              rx="18"
              fill="none"
              stroke="white"
              strokeWidth="3"
            />
            <path
              d="M410 165 L440 165"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </footer>
  );
}
