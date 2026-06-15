import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/jwt";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.JWT_SECRET = "unit-test-access-secret";
  process.env.JWT_REFRESH_SECRET = "unit-test-refresh-secret";
  process.env.JWT_ACCESS_EXPIRES_IN = "1h";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

const PAYLOAD = { sub: "user-1", email: "user@example.com" };

describe("signAccessToken / verifyAccessToken", () => {
  it("round-trips the payload", () => {
    const token = signAccessToken(PAYLOAD);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(PAYLOAD.sub);
    expect(decoded.email).toBe(PAYLOAD.email);
  });

  it("rejects a refresh token when verified as access", () => {
    const refresh = signRefreshToken(PAYLOAD);
    expect(() => verifyAccessToken(refresh)).toThrow();
  });
});

describe("signRefreshToken / verifyRefreshToken", () => {
  it("round-trips the payload", () => {
    const token = signRefreshToken(PAYLOAD);
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe(PAYLOAD.sub);
    expect(decoded.email).toBe(PAYLOAD.email);
  });

  it("rejects an access token when verified as refresh", () => {
    const access = signAccessToken(PAYLOAD);
    expect(() => verifyRefreshToken(access)).toThrow();
  });
});

describe("JWT_REFRESH_SECRET fallback", () => {
  it("falls back to JWT_SECRET when JWT_REFRESH_SECRET is unset", () => {
    delete process.env.JWT_REFRESH_SECRET;
    const token = signRefreshToken(PAYLOAD);
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe(PAYLOAD.sub);
  });

  it("throws when JWT_SECRET is unset", () => {
    delete process.env.JWT_SECRET;
    expect(() => signAccessToken(PAYLOAD)).toThrow(/JWT_SECRET is not set/);
  });
});
