"use client";

import { useEffect } from "react";
import { startMocking } from "./browser";

/** Starts the mock service worker, then reports that requests can go out. Browser only. */
export default function MockServiceWorker({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    startMocking().then(onReady);
  }, [onReady]);

  return null;
}
