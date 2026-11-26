import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "@/helpers/tests/providers";
import { VideoPlayerFactoryContext } from "@/hooks/useVideoPlayer";
import type {
  VideoPlayer,
  VideoPlayerEvents,
  VideoPlayerFactory,
} from "@/lib/watch/video-player";
import { MOCK_VIDEO_IDS, mockVideos } from "@/mocks/fixtures/watch";
import WatchScreen from "./WatchScreen";

function stubApi() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    const match = /^\/api\/videos\/([^/]+)(\/lines)?$/.exec(url.pathname);
    const entry = match ? mockVideos[match[1]!] : undefined;
    if (!entry)
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    if (!match![2])
      return new Response(JSON.stringify(entry.video), { status: 200 });
    const from = Number(url.searchParams.get("from_ms"));
    const to = Number(url.searchParams.get("to_ms"));
    const lines = entry.lines.filter(
      (l) => l.start_ms >= from && l.start_ms < to,
    );
    return new Response(JSON.stringify({ from_ms: from, to_ms: to, lines }), {
      status: 200,
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function fakePlayer() {
  let events: VideoPlayerEvents | undefined;
  const state = { seconds: 0 };
  const player: VideoPlayer = {
    play: vi.fn(() => events?.onPlayingChange(true)),
    pause: vi.fn(() => events?.onPlayingChange(false)),
    seekTo: vi.fn((s: number) => {
      state.seconds = s;
    }),
    getCurrentTime: () => state.seconds,
    getDuration: () => 768,
    setPlaybackRate: vi.fn(),
    setVolume: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    destroy: vi.fn(),
  };
  const factory: VideoPlayerFactory = vi.fn(async (_host, _options, ev) => {
    events = ev;
    setTimeout(() => ev.onReady(), 0);
    return player;
  });
  return { player, factory, state, events: () => events! };
}

function renderWatch(videoId: string, fake = fakePlayer(), startMs = 0) {
  const Wrapper = createWrapper();
  render(
    <VideoPlayerFactoryContext.Provider value={fake.factory}>
      <Wrapper>
        <WatchScreen videoId={videoId} startMs={startMs} />
      </Wrapper>
    </VideoPlayerFactoryContext.Provider>,
  );
  return fake;
}

const transcript = async () =>
  within(await screen.findByRole("complementary", { name: "Transcript" }));
const firstLine = async (text: string) =>
  (await (await transcript()).findAllByText(text))[0]!;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  stubApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WatchScreen", () => {
  it("shows the video's header and its transcript with translations", async () => {
    renderWatch(MOCK_VIDEO_IDS.normal);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /Ein Tag in Hamburg/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("12:48")).toBeInTheDocument();
    expect(await firstLine("Guten Morgen aus Hamburg!")).toHaveAttribute(
      "lang",
      "de",
    );
    expect(await firstLine("Good morning from Hamburg!")).toHaveAttribute(
      "lang",
      "en",
    );
  });

  it("marks the line at the playhead and seeks when a line is clicked", async () => {
    const fake = renderWatch(MOCK_VIDEO_IDS.normal);
    const line = mockVideos[MOCK_VIDEO_IDS.normal]!.lines[5]!;

    const button = (await firstLine(line.text)).closest("button")!;
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Play (Space)" }),
      ).toBeEnabled(),
    );
    await userEvent.setup().click(button);

    expect(fake.player.seekTo).toHaveBeenCalledWith(line.start_ms / 1000);
    expect(button).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("region", { name: "Video" })).toHaveTextContent(
      line.text,
    );
  });

  it("follows playback and offers to come back after the user scrolls", async () => {
    const fake = renderWatch(MOCK_VIDEO_IDS.normal);
    const lines = mockVideos[MOCK_VIDEO_IDS.normal]!.lines;
    const first = await firstLine(lines[0]!.text);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Play (Space)" }),
      ).toBeEnabled(),
    );

    await userEvent.setup().click(await firstLine(lines[3]!.text));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

    fireEvent.wheel(first.closest("[class*=overflow-y-auto]")!);
    const panel = await transcript();
    const back = await panel.findByRole("button", {
      name: "Back to current line",
    });
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    await userEvent.setup().click(back);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(
      panel.queryByRole("button", { name: "Back to current line" }),
    ).toBeNull();
    expect(fake.player.seekTo).toHaveBeenCalledTimes(1);
  });

  it("plays and pauses with the button and with Space", async () => {
    const fake = renderWatch(MOCK_VIDEO_IDS.normal);
    const play = await screen.findByRole("button", { name: "Play (Space)" });
    await waitFor(() => expect(play).toBeEnabled());

    await userEvent.setup().click(play);
    expect(fake.player.play).toHaveBeenCalled();
    expect(
      await screen.findByRole("button", { name: "Pause (Space)" }),
    ).toBeInTheDocument();

    act(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    fireEvent.keyDown(document.body, { code: "Space", key: " " });
    expect(fake.player.pause).toHaveBeenCalled();
  });

  it("seeks with the keyboard on the seek bar", async () => {
    const fake = renderWatch(MOCK_VIDEO_IDS.normal);
    const seek = await screen.findByRole("slider", { name: "Seek" });
    await waitFor(() => expect(seek).not.toHaveAttribute("aria-disabled"));
    fireEvent.keyDown(seek, { key: "ArrowRight" });
    expect(fake.player.seekTo).toHaveBeenCalledWith(5);
    fireEvent.keyDown(seek, { key: "End" });
    expect(fake.player.seekTo).toHaveBeenLastCalledWith(768);
  });

  it("starts at ?t= and loads the window around it first", async () => {
    const fetchMock = stubApi();
    const fake = fakePlayer();
    renderWatch(MOCK_VIDEO_IDS.normal, fake, 7 * 60_000);

    await firstLine("Guten Morgen aus Hamburg!");
    expect(fake.factory).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ startSeconds: 420 }),
      expect.anything(),
    );
    const lineCalls = fetchMock.mock.calls
      .map(([u]) => String(u))
      .filter((u) => u.includes("/lines"));
    expect(lineCalls[0]).toContain("from_ms=300000");
  });

  it("filters lines", async () => {
    renderWatch(MOCK_VIDEO_IDS.normal);
    await firstLine("Guten Morgen aus Hamburg!");
    const panel = await transcript();

    const user = userEvent.setup();
    await user.click(panel.getByRole("button", { name: "Filter lines" }));
    await user.type(
      panel.getByRole("searchbox", { name: "Filter lines" }),
      "Fischmarkt",
    );

    expect(panel.getAllByText(/Fischmarkt/).length).toBeGreaterThan(0);
    expect(panel.queryByText("Guten Morgen aus Hamburg!")).toBeNull();

    await user.type(
      panel.getByRole("searchbox", { name: "Filter lines" }),
      "xyzzy",
    );
    expect(panel.getByText(/No lines match/)).toBeInTheDocument();

    await user.click(panel.getByRole("button", { name: "Close filter" }));
    expect(panel.getByRole("button", { name: "Filter lines" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      (await panel.findAllByText("Guten Morgen aus Hamburg!")).length,
    ).toBeGreaterThan(0);
  });

  it("says the transcript is being prepared while the video still loads", async () => {
    const fake = renderWatch(MOCK_VIDEO_IDS.preparing);
    expect(
      await (await transcript()).findByText("Preparing the transcript"),
    ).toBeInTheDocument();
    await waitFor(() => expect(fake.factory).toHaveBeenCalled());
  });

  it("says when preparing failed", async () => {
    renderWatch(MOCK_VIDEO_IDS.failed);
    expect(
      await (await transcript()).findByText("Couldn't prepare this transcript"),
    ).toBeInTheDocument();
  });

  it("shows only the German line without a translation", async () => {
    renderWatch(MOCK_VIDEO_IDS.noTranslation);
    await firstLine("Guten Morgen aus Hamburg!");
    expect(
      (await transcript()).queryByText("Good morning from Hamburg!"),
    ).toBeNull();
  });

  it("says so when the video isn't in the library", async () => {
    renderWatch("0190f3c2-7d1a-7c00-8a00-00000000dead");
    expect(
      await screen.findByRole("heading", {
        name: "This video isn't in your library",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to library/ }),
    ).toHaveAttribute("href", "/dashboard/personal");
  });

  it("keeps the transcript when the video can't play", async () => {
    const fake = fakePlayer();
    fake.factory = vi.fn(async (_h, _o, ev) => {
      setTimeout(() => ev.onError(150), 0);
      return fake.player;
    });
    renderWatch(MOCK_VIDEO_IDS.normal, fake);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "can't play here",
    );
    await firstLine("Guten Morgen aus Hamburg!");
  });
});
