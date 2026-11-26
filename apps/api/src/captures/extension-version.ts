import { HttpException, type Provider } from "@nestjs/common";
import type { ApiError } from "@linguastream/contracts";

export const MIN_EXTENSION_VERSION = Symbol("MIN_EXTENSION_VERSION");

const UPGRADE_REQUIRED = 426;

export const minExtensionVersionProvider: Provider = {
  provide: MIN_EXTENSION_VERSION,
  useFactory: () => process.env.MIN_EXTENSION_VERSION || "0.1.0",
};

function parse(version: string | undefined): number[] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version ?? "");
  return match ? match.slice(1).map(Number) : null;
}

export function isSupportedVersion(version: string | undefined, minimum: string): boolean {
  const v = parse(version);
  const min = parse(minimum);
  if (!v || !min) return false;
  for (let i = 0; i < 3; i++) {
    if (v[i] !== min[i]) return v[i] > min[i];
  }
  return true;
}

export function assertSupportedVersion(version: string | undefined, minimum: string): void {
  if (isSupportedVersion(version, minimum)) return;
  throw new HttpException(
    { error: `Update the extension to version ${minimum} or newer` } satisfies ApiError,
    UPGRADE_REQUIRED,
  );
}
