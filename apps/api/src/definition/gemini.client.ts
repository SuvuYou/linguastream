import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"] as const;

type GeminiError = { status?: number; code?: number; message?: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function statusOf(error: GeminiError) {
  return error?.status ?? error?.code;
}

function isRetryableError(error: GeminiError) {
  const status = statusOf(error);
  const message = error?.message ?? "";

  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("UNAVAILABLE") ||
    message.includes("INTERNAL")
  );
}

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

  async generateText(
    prompt: string,
    options?: { responseMimeType?: "application/json" | "text/plain" },
  ): Promise<string> {
    if (!this.genAI) {
      this.logger.error("GEMINI_API_KEY is not set (apps/api/.env)");
      throw new Error("GEMINI_API_KEY is not set");
    }

    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const modelName = GEMINI_MODELS[i];

      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: options?.responseMimeType
            ? { responseMimeType: options.responseMimeType }
            : undefined,
        });
        return result.response.text();
      } catch (error) {
        this.logger.warn(`${modelName} failed (status ${statusOf(error as GeminiError) ?? "unknown"})`);

        if (!isRetryableError(error as GeminiError) || i === GEMINI_MODELS.length - 1) {
          throw new Error(`Gemini failed on ${modelName}`);
        }
        await sleep(1000);
      }
    }

    throw new Error("Gemini failed");
  }
}
