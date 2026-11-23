import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./auth.context";
import { tokenStorage } from "./token.storage";
import { readValidToken } from "./token.utils";
import { setUnauthorizedHandler } from "../services/api.client";

function getInitialToken(): string | null {
  const stored = tokenStorage.get();
  if (readValidToken(stored)) return stored;
  tokenStorage.clear();
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const user = useMemo(() => readValidToken(token), [token]);

  const login = useCallback((newToken: string) => {
    const decoded = readValidToken(newToken);
    if (!decoded) return null; // malformed or already-expired token: do not store
    tokenStorage.set(newToken);
    setToken(newToken);
    return decoded;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: user !== null, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
