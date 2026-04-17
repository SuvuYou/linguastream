import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useLanguages } from "@/hooks/useLanguages";
import { useUser } from "@/hooks/useUser";
import { useLibrary } from "@/hooks/useLibrary";
import LibraryGrid from "./LibraryGrid";
import type { User } from "@prisma/client";
import type { UseQueryResult } from "@tanstack/react-query";
import type { LibraryResponse } from "@/types/library";
import type { MergedContentItem } from "@/types";
import { UNKNOWN_SOURCE_LANGUAGE } from "@/helpers/const";
import userEvent from "@testing-library/user-event";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

vi.mock("@/hooks/useLibrary", () => ({
  useLibrary: vi.fn(),
  DEFAULT_LIBRARY_RESPONSE: { items: [], total: 0, pageCount: 0 },
}));

vi.mock("@/components/features/admin/AddToLibraryModal", () => ({
  default: ({ OnSuccess }: { OnSuccess: () => void }) => (
    <button onClick={OnSuccess}>Mock Modal</button>
  ),
}));

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

beforeEach(() => vi.resetAllMocks());

const mockedUseUser = vi.mocked(useUser);
const mockedUseLanguages = vi.mocked(useLanguages);
const mockedUseLibrary = vi.mocked(useLibrary);

const DEFAULT_LANGUAGE_RESPONSE = {
  isError: false,
  isLoading: false,
  isFetching: false,
  selectedSourceLanguage: "",
  selectedSubtitleLanguage: undefined,
  availableSourceLanguages: [],
  availableSubtitleLanguages: [],
};

describe("LibraryGrid", () => {
  it("shows skeleton when loading", () => {
    mockedUseLanguages.mockReturnValue(DEFAULT_LANGUAGE_RESPONSE);
    mockedUseUser.mockReturnValue({
      isLoading: true,
    } as UseQueryResult<User>);
    mockedUseLibrary.mockReturnValue({
      isLoading: false,
    } as UseQueryResult<LibraryResponse>);

    render(<LibraryGrid />);

    expect(screen.getAllByTestId("skeleton-item")).toHaveLength(12);
  });

  it("shows error state", () => {
    mockedUseLanguages.mockReturnValue(DEFAULT_LANGUAGE_RESPONSE);
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: true,
    } as UseQueryResult<User>);
    mockedUseLibrary.mockReturnValue({
      isLoading: false,
      isError: false,
    } as UseQueryResult<LibraryResponse>);

    render(<LibraryGrid />);

    expect(screen.getByText(/failed to load library/i)).toBeInTheDocument();
  });

  it("renders library items", () => {
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {},
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedSubtitleLanguage: "en",
    });

    mockedUseLibrary.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: "1",
            jellyfin_id: "123",
            source_language: "en",
            jellyfinItem: {
              Id: "123",
              Name: "Movie 1",
              Type: "Movie",
            },
            thumbnailUrl: "/img.jpg",
          },
        ],
        total: 1,
      },
    } as UseQueryResult<LibraryResponse>);

    render(<LibraryGrid />);

    expect(screen.getByText("Movie 1")).toBeInTheDocument();
    expect(screen.getByText("1 titles")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {},
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
    });

    mockedUseLibrary.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [] as MergedContentItem[], total: 0 },
    } as UseQueryResult<LibraryResponse>);

    render(<LibraryGrid />);

    expect(screen.getByText(/no items found/i)).toBeInTheDocument();
  });

  it("shows add button for admin and unknown language", async () => {
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { is_admin: true },
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedSubtitleLanguage: "en",
    });

    mockedUseLibrary.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: "1",
            jellyfin_id: "123",
            source_language: UNKNOWN_SOURCE_LANGUAGE,
            jellyfinItem: {
              Id: "123",
              Name: "Movie 1",
              Type: "Movie",
            },
            thumbnailUrl: "/img.jpg",
          },
        ],
        total: 1,
      },
    } as UseQueryResult<LibraryResponse>);

    render(<LibraryGrid />);

    expect(screen.getByText("+ Add")).toBeInTheDocument();

    await userEvent.click(screen.getByText("+ Add"));

    expect(screen.getByText(/Mock Modal/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText("Mock Modal"));

    expect(refreshMock).toHaveBeenCalled();
  });
});
