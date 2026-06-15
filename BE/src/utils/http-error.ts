export type HttpError = Error & { status: number; code?: string };

export function httpError(
  message: string,
  status: number,
  code?: string,
): HttpError {
  return Object.assign(new Error(message), { status, code });
}
