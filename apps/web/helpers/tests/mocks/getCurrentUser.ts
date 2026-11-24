import { vi } from "vitest";
import type { User } from "@prisma/client";

import { getCurrentUser } from "@/lib/firebase/session";

const createBaseUser = () => ({
  id: "id",
  firebase_uid: "fuid",
  email: "email@gmail.com",
  display_name: "Name",
  native_language: "en",
  is_admin: false,
  created_at: new Date(),
});

const createBaseUserResponse = () =>
  ({
    ...createBaseUser(),
  }) as User;

const createAdminUserResponse = () =>
  ({
    ...createBaseUser(),
    is_admin: true,
  }) as User;

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

export const mockGetCurrentUser = {
  empty: () => mockedGetCurrentUser.mockResolvedValue(null),
  base: () => mockedGetCurrentUser.mockResolvedValue(createBaseUserResponse()),
  admin: () =>
    mockedGetCurrentUser.mockResolvedValue(createAdminUserResponse()),
  override: (overrides: Partial<User>) =>
    mockedGetCurrentUser.mockResolvedValue({
      ...createBaseUserResponse(),
      ...overrides,
    }),
};
