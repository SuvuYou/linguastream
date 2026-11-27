import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PROCESSING_EVENT_NAME } from "@linguastream/contracts";
import { FakeEventSource } from "@/helpers/tests/fake-event-source";
import { createWrapper } from "@/helpers/tests/providers";
import { VideoPlayerFactoryContext } from "@/hooks/useVideoPlayer";
import type {
  VideoPlayer,
  VideoPlayerEvents,
  VideoPlayerFactory,
} from "@/lib/watch/video-player";
import { MOCK_VIDEO_IDS, mockVideos } from "@/mocks/fixtures/watch";
import WatchScreen from "./WatchScreen";

const api = {
  preferences: {
    subtitle_visibility: { original: "show", translation: "show" },
  },
  failPreferences: false,
  translating: new Set<string>(),
};

function stubApi() {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost");
      if (url.pathname === "/api/preferences") {
        if (init?.method === "PATCH") {
          if (api.failPreferences)
            return new Response(JSON.stringify({ error: "boom" }), {
              status: 500,
            });
          const change = JSON.parse(String(init.body));
          api.preferences = {
            subtitle_visibility: {
              ...api.preferences.subtitle_visibility,
              ...change.subtitle_visibility,
            },
          };
        }
        return new Response(JSON.stringify(api.preferences), { status: 200 });
      }
      const translate = /^\/api\/videos\/([^/]+)\/translation$/.exec(url.pathname);
      if (translate && init?.method === "POST") {
        api.translating.add(translate[1]!);
        return new Response(
          JSON.stringify({ video_id: translate[1], translation: { language: "en", status: "pending" } }),
          { status: 202 },
        );
      }
      const match = /^\/api\/videos\/([^/]+)(\/lines)?$/.exec(url.pathname);
      const entry = match ? mockVideos[match[1]!] : undefined;
      if (!entry)
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
        });
      if (!match![2]) {
        const video = api.translating.has(match![1]!)
          ? {
              ...entry.video,
              translation: { language: "en", status: "pending", error_code: null, progress: null },
            }
          : entry.video;
        return new Response(JSON.stringify(video), { status: 200 });
      }
      const from = Number(url.searchParams.get("from_ms"));
      const to = Number(url.searchParams.get("to_ms"));
      const lines = entry.lines.filter(
        (l) => l.start_ms >= from && l.start_ms < to,
      );
      return new Response(JSON.stringify({ from_ms: from, to_ms: to, lines }), {
        status: 200,
      });
    },
  );
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
      <TooltipProvider>
        <Wrapper>
          <WatchScreen videoId={videoId} startMs={startMs} />
        </Wrapper>
      </TooltipProvider>
    </VideoPlayerFactoryContext.Provider>,
  );
  return fake;
}

const transcript = async () =>
  within(await screen.findByRole("complementary", { name: "Transcript" }));
const firstLine = async (text: string) =>
  (await (await transcript()).findAllByText(text))[0]!;

beforeEach(() => {
  api.preferences = {
    subtitle_visibility: { original: "show", translation: "show" },
  };
  api.failPreferences = false;
  api.translating.clear();
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
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

  it("plays and pauses when the video is clicked", async () => {
    const fake = renderWatch(MOCK_VIDEO_IDS.normal);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Play (Space)" }),
      ).toBeEnabled(),
    );
    const host = screen
      .getByRole("region", { name: "Video" })
      .querySelector("[class*=pointer-events-none]")!;
    await userEvent.setup().click(host);
    expect(fake.player.play).toHaveBeenCalled();
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

  it("offers to translate a video without a translation and shows it's on the way", async () => {
    const fetchMock = stubApi();
    renderWatch(MOCK_VIDEO_IDS.noTranslation);
    await userEvent.click(await screen.findByRole("button", { name: "Translate into English" }));

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/videos/${MOCK_VIDEO_IDS.noTranslation}/translation`,
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText("Translating…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Translate into/ })).toBeNull();

    act(() =>
      FakeEventSource.latest().emit(PROCESSING_EVENT_NAME, {
        type: "step",
        track_id: "0190f3c2-7d1a-7c00-8b00-000000000009",
        video_id: MOCK_VIDEO_IDS.noTranslation,
        title: "x",
        step: "translate",
        step_index: 3,
        step_count: 5,
        progress: { done: 120, total: 812 },
      }),
    );
    expect(await screen.findByText("Translating 15%")).toBeInTheDocument();
    expect(screen.getAllByText("120 of 812 lines").length).toBeGreaterThan(0);
  });

  it("says why a translation failed and offers to try again", async () => {
    const entry = mockVideos[MOCK_VIDEO_IDS.noTranslation]!;
    const original = entry.video.translation;
    entry.video.translation = { language: "en", status: "failed", error_code: "provider_unavailable", progress: { done: 3, total: 9 } };
    try {
      renderWatch(MOCK_VIDEO_IDS.noTranslation);
      expect(await screen.findByText(/Translation failed\. The translation service \(Gemini\) didn't answer/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Translate again" })).toBeInTheDocument();

      entry.video.translation = { language: "en", status: "failed", error_code: "spend_cap", progress: null };
      cleanup();
      renderWatch(MOCK_VIDEO_IDS.noTranslation);
      expect(await screen.findByText(/AI budget is used up/)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Translate again" })).toBeNull();
    } finally {
      entry.video.translation = original;
    }
  });

  it("offers no translate button for a translated or unfinished video", async () => {
    renderWatch(MOCK_VIDEO_IDS.normal);
    await firstLine("Guten Morgen aus Hamburg!");
    expect(screen.queryByRole("button", { name: /Translat/ })).toBeNull();
  });

  it("reloads the video and its lines when its processing finishes", async () => {
    const fetchMock = stubApi();
    renderWatch(MOCK_VIDEO_IDS.noTranslation);
    await firstLine("Guten Morgen aus Hamburg!");
    const videoCalls = () =>
      fetchMock.mock.calls.filter(([url]) => String(url) === `/api/videos/${MOCK_VIDEO_IDS.noTranslation}`).length;
    const before = videoCalls();
    const ids = { track_id: "0190f3c2-7d1a-7c00-8b00-000000000009", title: "x" };

    act(() =>
      FakeEventSource.latest().emit(PROCESSING_EVENT_NAME, { type: "ready", video_id: "0190f3c2-7d1a-7c00-8b00-00000000ffff", ...ids }),
    );
    act(() =>
      FakeEventSource.latest().emit(PROCESSING_EVENT_NAME, { type: "step", video_id: MOCK_VIDEO_IDS.noTranslation, step: "translate", step_index: 3, step_count: 5, ...ids }),
    );
    expect(videoCalls()).toBe(before);

    act(() =>
      FakeEventSource.latest().emit(PROCESSING_EVENT_NAME, { type: "ready", video_id: MOCK_VIDEO_IDS.noTranslation, ...ids }),
    );
    await waitFor(() => expect(videoCalls()).toBe(before + 1));
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

  describe("line navigation", () => {
    const lines = mockVideos[MOCK_VIDEO_IDS.normal]!.lines;

    async function ready(startMs = 0) {
      const fake = renderWatch(MOCK_VIDEO_IDS.normal, fakePlayer(), startMs);
      await firstLine(lines[0]!.text);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Next line (D)" }),
        ).toBeEnabled(),
      );
      return fake;
    }

    it("jumps with the buttons and starts playback", async () => {
      const fake = await ready(lines[3]!.start_ms + 200);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Next line (D)" }));
      expect(fake.player.seekTo).toHaveBeenLastCalledWith(
        lines[4]!.start_ms / 1000,
      );
      expect(fake.player.play).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "Repeat line (S)" }));
      expect(fake.player.seekTo).toHaveBeenLastCalledWith(
        lines[4]!.start_ms / 1000,
      );

      await user.click(
        screen.getByRole("button", { name: "Previous line (A)" }),
      );
      expect(fake.player.seekTo).toHaveBeenLastCalledWith(
        lines[3]!.start_ms / 1000,
      );
      expect(fake.player.play).toHaveBeenCalledTimes(1);
    });

    it("jumps with A, S and D but not while typing or with a modifier", async () => {
      const fake = await ready(lines[3]!.start_ms + 200);

      fireEvent.keyDown(document.body, { code: "KeyD", key: "d" });
      expect(fake.player.seekTo).toHaveBeenLastCalledWith(
        lines[4]!.start_ms / 1000,
      );
      fireEvent.keyDown(document.body, { code: "KeyA", key: "a" });
      expect(fake.player.seekTo).toHaveBeenLastCalledWith(
        lines[3]!.start_ms / 1000,
      );
      fireEvent.keyDown(document.body, { code: "KeyS", key: "s" });
      expect(fake.player.seekTo).toHaveBeenLastCalledWith(
        lines[3]!.start_ms / 1000,
      );
      const calls = vi.mocked(fake.player.seekTo).mock.calls.length;

      fireEvent.keyDown(document.body, {
        code: "KeyS",
        key: "s",
        ctrlKey: true,
      });
      fireEvent.keyDown(document.body, {
        code: "KeyD",
        key: "d",
        repeat: true,
      });
      const panel = await transcript();
      await userEvent
        .setup()
        .click(panel.getByRole("button", { name: "Filter lines" }));
      fireEvent.keyDown(
        panel.getByRole("searchbox", { name: "Filter lines" }),
        { code: "KeyD", key: "d" },
      );
      expect(fake.player.seekTo).toHaveBeenCalledTimes(calls);
    });

    it("still jumps with the volume slider focused", async () => {
      const fake = await ready(lines[3]!.start_ms + 200);
      const volume = screen.getByRole("slider", { name: "Volume" });
      volume.focus();
      fireEvent.keyDown(volume, { code: "KeyD", key: "d" });
      expect(fake.player.seekTo).toHaveBeenLastCalledWith(
        lines[4]!.start_ms / 1000,
      );
    });

    it("disables previous and repeat before the first line", async () => {
      await ready(0);
      expect(
        screen.getByRole("button", { name: "Previous line (A)" }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Repeat line (S)" }),
      ).toBeDisabled();
    });

    it("disables next on the last line", async () => {
      renderWatch(
        MOCK_VIDEO_IDS.normal,
        fakePlayer(),
        lines.at(-1)!.start_ms + 100,
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Repeat line (S)" }),
        ).toBeEnabled(),
      );
      expect(
        screen.getByRole("button", { name: "Next line (D)" }),
      ).toBeDisabled();
    });

    it("stays disabled while the transcript is being prepared", async () => {
      const fake = renderWatch(MOCK_VIDEO_IDS.preparing);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Play (Space)" }),
        ).toBeEnabled(),
      );
      expect(
        screen.getByRole("button", { name: "Next line (D)" }),
      ).toBeDisabled();
      fireEvent.keyDown(document.body, { code: "KeyD", key: "d" });
      expect(fake.player.seekTo).not.toHaveBeenCalled();
    });

    it("brings the transcript back to the current line after a manual scroll", async () => {
      await ready(lines[3]!.start_ms + 200);
      const panel = await transcript();
      fireEvent.wheel(
        (await firstLine(lines[0]!.text)).closest("[class*=overflow-y-auto]")!,
      );
      expect(
        await panel.findByRole("button", { name: "Back to current line" }),
      ).toBeInTheDocument();

      fireEvent.keyDown(document.body, { code: "KeyD", key: "d" });
      await waitFor(() =>
        expect(
          panel.queryByRole("button", { name: "Back to current line" }),
        ).toBeNull(),
      );
    });
  });

  describe("subtitle visibility", () => {
    const first = mockVideos[MOCK_VIDEO_IDS.normal]!.lines[0]!;
    const video = () => screen.getByRole("region", { name: "Video" });

    async function openMenu() {
      renderWatch(MOCK_VIDEO_IDS.normal, fakePlayer(), first.start_ms + 100);
      await firstLine(first.text);
      const trigger = screen.getByRole("button", {
        name: "Subtitles: show, blur or hide each track",
      });
      await waitFor(() => expect(trigger).toBeEnabled());
      const user = userEvent.setup();
      await user.click(trigger);
      return {
        user,
        menu: within(
          await screen.findByRole("dialog", { name: "Subtitle visibility" }),
        ),
      };
    }

    it("hides a track on the video and in the transcript and saves it", async () => {
      const { user, menu } = await openMenu();
      expect(
        menu.getByRole("radiogroup", { name: "German" }),
      ).toBeInTheDocument();
      expect(
        menu.getByRole("radiogroup", { name: "English" }),
      ).toBeInTheDocument();

      await user.click(
        within(menu.getByRole("radiogroup", { name: "German" })).getByRole(
          "radio",
          { name: "Hide" },
        ),
      );

      expect(within(video()).queryByText(first.text)).toBeNull();
      expect(within(video()).getByText(first.translation!)).toBeInTheDocument();
      expect((await transcript()).queryByText(first.text)).toBeNull();
      await waitFor(() =>
        expect(api.preferences.subtitle_visibility).toEqual({
          original: "hide",
          translation: "show",
        }),
      );
    });

    it("blurs a track until hover", async () => {
      const { user, menu } = await openMenu();
      await user.click(
        within(menu.getByRole("radiogroup", { name: "English" })).getByRole(
          "radio",
          { name: "Blur" },
        ),
      );

      const onVideo = within(video()).getByText(first.translation!);
      expect(onVideo).toHaveAttribute("data-blurred");
      expect(onVideo.className).toContain("blur-[6px]");
      expect(onVideo.parentElement).toHaveAttribute("tabindex", "0");
      expect((await firstLine(first.translation!)).className).toContain(
        "blur-[5px]",
      );
    });

    it("shows a placeholder in the transcript when both tracks are hidden", async () => {
      api.preferences = {
        subtitle_visibility: { original: "hide", translation: "hide" },
      };
      renderWatch(MOCK_VIDEO_IDS.normal, fakePlayer(), first.start_ms + 100);
      const panel = await transcript();
      expect((await panel.findAllByText("Hidden")).length).toBeGreaterThan(0);
      expect(within(video()).queryByText(first.text)).toBeNull();
      expect(within(video()).queryByText(first.translation!)).toBeNull();
    });

    it("rolls back when saving fails", async () => {
      api.failPreferences = true;
      const { user, menu } = await openMenu();
      await user.click(
        within(menu.getByRole("radiogroup", { name: "German" })).getByRole(
          "radio",
          { name: "Hide" },
        ),
      );

      await waitFor(() =>
        expect(
          within(menu.getByRole("radiogroup", { name: "German" })).getByRole(
            "radio",
            { name: "Show" },
          ),
        ).toBeChecked(),
      );
      expect(
        await screen.findByText("Couldn't save the subtitle setting"),
      ).toBeInTheDocument();
      expect(within(video()).getByText(first.text)).toBeInTheDocument();
    });

    it("offers only the original track without a translation", async () => {
      renderWatch(MOCK_VIDEO_IDS.noTranslation);
      const trigger = await screen.findByRole("button", {
        name: "Subtitles: show, blur or hide each track",
      });
      await waitFor(() => expect(trigger).toBeEnabled());
      await userEvent.setup().click(trigger);
      const menu = within(
        await screen.findByRole("dialog", { name: "Subtitle visibility" }),
      );
      expect(
        menu.getByRole("radiogroup", { name: "German" }),
      ).toBeInTheDocument();
      expect(menu.queryByRole("radiogroup", { name: "English" })).toBeNull();
    });
  });
});
