"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { isMockingEnabled } from "@/mocks/config";
import { TooltipProvider } from "../ui/tooltip";

const MockServiceWorker = dynamic(() => import("@/mocks/MockServiceWorker"), {
  ssr: false,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  // With API mocks on (development only), wait for the mock service worker so the
  // first requests don't reach the real API before it intercepts them
  const [mocksReady, setMocksReady] = useState(() => !isMockingEnabled());
  const onMocksReady = useCallback(() => setMocksReady(true), []);

  if (!mocksReady) return <MockServiceWorker onReady={onMocksReady} />;

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TooltipProvider>
  );
}
