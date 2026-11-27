import type { ProcessingErrorCode } from "@linguastream/contracts";

export class ProcessingError extends Error {
  constructor(
    readonly code: ProcessingErrorCode,
    readonly retryable: boolean,
    readonly detail?: string,
  ) {
    super(code);
    this.name = "ProcessingError";
  }
}

export function toProcessingError(err: unknown): ProcessingError {
  return err instanceof ProcessingError ? err : new ProcessingError("internal", true);
}

export function errorReason(err: unknown): string {
  if (!(err instanceof Error)) return typeof err;
  const code = (err as { code?: unknown }).code;
  const cause = (err as { cause?: { code?: unknown } }).cause?.code;
  if (typeof code === "string") return code;
  if (typeof cause === "string") return cause;
  return err.name;
}

export function describeError(err: unknown): string {
  if (err instanceof ProcessingError) return err.detail ? `${err.code}, ${err.detail}` : err.code;
  return errorReason(err);
}
