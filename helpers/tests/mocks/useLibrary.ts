import { vi } from "vitest";
import { useLibrary } from "@/hooks/useLibrary";
import type { UseQueryResult } from "@tanstack/react-query";
import type { LibraryResponse } from "@/types/library";
import { JOB_STATUS } from "@/helpers/const";

vi.mock("@/hooks/useLibrary", () => ({
  useLibrary: vi.fn(),
  DEFAULT_LIBRARY_RESPONSE: { items: [], total: 0, pageCount: 0 },
}));

const createBaseLibraryItem = () => ({
  id: "1",
  jellyfin_id: "123",
  source_language: "en",
  jellyfinItem: {
    Id: "123",
    Name: "Movie 1",
    Type: "Movie",
  },
  thumbnailUrl: "/img.jpg",
  job_status: JOB_STATUS.DONE,
});

const createBaseLibraryResponse = () =>
  ({
    isLoading: false,
    isError: false,
    data: { items: [createBaseLibraryItem()], total: 1 },
  }) as UseQueryResult<LibraryResponse>;

const createLoadingLibraryResponse = () =>
  ({
    ...createBaseLibraryResponse(),
    isLoading: true,
  }) as UseQueryResult<LibraryResponse>;

const createErrorLibraryResponse = () =>
  ({
    ...createBaseLibraryResponse(),
    isLoading: false,
    isError: true,
  }) as UseQueryResult<LibraryResponse>;

const mockedUseLibrary = vi.mocked(useLibrary);

export const mockUseLibrary = {
  loading: () =>
    mockedUseLibrary.mockReturnValue(createLoadingLibraryResponse()),
  error: () => mockedUseLibrary.mockReturnValue(createErrorLibraryResponse()),
  base: () => mockedUseLibrary.mockReturnValue(createBaseLibraryResponse()),

  custom: (overrides: Partial<UseQueryResult<LibraryResponse>>) =>
    mockedUseLibrary.mockReturnValue({
      ...createBaseLibraryResponse(),
      ...overrides,
    } as UseQueryResult<LibraryResponse>),
};
