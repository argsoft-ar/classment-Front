export type AttendanceStatus = "P" | "A" | "T";

export interface IAttendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  accumulatedAbsences: number;
}
