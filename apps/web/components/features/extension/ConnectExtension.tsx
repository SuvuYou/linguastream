"use client";

import { createExtensionCodeRoute } from "@linguastream/contracts";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ApiRequestError, apiRequest } from "@/lib/api/client";
import { ExtensionUnavailableError, sendToExtension } from "@/lib/extension/send-to-extension";

type State = "connecting" | "connected" | "not-installed" | "server-unreachable" | "failed";

const SIGN_IN_AND_RETURN = `/auth/signin?next=${encodeURIComponent("/extension/connect")}`;

function isOk(response: unknown) {
  return typeof response === "object" && response !== null && (response as { ok?: unknown }).ok === true;
}

export default function ConnectExtension() {
  const router = useRouter();
  const [state, setState] = useState<State>("connecting");
  const started = useRef(false);

  const connect = useCallback(async () => {
    try {
      const { code } = await apiRequest(createExtensionCodeRoute);
      const response = await sendToExtension({ type: "connect", code });
      setState(isOk(response) ? "connected" : "failed");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
        router.replace(SIGN_IN_AND_RETURN);
        return;
      }
      if (err instanceof ExtensionUnavailableError) setState("not-installed");
      else if ((err instanceof ApiRequestError && err.status >= 500) || err instanceof TypeError) {
        setState("server-unreachable");
      } else setState("failed");
    }
  }, [router]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void connect();
  }, [connect]);

  function retry() {
    setState("connecting");
    void connect();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Connect the extension</CardTitle>
          <CardDescription>Signs the LinguaStream extension in as you.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state === "connecting" && (
            <p className="flex items-center gap-2" role="status">
              <Spinner className="size-4" /> Connecting…
            </p>
          )}
          {state === "connected" && <p role="status">Extension connected. You can close this tab.</p>}
          {state === "not-installed" && (
            <Alert role="alert">
              <AlertDescription>The extension isn&apos;t installed in this browser.</AlertDescription>
            </Alert>
          )}
          {(state === "failed" || state === "server-unreachable") && (
            <>
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  {state === "failed"
                    ? "Couldn't connect the extension."
                    : "The server isn't reachable right now."}
                </AlertDescription>
              </Alert>
              <Button onClick={retry}>Try again</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
