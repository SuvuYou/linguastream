/**
 * Which API routes are mocked in the browser, from NEXT_PUBLIC_API_MOCKS:
 * unset or empty = none, "all" = every mocked route, or a comma list of handler
 * groups ("user,library"). Only ever on in development.
 */
export function parseMockSetting(value: string | undefined): "all" | Set<string> {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "all") return "all";
  return new Set(
    trimmed
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
  );
}

export function isMockingEnabled(
  nodeEnv = process.env.NODE_ENV,
  setting = process.env.NEXT_PUBLIC_API_MOCKS,
): boolean {
  if (nodeEnv !== "development") return false;
  const parsed = parseMockSetting(setting);
  return parsed === "all" || parsed.size > 0;
}
