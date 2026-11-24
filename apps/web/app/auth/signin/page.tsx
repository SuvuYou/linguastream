"use client";

import { useState, useTransition } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/initializations/firebase/firebase";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

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
      } catch (err: Error | unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="pb-2 text-xl font-medium underline underline-offset-4 decoration-primary decoration-2">
            LinguaStream
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Create an account" : "Sign in to continue"}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <Field className="gap-3">
              <FieldLabel
                htmlFor="email"
                className="text-base font-normal pl-2 text-primary-foreground"
              >
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </Field>

            <Field className="gap-3">
              <FieldLabel
                htmlFor="password"
                className="text-base font-normal pl-2 text-primary-foreground"
              >
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={isPending}
              />
            </Field>
          </div>

          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              aria-busy={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "No account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
