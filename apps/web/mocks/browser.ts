import { setupWorker } from "msw/browser";
import { selectHandlers } from "./handlers";

let started: Promise<void> | undefined;

export function startMocking(): Promise<void> {
  started ??= (async () => {
    const worker = setupWorker(...selectHandlers(process.env.NEXT_PUBLIC_API_MOCKS));

    await worker.start({
      // Anything without a mock goes to the real API.
      onUnhandledFrame: "bypass",
      quiet: false,
    });
  })();
  return started;
}
