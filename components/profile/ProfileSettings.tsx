import { Pencil, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ProfilePageShell } from "@/components/profile/ProfilePageShell";

export default function ProfileSettings() {
  return (
    <ProfilePageShell activeTab="settings">
        <section className="rounded-[14px] border border-[#d8d8d8] bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="inline-flex items-center gap-4 text-left">
              <Avatar className="h-[54px] w-[54px]">
                <AvatarFallback className="bg-[#71C4FF] text-3xl font-normal text-white">
                  JB
                </AvatarFallback>
              </Avatar>
              <span className="inline-flex items-center gap-3 text-[22px] font-semibold tracking-[-0.02em] text-black">
                joe_bruin
                <Pencil className="h-5 w-5" />
              </span>
            </button>

            <button
              type="button"
              className="inline-flex h-[44px] items-center justify-center rounded-[15px] bg-[#3EA6FC] px-5 text-[17px] font-semibold text-white transition-colors hover:bg-[#2e96e5]"
            >
              Change photo
            </button>
          </div>
        </section>

        <section className="rounded-[14px] border border-[#d8d8d8] bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-[23px] font-semibold tracking-[-0.02em] text-black">
              Personal information
            </h2>

            <button
              type="button"
              className="inline-flex h-[44px] items-center gap-2 rounded-[15px] bg-[#3EA6FC] px-4 text-[17px] font-semibold text-white transition-colors hover:bg-[#2e96e5]"
            >
              <SquarePen className="h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="mt-4 border-t border-[#c9c9c9] pt-5">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="First name" value="Joe" />
              <InfoItem label="Last name" value="Bruin" />
              <InfoItem label="Current address" value="330 De Neve Dr, Los Angeles, CA 90024" />
              <InfoItem label="Email address" value="joebruin@ucla.edu" />
              <InfoItem label="Phone number" value="(123) 456-789" />
            </div>
          </div>
        </section>

        <section className="rounded-[14px] border border-[#d8d8d8] bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
          <h2 className="text-[23px] font-semibold tracking-[-0.02em] text-black">
            Notifications
          </h2>

          <div className="mt-4 border-t border-[#c9c9c9]">
            <NotificationRow
              title="Availability"
              description="Receive notifications when favorited listings become available"
            />
            <NotificationRow
              title="Listing reviews"
              description="Receive notifications when other users review your listing"
              className="border-t border-[#c9c9c9]"
            />
          </div>
        </section>
    </ProfilePageShell>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[15px] text-[#919191]">{label}</p>
      <p className="mt-1 text-[19px] leading-[26px] text-black">{value}</p>
    </div>
  );
}

function NotificationRow({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={`py-6 ${className || ""}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[310px]">
          <p className="text-[19px] leading-[26px] text-black">{title}</p>
          <p className="mt-2 text-[15px] text-[#919191]">{description}</p>
        </div>

        <div className="space-y-3">
          <Toggle label="Site Notifications" defaultChecked />
          <Toggle label="Email notifications" defaultChecked />
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-[19px] text-black">
      <Switch
        defaultChecked={defaultChecked}
        className="h-[32px] w-[60px] border-0 shadow-none data-[state=checked]:bg-[#71C4FF] data-[state=unchecked]:bg-[#d7d7d7]"
      />
      <span>{label}</span>
    </label>
  );
}
