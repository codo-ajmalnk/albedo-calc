export type Role = "admin" | "coordinator" | "mentor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  status?: "active" | "inactive";
  supervisorId?: string; // For mentors, their coordinator ID
  password?: string;
}

// Add Coordinator type that extends User with a specific role
export interface Coordinator extends Omit<User, 'role'> {
  role: 'coordinator';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  mentorId: string;
  status: "active" | "inactive";
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
  completedHours?: number;
  pendingHours?: number;
  activeHours?: number;
  activeSessions?: number;
  totalPayments?: number;
  completedPayments?: number;
  pendingPayments?: number;
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
