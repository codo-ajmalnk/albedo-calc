export type Role = "admin" | "coordinator" | "mentor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  supervisorId?: string; // For mentors, their coordinator ID
  phone?: string;
  password?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  mentorId: string;
  status: "active" | "inactive";
  batchId: string;
  totalHours: number;
  totalSessions: number;
  sessionsCompleted: number;
  totalPayment: number;
  paidAmount: number;
  sessionsRemaining: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  sessionDuration: number;
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
