import { describe, it, expect } from "vitest";
import {
  FETCH_LANGUAGES_API_PARAMS_SCHEMA,
  FETCH_LIBRARY_API_PARAMS_SCHEMA,
  parseSearchParams,
  PUBLIC_LIBRARY_PARAMS_SCHEMA,
  USE_LIBRARY_HOOK_PARAMS_SCHEMA,
} from "./params-schema";

describe("PUBLIC_LIBRARY_PARAMS_SCHEMA", () => {
  it("parses valid params", () => {
    const params = new URLSearchParams({
      q: "dark",
      src: "de",
      sub: "en",
      page: "2",
      unreg: "true",
    });

    const result = parseSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA, params);

    expect(result.q).toBe("dark");
    expect(result.src).toBe("de");
    expect(result.sub).toBe("en");
    expect(result.page).toBe(2);
    expect(result.unreg).toBe(true);
  });

  it("applies default params", () => {
    const params = new URLSearchParams();
    const result = parseSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA, params);

    expect(result.page).toBe(0);
    expect(result.unreg).toBe(false);
  });

  it("rejects invalid page value", () => {
    const params = new URLSearchParams({ page: "abc" });
    expect(() =>
      parseSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA, params),
    ).toThrow();
  });

  it("rejects invalid language code", () => {
    const params = new URLSearchParams({ src: "xx" });
    expect(() =>
      parseSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA, params),
    ).toThrow();
  });

  it("transforms unreg string to boolean", () => {
    const trueParams = new URLSearchParams({ unreg: "true" });
    const falseParams = new URLSearchParams({ unreg: "false" });

    expect(
      parseSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA, trueParams).unreg,
    ).toBe(true);
    expect(
      parseSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA, falseParams).unreg,
    ).toBe(false);
  });

  it("transforms page string to number", () => {
    const params = new URLSearchParams({ page: "3" });
    const result = parseSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA, params);
    expect(result.page).toBe(3);
    expect(typeof result.page).toBe("number");
  });
});

describe("USE_LIBRARY_HOOK_PARAMS_SCHEMA", () => {
  it("parses valid params", () => {
    const params = new URLSearchParams({
      q: "dark",
      page: "2",
      unreg: "true",
    });

    const result = parseSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA, params);

    expect(result.q).toBe("dark");
    expect(result.page).toBe(2);
    expect(result.unreg).toBe(true);
  });

  it("applies default params", () => {
    const params = new URLSearchParams();
    const result = parseSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA, params);

    expect(result.page).toBe(0);
    expect(result.unreg).toBe(false);
  });

  it("rejects invalid page value", () => {
    const params = new URLSearchParams({ page: "abc" });
    expect(() =>
      parseSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA, params),
    ).toThrow();
  });

  it("transforms unreg string to boolean", () => {
    const trueParams = new URLSearchParams({ unreg: "true" });
    const falseParams = new URLSearchParams({ unreg: "false" });

    expect(
      parseSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA, trueParams).unreg,
    ).toBe(true);
    expect(
      parseSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA, falseParams).unreg,
    ).toBe(false);
  });

  it("transforms page string to number", () => {
    const params = new URLSearchParams({ page: "3" });
    const result = parseSearchParams(USE_LIBRARY_HOOK_PARAMS_SCHEMA, params);
    expect(result.page).toBe(3);
    expect(typeof result.page).toBe("number");
  });

  describe("FETCH_LIBRARY_API_PARAMS_SCHEMA", () => {
    it("parses valid params", () => {
      const params = new URLSearchParams({
        q: "dark",
        selectedSrc: "de",
        selectedSub: "en",
        page: "2",
        unreg: "true",
      });

      const result = parseSearchParams(FETCH_LIBRARY_API_PARAMS_SCHEMA, params);

      expect(result.q).toBe("dark");
      expect(result.selectedSrc).toBe("de");
      expect(result.selectedSub).toBe("en");
      expect(result.page).toBe(2);
      expect(result.unreg).toBe(true);
    });

    it("applies default params", () => {
      const params = new URLSearchParams();
      const result = parseSearchParams(FETCH_LIBRARY_API_PARAMS_SCHEMA, params);

      expect(result.page).toBe(0);
      expect(result.unreg).toBe(false);
    });

    it("rejects invalid page value", () => {
      const params = new URLSearchParams({ page: "abc" });
      expect(() =>
        parseSearchParams(FETCH_LIBRARY_API_PARAMS_SCHEMA, params),
      ).toThrow();
    });

    it("rejects invalid language code", () => {
      const params = new URLSearchParams({ selectedSrc: "xx" });
      expect(() =>
        parseSearchParams(FETCH_LIBRARY_API_PARAMS_SCHEMA, params),
      ).toThrow();
    });

    it("transforms unreg string to boolean", () => {
      const trueParams = new URLSearchParams({ unreg: "true" });
      const falseParams = new URLSearchParams({ unreg: "false" });

      expect(
        parseSearchParams(FETCH_LIBRARY_API_PARAMS_SCHEMA, trueParams).unreg,
      ).toBe(true);
      expect(
        parseSearchParams(FETCH_LIBRARY_API_PARAMS_SCHEMA, falseParams).unreg,
      ).toBe(false);
    });

    it("transforms page string to number", () => {
      const params = new URLSearchParams({ page: "3" });
      const result = parseSearchParams(FETCH_LIBRARY_API_PARAMS_SCHEMA, params);
      expect(result.page).toBe(3);
      expect(typeof result.page).toBe("number");
    });
  });

  describe("FETCH_LANGUAGES_API_PARAMS_SCHEMA", () => {
    it("parses valid params", () => {
      const params = new URLSearchParams({
        src: "de",
        sub: "en",
      });

      const result = parseSearchParams(
        FETCH_LANGUAGES_API_PARAMS_SCHEMA,
        params,
      );

      expect(result.src).toBe("de");
      expect(result.sub).toBe("en");
    });

    it("rejects invalid language code", () => {
      const params = new URLSearchParams({ src: "xx" });

      expect(() =>
        parseSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA, params),
      ).toThrow();

      const params2 = new URLSearchParams({ sub: "xx" });

      expect(() =>
        parseSearchParams(FETCH_LANGUAGES_API_PARAMS_SCHEMA, params2),
      ).toThrow();
    });
  });
});
