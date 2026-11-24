import { vi } from "vitest";
import { useUser } from "@/hooks/useUser";
import type { CurrentUser } from "@linguastream/contracts";
import type { UseQueryResult } from "@tanstack/react-query";

const createBaseUser = (): CurrentUser => ({
  id: "",
  email: "",
  display_name: "",
  native_language: "",
  is_admin: false,
});

const createBaseUserResponse = () =>
  ({
    isLoading: false,
    isError: false,
    data: createBaseUser(),
  }) as UseQueryResult<CurrentUser>;

const createLoadingUserResponse = () =>
  ({
    ...createBaseUserResponse(),
    isLoading: true,
  }) as UseQueryResult<CurrentUser>;

const createErrorUserResponse = () =>
  ({
    ...createBaseUserResponse(),
    isLoading: false,
    isError: true,
  }) as UseQueryResult<CurrentUser>;

const createAdminUserResponse = () => {
  const response = {
    data: createBaseUser(),
    isLoading: false,
    isError: false,
  };

  response.data.is_admin = true;

  return response as UseQueryResult<CurrentUser>;
};

const mockedUseUser = vi.mocked(useUser);

export const mockUseUser = {
  loading: () => mockedUseUser.mockReturnValue(createLoadingUserResponse()),
  error: () => mockedUseUser.mockReturnValue(createErrorUserResponse()),
  base: () => mockedUseUser.mockReturnValue(createBaseUserResponse()),
  admin: () => mockedUseUser.mockReturnValue(createAdminUserResponse()),
};
