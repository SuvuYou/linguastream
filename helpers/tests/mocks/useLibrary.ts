import { vi } from "vitest";
import { useLibrary } from "@/hooks/useLibrary";
import type { UseQueryResult } from "@tanstack/react-query";
import type { LibraryResponse } from "@/types/library";
import { JELLYFIN_CONTENT_TYPE, JOB_STATUS } from "@/helpers/const";
import { MergedContentItem } from "@/types";

export const createBaseLibraryItem = (): MergedContentItem => ({
  id: "mediaId",
  user_id: "userId",
  title: "title",
  jellyfin_id: "jellyfinId",
  type: JELLYFIN_CONTENT_TYPE,
  source_language: "en",
  jellyfinItem: {
    Id: "jellyfinId",
    Name: "Movie 1",
    Type: "Movie",
  },
  file_path: "path/file",
  youtube_video_id: "ytId",
  source_subtitle_acquisition_method: "whisperx",
  thumbnailUrl: "/img.jpg",
  job_status: JOB_STATUS.DONE,
  job_progress: 45,
  job_logs: "path/job",
  subtitle_tracks: [],
  created_at: new Date(),
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

const createEmptyLibraryResponse = () =>
  ({
    ...createBaseLibraryResponse(),
    data: { items: [], total: 0, pageCount: 0 },
  }) as UseQueryResult<LibraryResponse>;

const mockedUseLibrary = vi.mocked(useLibrary);

export const mockUseLibrary = {
  loading: () =>
    mockedUseLibrary.mockReturnValue(createLoadingLibraryResponse()),
  error: () => mockedUseLibrary.mockReturnValue(createErrorLibraryResponse()),
  base: () => mockedUseLibrary.mockReturnValue(createBaseLibraryResponse()),
  empty: () => mockedUseLibrary.mockReturnValue(createEmptyLibraryResponse()),

  custom: (overrides: Partial<UseQueryResult<LibraryResponse>>) =>
    mockedUseLibrary.mockReturnValue({
      ...createBaseLibraryResponse(),
      ...overrides,
    } as UseQueryResult<LibraryResponse>),
};
