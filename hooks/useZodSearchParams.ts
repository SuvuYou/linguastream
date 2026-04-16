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

    router.replace(`${pathname}?${params.toString()}`);
  };

  const remove = (...keys: (keyof z.infer<T>)[]) => {
    const params = new URLSearchParams(searchParams.toString());

    keys.forEach((key) => {
      params.delete(key as string);
    });

    router.replace(`${pathname}?${params.toString()}`);
  };

  return { params: parsedParams, set, remove };
}
