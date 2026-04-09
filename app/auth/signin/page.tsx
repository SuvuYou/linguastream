"use client";

import { useState, useTransition } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const cred = isSignUp
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

        const idToken = await cred.user.getIdToken();

        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        router.push("/");
        router.refresh();
      } catch (err: { message: string } | unknown) {
        setError((err as { message: string }).message);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm border border-primary-border p-8 flex flex-col gap-6">
        <div>
          <div className="text-lg font-medium">LinguaStream</div>
          <div className="text-sm text-secondary-text mt-1">
            {isSignUp ? "Create an account" : "Sign in to continue"}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border border-primary-border px-3 py-2 text-sm outline-none text-primary-text placeholder-secondary-text"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-background border border-primary-border px-3 py-2 text-sm outline-none text-primary-text placeholder-secondary-text"
          />
        </div>

        {error && <div className="text-xs text-red-400">{error}</div>}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="py-2 text-sm bg-[#7a9e87] text-background font-medium disabled:opacity-50"
          >
            {isPending ? "..." : isSignUp ? "Create account" : "Sign in"}
          </button>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-secondary-text hover:text-primary-text transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "No account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
