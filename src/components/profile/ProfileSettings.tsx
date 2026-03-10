"use client";

import { ProfilePageShell } from "@/components/profile/ProfilePageShell";
import SettingsPanel from "@/components/profile/SettingsPanel";

export default function ProfileSettings() {
  return (
    <ProfilePageShell activeTab="settings">
      <SettingsPanel />
    </ProfilePageShell>
  );
}
