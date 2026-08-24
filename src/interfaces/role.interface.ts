import type { RoleLevel } from "../types/rbac.types";

export interface IRole {
  id: string;
  userId: string;
  institutionId: string;
  level: RoleLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRoleWithRelations extends IRole {
  assignedCourses: { courseId: string }[];
  assignedSubjects: { subjectId: string }[];
}
