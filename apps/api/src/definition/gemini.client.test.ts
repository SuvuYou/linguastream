import { Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiClient } from "./gemini.client";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function () {
    return { getGenerativeModel: ({ model }: { model: string }) => ({ generateContent: (req: unknown) => generateContent(model, req) }) };
  }),
}));

const ok = (text: string) => ({ response: { text: () => text } });

describe("GeminiClient", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    generateContent.mockReset();
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
    await expect(new GeminiClient().generateText("prompt")).resolves.toBe("{}");
    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(GoogleGenerativeAI).toHaveBeenCalledWith("test-key");
  });

  it("falls back to the next model on a retryable error", async () => {
    generateContent
      .mockRejectedValueOnce({ status: 503, message: "UNAVAILABLE" })
      .mockResolvedValueOnce(ok("fallback"));
    const result = new GeminiClient().generateText("prompt");
    await vi.runAllTimersAsync();
    await expect(result).resolves.toBe("fallback");
    expect(generateContent.mock.calls.map(([model]) => model)).toEqual([
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
    ]);
  });

  it("stops at once on an error that won't go away", async () => {
    generateContent.mockRejectedValue({ status: 400, message: "bad request about Haus" });
    await expect(new GeminiClient().generateText("prompt")).rejects.toThrow("Gemini failed");
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("logs the model and status, not the error text", async () => {
    generateContent.mockRejectedValue({ status: 400, message: "bad request about Haus" });
    await expect(new GeminiClient().generateText("prompt with Haus")).rejects.toThrow();
    expect(warn.mock.calls).toEqual([["gemini-3.1-flash-lite failed (status 400)"]]);
  });

  it("fails clearly without an API key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(new GeminiClient().generateText("prompt")).rejects.toThrow("GEMINI_API_KEY is not set");
  });
});
