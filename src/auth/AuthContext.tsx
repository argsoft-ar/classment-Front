import React, { createContext, useState, useCallback } from "react";
import type { DecodedToken } from "../interfaces/auth.interface";

// Single source of truth - imported by useApi to avoid key mismatch
export const TOKEN_KEY = "classment_token";

function decodeToken(token: string): DecodedToken {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64)) as DecodedToken;
  return payload;
}

// exp is in seconds; compare against ms timestamp
function isTokenExpired(decoded: DecodedToken): boolean {
  return decoded.exp * 1000 < Date.now();
}

interface AuthContextValue {
  user: DecodedToken | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialToken(): string | null {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored === null) return null;
  try {
    const decoded = decodeToken(stored);
    if (isTokenExpired(decoded)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return stored;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

function getInitialUser(): DecodedToken | null {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored === null) return null;
  try {
    const decoded = decodeToken(stored);
    return isTokenExpired(decoded) ? null : decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [user, setUser] = useState<DecodedToken | null>(getInitialUser);

  const login = useCallback((newToken: string) => {
    try {
      const decoded = decodeToken(newToken);
      if (isTokenExpired(decoded)) return; // reject already-expired token
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(decoded);
    } catch {
      // Malformed JWT - do not store
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
