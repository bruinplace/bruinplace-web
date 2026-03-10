"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Pencil, Edit3 } from "lucide-react";
import { useAuthMe } from "@/hooks/use-auth-me";
import { api } from "@/lib/api";
import { QueryKeys } from "@/lib/query-keys";

function splitName(name?: string | null) {
  if (!name) return { first: "-", last: "-" };
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { first: parts[0], last: "-" };
  return {
    first: parts[0],
    last: parts.slice(1).join(" "),
  };
}

function initialsFromName(name?: string | null, email?: string | null) {
  const source = (name && name.trim()) || (email && email.trim()) || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function SettingsPanel() {
  const { data: authUser } = useAuthMe();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      name: string | null;
      profile_picture: string | null;
    }) => api.patch("/me", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.AUTH_ME] });
      setIsEditing(false);
    },
  });

  const { first, last } = splitName(authUser?.name);
  const initials = initialsFromName(authUser?.name, authUser?.email);
  const displayName = authUser?.name || authUser?.email || "Guest";

  function beginEdit() {
    setFullName(authUser?.name ?? "");
    setProfilePicture(authUser?.profile_picture ?? "");
    setIsEditing(true);
  }

  function onCancelEdit() {
    setFullName(authUser?.name ?? "");
    setProfilePicture(authUser?.profile_picture ?? "");
    setIsEditing(false);
  }

  function onSaveEdit() {
    updateMutation.mutate({
      name: fullName.trim() || null,
      profile_picture: profilePicture.trim() || null,
    });
  }

  return (
    <div className="space-y-6">
      {/* Top mini profile card */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-sky-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2">
              <div className="font-semibold">{displayName}</div>
              <Pencil className="h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <Button
            className="rounded-full bg-sky-500 hover:bg-sky-600"
            onClick={beginEdit}
          >
            Change photo
          </Button>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Personal information</CardTitle>
          {!isEditing ? (
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={beginEdit}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={onCancelEdit}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="rounded-full bg-sky-500 hover:bg-sky-600"
                onClick={onSaveEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="pb-6">
          <Separator className="mb-6" />

          {!isEditing ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <InfoItem label="First name" value={first} />
              <InfoItem label="Last name" value={last} />
              <InfoItem label="Current address" value="-" multiline />

              <InfoItem label="Email address" value={authUser?.email || "-"} />
              <InfoItem label="Phone number" value="-" />
              <InfoItem
                label="Profile photo URL"
                value={authUser?.profile_picture || "-"}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs text-zinc-500">Full name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-zinc-500">Email address</label>
                <Input value={authUser?.email || ""} disabled />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-zinc-500">
                  Profile photo URL
                </label>
                <Input
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              {updateMutation.isError && (
                <p className="text-sm text-red-600">
                  Failed to update profile. Please try again.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>

        <CardContent className="pb-6">
          <Separator className="mb-6" />

          <div className="space-y-6">
            <NotificationRow
              title="Availability"
              description="Receive notifications when favorited listings become available"
            />

            <Separator />

            <NotificationRow
              title="Listing reviews"
              description="Receive notifications when other users review your listing"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <div
        className={`mt-1 text-sm font-medium text-zinc-900 ${multiline ? "whitespace-pre-line" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function NotificationRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-zinc-500">{description}</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-end gap-3">
          <div className="text-xs text-zinc-600">Site Notifications</div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-end gap-3">
          <div className="text-xs text-zinc-600">Email notifications</div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
