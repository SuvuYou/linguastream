import { vi } from "vitest";
import { useLanguages } from "@/hooks/useLanguages";

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

const createEmptyLanguageResponse = () => ({
  isError: false,
  isLoading: false,
  isFetching: false,
  selectedSourceLanguage: undefined,
  selectedTranslationLanguage: undefined,
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
});

const createLoadingLanguageResponse = () => ({
  ...createEmptyLanguageResponse(),
  isLoading: true,
});

const createErrorLanguageResponse = () => ({
  ...createEmptyLanguageResponse(),
  isError: true,
});

const createSelectedLanguageResponse = () => ({
  ...createEmptyLanguageResponse(),
  selectedSourceLanguage: "de",
  selectedTranslationLanguage: "en",
  availableSourceLanguages: ["de"],
  availableTranslationLanguages: ["en"],
});

const mockedUseLanguages = vi.mocked(useLanguages);
export const mockUseLanguages = {
  empty: () =>
    mockedUseLanguages.mockReturnValue(createEmptyLanguageResponse()),
  loading: () =>
    mockedUseLanguages.mockReturnValue(createLoadingLanguageResponse()),
  error: () =>
    mockedUseLanguages.mockReturnValue(createErrorLanguageResponse()),
  selected: () =>
    mockedUseLanguages.mockReturnValue(createSelectedLanguageResponse()),

  custom: (
    overrides: Partial<ReturnType<typeof createEmptyLanguageResponse>>,
  ) =>
    mockedUseLanguages.mockReturnValue({
      ...createEmptyLanguageResponse(),
      ...overrides,
    }),
};
