"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/hooks/useUser";

export function initials(name: string | null | undefined, email: string | undefined) {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : source.slice(0, 2);
  return letters.toUpperCase() || "?";
}

export default function AccountMenu() {
  const router = useRouter();
  const { data: user } = useUser();
  const [signingOut, startTransition] = useTransition();

  const handleSignOut = () =>
    startTransition(async () => {
      const [{ signOut }, { auth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/initializations/firebase/firebase"),
      ]);
      await signOut(auth);
      await fetch("/api/auth/session", { method: "DELETE" });
      router.push("/auth/signin");
      router.refresh();
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-raised-2 text-text-2 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:text-foreground"
      >
        <span aria-hidden="true" className="text-[13px] font-semibold">{initials(user?.display_name, user?.email)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {user && (
          <>
            <DropdownMenuLabel className="flex min-w-0 flex-col gap-0.5 pb-2 font-normal tracking-normal normal-case">
              {user.display_name && (
                <span className="truncate text-sm font-semibold text-foreground">
                  {user.display_name}
                </span>
              )}
              <span className="truncate text-[13px] text-text-3">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
        >
          {signingOut ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
