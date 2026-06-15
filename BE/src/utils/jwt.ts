import jwt, { type SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  email: string;
  role?: "user" | "admin" | "boss";
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

function accessSecret(): string {
  return requireEnv("JWT_SECRET");
}

function refreshSecret(): string {
  // Fall back to JWT_SECRET so existing dev setups keep working, but
  // production should set JWT_REFRESH_SECRET to a distinct value.
  return process.env.JWT_REFRESH_SECRET || requireEnv("JWT_SECRET");
}

function accessExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_ACCESS_EXPIRES_IN ||
    process.env.JWT_EXPIRES_IN ||
    "15m") as SignOptions["expiresIn"];
}

function refreshExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_REFRESH_EXPIRES_IN ||
    "7d") as SignOptions["expiresIn"];
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, accessSecret(), { expiresIn: accessExpiresIn() });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret()) as JwtPayload;
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, refreshSecret(), { expiresIn: refreshExpiresIn() });
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret()) as JwtPayload;
}

// Backward-compatible aliases. New code should prefer the explicit
// access/refresh helpers above.
export const signToken = signAccessToken;
export const verifyToken = verifyAccessToken;
