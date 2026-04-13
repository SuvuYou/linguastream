"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { auth } from "@/lib/firebase/firebase";
import { signOut } from "firebase/auth";

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
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="text-xs text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
