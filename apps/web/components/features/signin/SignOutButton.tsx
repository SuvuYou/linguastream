"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { auth } from "@/lib/initializations/firebase/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut(auth);
      await fetch("/api/auth/session", { method: "DELETE" });
      router.push("/auth/signin");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="default"
      onClick={handleSignOut}
      disabled={isPending}
      aria-busy={isPending}
      className="mb-4 p-4 w-full justify-start"
    >
      {isPending ? (
        <>
          <Spinner className="size-3.5" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="size-4" /> {"Sign out"}
        </>
      )}
    </Button>
  );
}
