import { Inject, Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI, type UsageMetadata } from "@google/generative-ai";
import { SpendLimiter } from "../usage/spend-limiter";
import { costMicroUsd } from "../usage/usage-config";

const GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"] as const;

export const GEMINI_TIMEOUT_MS = 90_000;

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

  constructor(@Inject(SpendLimiter) private readonly spend: SpendLimiter) {}

  private async recordUsage(
    model: string,
    usage: UsageMetadata | undefined,
    onCost?: (costMicroUsd: number) => void,
  ): Promise<void> {
    if (!usage) return;
    const input = usage.promptTokenCount ?? 0;
    const output = Math.max(0, (usage.totalTokenCount ?? 0) - input);
    const cost = costMicroUsd(model, input, output);
    onCost?.(cost);
    await this.spend.record(cost).catch((err: unknown) => {
      this.logger.error(`Spend not recorded: ${err instanceof Error ? err.name : typeof err}`);
    });
  }

  async generateText(
    prompt: string,
    options?: {
      responseMimeType?: "application/json" | "text/plain";
      systemInstruction?: string;
      temperature?: number;
      onCost?: (costMicroUsd: number) => void;
    },
  ): Promise<string> {
    if (!this.genAI) {
      this.logger.error("GEMINI_API_KEY is not set (apps/api/.env)");
      throw new Error("GEMINI_API_KEY is not set");
    }

    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const modelName = GEMINI_MODELS[i];

      try {
        const model = this.genAI.getGenerativeModel(
          { model: modelName, ...(options?.systemInstruction && { systemInstruction: options.systemInstruction }) },
          { timeout: GEMINI_TIMEOUT_MS },
        );
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            ...(options?.responseMimeType && { responseMimeType: options.responseMimeType }),
            ...(options?.temperature !== undefined && { temperature: options.temperature }),
          },
        });
        await this.recordUsage(modelName, result.response.usageMetadata, options?.onCost);
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
