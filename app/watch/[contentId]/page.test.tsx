import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  fetchJellyfinWatchItem,
  getJellyfinStreamUrl,
} from "@/lib/db-helpers/jellyfin";
import Watch from "./page";
import type { JellyfinItem } from "@/types";

vi.mock("@/lib/db-helpers/jellyfin", () => ({
  fetchJellyfinWatchItem: vi.fn(),
  getJellyfinStreamUrl: vi.fn(),
}));

vi.mock("@/components/features/Player", () => ({
  default: ({ streamUrl, title }: { title: string; streamUrl: string }) => (
    <div data-testid="player">
      {streamUrl} - {title}
    </div>
  ),
}));

beforeEach(() => vi.resetAllMocks());

const mockedFetchJellyfinWatchItem = vi.mocked(fetchJellyfinWatchItem);
const mockedGetJellyfinStreamUrl = vi.mocked(getJellyfinStreamUrl);

describe("watch content page", () => {
  it("renders Player with fetched data", async () => {
    mockedFetchJellyfinWatchItem.mockResolvedValue({
      Name: "Movie Title",
    } as JellyfinItem);

    mockedGetJellyfinStreamUrl.mockReturnValue("http://stream-url");

    const Component = await Watch({
      params: Promise.resolve({ contentId: "123" }),
    });

    render(Component);

    expect(screen.getByTestId("player")).toHaveTextContent(
      "http://stream-url - Movie Title",
    );
    expect(mockedFetchJellyfinWatchItem).toHaveBeenCalledWith("123");
    expect(mockedGetJellyfinStreamUrl).toHaveBeenCalledWith("123");
  });
});
