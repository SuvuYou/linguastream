import { GoogleGenerativeAI } from "@google/generative-ai";

type Error = {
  status?: number;
  code?: number;
  message?: string;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"] as const;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(error: Error) {
  const status = error?.status ?? error?.code;
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

export async function generateGeminiText(
  prompt: string,
  options?: {
    responseMimeType?: "application/json" | "text/plain";
  },
) {
  let lastError: unknown;

  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    const modelName = GEMINI_MODELS[i];

    try {
      console.log(`Trying Gemini model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: options?.responseMimeType
          ? {
              responseMimeType: options.responseMimeType,
            }
          : undefined,
      });

      console.log(`✓ Gemini succeeded with ${modelName}`);

      return result.response.text();
    } catch (error) {
      lastError = error;

      console.error(`✗ ${modelName} failed`, error);

      if (!isRetryableError(error as Error)) {
        throw error;
      }

      if (i < GEMINI_MODELS.length - 1) {
        await sleep(1000);
      }
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
