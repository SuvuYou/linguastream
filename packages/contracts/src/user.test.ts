import { describe, expect, it } from "vitest";
import { CurrentUser, getCurrentUserRoute } from "./user.js";

const valid = {
  id: "u1",
  email: "learner@example.com",
  display_name: null,
  native_language: "uk",
  learning_language: "de",
  is_admin: false,
};

describe("CurrentUser", () => {
  it("accepts the shape /api/user returns", () => {
    expect(CurrentUser.parse(valid)).toEqual(valid);
  });

  it("drops database-only fields", () => {
    const parsed = CurrentUser.parse({ ...valid, firebase_uid: "fb-1", created_at: "2026-01-01" });
    expect(parsed).not.toHaveProperty("firebase_uid");
  });

  it("rejects a missing field", () => {
    const { is_admin: _isAdmin, ...withoutAdmin } = valid;
    expect(CurrentUser.safeParse(withoutAdmin).success).toBe(false);
  });
});

describe("getCurrentUserRoute", () => {
  it("is GET /api/user", () => {
    expect(getCurrentUserRoute.method).toBe("GET");
    expect(getCurrentUserRoute.path).toBe("/api/user");
  });
});
