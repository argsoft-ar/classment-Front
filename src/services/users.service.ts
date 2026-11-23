import { apiClient } from "./api.client";
import type {
  CreateUserDto,
  IUserPublic,
  UpdateUserDto,
  UsersQuery,
} from "../interfaces/user.interface";

export const usersService = {
  me: () => apiClient.get<IUserPublic>("/users/me"),
  getAll: (query: UsersQuery = {}) => apiClient.get<IUserPublic[]>("/users", { ...query }),
  getById: (id: string) => apiClient.get<IUserPublic>(`/users/${encodeURIComponent(id)}`),
  create: (dto: CreateUserDto) => apiClient.post<IUserPublic>("/users", dto),
  update: (id: string, dto: UpdateUserDto) => apiClient.patch<IUserPublic>(`/users/${encodeURIComponent(id)}`, dto),
  deactivate: (id: string) => apiClient.delete<null>(`/users/${encodeURIComponent(id)}`),
};
