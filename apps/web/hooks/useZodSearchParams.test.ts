import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useZodSearchParams } from "./useZodSearchParams";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

const mockedUseSearchParams = vi.mocked(useSearchParams);
const mockedUseRouter = vi.mocked(useRouter);
const mockedUsePathname = vi.mocked(usePathname);

describe("useZodSearchParams hook", () => {
  it("parses search params", () => {
    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams("q=test&page=2") as ReadonlyURLSearchParams,
    );

    mockedUsePathname.mockReturnValue("/library");

    mockedUseRouter.mockReturnValue({
      replace: vi.fn(),
    } as unknown as AppRouterInstance);

    const { result } = renderHook(() =>
      useZodSearchParams(
        z.object({
          q: z.string().optional(),
          page: z.string().optional(),
        }),
      ),
    );

    expect(result.current.params).toEqual({
      q: "test",
      page: "2",
    });
  });

  it("updates search params with set()", () => {
    const replaceMock = vi.fn();

    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams("q=test") as ReadonlyURLSearchParams,
    );

    mockedUsePathname.mockReturnValue("/library");

    mockedUseRouter.mockReturnValue({
      replace: replaceMock,
    } as unknown as AppRouterInstance);

    const { result } = renderHook(() =>
      useZodSearchParams(
        z.object({
          q: z.string().optional(),
        }),
      ),
    );

    result.current.set({ q: "new" });

    expect(replaceMock).toHaveBeenCalledWith("/library?q=new");
  });

  it("removes search params with set() and undefined value", () => {
    const replaceMock = vi.fn();

    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams("q=test") as ReadonlyURLSearchParams,
    );

    mockedUsePathname.mockReturnValue("/library");

    mockedUseRouter.mockReturnValue({
      replace: replaceMock,
    } as unknown as AppRouterInstance);

    const { result } = renderHook(() =>
      useZodSearchParams(
        z.object({
          q: z.string().optional(),
        }),
      ),
    );

    result.current.set({ q: undefined });

    expect(replaceMock).toHaveBeenCalledWith("/library?");
  });

  it("removes search params", () => {
    const replaceMock = vi.fn();

    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams("q=test&page=2") as ReadonlyURLSearchParams,
    );

    mockedUsePathname.mockReturnValue("/library");

    mockedUseRouter.mockReturnValue({
      replace: replaceMock,
    } as unknown as AppRouterInstance);

    const { result } = renderHook(() =>
      useZodSearchParams(
        z.object({
          q: z.string().optional(),
          page: z.string().optional(),
        }),
      ),
    );

    result.current.remove("q");

    expect(replaceMock).toHaveBeenCalledWith("/library?page=2");
  });
});
