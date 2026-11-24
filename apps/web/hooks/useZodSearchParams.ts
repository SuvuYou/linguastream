import { z } from "zod";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { parseSearchParams } from "@/helpers/params-schema";

export function useZodSearchParams<T extends z.ZodTypeAny>(schema: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const parsedParams = parseSearchParams(schema, searchParams);

  const set = (updates: Partial<z.infer<T>>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const next = params.toString();
    const current = searchParams.toString();

    if (next !== current) {
      router.replace(`${pathname}?${next}`);
    }
  };

  const remove = (...keys: (keyof z.infer<T>)[]) => {
    const params = new URLSearchParams(searchParams.toString());

    keys.forEach((key) => {
      params.delete(key as string);
    });

    const next = params.toString();
    const current = searchParams.toString();

    if (next !== current) {
      router.replace(`${pathname}?${next}`);
    }
  };

  return { params: parsedParams, set, remove };
}
