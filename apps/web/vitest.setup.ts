import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";
import { FakeEventSource } from "./helpers/tests/fake-event-source";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

(globalThis as { EventSource?: unknown }).EventSource = FakeEventSource;

beforeEach(() => {
  FakeEventSource.instances = [];
});
