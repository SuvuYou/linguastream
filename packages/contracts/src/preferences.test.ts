import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  UserPreferences,
  updatePreferencesRoute,
} from "./preferences.js";

describe("preferences contracts", () => {
  it("defaults to both tracks shown", () => {
    expect(UserPreferences.parse(DEFAULT_PREFERENCES)).toEqual({
      subtitle_visibility: { original: "show", translation: "show" },
    });
  });

  it("accepts a change to one track", () => {
    const body = updatePreferencesRoute.body!;
    expect(
      body.safeParse({ subtitle_visibility: { translation: "blur" } }).success,
    ).toBe(true);
    expect(
      body.safeParse({
        subtitle_visibility: { original: "hide", translation: "show" },
      }).success,
    ).toBe(true);
  });

  it("rejects empty changes, unknown values and unknown keys", () => {
    const body = updatePreferencesRoute.body!;
    expect(body.safeParse({ subtitle_visibility: {} }).success).toBe(false);
    expect(
      body.safeParse({ subtitle_visibility: { original: "dim" } }).success,
    ).toBe(false);
    expect(
      body.safeParse({ subtitle_visibility: { original: "show", size: 2 } })
        .success,
    ).toBe(false);
    expect(body.safeParse({ theme: "dark" }).success).toBe(false);
  });
});
