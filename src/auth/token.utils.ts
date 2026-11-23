import type { DecodedToken } from "../interfaces/auth.interface";

export function decodeToken(token: string): DecodedToken {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    Array.from(atob(base64), (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""),
  );
  return JSON.parse(json) as DecodedToken;
}

/** exp is in seconds; compare against a ms timestamp. */
export function isTokenExpired(decoded: DecodedToken): boolean {
  return decoded.exp * 1000 < Date.now();
}

/** Returns the decoded token if it is well-formed and not expired, otherwise null. */
export function readValidToken(token: string | null): DecodedToken | null {
  if (!token) return null;
  try {
    const decoded = decodeToken(token);
    return isTokenExpired(decoded) ? null : decoded;
  } catch {
    return null;
  }
}
