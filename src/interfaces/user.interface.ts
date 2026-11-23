import type { RoleLevel } from "../types/rbac.types";

export type UserStatus = "INVITED" | "ACTIVE" | "INACTIVE";
export type CreatableRole = Exclude<RoleLevel, "SuperAdmin">;

export interface IUserCareer {
  studyPlanId: string;
  studyPlanCode: string;
  careerId: string;
  careerName: string;
  cohortYear: number;
}

export interface IUserPublic {
  id: string;
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  role: RoleLevel;
  status: UserStatus;
  careers: IUserCareer[];
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  role: CreatableRole;
  /** Without password the user stays INVITED. */
  password?: string;
  /** Required when role = Alumno. */
  careerId?: string;
  cohortYear?: number;
}

export type UpdateUserDto = Partial<
  Pick<IUserPublic, "email" | "dni" | "firstName" | "lastName" | "status">
> & { password?: string };

export interface UsersQuery {
  role?: RoleLevel;
  status?: UserStatus;
  careerId?: string;
}
