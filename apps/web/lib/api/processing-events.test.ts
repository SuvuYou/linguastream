import { describe, expect, it, vi } from "vitest";
import { PROCESSING_EVENT_NAME } from "@linguastream/contracts";
import { FakeEventSource } from "@/helpers/tests/fake-event-source";
import { openProcessingEvents } from "./processing-events";

const event = {
  type: "queued",
  track_id: "0190f3c2-7d1a-7c00-8a00-000000000002",
  video_id: "0190f3c2-7d1a-7c00-8a00-000000000001",
  title: "Ein Tag in Hamburg",
} as const;

describe("openProcessingEvents", () => {
  it("shares one connection between subscribers and closes it after the last one leaves", () => {
    const before = FakeEventSource.instances.length;
    const first = vi.fn();
    const second = vi.fn();
    const closeFirst = openProcessingEvents(first);
    const closeSecond = openProcessingEvents(second);
    expect(FakeEventSource.instances.length).toBe(before + 1);

    const source = FakeEventSource.latest();
    expect(source.url).toBe("/api/processing/events");
    expect(source.init).toEqual({ withCredentials: true });
    source.emit(PROCESSING_EVENT_NAME, event);
    expect(first).toHaveBeenCalledWith(event);
    expect(second).toHaveBeenCalledWith(event);

    closeFirst();
    expect(source.closed).toBe(false);
    source.emit(PROCESSING_EVENT_NAME, event);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);

    closeSecond();
    expect(source.closed).toBe(true);

    const closeThird = openProcessingEvents(vi.fn());
    expect(FakeEventSource.latest()).not.toBe(source);
    closeThird();
  });

  it("ignores messages that aren't valid events", () => {
    const onEvent = vi.fn();
    const close = openProcessingEvents(onEvent);
    const source = FakeEventSource.latest();
    source.emit(PROCESSING_EVENT_NAME, "not json");
    source.emit(PROCESSING_EVENT_NAME, { type: "nope" });
    expect(onEvent).not.toHaveBeenCalled();
    close();
  });
});
