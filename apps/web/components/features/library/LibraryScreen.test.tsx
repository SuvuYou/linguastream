import {
  PROCESSING_EVENT_NAME,
  type LibraryVideo,
  type ProcessingEvent,
} from "@linguastream/contracts";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeEventSource } from "@/helpers/tests/fake-event-source";
import { createWrapper } from "@/helpers/tests/providers";
import { libraryPage, mockLibrary } from "@/mocks/fixtures/library";
import LibraryScreen from "./LibraryScreen";
import { SEARCH_DEBOUNCE_MS } from "./LibrarySearch";

const nav = vi.hoisted(() => ({
  search: "",
  replace: vi.fn((url: string) => {
    nav.search = url.split("?")[1] ?? "";
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace }),
  usePathname: () => "/dashboard/personal",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const api = {
  fail: false,
  retryStatus: 200,
  retried: [] as string[],
  override: null as ((page: number, q?: string) => unknown) | null,
};

function stubApi() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    const retry = /^\/api\/tracks\/([^/]+)\/retry$/.exec(url.pathname);
    if (retry) {
      api.retried.push(retry[1]!);
      return new Response(
        JSON.stringify(
          api.retryStatus === 200
            ? { track_id: retry[1], status: "pending" }
            : { error: "boom" },
        ),
        { status: api.retryStatus },
      );
    }
    if (api.fail)
      return new Response(JSON.stringify({ error: "boom" }), { status: 500 });
    const page = Number(url.searchParams.get("page") ?? 0);
    const q = url.searchParams.get("q") ?? undefined;
    const body = api.override?.(page, q) ?? libraryPage(page, q);
    return new Response(JSON.stringify(body), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderScreen(Wrapper = createWrapper()) {
  const view = render(<LibraryScreen />, { wrapper: Wrapper });
  return { ...view, rerenderScreen: () => view.rerender(<LibraryScreen />) };
}

const card = (video: LibraryVideo) =>
  screen.getAllByRole("link").find((link) => link.getAttribute("href") === `/watch/${video.id}`)!;

const tryAgain = (video: LibraryVideo) =>
  within(card(video).closest("article")!).queryByRole("button", { name: /^Try again/ });

const failed = mockLibrary.find((v) => v.track?.status === "failed")!;
const preparing = mockLibrary.find((v) => v.track?.status === "processing")!;
const ready = mockLibrary.find((v) => v.track?.status === "ready")!;

beforeEach(() => {
  nav.search = "";
  nav.replace.mockClear();
  Object.assign(api, { fail: false, retryStatus: 200, retried: [], override: null });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("LibraryScreen", () => {
  it("shows the first page of the user's videos, each linking to its watch page", async () => {
    const fetchMock = stubApi();
    renderScreen();
    expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();

    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));
    expect(fetchMock).toHaveBeenCalledWith("/api/videos?page=0", expect.anything());
    expect(card(ready)).toHaveAttribute("href", `/watch/${ready.id}`);
    const article = card(ready).closest("article")!;
    expect(within(article).getByText(/^\d+:\d{2}$/)).toBeInTheDocument();
    expect(article.querySelector("img")).toHaveAttribute(
      "src",
      `https://i.ytimg.com/vi/${ready.youtube_video_id}/mqdefault.jpg`,
    );
  });

  it("shows preparing and failed videos, and retries a failed one from its card", async () => {
    stubApi();
    renderScreen();
    await waitFor(() => expect(card(failed)).toBeDefined());

    expect(card(preparing)).toHaveTextContent("Preparing: Translating, 60%");
    expect(card(failed)).toHaveTextContent("Couldn't prepare");

    await userEvent.click(tryAgain(failed)!);
    await waitFor(() => expect(card(failed)).toHaveTextContent("Waiting to prepare"));
    expect(api.retried).toEqual([failed.track!.id]);
    expect(tryAgain(failed)).toBeNull();
  });

  it("says so when a retry can't be started", async () => {
    stubApi();
    api.retryStatus = 500;
    renderScreen();
    await userEvent.click(await waitFor(() => tryAgain(failed)!));
    expect(await screen.findByText("Couldn't start. Try again")).toBeInTheDocument();
  });

  it("follows live processing events and reloads when a video is queued, ready or failed", async () => {
    const fetchMock = stubApi();
    renderScreen();
    await waitFor(() => expect(card(ready)).toBeDefined());
    const calls = fetchMock.mock.calls.length;
    const ids = { track_id: ready.track!.id, video_id: ready.id, title: ready.title };
    const emit = (event: ProcessingEvent) =>
      act(() => FakeEventSource.latest().emit(PROCESSING_EVENT_NAME, event));

    emit({ type: "step", ...ids, step: "analyse", step_index: 2, step_count: 5 });
    expect(card(ready)).toHaveTextContent("Preparing: Words, 40%");
    expect(fetchMock.mock.calls.length).toBe(calls);

    emit({ type: "failed", ...ids, error_code: "empty_track" });
    expect(card(ready)).toHaveTextContent("These captions have no text.");
    expect(tryAgain(ready)).toBeNull();
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(calls));
  });

  it("searches after a pause, starting from the first page", async () => {
    stubApi();
    nav.search = "page=2";
    const { rerenderScreen } = renderScreen();
    const input = screen.getByRole("searchbox", { name: "Search the library" });

    await userEvent.type(input, "Brezeln");
    expect(nav.replace).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(nav.replace).toHaveBeenCalledWith("/dashboard/personal?q=Brezeln", { scroll: false }),
      { timeout: SEARCH_DEBOUNCE_MS + 500 },
    );
    rerenderScreen();
    await waitFor(() =>
      expect(screen.getAllByRole("article").every((a) => a.textContent!.includes("Brezeln"))).toBe(true),
    );

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(nav.replace).toHaveBeenLastCalledWith("/dashboard/personal", { scroll: false });
  });

  it("pages through the library", async () => {
    stubApi();
    const { rerenderScreen } = renderScreen();
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));

    await userEvent.click(screen.getByLabelText("Go to next page"));
    expect(nav.replace).toHaveBeenCalledWith("/dashboard/personal?page=2", { scroll: false });
    rerenderScreen();
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(mockLibrary.length - 24));
  });

  it("explains an empty library, an empty search and a page past the end", async () => {
    stubApi();
    api.override = (page) => ({ items: [], page, page_size: 24, total: 0 });
    const { unmount } = renderScreen();
    expect(await screen.findByText("Your library is empty")).toBeInTheDocument();
    unmount();

    nav.search = "q=zzz";
    const second = renderScreen();
    expect(await screen.findByText("No videos match “zzz”")).toBeInTheDocument();
    second.unmount();

    nav.search = "page=9";
    api.override = (page) => ({ items: [], page, page_size: 24, total: 30 });
    renderScreen();
    await userEvent.click(await screen.findByRole("button", { name: "Go to the first page" }));
    expect(nav.replace).toHaveBeenCalledWith("/dashboard/personal", { scroll: false });
  });

  it("offers to try again when the library can't be loaded", async () => {
    stubApi();
    api.fail = true;
    renderScreen();
    expect(await screen.findByText("Couldn't load your library")).toBeInTheDocument();
    api.fail = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));
  });

  it("shows the placeholder cover when YouTube's image fails", async () => {
    stubApi();
    api.override = () => ({ items: [ready], page: 0, page_size: 24, total: 1 });
    renderScreen();
    const img = (await screen.findByRole("article")).querySelector("img")!;
    act(() => {
      img.dispatchEvent(new Event("error"));
    });
    expect(screen.getByRole("article").querySelector("img")).toBeNull();
    expect(screen.getByRole("article")).toHaveTextContent(ready.title.charAt(0));
  });
});
