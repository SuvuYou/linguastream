import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useLanguages } from "@/hooks/useLanguages";
import { useUser } from "@/hooks/useUser";
import { useLibrary } from "@/hooks/useLibrary";
import LibraryGrid from "@/components/features/library/LibraryGrid";
import type { User } from "@prisma/client";
import type { UseQueryResult } from "@tanstack/react-query";
import type { LibraryResponse } from "@/types/library";
import type { MergedContentItem } from "@/types";
import { JOB_STATUS, UNKNOWN_SOURCE_LANGUAGE } from "@/helpers/const";
import userEvent from "@testing-library/user-event";
import { useJobPolling } from "@/hooks/useJobPolling";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

vi.mock("@/hooks/useJobPolling", () => ({
  useJobPolling: vi.fn(),
}));

vi.mock("@/hooks/useLibrary", () => ({
  useLibrary: vi.fn(),
  DEFAULT_LIBRARY_RESPONSE: { items: [], total: 0, pageCount: 0 },
}));

vi.mock("@/components/features/library/ContentConfigurationModal", () => ({
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <button onClick={onSuccess}>Mock Modal</button>
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
const mockedUseJobPolling = vi.mocked(useJobPolling);

const DEFAULT_LANGUAGE_RESPONSE = {
  isError: false,
  isLoading: false,
  isFetching: false,
  selectedSourceLanguage: "",
  selectedTranslationLanguage: undefined,
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
};

const DEFAULT_POLLING_RESPONSE = {
  jobState: {
    status: JOB_STATUS.DONE,
    progress: 12,
    logs: [],
  },
  elementRef: { current: null },
  resetJob: vi.fn(),
};

describe("LibraryGrid", () => {
  it("shows skeleton when loading", () => {
    mockedUseJobPolling.mockReturnValue(DEFAULT_POLLING_RESPONSE);
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
    mockedUseJobPolling.mockReturnValue(DEFAULT_POLLING_RESPONSE);
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
    mockedUseJobPolling.mockReturnValue(DEFAULT_POLLING_RESPONSE);
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {},
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "en",
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
    mockedUseJobPolling.mockReturnValue(DEFAULT_POLLING_RESPONSE);
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
    mockedUseJobPolling.mockReturnValue(DEFAULT_POLLING_RESPONSE);
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { is_admin: true },
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "en",
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
            subtitle_tracks: [{ language: "de" }],
            jellyfinItem: {
              Id: "123",
              Name: "Movie 1",
              Type: "Movie",
            },
            thumbnailUrl: "/img.jpg",
            job_status: JOB_STATUS.DONE,
          },
        ],
        total: 1,
      },
    } as UseQueryResult<LibraryResponse>);

    render(<LibraryGrid />);

    expect(screen.getByText("Configure")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Configure"));

    expect(screen.getByText(/Mock Modal/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText("Mock Modal"));

    const modal = screen.queryByText(/Mock Modal/i);

    expect(modal).not.toBeInTheDocument();
  });
});
