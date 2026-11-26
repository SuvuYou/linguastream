export class ExtensionUnavailableError extends Error {
  constructor() {
    super("The extension isn't installed in this browser");
    this.name = "ExtensionUnavailableError";
  }
}

interface ChromeRuntime {
  sendMessage(extensionId: string, message: unknown, callback: (response: unknown) => void): void;
  lastError?: { message?: string };
}

export function sendToExtension(message: unknown): Promise<unknown> {
  const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;
  const runtime = (globalThis as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;

  if (!extensionId || typeof runtime?.sendMessage !== "function") {
    return Promise.reject(new ExtensionUnavailableError());
  }

  return new Promise((resolve, reject) => {
    runtime.sendMessage(extensionId, message, (response) => {
      if (runtime.lastError) reject(new ExtensionUnavailableError());
      else resolve(response);
    });
  });
}
