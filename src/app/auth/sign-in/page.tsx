import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-74px)] w-full bg-white flex items-center justify-center px-4 py-10">
      <div
        className="
          w-[411px]
          rounded-[25px]
          bg-white
          p-[50px]
          shadow-[0_4px_15px_rgba(0,0,0,0.25)]
        "
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <UserCog className="h-16 w-16 text-[#71C4FF]" />
          <div className="text-2xl font-semibold text-[#71C4FF]">
            BruinPlace
          </div>
          <div className="text-sm text-zinc-700">Sign in to continue.</div>
        </div>

        <form className="mt-8 flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm text-zinc-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm text-zinc-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="h-[42px] w-full rounded-full bg-[#71C4FF] text-white hover:bg-[#71C4FF]"
          >
            Sign in
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-200" />
            <div className="text-xs text-zinc-400">OR</div>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <div className="text-center text-sm text-zinc-700">
            Don’t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-[#71C4FF]">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
