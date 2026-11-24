import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PersonalLibraryPage from "./PersonalLibraryPage";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

vi.mock("@/hooks/useLibraryLanguages", () => ({
  useLibraryLanguages: vi.fn(),
}));

vi.mock("@/components/primitives/SearchBar", () => ({
  default: () => <div data-testid="search-bar">Search</div>,
}));

vi.mock("../features/library/LanguageFilter", () => ({
  default: ({
    isLoading,
    isError,
  }: {
    isLoading: boolean;
    isError: boolean;
  }) => (
    <div data-testid="language-filter">
      {isLoading ? "Loading" : isError ? "Error" : "Languages"}
    </div>
  ),
}));

vi.mock("../features/personal-library/SourceUploadFilter", () => ({
  default: ({
    type,
  }: {
    type: {
      value: string;
      onChange: (value: string) => void;
    };
  }) => (
    <select
      data-testid="source-filter"
      value={type.value}
      onChange={(e) => type.onChange(e.target.value as any)}
    >
      <option value="all">All</option>
      <option value="youtube">YouTube</option>
      <option value="upload">Uploads</option>
    </select>
  ),
}));

vi.mock("../features/personal-library/Grid/CardsGrid", () => ({
  default: ({ isLanguagesLoading }: { isLanguagesLoading: boolean }) => (
    <div data-testid="cards-grid">
      {isLanguagesLoading && "Loading languages"}
    </div>
  ),
}));

vi.mock("../ui/separator", () => ({
  Separator: () => <div data-testid="separator" />,
}));

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);
const mockedUseLibraryLanguages = vi.mocked(useLibraryLanguages);

describe("PersonalLibraryPage", () => {
  const setParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseZodSearchParams.mockReturnValue({
      params: {
        type: "all",
        page: 0,
      },
      set: setParams,
    } as any);

    mockedUseLibraryLanguages.mockReturnValue({
      source: {},
      translation: {},
      isLoading: false,
      isFetching: false,
      isError: false,
    } as any);
  });

  it("renders search, language filter and cards grid", () => {
    render(<PersonalLibraryPage />);

    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("language-filter")).toBeInTheDocument();
    expect(screen.getByTestId("cards-grid")).toBeInTheDocument();
  });

  it("renders source filter", () => {
    render(<PersonalLibraryPage />);

    expect(screen.getByTestId("source-filter")).toBeInTheDocument();
  });

  it("uses current type from search params", () => {
    mockedUseZodSearchParams.mockReturnValue({
      params: {
        type: "youtube",
        page: 0,
      },
      set: setParams,
    } as any);

    render(<PersonalLibraryPage />);

    expect(screen.getByTestId("source-filter")).toHaveValue("youtube");
  });

  it("updates type and resets page", async () => {
    const user = userEvent.setup();

    render(<PersonalLibraryPage />);

    await user.selectOptions(screen.getByTestId("source-filter"), "upload");

    expect(setParams).toHaveBeenCalledWith({
      type: "upload",
      page: 0,
    });
  });

  it("hides source filter while languages are loading", () => {
    mockedUseLibraryLanguages.mockReturnValue({
      source: {},
      translation: {},
      isLoading: true,
      isFetching: false,
      isError: false,
    } as any);

    render(<PersonalLibraryPage />);

    expect(screen.queryByTestId("source-filter")).not.toBeInTheDocument();
  });

  it("hides source filter while languages are fetching", () => {
    mockedUseLibraryLanguages.mockReturnValue({
      source: {},
      translation: {},
      isLoading: false,
      isFetching: true,
      isError: false,
    } as any);

    render(<PersonalLibraryPage />);

    expect(screen.queryByTestId("source-filter")).not.toBeInTheDocument();
  });

  it("passes language loading state to CardsGrid", () => {
    mockedUseLibraryLanguages.mockReturnValue({
      source: {},
      translation: {},
      isLoading: true,
      isFetching: false,
      isError: false,
    } as any);

    render(<PersonalLibraryPage />);

    expect(screen.getByTestId("cards-grid")).toHaveTextContent(
      "Loading languages",
    );
  });
});
