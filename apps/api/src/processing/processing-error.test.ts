import { describe, expect, it } from "vitest";
import { ProcessingError, describeError, errorReason, toProcessingError } from "./processing-error";

describe("processing errors", () => {
  it("turns anything unknown into a retryable internal error", () => {
    const own = new ProcessingError("empty_track", false);
    expect(toProcessingError(own)).toBe(own);
    expect(toProcessingError(new Error("x"))).toMatchObject({ code: "internal", retryable: true });
  });

  it("names the reason by code, the cause's code, or the error type, never the message", () => {
    expect(errorReason(Object.assign(new Error("secret text"), { code: "ECONNREFUSED" }))).toBe("ECONNREFUSED");
    expect(errorReason(new TypeError("fetch failed", { cause: { code: "ENOTFOUND" } }))).toBe("ENOTFOUND");
    expect(errorReason(new RangeError("secret text"))).toBe("RangeError");
    expect(errorReason("boom")).toBe("string");
  });

  it("describes an error with its code and detail", () => {
    expect(describeError(new ProcessingError("internal", true, "NLP service answered 500"))).toBe(
      "internal, NLP service answered 500",
    );
    expect(describeError(new ProcessingError("empty_track", false))).toBe("empty_track");
    expect(describeError(new Error("secret"))).toBe("Error");
  });
});
