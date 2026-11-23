import { createContext } from "react";
import type { DecodedToken } from "../interfaces/auth.interface";

export interface AuthContextValue {
  user: DecodedToken | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => DecodedToken | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
