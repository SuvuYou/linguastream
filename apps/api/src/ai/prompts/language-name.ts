const names = new Intl.DisplayNames(["en"], { type: "language" });

export function languageName(code: string): string {
  try {
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}
