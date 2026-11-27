import type { ProcessingErrorCode } from "@linguastream/contracts";

export class ProcessingError extends Error {
  constructor(
    readonly code: ProcessingErrorCode,
    readonly retryable: boolean,
  ) {
    super(code);
    this.name = "ProcessingError";
  }
}

export function toProcessingError(err: unknown): ProcessingError {
  return err instanceof ProcessingError ? err : new ProcessingError("internal", true);
}
