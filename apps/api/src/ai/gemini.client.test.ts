import { Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SpendLimiter } from "../usage/spend-limiter";
import { GeminiCallError, GeminiClient } from "./gemini.client";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function () {
    return { getGenerativeModel: ({ model }: { model: string }) => ({ generateContent: (req: unknown) => generateContent(model, req) }) };
  }),
}));

const ok = (text: string, usageMetadata?: { promptTokenCount: number; totalTokenCount: number }) => ({
  response: { text: () => text, usageMetadata },
});

const spend = { record: vi.fn<(microUsd: number) => Promise<void>>(async () => {}) };
const client = () => new GeminiClient(spend as unknown as SpendLimiter);

describe("GeminiClient", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    generateContent.mockReset();
    spend.record.mockReset();
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns the first model's text", async () => {
    generateContent.mockResolvedValue(ok("{}"));
    await expect(client().generateText("prompt")).resolves.toBe("{}");
    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(GoogleGenerativeAI).toHaveBeenCalledWith("test-key");
  });

  it("falls back to the next model on a retryable error", async () => {
    generateContent
      .mockRejectedValueOnce({ status: 503, message: "UNAVAILABLE" })
      .mockResolvedValueOnce(ok("fallback"));
    const result = client().generateText("prompt");
    await vi.runAllTimersAsync();
    await expect(result).resolves.toBe("fallback");
    expect(generateContent.mock.calls.map(([model]) => model)).toEqual([
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
    ]);
  });

  it("stops at once on an error that won't go away", async () => {
    generateContent.mockRejectedValue({ status: 400, message: "bad request about Haus" });
    await expect(client().generateText("prompt")).rejects.toThrow("Gemini failed");
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("says which model failed, with what status, and whether trying later can help", async () => {
    generateContent.mockRejectedValue({ status: 400, message: "bad request about Haus" });
    const error = await client().generateText("prompt").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GeminiCallError);
    expect(error).toMatchObject({ model: "gemini-3.1-flash-lite", status: 400, retryable: false, code: "GEMINI_400" });
    expect((error as Error).message).not.toContain("Haus");

    generateContent.mockReset().mockRejectedValue({ status: 429, message: "RESOURCE_EXHAUSTED" });
    const busy = client().generateText("prompt").catch((e: unknown) => e);
    await vi.runAllTimersAsync();
    expect(await busy).toMatchObject({ model: "gemini-3.5-flash", status: 429, retryable: true, code: "GEMINI_429" });

    generateContent.mockReset().mockRejectedValue(Object.assign(new Error("Request aborted"), { name: "AbortError" }));
    const slow = client().generateText("prompt").catch((e: unknown) => e);
    await vi.runAllTimersAsync();
    expect(await slow).toMatchObject({ status: "timeout", retryable: true, code: "GEMINI_TIMEOUT" });

    generateContent.mockReset().mockRejectedValue(new Error("socket hang up"));
    expect(await client().generateText("prompt").catch((e: unknown) => e)).toMatchObject({
      status: null,
      code: "GEMINI_ERROR",
    });
  });

  it("logs the model and status, not the error text", async () => {
    generateContent.mockRejectedValue({ status: 400, message: "bad request about Haus" });
    await expect(client().generateText("prompt with Haus")).rejects.toThrow();
    expect(warn.mock.calls).toEqual([["gemini-3.1-flash-lite failed (status 400)"]]);
  });

  it("fails clearly without an API key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(client().generateText("prompt")).rejects.toThrow("GEMINI_API_KEY is not set");
  });

  it("records the call's cost from the reported tokens, thinking included", async () => {
    generateContent.mockResolvedValue(ok("{}", { promptTokenCount: 1000, totalTokenCount: 1400 }));
    await client().generateText("prompt");
    expect(spend.record).toHaveBeenCalledWith(1000 * 0.25 + 400 * 1.5);
  });

  it("reports the call's cost to the caller", async () => {
    generateContent.mockResolvedValue(ok("{}", { promptTokenCount: 1000, totalTokenCount: 1400 }));
    const onCost = vi.fn();
    await client().generateText("prompt", { onCost });
    expect(onCost).toHaveBeenCalledWith(1000 * 0.25 + 400 * 1.5);
  });

  it("still answers when the cost can't be recorded", async () => {
    generateContent.mockResolvedValue(ok("{}", { promptTokenCount: 10, totalTokenCount: 20 }));
    spend.record.mockRejectedValueOnce(new Error("redis down"));
    await expect(client().generateText("prompt")).resolves.toBe("{}");
  });
});
