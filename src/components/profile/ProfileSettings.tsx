"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Pencil, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ProfilePageShell } from "@/components/profile/ProfilePageShell";

type ProfileForm = {
  username: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
};

const INITIAL_PROFILE: ProfileForm = {
  username: "joe_bruin",
  firstName: "Joe",
  lastName: "Bruin",
  address: "330 De Neve Dr, Los Angeles, CA 90024",
  email: "joebruin@ucla.edu",
  phone: "(123) 456-789",
};

export default function ProfileSettings() {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draftProfile, setDraftProfile] = useState(INITIAL_PROFILE);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  function handleChangePhotoClick() {
    inputRef.current?.click();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextPhotoUrl = URL.createObjectURL(file);
    setPhotoUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return nextPhotoUrl;
    });

    event.target.value = "";
  }

  function handleStartEditing() {
    setDraftProfile(profile);
    setIsEditingProfile(true);
  }

  function handleCancelEditing() {
    setDraftProfile(profile);
    setIsEditingProfile(false);
  }

  function handleSaveEditing() {
    setProfile(draftProfile);
    setIsEditingProfile(false);
  }

  function handleFieldChange<K extends keyof ProfileForm>(
    field: K,
    value: ProfileForm[K],
  ) {
    setDraftProfile((current) => ({ ...current, [field]: value }));
  }

  const profileValues = isEditingProfile ? draftProfile : profile;
  const avatarFallback =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <ProfilePageShell
      activeTab="settings"
      avatarSrc={photoUrl}
      avatarFallback={avatarFallback}
    >
      <section className="rounded-[14px] border border-[#d8d8d8] bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleStartEditing}
            className="inline-flex items-center gap-4 text-left"
          >
            <Avatar className="h-[54px] w-[54px]">
              {photoUrl ? (
                <AvatarImage
                  src={photoUrl}
                  alt="Profile photo"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-[#71C4FF] text-3xl font-normal text-white">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <span className="inline-flex items-center gap-3 text-[22px] font-semibold tracking-[-0.02em] text-black">
              {profile.username}
              <Pencil className="h-5 w-5" />
            </span>
          </button>

          <button
            type="button"
            onClick={handleChangePhotoClick}
            className="inline-flex h-[44px] items-center justify-center rounded-[15px] bg-[#3EA6FC] px-5 text-[17px] font-semibold text-white transition-colors hover:bg-[#2e96e5]"
          >
            Change photo
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
          />
        </div>
      </section>

      <section className="rounded-[14px] border border-[#d8d8d8] bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[23px] font-semibold tracking-[-0.02em] text-black">
            Personal information
          </h2>

          {isEditingProfile ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCancelEditing}
                className="inline-flex h-[44px] items-center gap-2 rounded-[15px] border border-[#c9c9c9] bg-white px-4 text-[17px] font-semibold text-black transition-colors hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditing}
                className="inline-flex h-[44px] items-center gap-2 rounded-[15px] bg-[#3EA6FC] px-4 text-[17px] font-semibold text-white transition-colors hover:bg-[#2e96e5]"
              >
                <SquarePen className="h-4 w-4" />
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEditing}
              className="inline-flex h-[44px] items-center gap-2 rounded-[15px] bg-[#3EA6FC] px-4 text-[17px] font-semibold text-white transition-colors hover:bg-[#2e96e5]"
            >
              <SquarePen className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        <div className="mt-4 border-t border-[#c9c9c9] pt-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            <ProfileField
              label="Username"
              value={profileValues.username}
              isEditing={isEditingProfile}
              onChange={(value) => handleFieldChange("username", value)}
            />
            <ProfileField
              label="First name"
              value={profileValues.firstName}
              isEditing={isEditingProfile}
              onChange={(value) => handleFieldChange("firstName", value)}
            />
            <ProfileField
              label="Last name"
              value={profileValues.lastName}
              isEditing={isEditingProfile}
              onChange={(value) => handleFieldChange("lastName", value)}
            />
            <ProfileField
              label="Current address"
              value={profileValues.address}
              isEditing={isEditingProfile}
              multiline
              onChange={(value) => handleFieldChange("address", value)}
            />
            <ProfileField
              label="Email address"
              value={profileValues.email}
              isEditing={isEditingProfile}
              onChange={(value) => handleFieldChange("email", value)}
            />
            <ProfileField
              label="Phone number"
              value={profileValues.phone}
              isEditing={isEditingProfile}
              onChange={(value) => handleFieldChange("phone", value)}
            />
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

function ProfileField({
  label,
  value,
  isEditing,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  if (isEditing) {
    return (
      <label className="block">
        <p className="text-[15px] text-[#919191]">{label}</p>
        {multiline ? (
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 min-h-[96px] resize-none border-[#c9c9c9] text-[16px] leading-[24px] text-black"
          />
        ) : (
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 h-[44px] border-[#c9c9c9] text-[16px] text-black"
          />
        )}
      </label>
    );
  }

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
