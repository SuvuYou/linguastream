import {
  PROCESSING_EVENT_NAME,
  type ProcessingEvent,
} from "@linguastream/contracts";
import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FakeEventSource } from "@/helpers/tests/fake-event-source";
import { READY_HIDE_MS } from "@/hooks/useProcessingToasts";
import ProcessingToasts from "./ProcessingToasts";

const track = (n: number) => ({
  track_id: `0190f3c2-7d1a-7c00-8b00-00000000000${n}`,
  video_id: `0190f3c2-7d1a-7c00-8a00-00000000000${n}`,
  title: `Video ${n}`,
});

function emit(event: ProcessingEvent | unknown) {
  act(() => FakeEventSource.latest().emit(PROCESSING_EVENT_NAME, event));
}

const step = (
  n: number,
  s: "parse" | "analyse" | "translate",
  index: number,
): ProcessingEvent => ({
  type: "step",
  ...track(n),
  step: s,
  step_index: index,
  step_count: 5,
});

const region = () =>
  within(screen.getByRole("region", { name: "Video processing" }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ProcessingToasts", () => {
  it("listens to the user's processing events and stops when it unmounts", () => {
    const view = render(<ProcessingToasts />);
    const source = FakeEventSource.latest();
    expect(source.url).toBe("/api/processing/events");
    expect(source.init).toEqual({ withCredentials: true });
    expect(screen.queryByRole("region")).toBeNull();

    view.unmount();
    expect(source.closed).toBe(true);
  });

  it("shows a queued video, then its progress through the stages", () => {
    render(<ProcessingToasts />);
    emit({ type: "queued", ...track(1) });
    expect(region().getByRole("status")).toHaveTextContent(
      "Waiting to prepare “Video 1”",
    );

    emit(step(1, "analyse", 2));
    const toast = region().getByRole("status");
    expect(toast).toHaveTextContent("Preparing “Video 1”");
    expect(within(toast).getByText("Words")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(within(toast).getByText("Sentences")).toHaveTextContent(
      "Sentences ✓",
    );
  });

  it("offers the video when it's ready and hides the toast after a while", () => {
    vi.useFakeTimers();
    render(<ProcessingToasts />);
    emit(step(1, "parse", 0));
    emit({ type: "ready", ...track(1) });

    expect(region().getByRole("link", { name: "Open video" })).toHaveAttribute(
      "href",
      `/watch/${track(1).video_id}`,
    );
    act(() => vi.advanceTimersByTime(READY_HIDE_MS - 1));
    expect(
      screen.getByRole("link", { name: "Open video" }),
    ).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("keeps a failed video until closed and retries it", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ track_id: track(1).track_id, status: "pending" }),
          { status: 202 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ProcessingToasts />);
    emit({ type: "failed", ...track(1), error_code: "internal" });

    const alert = region().getByRole("alert");
    expect(alert).toHaveTextContent("Couldn't prepare “Video 1”");
    expect(alert).toHaveTextContent("Something went wrong on our side");

    await userEvent
      .setup()
      .click(within(alert).getByRole("button", { name: "Retry" }));
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/tracks/${track(1).track_id}/retry`,
      expect.objectContaining({ method: "POST" }),
    );
    expect(await region().findByRole("status")).toHaveTextContent(
      "Waiting to prepare “Video 1”",
    );
  });

  it("says so when the retry itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "boom" }), { status: 500 }),
      ),
    );
    render(<ProcessingToasts />);
    emit({ type: "failed", ...track(1), error_code: "internal" });

    await userEvent
      .setup()
      .click(region().getByRole("button", { name: "Retry" }));
    expect(
      await region().findByText(/The retry didn't go through/),
    ).toBeInTheDocument();
    expect(region().getByRole("button", { name: "Retry" })).toBeEnabled();
  });

  it("offers no retry when retrying can't help", () => {
    render(<ProcessingToasts />);
    emit({ type: "failed", ...track(1), error_code: "invalid_track" });
    expect(region().getByRole("alert")).toHaveTextContent(
      "The captions couldn't be read",
    );
    expect(region().queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("closes a toast with its close button", async () => {
    render(<ProcessingToasts />);
    emit(step(1, "parse", 0));
    await userEvent
      .setup()
      .click(region().getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("stacks one toast per video, at most three, with a count of the rest", () => {
    render(<ProcessingToasts />);
    for (const n of [1, 2, 3, 4]) emit(step(n, "parse", 0));
    emit(step(2, "translate", 3));

    expect(region().getAllByRole("status")).toHaveLength(3);
    expect(region().getByText("+1 more")).toBeInTheDocument();
    expect(region().queryByText(/Video 1/)).toBeNull();
    expect(
      region()
        .getByText(/Video 2/)
        .closest("[role=status]"),
    ).toHaveTextContent("Translating");
  });

  it("ignores events that don't match the contract", () => {
    render(<ProcessingToasts />);
    emit({
      type: "step",
      ...track(1),
      step: "dance",
      step_index: 0,
      step_count: 5,
    });
    emit("not json");
    expect(screen.queryByRole("region")).toBeNull();
  });
});
