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
  activeSessions: number;
  completedHours: number;
  pendingHours: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  activeHours: number;
  status: 'active' | 'inactive';
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
  totalHours: number;
  overallProgress: number;
  completedHours: number;
  pendingHours: number;
  pendingSessions: number;
  totalSessions: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  activeHours: number;
}
