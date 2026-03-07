import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Pencil, Edit3 } from "lucide-react";

export default function SettingsPanel() {
  return (
    <div className="space-y-6">
      {/* Top mini profile card */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-sky-500 text-white">JB</AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2">
              <div className="font-semibold">joe_bruin</div>
              <Pencil className="h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <Button className="rounded-full bg-sky-500 hover:bg-sky-600">
            Change photo
          </Button>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Personal information</CardTitle>
          <Button variant="secondary" className="rounded-full">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardHeader>

        <CardContent className="pb-6">
          <Separator className="mb-6" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <InfoItem label="First name" value="Joe" />
            <InfoItem label="Last name" value="Bruin" />
            <InfoItem
              label="Current address"
              value={"330 De Neve Dr, Los Angeles,\nCA 90024"}
              multiline
            />

            <InfoItem label="Email address" value="joebruin@ucla.edu" />
            <InfoItem label="Phone number" value="(123) 456-789" />
          </div>
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
      <div className={`mt-1 text-sm font-medium text-zinc-900 ${multiline ? "whitespace-pre-line" : ""}`}>
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