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
    });
    expect(parsed.email).toBe("user@example.com");
    expect(parsed.password).toBe("supersecret");
    expect(parsed.name).toBe("Chris");
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(() =>
      registerBodySchema.parse({
        email: "user@example.com",
        password: "short",
      }),
    ).toThrow(/at least 8/i);
  });

  it("rejects invalid emails", () => {
    expect(() =>
      registerBodySchema.parse({
        email: "not-an-email",
        password: "supersecret",
      }),
    ).toThrow();
  });

  it("defaults missing name to an empty string", () => {
    const parsed = registerBodySchema.parse({
      email: "user@example.com",
      password: "supersecret",
    });
    expect(parsed.name).toBe("");
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
