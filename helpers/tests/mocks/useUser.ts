import { vi } from "vitest";
import { useUser } from "@/hooks/useUser";
import type { User } from "@prisma/client";
import type { UseQueryResult } from "@tanstack/react-query";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

const createBaseUser = () => ({
  id: "",
  firebase_uid: "",
  email: "",
  display_name: "",
  native_language: "",
  is_admin: false,
  created_at: new Date(),
});

const createBaseUserResponse = () =>
  ({
    isLoading: false,
    isError: false,
    data: createBaseUser(),
  }) as UseQueryResult<User>;

const createLoadingUserResponse = () =>
  ({
    ...createBaseUserResponse(),
    isLoading: true,
  }) as UseQueryResult<User>;

const createErrorUserResponse = () =>
  ({
    ...createBaseUserResponse(),
    isLoading: false,
    isError: true,
  }) as UseQueryResult<User>;

const createAdminUserResponse = () => {
  const response = {
    data: createBaseUser(),
    isLoading: false,
    isError: false,
  };

  response.data.is_admin = true;

  return response as UseQueryResult<User>;
};

const mockedUseUser = vi.mocked(useUser);

export const mockUseUser = {
  loading: () => mockedUseUser.mockReturnValue(createLoadingUserResponse()),
  error: () => mockedUseUser.mockReturnValue(createErrorUserResponse()),
  base: () => mockedUseUser.mockReturnValue(createBaseUserResponse()),
  admin: () => mockedUseUser.mockReturnValue(createAdminUserResponse()),

  custom: (overrides: Partial<UseQueryResult<User>>) =>
    mockedUseUser.mockReturnValue({
      ...createBaseUserResponse(),
      ...overrides,
    } as UseQueryResult<User>),
};
