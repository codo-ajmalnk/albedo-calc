export type Role = "admin" | "coordinator" | "mentor" | "teacher";

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
  teacherId: string;
  packageId: string;
  status: "active" | "inactive";
  totalHours: number;
  totalSessions: number;
  sessionsCompleted: number;
  upcomingSessions: number;
  meetingSessions: number;
  totalPayment: number;
  paidAmount: number;
  teachersPayment: number;
  expenseRatio: number;
  classTakeAmount: number;
  teacherSalary: number;
  hourlyPayment: number;
  sessionDuration: number;
  startDate: string;
  endDate: string;
  sessionAddedOn: string;
  sessionsRemaining: number;
  progressPercentage: number;
  completedHours?: number;
  pendingHours?: number;
  activeHours?: number;
  activeSessions?: number;
  totalPayments?: number;
  completedPayments?: number;
  pendingPayments?: number;
  refundedPayments?: number;
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
  upcomingSessions: number;
  meetingSessions: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  activeHours: number;
  totalExpenses?: number;
  completedExpenses?: number;
  pendingExpenses?: number;
  refundedPayments?: number;
  classTakeAmount?: number;
  expenseRatio?: number;
  teacherSalary?: number;
}
