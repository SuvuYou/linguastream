import { SignInCodes } from "./sign-in-codes";

const user = { id: "user-1", firebaseUid: "firebase-uid-1" };

describe("SignInCodes", () => {
  let codes: SignInCodes;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-26T12:00:00Z"));
    codes = new SignInCodes();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("issues a long random code that expires in 2 minutes", () => {
    const { code, expiresAt } = codes.issue(user);
    expect(code).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(expiresAt.toISOString()).toBe("2026-11-26T12:02:00.000Z");
    expect(codes.issue({ id: "user-2", firebaseUid: "firebase-uid-2" }).code).not.toBe(code);
  });

  it("redeems a code once, for the user it was issued to", () => {
    const { code } = codes.issue(user);
    expect(codes.redeem(code)).toBe("firebase-uid-1");
    expect(codes.redeem(code)).toBeNull();
  });

  it("refuses an unknown code", () => {
    expect(codes.redeem("made-up")).toBeNull();
  });

  it("refuses a code after 2 minutes", () => {
    const { code } = codes.issue(user);
    vi.advanceTimersByTime(SignInCodes.TTL_MS);
    expect(codes.redeem(code)).toBeNull();
  });

  it("keeps one live code per user", () => {
    const first = codes.issue(user).code;
    const second = codes.issue(user).code;
    expect(codes.redeem(first)).toBeNull();
    expect(codes.redeem(second)).toBe("firebase-uid-1");
  });

  it("keeps a new code valid after the old one expired", () => {
    codes.issue(user);
    vi.advanceTimersByTime(SignInCodes.TTL_MS - 1000);
    const { code } = codes.issue(user);
    vi.advanceTimersByTime(2000);
    expect(codes.redeem(code)).toBe("firebase-uid-1");
  });
});
