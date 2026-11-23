import type { RoleLevel } from "../types/rbac.types";
import type { IUserPublic } from "./user.interface";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: Pick<IUserPublic, "id" | "email" | "firstName" | "lastName" | "role">;
}

/** JWT payload signed by the backend: { userId, role, email } + registered claims. */
export interface DecodedToken {
  userId: string;
  role: RoleLevel | string;
  email: string;
  exp: number;
  iat: number;
}
