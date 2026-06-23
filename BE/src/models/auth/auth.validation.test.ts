import { describe, expect, it } from "vitest";

import {
  forgotPasswordBodySchema,
  googleAuthBodySchema,
  loginBodySchema,
  registerBodySchema,
  resendVerificationBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from "@/models/auth/auth.validation";

describe("registerBodySchema", () => {
  it("accepts a valid payload and normalizes the email", () => {
    const parsed = registerBodySchema.parse({
      email: "  User@Example.com  ",
      password: "supersecret",
      name: "  Chris  ",
      phone: "  0912345678  ",
    });
    expect(parsed.email).toBe("user@example.com");
    expect(parsed.password).toBe("supersecret");
    expect(parsed.name).toBe("Chris");
    expect(parsed.phone).toBe("0912345678");
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(() =>
      registerBodySchema.parse({
        email: "user@example.com",
        password: "short",
        phone: "0912345678",
      }),
    ).toThrow(/at least 8/i);
  });

  it("rejects invalid emails", () => {
    expect(() =>
      registerBodySchema.parse({
        email: "not-an-email",
        password: "supersecret",
        phone: "0912345678",
      }),
    ).toThrow();
  });

  it("defaults missing name to an empty string", () => {
    const parsed = registerBodySchema.parse({
      email: "user@example.com",
      password: "supersecret",
      phone: "0912345678",
    });
    expect(parsed.name).toBe("");
  });

  it("rejects missing phone numbers", () => {
    expect(() =>
      registerBodySchema.parse({
        email: "user@example.com",
        password: "supersecret",
      }),
    ).toThrow();
  });

  it("rejects empty phone numbers", () => {
    expect(() =>
      registerBodySchema.parse({
        email: "user@example.com",
        password: "supersecret",
        phone: "   ",
      }),
    ).toThrow(/required/i);
  });

  it("rejects phone numbers longer than 32 characters", () => {
    expect(() =>
      registerBodySchema.parse({
        email: "user@example.com",
        password: "supersecret",
        phone: "1".repeat(33),
      }),
    ).toThrow(/too long/i);
  });
});

describe("loginBodySchema", () => {
  it("normalizes the email", () => {
    const parsed = loginBodySchema.parse({
      email: "  USER@EXAMPLE.COM  ",
      password: "anything",
    });
    expect(parsed.email).toBe("user@example.com");
  });

  it("rejects empty passwords", () => {
    expect(() =>
      loginBodySchema.parse({ email: "user@example.com", password: "" }),
    ).toThrow();
  });
});

describe("forgotPasswordBodySchema", () => {
  it("normalizes the email", () => {
    const parsed = forgotPasswordBodySchema.parse({
      email: "  USER@Example.com  ",
    });
    expect(parsed.email).toBe("user@example.com");
  });

  it("rejects invalid emails", () => {
    expect(() =>
      forgotPasswordBodySchema.parse({ email: "not-an-email" }),
    ).toThrow();
  });
});

describe("resetPasswordBodySchema", () => {
  it("accepts a reset token and valid password", () => {
    const parsed = resetPasswordBodySchema.parse({
      token: "abc123",
      password: "supersecret",
    });
    expect(parsed.token).toBe("abc123");
  });

  it("rejects short passwords", () => {
    expect(() =>
      resetPasswordBodySchema.parse({
        token: "abc123",
        password: "short",
      }),
    ).toThrow(/at least 8/i);
  });
});

describe("googleAuthBodySchema", () => {
  it("accepts a Google credential", () => {
    const parsed = googleAuthBodySchema.parse({ credential: "token" });
    expect(parsed.credential).toBe("token");
  });

  it("rejects an empty credential", () => {
    expect(() => googleAuthBodySchema.parse({ credential: "" })).toThrow();
  });
});

describe("verifyEmailBodySchema", () => {
  it("accepts a verification token", () => {
    const parsed = verifyEmailBodySchema.parse({ token: "abc123" });
    expect(parsed.token).toBe("abc123");
  });
});

describe("resendVerificationBodySchema", () => {
  it("normalizes the email", () => {
    const parsed = resendVerificationBodySchema.parse({
      email: "  USER@Example.com  ",
    });
    expect(parsed.email).toBe("user@example.com");
  });
});
