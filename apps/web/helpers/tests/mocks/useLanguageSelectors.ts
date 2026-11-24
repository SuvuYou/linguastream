import { vi } from "vitest";
import { useLanguageSelectors } from "@/hooks/useLanguageSelectors";
import { LANGUAGES } from "@/helpers/const";

const createBaseResponse = () => ({
  data: {
    selectedTranslateLangs: new Set<string>(["en"]),
    selectedSourceLang: "de",
    availableTranslationLangs: LANGUAGES.filter((l) => l.code !== "de"),
    removedTranslationLangs: [],
  },

  actions: {
    setSelectedSourceLang: vi.fn(),
    toggleTranslateLang: vi.fn(),
  },

  checks: {
    isSourceLanguageExisting: true,
    isTranslationLanguageSelected: vi.fn((lang: string) =>
      new Set(["en"]).has(lang),
    ),
    isTranslationLanguageExisting: vi.fn((lang: string) =>
      ["en"].includes(lang),
    ),
  },
});

const mockedUseLanguageSelectors = vi.mocked(useLanguageSelectors);

export const mockUseLanguageSelectors = {
  base: () => mockedUseLanguageSelectors.mockReturnValue(createBaseResponse()),

  custom: (overrides: Partial<ReturnType<typeof createBaseResponse>>) => {
    const base = createBaseResponse();

    mockedUseLanguageSelectors.mockReturnValue({
      ...base,
      ...overrides,
      data: {
        ...base.data,
        ...overrides.data,
      },
      actions: {
        ...base.actions,
        ...overrides.actions,
      },
      checks: {
        ...base.checks,
        ...overrides.checks,
      },
    });
  },
};
