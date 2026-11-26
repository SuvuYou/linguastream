import { HttpException } from "@nestjs/common";
import { assertSupportedVersion, isSupportedVersion } from "./extension-version";

describe("isSupportedVersion", () => {
  it("accepts the minimum and newer versions", () => {
    expect(isSupportedVersion("0.1.0", "0.1.0")).toBe(true);
    expect(isSupportedVersion("0.1.1", "0.1.0")).toBe(true);
    expect(isSupportedVersion("0.2.0", "0.1.9")).toBe(true);
    expect(isSupportedVersion("1.0.0", "0.9.9")).toBe(true);
    expect(isSupportedVersion("0.10.0", "0.9.0")).toBe(true);
  });

  it("refuses older, missing or malformed versions", () => {
    expect(isSupportedVersion("0.0.9", "0.1.0")).toBe(false);
    expect(isSupportedVersion("0.9.0", "0.10.0")).toBe(false);
    expect(isSupportedVersion(undefined, "0.1.0")).toBe(false);
    expect(isSupportedVersion("1.0", "0.1.0")).toBe(false);
    expect(isSupportedVersion("v1.0.0", "0.1.0")).toBe(false);
  });
});

describe("assertSupportedVersion", () => {
  it("throws 426 with an ApiError body for an old extension", () => {
    try {
      assertSupportedVersion("0.0.1", "0.2.0");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(426);
      expect((err as HttpException).getResponse()).toEqual({ error: "Update the extension to version 0.2.0 or newer" });
    }
  });
});
