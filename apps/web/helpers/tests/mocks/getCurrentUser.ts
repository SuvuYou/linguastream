import { vi } from "vitest";
import type { User } from "@linguastream/db";

import { getCurrentUser } from "@/lib/firebase/session";

const createBaseUser = () => ({
  id: "id",
  firebaseUid: "fuid",
  email: "email@gmail.com",
  displayName: "Name",
  nativeLanguage: "en",
  learningLanguage: "de",
  isAdmin: false,
  createdAt: new Date(),
});

const createBaseUserResponse = () =>
  ({
    ...createBaseUser(),
  }) as User;

const createAdminUserResponse = () =>
  ({
    ...createBaseUser(),
    isAdmin: true,
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
