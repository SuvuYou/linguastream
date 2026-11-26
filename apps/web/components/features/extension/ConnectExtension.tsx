"use client";

import { createExtensionCodeRoute } from "@linguastream/contracts";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiRequest } from "@/lib/api/client";
import { ExtensionUnavailableError, sendToExtension } from "@/lib/extension/send-to-extension";

type State = "connecting" | "connected" | "not-installed" | "failed";

function isOk(response: unknown) {
  return typeof response === "object" && response !== null && (response as { ok?: unknown }).ok === true;
}

export default function ConnectExtension() {
  const [state, setState] = useState<State>("connecting");
  const started = useRef(false);

  const connect = useCallback(async () => {
    try {
      const { code } = await apiRequest(createExtensionCodeRoute);
      const response = await sendToExtension({ type: "connect", code });
      setState(isOk(response) ? "connected" : "failed");
    } catch (err) {
      setState(err instanceof ExtensionUnavailableError ? "not-installed" : "failed");
    }
  }, []);

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
          {state === "failed" && (
            <>
              <Alert variant="destructive" role="alert">
                <AlertDescription>Couldn&apos;t connect the extension.</AlertDescription>
              </Alert>
              <Button onClick={retry}>Try again</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
