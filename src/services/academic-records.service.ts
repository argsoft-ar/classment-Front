import { apiClient } from "./api.client";
import type {
  BulkUpsertRecordsDto,
  IStudentProgress,
} from "../interfaces/academic-record.interface";

export const academicRecordsService = {
  getMine: () => apiClient.get<IStudentProgress>("/academic-records/me"),
  getByStudent: (studentId: string) =>
    apiClient.get<IStudentProgress>(`/academic-records/student/${encodeURIComponent(studentId)}`),
  /** "Día Cero" bulk save; returns the refreshed progress. */
  bulkUpsert: (studentId: string, dto: BulkUpsertRecordsDto) =>
    apiClient.put<IStudentProgress>(`/academic-records/student/${encodeURIComponent(studentId)}`, dto),
};
