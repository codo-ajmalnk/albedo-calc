
export type Role = "admin" | "coordinator" | "mentor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  supervisorId?: string; // For mentors, their coordinator ID
}

export interface Student {
  id: string;
  name: string;
  totalHours: number;
  sessionDuration: number; // Hours per session
  totalSessions: number;
  startDate: string;
  endDate: string;
  sessionsCompleted: number;
  sessionsRemaining: number;
  progressPercentage: number;
  mentorId: string;
  batchId: string;
}

export interface Batch {
  id: string;
  name: string;
  addedOn: string;
  sessionStart: string;
  sessionEnd: string;
  studentCount: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeSessions: number;
  completedSessions: number;
  overallProgress: number;
  totalHours: number;
}
